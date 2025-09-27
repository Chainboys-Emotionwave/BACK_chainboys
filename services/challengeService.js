const challengeModel = require('../models/challengeModel');

exports.insertChallenge = async (contentData) => {
    try {
        const newChallenge = await challengeModel.insertChallenge(contentData);
        return newChallenge;
    } catch (error) {
        throw new Error('챌린지 삽입 실패 : ' + error.message)
    }
};

exports.getAllChallenges = async () => {
    try {
        const challenges = await challengeModel.findAllChallenges();
        return challenges;
    } catch (error) {
        throw new Error('챌린지 목록 조회 실패 : ' + error.message)
    }
};

exports.getActiveChallenges = async () => {
    try {
        const challenges = await challengeModel.findActiveChallenges();
        return challenges;
    } catch (error) {
        throw new Error('활성 챌린지 조회 실패 : ' + error.message);
    }
};

exports.getChallenge = async (challNum) => {
    try {
        const challenge = await challengeModel.findChallenge(challNum);
        return challenge;
    } catch (error) {
        throw new Error('챌린지 조회 실패 : ' + error.message)
    }
};