const blockchainService = require('../services/blockchainService');
const challengeBlockchainService = require('../services/challengeBlockchainService');
const supportBlockchainService = require('../services/supportBlockchainService');
const challengeModel = require('../models/challengeModel');
const supportModel = require('../models/supportModel');

// 블록체인 연결 상태 확인
exports.getBlockchainStatus = async (req, res) => {
    try {
        const status = await blockchainService.checkConnection();
        res.status(200).json({
            message: '블록체인 상태 조회 성공',
            data: status
        });
    } catch (error) {
        res.status(500).send('서버 오류 : ' + error.message);
    }
};

// 챌린지 상금 예치
exports.depositChallengePrize = async (req, res) => {
    try {
        const { challNum, prizeDistribution } = req.body;
        const role = req.userData.role;
        
        if (role !== 'admin') {
            return res.status(403).send('관리자만 상금을 예치할 수 있습니다.');
        }

        const challenge = await challengeModel.getChallenge(challNum);
        if (!challenge) {
            return res.status(404).send('챌린지를 찾을 수 없습니다.');
        }

        const result = await challengeBlockchainService.createChallengeWithPrize({
            challNum,
            challPrize: challenge.challPrize,
            prizeDistribution
        });

        res.status(200).json({
            message: '챌린지 상금 예치 성공',
            data: result
        });
    } catch (error) {
        res.status(500).send('서버 오류 : ' + error.message);
    }
};

// 챌린지 상금 분배
exports.distributeChallengePrize = async (req, res) => {
    try {
        const { challNum } = req.params;
        const role = req.userData.role;
        
        if (role !== 'admin') {
            return res.status(403).send('관리자만 상금을 분배할 수 있습니다.');
        }

        // 상금 분배 가능 여부 확인
        const canDistribute = await challengeBlockchainService.canDistributePrize(challNum);
        if (!canDistribute.canDistribute) {
            return res.status(400).send(canDistribute.reason);
        }

        const result = await challengeBlockchainService.distributePrize(challNum);

        res.status(200).json({
            message: '챌린지 상금 분배 성공',
            data: result
        });
    } catch (error) {
        res.status(500).send('서버 오류 : ' + error.message);
    }
};

// 챌린지 블록체인 정보 조회
exports.getChallengeBlockchainInfo = async (req, res) => {
    try {
        const { challNum } = req.params;
        
        const [dbInfo, blockchainInfo] = await Promise.all([
            challengeModel.getChallengeBlockchainInfo(challNum),
            challengeBlockchainService.getChallengeBlockchainInfo(challNum)
        ]);

        res.status(200).json({
            message: '챌린지 블록체인 정보 조회 성공',
            data: {
                db: dbInfo,
                blockchain: blockchainInfo
            }
        });
    } catch (error) {
        res.status(500).send('서버 오류 : ' + error.message);
    }
};

// 응원 블록체인 기록 (1시간 배치)
exports.recordHourlySupports = async (req, res) => {
    try {
        const result = await supportBlockchainService.recordHourlySupports();
        
        res.status(200).json({
            message: '응원 블록체인 기록 성공',
            data: result
        });
    } catch (error) {
        res.status(500).send('서버 오류 : ' + error.message);
    }
};

// 특정 콘텐츠 응원 히스토리 조회
exports.getSupportHistory = async (req, res) => {
    try {
        const { conNum } = req.params;
        
        const history = await supportBlockchainService.getSupportHistory(conNum);
        
        res.status(200).json({
            message: '응원 히스토리 조회 성공',
            data: history
        });
    } catch (error) {
        res.status(500).send('서버 오류 : ' + error.message);
    }
};

// 응원 기록 상태 확인
exports.getSupportRecordStatus = async (req, res) => {
    try {
        const { conNum } = req.query;
        
        let status;
        if (conNum) {
            status = await supportBlockchainService.getSupportRecordStatus(conNum);
        } else {
            status = await supportModel.getBlockchainRecordStatus();
        }
        
        res.status(200).json({
            message: '응원 기록 상태 조회 성공',
            data: status
        });
    } catch (error) {
        res.status(500).send('서버 오류 : ' + error.message);
    }
};

// 수동 배치 처리
exports.recordBatchSupports = async (req, res) => {
    try {
        const { contentIds, startDate, endDate } = req.body;
        const role = req.userData.role;
        
        if (role !== 'admin') {
            return res.status(403).send('관리자만 배치 처리를 실행할 수 있습니다.');
        }

        let result;
        if (contentIds) {
            result = await supportBlockchainService.recordBatchSupports(contentIds);
        } else if (startDate && endDate) {
            result = await supportBlockchainService.recordSupportsByPeriod(
                new Date(startDate), 
                new Date(endDate)
            );
        } else {
            return res.status(400).send('contentIds 또는 startDate, endDate가 필요합니다.');
        }

        res.status(200).json({
            message: '배치 응원 기록 성공',
            data: result
        });
    } catch (error) {
        res.status(500).send('서버 오류 : ' + error.message);
    }
};

// 트랜잭션 상태 확인
exports.getTransactionStatus = async (req, res) => {
    try {
        const { txHash } = req.params;
        
        const status = await blockchainService.getTransactionStatus(txHash);
        
        res.status(200).json({
            message: '트랜잭션 상태 조회 성공',
            data: status
        });
    } catch (error) {
        res.status(500).send('서버 오류 : ' + error.message);
    }
};

// 블록체인 이벤트 조회
exports.getBlockchainEvents = async (req, res) => {
    try {
        const { type, challNum, fromBlock, toBlock } = req.query;
        
        let events;
        if (type === 'challenge') {
            events = await challengeBlockchainService.getChallengeEvents(
                challNum, 
                parseInt(fromBlock) || 0, 
                toBlock || 'latest'
            );
        } else if (type === 'support') {
            events = await supportBlockchainService.getSupportEvents(
                parseInt(fromBlock) || 0, 
                toBlock || 'latest'
            );
        } else {
            return res.status(400).send('type은 challenge 또는 support여야 합니다.');
        }
        
        res.status(200).json({
            message: '블록체인 이벤트 조회 성공',
            data: events
        });
    } catch (error) {
        res.status(500).send('서버 오류 : ' + error.message);
    }
};

// 컨트랙트 정보 조회
exports.getContractInfo = async (req, res) => {
    try {
        const info = await blockchainService.getContractInfo();
        
        res.status(200).json({
            message: '컨트랙트 정보 조회 성공',
            data: info
        });
    } catch (error) {
        res.status(500).send('서버 오류 : ' + error.message);
    }
};

