const contentModel = require('../models/contentModel');
const badgeService = require('./badgeService');

exports.getAllContents = async ({ sort, limit, offset }) => {
    try {
        if (limit > 50 || limit < 1) {
            const error = new Error('limit 값은 1에서 50 사이여야 합니다.');
            error.status = 400; 
            throw error;
        }
        if (offset < 0) {
            const error = new Error('offset 값은 0 이상이어야 합니다.');
            error.status = 400; 
            throw error;
        }

        const contents = await contentModel.findAllContents({ sort, limit, offset });
        return contents;
    } catch (error) {
        throw new Error('컨텐츠를 불러오는 데 실패했습니다.' + error.message);
    }
};


exports.getContent = async (conNum) => {
    try {
        await contentModel.incrementViews(conNum);
        const content = await contentModel.findContent(conNum);
        return content;
    } catch (error) {
        throw new Error(error.message);
    }
};


exports.getContentsWithUserNum = async (userNum) => {
    try {
        const contents = await contentModel.findContentsWithUserNum(userNum);
        return contents;
    } catch (error) {
        throw new Error(error.message);
    }
};


exports.getContentsWithChallNum = async (challNum) => {
    try {
        const contents = await contentModel.findContentsWithChallNum(challNum);
        return contents;
    } catch (error) {
        throw new Error(error.message);
    }
};


exports.getContentsWithCateNum = async (cateNum) => {
    try {
        const contents = await contentModel.findContentsWithCateNum(cateNum);
        return contents;
    } catch (error) {
        throw new Error(error.message);
    }
};


exports.insertContent = async (contentData) => {
    // contentData 는 객체
    try {
        const newContent = await contentModel.insertContent(contentData);

        // 콘텐츠 생성 후, 뱃지 획득 조건 확인
        if (newContent && contentData.userNum) {
            await badgeService.updateUserBadges(contentData.userNum);
        }

        return newContent;
    } catch (error) {
        throw new Error(`컨텐츠 생성 실패 : ${error.message}`);
    }
};


exports.updateContent = async (conNum, contentData) => {
    try {
        const updatedContent = await contentModel.updateContent(conNum, contentData);
        return updatedContent;
    } catch (error) {
        throw new Error(`컨텐츠 갱신 실패 : ${error.message}`);
    }
};


exports.deleteContent = async (conNum, userNum) => {
    try {
        const isDeleted = await contentModel.deleteContent(conNum, userNum);
        return isDeleted;
    } catch (error) {
        throw new Error(`컨텐츠 삭제 실패 : ${error.message}`);
    }
};

exports.processSupport = async (supporterNum, conNum) => {
    try {
        const receiverNum = await contentModel.findContentUser(conNum);

        if (supporterNum === receiverNum) {
            const error = new Error('자신의 콘텐츠는 응원할 수 없습니다.');
            error.status = 403; // Forbidden 상태 코드
            throw error;
        }

        await contentModel.createSupportTransaction(supporterNum, conNum, receiverNum);
    } catch (error) {
        throw new Error(`응원 기록 실패 : ${error.message}`);
    }
};