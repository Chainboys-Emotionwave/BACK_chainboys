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