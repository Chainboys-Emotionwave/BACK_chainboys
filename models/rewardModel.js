const db = require('../db');

class RewardModel {
    // 보상 기록 생성
    async insertReward(rewardData) {
        try {
            const { userNum, rewardAmount } = rewardData;
            
            const query = `
                INSERT INTO rewards (userNum, rewardAmount, rewardTime)
                VALUES (?, ?, NOW())
            `;
            
            const [result] = await db.query(query, [userNum, rewardAmount]);
            return result.insertId;
        } catch (error) {
            throw new Error(`보상 기록 생성 실패: ${error.message}`);
        }
    }

    // 특정 사용자의 보상 기록 조회
    async findRewardsByUserNum(userNum, limit = 50, offset = 0) {
        try {
            const query = `
                SELECT 
                    rewardNum,
                    rewardAmount,
                    rewardTime,
                    userNum
                FROM rewards 
                WHERE userNum = ?
                ORDER BY rewardTime DESC
                LIMIT ${limit} OFFSET ${offset}
            `;
            
            const [rows] = await db.query(query, [userNum]);
            return rows;
        } catch (error) {
            throw new Error(`사용자 보상 기록 조회 실패: ${error.message}`);
        }
    }

    // 특정 사용자의 총 보상 금액 조회
    async getTotalRewardByUserNum(userNum) {
        try {
            const query = `
                SELECT 
                    COALESCE(SUM(rewardAmount), 0) as totalReward
                FROM rewards 
                WHERE userNum = ?
            `;
            
            const [rows] = await db.query(query, [userNum]);
            return rows[0].totalReward;
        } catch (error) {
            throw new Error(`사용자 총 보상 금액 조회 실패: ${error.message}`);
        }
    }

    // 전체 보상 통계 조회
    async getRewardStats() {
        try {
            const query = `
                SELECT 
                    COUNT(*) as totalRewards,
                    COALESCE(SUM(rewardAmount), 0) as totalAmount,
                    COALESCE(AVG(rewardAmount), 0) as averageReward,
                    MAX(rewardTime) as latestReward
                FROM rewards
            `;
            
            const [rows] = await db.query(query);
            return rows[0];
        } catch (error) {
            throw new Error(`보상 통계 조회 실패: ${error.message}`);
        }
    }

    // 특정 기간의 보상 기록 조회
    async findRewardsByPeriod(startDate, endDate, limit = 100, offset = 0) {
        try {
            const query = `
                SELECT 
                    r.rewardNum,
                    r.rewardAmount,
                    r.rewardTime,
                    r.userNum,
                    u.userName,
                    u.userWalletAddress
                FROM rewards r
                JOIN users u ON r.userNum = u.userNum
                WHERE r.rewardTime BETWEEN ? AND ?
                ORDER BY r.rewardTime DESC
                LIMIT ${limit} OFFSET ${offset}  // 👈 LIMIT/OFFSET 직접 삽입
            `;
            
            const [rows] = await db.query(query, [startDate, endDate]);
            return rows;
        } catch (error) {
            throw new Error(`기간별 보상 기록 조회 실패: ${error.message}`);
        }
    }

    // 챌린지 관련 보상 기록 생성 (추가 컬럼이 있다면 확장 가능)
    async insertChallengeReward(rewardData) {
        try {
            const { userNum, rewardAmount, challNum } = rewardData;
            
            // 현재 rewards 테이블 구조에 맞춰 기본 정보만 저장
            // 필요시 challNum을 저장할 컬럼을 추가할 수 있음
            const query = `
                INSERT INTO rewards (userNum, rewardAmount, rewardTime)
                VALUES (?, ?, NOW())
            `;
            
            const [result] = await db.query(query, [userNum, rewardAmount]);
            return result.insertId;
        } catch (error) {
            throw new Error(`챌린지 보상 기록 생성 실패: ${error.message}`);
        }
    }
}

module.exports = new RewardModel();
