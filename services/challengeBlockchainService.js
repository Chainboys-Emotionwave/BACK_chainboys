const blockchainService = require('./blockchainService');
const challengeModel = require('../models/challengeModel');
const contentModel = require('../models/contentModel');
const userModel = require('../models/userModel');
const rewardService = require('./rewardService');
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
            const challenge = await challengeModel.findChallenge(challNum);
            if (!challenge) {
                throw new Error('챌린지를 찾을 수 없습니다.');
            }

            // 챌린지에 참여한 콘텐츠들의 응원 수 기준으로 순위 계산
            const participatingContents = await contentModel.findContentsWithChallNum(challNum);
            if (!participatingContents || participatingContents.length === 0) {
                throw new Error('참여한 콘텐츠가 없습니다.');
            }

            // 응원 수 기준으로 정렬
            const sortedContents = participatingContents.sort((a, b) => b.conSupports - a.conSupports);
            
            // 상금 분배 비율 적용
            let distribution = challenge.prizeDistribution; // DB에서 조회한 값
            
            // 문제 해결: JSON 문자열을 객체로 변환합니다.
            if (typeof distribution === 'string') {
                try {
                    distribution = JSON.parse(distribution);
                } catch (e) {
                    console.error("prizeDistribution JSON 파싱 실패, 기본값 사용:", e);
                    // 파싱 실패 시 기본값으로 대체 (안전성 확보)
                    distribution = DEFAULT_PRIZE_DISTRIBUTION;
                }
            }
            
            // DB에 저장된 prizeDistribution이 없거나 (null) 파싱에 실패하면 기본값 사용
            distribution = distribution || DEFAULT_PRIZE_DISTRIBUTION;
            
            // challPrize를 안전하게 부동 소수점 숫자로 변환합니다.
            const totalPrize = parseFloat(challenge.challPrize); 
            
            const winners = [];
            const amounts = [];
            const winningUserNums = [];
            
            // 1위 상금 계산
            if (sortedContents[0]) {
                const firstPrize = (totalPrize * distribution.first) / 100;
                winningUserNums.push(sortedContents[0].userNum);
                amounts.push(ethers.parseEther(firstPrize.toString()));
            }
            
            // 2위 상금 계산
            if (sortedContents[1]) {
                const secondPrize = (totalPrize * distribution.second) / 100;
                winningUserNums.push(sortedContents[1].userNum);
                amounts.push(ethers.parseEther(secondPrize.toString()));
            }
            
            // 3위 상금 계산
            if (sortedContents[2]) {
                const thirdPrize = (totalPrize * distribution.third) / 100;
                winningUserNums.push(sortedContents[2].userNum);
                amounts.push(ethers.parseEther(thirdPrize.toString()));
            }

            if (winningUserNums.length === 0) {
                throw new Error('상금을 받을 수 있는 참여자가 없습니다.');
            }

            // 🚨 핵심 수정: userNum을 순회하며 지갑 주소로 변환
            for (const userNum of winningUserNums) {
                // userModel을 사용하여 userNum에 해당하는 지갑 주소를 조회합니다.
                const user = await userModel.findByUserNum(userNum); 
                if (!user || !user.userWalletAddress) {
                    throw new Error(`상금 수령자(UserNum: ${userNum})의 지갑 주소를 찾을 수 없습니다.`);
                }
                winners.push(user.userWalletAddress); // 지갑 주소(string)를 winners 배열에 추가
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

            // 🎯 보상 기록 생성 - 챌린지 분배 시 수상자들에게 보상 기록
            const rewardResult = await rewardService.recordChallengeRewards(challNum, winners, amounts, challenge.challName);

            return {
                success: true,
                txHash: tx.hash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed.toString(),
                winners: winners.map((walletAddress, index) => ({
                    walletAddress,
                    rank: index + 1,
                    amount: ethers.formatEther(amounts[index])
                })),
                rewards: rewardResult.rewards // 추가된 보상 기록 정보
            };
        } catch (error) {
            throw new Error(`상금 분배 실패: ${error.message}`);
        }
    }

    // 챌린지 블록체인 정보 조회
    async getChallengeBlockchainInfo(challNum) {
        try {
            const challengeInfo = await this.contract.getChallengeInfo(challNum);
            
            // 🚨 반환되는 배열의 인덱스에 맞춰 변수명을 수정합니다.
            const creator = challengeInfo[0];
            const prizeAmount = challengeInfo[1]; // 총 예치된 상금 (uint256)
            const distributedAmount = challengeInfo[2]; // 분배된 상금 (uint256)
            const active = challengeInfo[3]; // 활성화 상태 (bool)

            return {
                // challengeId는 실제로 DB의 challNum을 사용하고, 
                // 블록체인에서는 creator 주소가 첫 번째 요소입니다.
                creator: creator,
                // 총 상금: prizeAmount가 두 번째 요소 (index 1)입니다.
                prizeAmount: ethers.formatEther(prizeAmount),
                // 분배 여부: isDistributed 대신 active 상태를 사용하고, 
                // 서비스의 출력 구조에 맞춰 key를 재정의합니다.
                isDistributed: !active || (prizeAmount === distributedAmount), // active가 false거나 상금이 모두 분배되었으면 true로 가정
                active: active
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
            const challenge = await challengeModel.findChallenge(challNum);
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
            const participatingContents = await contentModel.findContentsWithChallNum(challNum);
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

