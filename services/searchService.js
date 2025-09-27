const searchModel = require('../models/searchModel');

exports.searchInUsers = async (queryParam) => {
    try {
        const users = await searchModel.searchInUsers(queryParam);
        return users;
    } catch (error) {
        throw new Error('유저 검색에 실패했습니다. ' + error.message);
    }
};

exports.searchInContents = async (queryParam) => {
    try {
        const contents = await searchModel.searchInContents(queryParam);
        return contents;
    } catch (error) {
        throw new Error('컨텐츠 검색에 실패했습니다. ' + error.message);
    }
};