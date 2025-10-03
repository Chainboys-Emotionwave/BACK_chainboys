const supportService = require('../services/supportService');


exports.getSupportsTotalStats = async (req, res) => {
    try {
        const totalStats = await supportService.getSupportsTotalStats();
        res.status(200).json(totalStats)
    } catch (error) {
        res.status(500).send('서버 오류 : ' + error.message);
    }
};


exports.getTotalSupports = async (req, res) => {
    try {
        const cateNum = req.query.cateNum;
        const supports = await supportService.getTotalSupports(cateNum);
        res.status(200).json(supports);
    } catch (error) {
        res.status(500).send('서버 오류 : ' + error.message);
    }
};

exports.getWeeklySupports = async (req, res) => {
    try {
        const cateNum = req.query.cateNum;
        const supports = await supportService.getWeeklySupports(cateNum);
        res.status(200).json(supports);
    } catch (error) {
        res.status(500).send('서버 오류 : ' + error.message);
    }
};

exports.getMySupportStats = async (req, res) => {
    try {
        const userNum = req.userData.userNum;
        const userStats = await supportService.getUserSupportStats(userNum);
        
        res.status(200).json({
            message: '나의 응원 통계 조회 성공',
            data: {
                weeklyRank: userStats.weeklyRank,
                weeklySupports: userStats.weeklySupports,
                totalRank: userStats.totalRank,
                totalSupports: userStats.totalSupports
            }
        });
    } catch (error) {
        res.status(500).send('서버 오류 : ' + error.message);
    }
};