const badgeModel = require('../models/badgeModel');
const userModel = require('../models/userModel');

// 뱃지 획득 조건 정의
const BADGE_CONDITIONS = [
    { badgesNum: 1, name: '새싹 주민', postCount: 0 },
    { badgesNum: 2, name: '성장 주민', postCount: 1 },
    { badgesNum: 3, name: '성숙 주민', postCount: 5 },
    { badgesNum: 4, name: '명예 주민', postCount: 10 },
    { badgesNum: 5, name: '빌리지 마스터', postCount: 50 },
];

/**
 * 사용자의 게시물 수에 따라 뱃지를 자동으로 업데이트합니다.
 * @param {number} userNum 사용자 번호
 */
exports.updateUserBadges = async (userNum) => {
    try {
        const contents = await userModel.findContentsByUserNum(userNum);
        const postCount = contents ? contents.length : 0;

        const awardedBadges = [];

        for (const condition of BADGE_CONDITIONS) {
            if (postCount >= condition.postCount) {
                const hasBadge = await badgeModel.checkUserHasBadge(userNum, condition.badgesNum);
                if (!hasBadge) {
                    await badgeModel.grantBadgeToUser(userNum, condition.badgesNum);
                    awardedBadges.push(condition.name);
                }
            }
        }
        return { postCount, awardedBadges };
    } catch (error) {
        console.error(`[BadgeService] 뱃지 업데이트 실패 (userNum: ${userNum}):`, error);
        throw new Error(`뱃지 업데이트 실패: ${error.message}`);
    }
};

/**
 * 신규 사용자에게 기본 뱃지를 부여합니다.
 * @param {number} userNum 사용자 번호
 */
exports.grantInitialBadge = async (userNum) => {
    try {
        // 1번 뱃지: 새싹 주민
        await badgeModel.grantBadgeToUser(userNum, 1);
    } catch (error) {
        console.error(`[BadgeService] 초기 뱃지 부여 실패 (userNum: ${userNum}):`, error);
        // 여기서 에러를 던지지 않아 회원가입 흐름을 막지 않도록 합니다.
    }
};

// --- 관리자 및 기본 CRUD ---

exports.getAllBadges = async () => {
    return await badgeModel.findAllBadges();
};

exports.getBadgeById = async (badgesNum) => {
    const badge = await badgeModel.findBadgeById(badgesNum);
    if (!badge) {
        const error = new Error('뱃지를 찾을 수 없습니다.');
        error.status = 404;
        throw error;
    }
    return badge;
};

exports.createBadge = async (badgeData) => {
    return await badgeModel.createBadge(badgeData);
};

exports.updateBadge = async (badgesNum, badgeData) => {
    const success = await badgeModel.updateBadge(badgesNum, badgeData);
    if (!success) {
        const error = new Error('뱃지를 찾을 수 없거나 업데이트에 실패했습니다.');
        error.status = 404;
        throw error;
    }
    return { badgesNum, ...badgeData };
};

exports.deleteBadge = async (badgesNum) => {
    const success = await badgeModel.deleteBadge(badgesNum);
    if (!success) {
        const error = new Error('뱃지를 찾을 수 없습니다.');
        error.status = 404;
        throw error;
    }
    return true;
};

exports.getUserBadges = async (userNum) => {
    return await badgeModel.findUserBadges(userNum);
};
