const contentService = require('../services/contentService');

exports.getAllContents = async (req, res) => {
    try {
        const contents = await contentService.getAllContents();
        res.status(200).json(contents)
    } catch (error) {
        res.status(500).send(error.message);
    }
};

exports.getContent = async (req, res) => {
    try {
        const content = await contentService.getContent(req.params.conNum);

        if (!content) { // 잘 검색을 했지만 반환 값이 0개 일때
            return res.status(404).send('콘텐츠를 찾을 수 없습니다.');
        }

        res.status(200).json(content);
    } catch (error) {
        res.status(500).send('서버 오류 : ' + error.message);
    }
}

exports.getContentwithCreatorId = async (req, res) => {
    try {
        const contents = await contentService.getContentwithCreatorId(req.params.userNum);

        if (!contents) { // 잘 검색을 했지만 반환 값이 0개 일때
            return res.status(404).send('콘텐츠를 찾을 수 없습니다.');
        }

        res.status(200).json(contents);
    } catch (error) {
        res.status(500).send('서버 오류 : ' + error.message);
    }
}

exports.insertContent = async (req, res) => {
    try {
        // JWT
        const userNum = req.userData.userNum;
        const contentData = {
            ...req.body,
            userNum
        }

        const newContent = await contentService.insertContent(contentData);

        res.status(201).json({
            message: '컨텐츠가 성공적으로 생성되었습니다.',
            content : newContent
        });
    } catch (error) {
        res.status(500).json({ message: '컨텐츠 생성 중 서버 오류가 발생했습니다.', error: error.message });
    }
};

exports.updateContent = async (req, res) => {
    try {
        // JWT
        const userNum = req.userData.userNum;
        const contentData = {
            ...req.body,
            userNum
        }

        const updatedContent = await contentService.updateContent(req.params.conNum, contentData);

        res.status(200).json({ 
            message: '컨텐츠가 성공적으로 갱신되었습니다.',
            content : updatedContent
        });
    } catch (error) {
        res.status(500).json({ message: '컨텐츠 갱신 중 서버 오류가 발생했습니다.', error: error.message });
    }
};

exports.deleteContent = async (req, res) => {
    try {
        // JWT
        const userNum = req.userData.userNum;

        const isDeleted = await contentService.deleteContent(req.params.conNum, userNum);

        if (!isDeleted) {
            res.status(404).json({
                message: '컨텐츠를 찾을 수 없습니다.'
            });
        }
        res.status(200).json({
            message: '컨텐츠가 성공적으로 삭제되었습니다.'
        })
    } catch (error) {
        res.status(500).json({ message: '컨텐츠 삭제 중 서버 오류가 발생했습니다.', error: error.message });
    }
}