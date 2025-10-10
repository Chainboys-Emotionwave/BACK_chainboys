const authModel = require('../models/authModel');
const badgeService = require('./badgeService'); // 뱃지 서비스 추가
const ethers = require('ethers');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const SIGNATURE_MESSAGE_TEMPLATE = 'EmotionWave에 오신것을 환영합니다. 서명하여 신원을 증명하세요. 난수: ';

exports.generateSignatureMessage = async (userWalletAddress) => {
    let user = await authModel.findByWalletAddress(userWalletAddress);
    let userNonce;

    if(!user) {
        userNonce = Math.random().toString(36).substring(2,15);
        const newUser = await authModel.createUser(userWalletAddress, userNonce);
        // 새로운 사용자에게 초기 뱃지 부여
        await badgeService.grantInitialBadge(newUser.id);
    } else {
        userNonce = user.userNonce;
    }

    const message = `${SIGNATURE_MESSAGE_TEMPLATE}${userNonce}`;
    return message
}

exports.verifySignatureAndLogin = async (userWalletAddress, signature) => {
    const user = await authModel.findByWalletAddress(userWalletAddress);
    if (!user) {
        throw new Error('사용자를 찾을 수 없습니다.');
    }

    const message = `${SIGNATURE_MESSAGE_TEMPLATE}${user.userNonce}`;

    //서명 검증
    const recoveredAddress = ethers.verifyMessage(message, signature);
    if (recoveredAddress.toLowerCase() !== userWalletAddress.toLowerCase()) {
        throw new Error('유효하지 않은 서명입니다.')
    }

    //서명 성공 후 난수 업데이트
    const newNonce = Math.random().toString(36).substring(2,15);
    await authModel.updateNonce(user.userNum, newNonce);

    //JWT 토큰 발급
    const token = jwt.sign({ userWalletAddress, userNum : user.userNum, role : user.role}, process.env.JWT_SECRET, {expiresIn: '1d'});

    return { token, user: { userNum: user.userNum, userWalletAddress: user.userWalletAddress, role: user.role} };
}