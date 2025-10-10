const rewardService = require('../services/rewardService');

class RewardController {
    // 사용자의 보상 기록 조회
    async getUserRewards(req, res) {
        try {
            const { userNum } = req.params;
            const { limit = 50, offset = 0 } = req.query;

            const result = await rewardService.getUserRewards(
                parseInt(userNum), 
                parseInt(limit), 
                parseInt(offset)
            );

            res.status(200).json({
                message: '사용자 보상 기록 조회 성공',
                data: result
            });
        } catch (error) {
            console.error('사용자 보상 조회 실패:', error);
            res.status(500).json({
                message: '사용자 보상 조회 실패',
                error: error.message
            });
        }
    }

    // 사용자의 총 보상 금액 조회
    async getUserTotalReward(req, res) {
        try {
            const { userNum } = req.params;

            const totalReward = await rewardService.getUserTotalReward(parseInt(userNum));

            res.status(200).json({
                message: '사용자 총 보상 조회 성공',
                data: {
                    userNum: parseInt(userNum),
                    totalReward
                }
            });
        } catch (error) {
            console.error('사용자 총 보상 조회 실패:', error);
            res.status(500).json({
                message: '사용자 총 보상 조회 실패',
                error: error.message
            });
        }
    }

    // 전체 보상 통계 조회
    async getRewardStats(req, res) {
        try {
            const stats = await rewardService.getRewardStats();

            res.status(200).json({
                message: '보상 통계 조회 성공',
                data: stats
            });
        } catch (error) {
            console.error('보상 통계 조회 실패:', error);
            res.status(500).json({
                message: '보상 통계 조회 실패',
                error: error.message
            });
        }
    }

    // 기간별 보상 기록 조회
    async getRewardsByPeriod(req, res) {
        try {
            const { startDate, endDate } = req.query;
            const { limit = 100, offset = 0 } = req.query;

            if (!startDate || !endDate) {
                return res.status(400).json({
                    message: '시작일과 종료일을 모두 입력해주세요.',
                    error: 'Missing required parameters: startDate, endDate'
                });
            }

            const result = await rewardService.getRewardsByPeriod(
                startDate, 
                endDate, 
                parseInt(limit), 
                parseInt(offset)
            );

            res.status(200).json({
                message: '기간별 보상 기록 조회 성공',
                data: result
            });
        } catch (error) {
            console.error('기간별 보상 조회 실패:', error);
            res.status(500).json({
                message: '기간별 보상 조회 실패',
                error: error.message
            });
        }
    }

    // 보상 생성 (관리자 전용)
    async createReward(req, res) {
        try {
            const { userNum, rewardAmount, description } = req.body;

            if (!userNum || !rewardAmount) {
                return res.status(400).json({
                    message: '사용자 번호와 보상 금액을 입력해주세요.',
                    error: 'Missing required parameters: userNum, rewardAmount'
                });
            }

            const result = await rewardService.createReward(
                parseInt(userNum), 
                parseFloat(rewardAmount), 
                description
            );

            res.status(201).json({
                message: '보상 생성 성공',
                data: result
            });
        } catch (error) {
            console.error('보상 생성 실패:', error);
            res.status(500).json({
                message: '보상 생성 실패',
                error: error.message
            });
        }
    }
}

module.exports = new RewardController();
