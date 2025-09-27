const userModel = require('../models/userModel');

exports.getUser = async (userNum) => {
    try {
        const user = await userModel.findByUserNum(userNum);
        return user;
    } catch (error) {
        throw new Error(error.message);
    }
};

exports.updateUser = async (userData) => {
    try {
        const user = await userModel.updateUser(userData);
        return user;
    } catch (error) {
        throw new Error("내 정보 갱신 오류 : " + error.message);
    }
}