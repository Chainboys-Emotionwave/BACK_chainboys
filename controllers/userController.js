const userService = require('../services/userService');

exports.getUser = async (req,res) => {
    try {
        const user = await userService.getUser(req.params.userNum);
        if (!user) {
            return res.status(404).send('사용자를 찾을 수 없습니다.');
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).send('서버 오류 : ' + error.messages);
    }
};

exports.getMyData = async (req,res) => {
    try {
        console.log(req.userData);
        const userNum = req.userData.userNum;
        const user = await userService.getUser(userNum);
        if (!user) {
            return res.status(404).send('내 정보를 불러올 수 없습니다.');
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).send('서버 오류 : ' + error.messages);
    }
};

exports.updateMyData = async (req,res) => {
    try {
        const userNum = req.userData.userNum;
        const userWalletAddress = req.userData.userWalletAddress;
        const userData = {
            ...req.body,
            userNum,
            userWalletAddress
        }

        const updatedMyData = await userService.updateUser(userData);

        if (!updatedMyData) {
            return res.status(404).send('내 정보를 갱신할 수 없습니다.');
        }
        return res.status(200).json(updatedMyData);
    } catch (error) {
        res.status(500).send('서버 오류 : ' + error.messages);
    }
}