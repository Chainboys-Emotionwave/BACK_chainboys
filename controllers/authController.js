const authService = require('../services/authService');

exports.requestSignatureMessage = async (req, res) => {
    try {
        const { walletAddress } = req.body;
        console.log(`지갑 주소 : ${walletAddress}`)
        if (!walletAddress) {
            return res.status(400).json({ message : '지갑 주소가 필요합니다.'});
        }
        const message = await authService.generateSignatureMessage(walletAddress);
        res.json({ message });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.verifySignatureAndLogin = async (req, res) => {
    try {
        const { walletAddress, signature } = req.body;
        if (!walletAddress || !signature) {
            return res.status(400).json({ message: '지갑 주소와 서명이 필요합니다.' });
        }
        const result = await authService.verifySignatureAndLogin(walletAddress, signature);
        res.json(result); 
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};