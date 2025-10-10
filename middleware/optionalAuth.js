const jwt = require('jsonwebtoken');
require('dotenv').config();

// JWT 인증을 선택적으로 처리하는 미들웨어
// 토큰이 있으면 req.userData에 사용자 정보를 추가하고, 없거나 유효하지 않으면 그냥 다음 미들웨어로 넘어갑니다.
module.exports = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            if (token) {
                const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
                req.userData = { 
                    userNum: decodedToken.userNum, 
                    role: decodedToken.role, 
                    userWalletAddress: decodedToken.userWalletAddress 
                };
            }
        }
    } catch (error) {
        // 토큰이 유효하지 않은 경우, 오류를 발생시키지 않고 그냥 넘어갑니다.
        // req.userData는 설정되지 않은 상태로 유지됩니다.
        console.log('Optional auth: Invalid token');
    }
    next();
};