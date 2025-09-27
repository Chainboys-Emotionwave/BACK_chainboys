const challengeService = require('../services/challengeService');

exports.insertChallenge = async (req, res) => {
    try {
        const role = req.userData.role;
        if (role === 'admin') {
            const newChallenge = await challengeService.insertChallenge(req.body);

            res.status(201).json({
                message : '챌린지가 성공적으로 등록되었습니다.',
                challenge : newChallenge
            });
        } else {
            res.status(403).send('관리자만 챌린지를 등록할 수 있습니다.');
        }
    } catch (error) {
        res.status(500).send('서버 오류 : ' + error.message);
    }
};

exports.getAllChallenges = async (req, res) => {
    try {
        const challenges = await challengeService.getAllChallenges();
        res.status(200).json(challenges);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.getActiveChallenges = async (req, res) => {
    try {
        const challenges = await challengeService.getActiveChallenges();
        res.status(200).json(challenges);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.getChallenge = async (req, res) => {
    try {
        const challenge = await challengeService.getChallenge(req.params.challNum);
        if (!challenge) {
            res.status(404).send('챌린지를 찾을 수 없습니다.')
        }
        res.status(200).json(challenge);
    } catch (error) {
        res.status(500).send(error.message);
    }
};