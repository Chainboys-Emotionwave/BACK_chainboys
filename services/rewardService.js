const rewardModel = require('../models/rewardModel');
const userModel = require('../models/userModel');
const authModel = require('../models/authModel');

class RewardService {
    // 챌린지 상금 분배 시 보상 기록 생성
    async recordChallengeRewards(challNum, winners, amounts) {
        try {
            const recordedRewards = [];
            
            // winners와 amounts 배열의 길이가 일치하는지 확인
            if (winners.length !== amounts.length) {
                throw new Error('수상자와 상금 금액의 개수가 일치하지 않습니다.');
            }

            // 각 수상자에 대해 보상 기록 생성
            for (let i = 0; i < winners.length; i++) {
                const walletAddress = winners[i];
                const amountWei = amounts[i];
                
                // 지갑 주소로 사용자 정보 조회
                const user = await authModel.findByWalletAddress(walletAddress);
                if (!user) {
                    console.warn(`지갑 주소 ${walletAddress}에 해당하는 사용자를 찾을 수 없습니다.`);
                    continue;
                }

                // Wei를 Ether로 변환
                const { ethers } = require('ethers');
                const amountEther = parseFloat(ethers.formatEther(amountWei));

                // 보상 기록 생성
                const rewardId = await rewardModel.insertChallengeReward({
                    userNum: user.userNum,
                    rewardAmount: amountEther,
                    challNum: challNum
                });

                recordedRewards.push({
                    rewardId,
                    userNum: user.userNum,
                    userName: user.userName,
                    walletAddress,
                    rank: i + 1,
                    amount: amountEther
                });
            }

            return {
                success: true,
                recordedCount: recordedRewards.length,
                rewards: recordedRewards
            };
        } catch (error) {
            throw new Error(`챌린지 보상 기록 실패: ${error.message}`);
        }
    }

    // 사용자의 보상 기록 조회
    async getUserRewards(userNum, limit = 50, offset = 0) {
        try {
            const rewards = await rewardModel.findRewardsByUserNum(userNum, limit, offset);
            const totalReward = await rewardModel.getTotalRewardByUserNum(userNum);
            
            return {
                rewards,
                totalReward: parseFloat(totalReward),
                count: rewards.length
            };
        } catch (error) {
            throw new Error(`사용자 보상 조회 실패: ${error.message}`);
        }
    }

    // 사용자의 총 보상 금액 조회
    async getUserTotalReward(userNum) {
        try {
            const totalReward = await rewardModel.getTotalRewardByUserNum(userNum);
            return parseFloat(totalReward);
        } catch (error) {
            throw new Error(`사용자 총 보상 조회 실패: ${error.message}`);
        }
    }

    // 전체 보상 통계 조회
    async getRewardStats() {
        try {
            const stats = await rewardModel.getRewardStats();
            return {
                totalRewards: stats.totalRewards,
                totalAmount: parseFloat(stats.totalAmount),
                averageReward: parseFloat(stats.averageReward),
                latestReward: stats.latestReward
            };
        } catch (error) {
            throw new Error(`보상 통계 조회 실패: ${error.message}`);
        }
    }

    // 기간별 보상 기록 조회
    async getRewardsByPeriod(startDate, endDate, limit = 100, offset = 0) {
        try {
            const rewards = await rewardModel.findRewardsByPeriod(startDate, endDate, limit, offset);
            
            return {
                rewards,
                count: rewards.length,
                period: {
                    startDate,
                    endDate
                }
            };
        } catch (error) {
            throw new Error(`기간별 보상 조회 실패: ${error.message}`);
        }
    }

    // 보상 기록 생성 (일반적인 보상)
    async createReward(userNum, rewardAmount, description = null) {
        try {
            const rewardId = await rewardModel.insertReward({
                userNum,
                rewardAmount
            });

            return {
                success: true,
                rewardId,
                userNum,
                rewardAmount,
                description
            };
        } catch (error) {
            throw new Error(`보상 생성 실패: ${error.message}`);
        }
    }
}

module.exports = new RewardService();
