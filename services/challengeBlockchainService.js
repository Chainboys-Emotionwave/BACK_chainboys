const blockchainService = require('./blockchainService');
const challengeModel = require('../models/challengeModel');
const contentModel = require('../models/contentModel');
const { ethers } = require('ethers');
const { DEFAULT_PRIZE_DISTRIBUTION } = require('../config/blockchain');

class ChallengeBlockchainService {
    constructor() {
        this.contract = blockchainService.challengeContract;
    }

    // 챌린지 생성 및 상금 예치
    async createChallengeWithPrize(challengeData) {
        try {
            const { challNum, challPrize, prizeDistribution } = challengeData;
            
            // 상금을 Wei 단위로 변환
            const prizeAmountWei = ethers.parseEther(challPrize.toString());
            
            // 스마트 컨트랙트에 챌린지 생성 트랜잭션 전송
            const tx = await this.contract.createChallenge(
                challNum,
                prizeAmountWei,
                {
                    value: prizeAmountWei, // 상금을 함께 전송
                    gasLimit: 500000
                }
            );

            // 트랜잭션 완료 대기
            const receipt = await tx.wait();
            
            // DB에 블록체인 정보 업데이트
            await challengeModel.updateChallengeBlockchainInfo(challNum, {
                txHash: tx.hash,
                blockNumber: receipt.blockNumber,
                prizeAmount: challPrize,
                prizeDistribution: prizeDistribution || DEFAULT_PRIZE_DISTRIBUTION,
                status: 'created'
            });

            return {
                success: true,
                txHash: tx.hash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed.toString(),
                prizeAmount: challPrize
            };
        } catch (error) {
            throw new Error(`챌린지 생성 실패: ${error.message}`);
        }
    }

    // 상금 분배 실행
    async distributePrize(challNum) {
        try {
            // 챌린지 정보 조회
            const challenge = await challengeModel.getChallenge(challNum);
            if (!challenge) {
                throw new Error('챌린지를 찾을 수 없습니다.');
            }

            // 챌린지에 참여한 콘텐츠들의 응원 수 기준으로 순위 계산
            const participatingContents = await contentModel.getContentsWithChallNum(challNum);
            if (!participatingContents || participatingContents.length === 0) {
                throw new Error('참여한 콘텐츠가 없습니다.');
            }

            // 응원 수 기준으로 정렬
            const sortedContents = participatingContents.sort((a, b) => b.conSupports - a.conSupports);
            
            // 상금 분배 비율 적용
            const distribution = challenge.prizeDistribution || DEFAULT_PRIZE_DISTRIBUTION;
            const totalPrize = parseFloat(challenge.prizeAmount);
            
            const winners = [];
            const amounts = [];
            
            // 1위 상금 계산
            if (sortedContents[0]) {
                const firstPrize = (totalPrize * distribution.first) / 100;
                winners.push(sortedContents[0].userNum);
                amounts.push(ethers.parseEther(firstPrize.toString()));
            }
            
            // 2위 상금 계산
            if (sortedContents[1]) {
                const secondPrize = (totalPrize * distribution.second) / 100;
                winners.push(sortedContents[1].userNum);
                amounts.push(ethers.parseEther(secondPrize.toString()));
            }
            
            // 3위 상금 계산
            if (sortedContents[2]) {
                const thirdPrize = (totalPrize * distribution.third) / 100;
                winners.push(sortedContents[2].userNum);
                amounts.push(ethers.parseEther(thirdPrize.toString()));
            }

            if (winners.length === 0) {
                throw new Error('상금을 받을 수 있는 참여자가 없습니다.');
            }

            // 스마트 컨트랙트에 상금 분배 트랜잭션 전송
            const tx = await this.contract.distributePrize(
                challNum,
                winners,
                amounts,
                {
                    gasLimit: 1000000
                }
            );

            // 트랜잭션 완료 대기
            const receipt = await tx.wait();

            // DB에 분배 정보 업데이트
            await challengeModel.updateChallengeBlockchainInfo(challNum, {
                distributionTxHash: tx.hash,
                distributionBlockNumber: receipt.blockNumber,
                status: 'distributed',
                distributedAt: new Date()
            });

            return {
                success: true,
                txHash: tx.hash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed.toString(),
                winners: winners.map((userNum, index) => ({
                    userNum,
                    rank: index + 1,
                    amount: ethers.formatEther(amounts[index])
                }))
            };
        } catch (error) {
            throw new Error(`상금 분배 실패: ${error.message}`);
        }
    }

    // 챌린지 블록체인 정보 조회
    async getChallengeBlockchainInfo(challNum) {
        try {
            const challengeInfo = await this.contract.getChallengeInfo(challNum);
            return {
                challengeId: challengeInfo[0].toString(),
                creator: challengeInfo[1],
                prizeAmount: ethers.formatEther(challengeInfo[2]),
                isDistributed: challengeInfo[3]
            };
        } catch (error) {
            throw new Error(`챌린지 블록체인 정보 조회 실패: ${error.message}`);
        }
    }

    // 챌린지 참여자 목록 조회
    async getChallengeParticipants(challNum) {
        try {
            const participants = await this.contract.getChallengeParticipants(challNum);
            return participants;
        } catch (error) {
            throw new Error(`챌린지 참여자 조회 실패: ${error.message}`);
        }
    }

    // 상금 분배 가능 여부 확인
    async canDistributePrize(challNum) {
        try {
            const challenge = await challengeModel.getChallenge(challNum);
            if (!challenge) {
                return { canDistribute: false, reason: '챌린지를 찾을 수 없습니다.' };
            }

            // 챌린지 종료 여부 확인
            const now = new Date();
            const endDate = new Date(challenge.challEndDate);
            if (now < endDate) {
                return { canDistribute: false, reason: '챌린지가 아직 종료되지 않았습니다.' };
            }

            // 이미 분배되었는지 확인
            if (challenge.status === 'distributed') {
                return { canDistribute: false, reason: '이미 상금이 분배되었습니다.' };
            }

            // 참여자 확인
            const participatingContents = await contentModel.getContentsWithChallNum(challNum);
            if (!participatingContents || participatingContents.length === 0) {
                return { canDistribute: false, reason: '참여한 콘텐츠가 없습니다.' };
            }

            return { canDistribute: true };
        } catch (error) {
            throw new Error(`상금 분배 가능 여부 확인 실패: ${error.message}`);
        }
    }

    // 챌린지 이벤트 로그 조회
    async getChallengeEvents(challNum, fromBlock = 0, toBlock = 'latest') {
        try {
            const createdEvents = await blockchainService.getEventLogs(
                this.contract, 
                'ChallengeCreated', 
                fromBlock, 
                toBlock
            );
            
            const distributedEvents = await blockchainService.getEventLogs(
                this.contract, 
                'PrizeDistributed', 
                fromBlock, 
                toBlock
            );

            return {
                created: createdEvents.filter(event => event.args.challengeId.toString() === challNum.toString()),
                distributed: distributedEvents.filter(event => event.args.challengeId.toString() === challNum.toString())
            };
        } catch (error) {
            throw new Error(`챌린지 이벤트 조회 실패: ${error.message}`);
        }
    }
}

module.exports = new ChallengeBlockchainService();

