const badgeService = require('../services/badgeService');

// 사용자의 뱃지 목록 조회
exports.getUserBadges = async (req, res) => {
    try {
        const { userNum } = req.params;
        const badges = await badgeService.getUserBadges(userNum);
        res.status(200).json(badges);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 현재 로그인한 사용자의 뱃지 목록 조회
exports.getMyBadges = async (req, res) => {
    try {
        const userNum = req.userData.userNum;
        const badges = await badgeService.getUserBadges(userNum);
        res.status(200).json(badges);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// --- 관리자 기능 ---

// 모든 뱃지 목록 조회
exports.getAllBadges = async (req, res) => {
    try {
        const badges = await badgeService.getAllBadges();
        res.status(200).json(badges);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 뱃지 생성
exports.createBadge = async (req, res) => {
    try {
        if (req.userData.role !== 'admin') {
            return res.status(403).json({ message: '관리자만 접근 가능합니다.' });
        }
        const newBadge = await badgeService.createBadge(req.body);
        res.status(201).json(newBadge);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 뱃지 수정
exports.updateBadge = async (req, res) => {
    try {
        if (req.userData.role !== 'admin') {
            return res.status(403).json({ message: '관리자만 접근 가능합니다.' });
        }
        const { badgesNum } = req.params;
        const updatedBadge = await badgeService.updateBadge(badgesNum, req.body);
        res.status(200).json(updatedBadge);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

// 뱃지 삭제
exports.deleteBadge = async (req, res) => {
    try {
        if (req.userData.role !== 'admin') {
            return res.status(403).json({ message: '관리자만 접근 가능합니다.' });
        }
        const { badgesNum } = req.params;
        await badgeService.deleteBadge(badgesNum);
        res.status(200).json({ message: '뱃지가 성공적으로 삭제되었습니다.' });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};
