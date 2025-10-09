const blockchainService = require('./blockchainService');
const supportModel = require('../models/supportModel');
const { ethers } = require('ethers');

class SupportBlockchainService {
    constructor() {
        this.contract = blockchainService.supportContract;
    }

    // 1) 1시간 동안의 응원을 블록체인에 기록
    async recordHourlySupports() {
        try {
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            const supports = await supportModel.getSupportsForBlockchain(oneHourAgo);

            if (!supports || supports.length === 0) {
                return {
                    success: true,
                    message: '기록할 응원 데이터가 없습니다.',
                    recordedCount: 0
                };
            }

            const contentIds = supports.map(s => s.conNum);
            const supporters = supports.map(s => s.supporterWalletAddress);
            const amounts = supports.map(() => 1);
            const timestamp = Math.floor(Date.now() / 1000);

            const tx = await this.contract.recordSupports(
                contentIds,
                supporters,
                amounts,
                timestamp,
                { gasLimit: 1000000 }
            );

            const receipt = await tx.wait();

            await supportModel.updateSupportsBlockchainInfo(
                supports.map(s => s.supNum),
                {
                    txHash: tx.hash,
                    blockNumber: receipt.blockNumber,
                    recordedAt: new Date()
                }
            );

            return {
                success: true,
                txHash: tx.hash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed.toString(),
                recordedCount: supports.length,
                timestamp
            };
        } catch (error) {
            throw new Error(`응원 블록체인 기록 실패: ${error.message}`);
        }
    }

    // 2) 특정 콘텐츠의 응원 히스토리 조회 (온체인)
    async getSupportHistory(conNum) {
        try {
            const history = await this.contract.getSupportHistory(conNum);
            return {
                supporters: history[0],
                amounts: history[1].map(a => a.toString()),
                timestamps: history[2].map(t => new Date(parseInt(t.toString()) * 1000))
            };
        } catch (error) {
            throw new Error(`응원 히스토리 조회 실패: ${error.message}`);
        }
    }

    // 3) 응원 기록 상태 확인 (DB vs 온체인 비교 요약)
    async getSupportRecordStatus(conNum) {
        try {
            const dbSupports = await supportModel.getSupportsByContent(conNum);
            const blockchainHistory = await this.getSupportHistory(conNum);

            return {
                dbCount: dbSupports.length,
                blockchainCount: blockchainHistory.supporters.length,
                lastRecorded: blockchainHistory.timestamps.length > 0 ?
                    blockchainHistory.timestamps[blockchainHistory.timestamps.length - 1] : null,
                isSynced: dbSupports.length === blockchainHistory.supporters.length
            };
        } catch (error) {
            throw new Error(`응원 기록 상태 확인 실패: ${error.message}`);
        }
    }

    // 4) 배치 처리: 여러 콘텐츠의 응원을 한 번에 기록
    async recordBatchSupports(contentIds) {
        try {
            const results = [];

            for (const conNum of contentIds) {
                try {
                    const supports = await supportModel.getSupportsByContentForBlockchain(conNum);

                    if (supports && supports.length > 0) {
                        const contentIds = supports.map(s => s.conNum);
                        
                        const supporters = supports.map(s => s.supporterWalletAddress);
                        const amounts = supports.map(() => 1);
                        const timestamp = Math.floor(Date.now() / 1000);

                        const tx = await this.contract.recordSupports(
                            contentIds, // 👈 수정: 길이가 N인 배열을 전달합니다.
                            supporters,
                            amounts,
                            timestamp,
                            { gasLimit: 500000 }
                        );

                        const receipt = await tx.wait();

                        await supportModel.updateSupportsBlockchainInfo(
                            supports.map(s => s.supNum),
                            {
                                txHash: tx.hash,
                                blockNumber: receipt.blockNumber,
                                recordedAt: new Date()
                            }
                        );

                        results.push({ conNum, success: true, txHash: tx.hash, recordedCount: supports.length });
                    } else {
                        results.push({ conNum, success: true, recordedCount: 0, message: '기록할 데이터 없음' });
                    }
                } catch (error) {
                    results.push({ conNum, success: false, error: error.message });
                }
            }

            return { success: true, results };
        } catch (error) {
            throw new Error(`배치 응원 기록 실패: ${error.message}`);
        }
    }

    // 5) 응원 이벤트 로그 조회
    async getSupportEvents(fromBlock = 0, toBlock = 'latest') {
        try {
            const events = await blockchainService.getEventLogs(
                this.contract,
                'SupportsRecorded',
                fromBlock,
                toBlock
            );

            return events.map(e => ({
                blockNumber: e.blockNumber,
                transactionHash: e.transactionHash,
                contentIds: e.args.contentIds.map(id => id.toString()),
                supporters: e.args.supporters,
                amounts: e.args.amounts.map(a => a.toString()),
                timestamp: new Date(parseInt(e.args.timestamp.toString()) * 1000)
            }));
        } catch (error) {
            throw new Error(`응원 이벤트 조회 실패: ${error.message}`);
        }
    }

    // 6) 스케줄러 진입점 (외부에서 cron으로 호출)
    async startHourlyBatch() {
        try {
            const result = await this.recordHourlySupports();
            return result;
        } catch (error) {
            throw error;
        }
    }

    // 7) 수동 기간별 기록 (컨트롤러에서 사용)
    async recordSupportsByPeriod(startDate, endDate) {
        try {
            const supports = await supportModel.getSupportsByPeriod(startDate, endDate);

            if (!supports || supports.length === 0) {
                return {
                    success: true,
                    message: '해당 기간에 기록할 응원 데이터가 없습니다.',
                    recordedCount: 0
                };
            }

            const contentIds = supports.map(s => s.conNum);
            const supporters = supports.map(s => s.supporterWalletAddress);
            const amounts = supports.map(() => 1);
            const timestamp = Math.floor(endDate.getTime() / 1000);

            const tx = await this.contract.recordSupports(
                contentIds,
                supporters,
                amounts,
                timestamp,
                { gasLimit: 2000000 }
            );

            const receipt = await tx.wait();

            await supportModel.updateSupportsBlockchainInfo(
                supports.map(s => s.supNum),
                {
                    txHash: tx.hash,
                    blockNumber: receipt.blockNumber,
                    recordedAt: new Date()
                }
            );

            return {
                success: true,
                txHash: tx.hash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed.toString(),
                recordedCount: supports.length,
                contentCount: Array.from(new Set(contentIds)).length
            };
        } catch (error) {
            throw new Error(`기간별 응원 기록 실패: ${error.message}`);
        }
    }
}

module.exports = new SupportBlockchainService();
