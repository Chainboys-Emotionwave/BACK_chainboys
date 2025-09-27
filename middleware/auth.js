const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: '로그인이 필요합니다!' });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.userData = { userNum: decodedToken.userNum, role: decodedToken.role, userWalletAddress: decodedToken.userWalletAddress };
        next();
    } catch (error) {
        res.status(401).json({ message: '로그인 기한이 만료되었습니다. 다시 로그인해주세요.' });
    }
};