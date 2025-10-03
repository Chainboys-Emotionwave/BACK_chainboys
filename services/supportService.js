const supportModel = require('../models/supportModel');


exports.getSupportsTotalStats = async () => {
    try {
        const totalStats = await supportModel.findSupportsTotalStats();
        return totalStats;
    } catch (error) {
        throw new Error("응원 통계 조회 실패 : " + error.message);
    }
};


exports.getTotalSupports = async (cateNum) => {
    try {
        const supports = await supportModel.findTotalSupports(cateNum);
        return supports;
    } catch (error) {
        throw new Error("전체 응원 조회 실패 : " + error.message);
    }
};


exports.getWeeklySupports = async (cateNum) => {
    try {
        const supports = await supportModel.findWeeklySupports(cateNum);
        return supports;
    } catch (error) {
        throw new Error("주간 응원 조회 실패 : " + error.message);
    }
};

exports.getUserSupportStats = async (userNum) => {
    try {
        const userStats = await supportModel.findUserSupportStats(userNum);
        return userStats;
    } catch (error) {
        throw new Error("사용자 응원 통계 조회 실패 : " + error.message);
    }
};