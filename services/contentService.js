const contentModel = require('../models/contentModel');

exports.getAllContents = async () => {
    try {
        const contents = await contentModel.findAllContents();
        return contents;
    } catch (error) {
        throw new Error('컨텐츠를 불러오는 데 실패했습니다.');
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

exports.getContentwithCreatorId = async (userNum) => {
    try {
        const contents = await contentModel.findContentwithCreatorId(userNum);
        return contents;
    } catch (error) {
        throw new Error(error.message);
    }
};

exports.insertContent = async (contentData) => {
    // contentData 는 객체
    try {
        const newContent = await contentModel.insertContent(contentData);
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