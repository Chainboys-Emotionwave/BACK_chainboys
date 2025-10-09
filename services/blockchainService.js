const { ethers } = require('ethers');

const { 
    getProvider, 
    getAdminWallet, 
    CHALLENGE_CONTRACT_ABI, 
    SUPPORT_CONTRACT_ABI, 
    CONTRACT_ADDRESSES, 
    GAS_CONFIG 
} = require('../config/blockchain');

class BlockchainService {
    constructor() {
        this.provider = getProvider();
        this.adminWallet = getAdminWallet();
        this.challengeContract = new ethers.Contract(
            CONTRACT_ADDRESSES.challenge,
            CHALLENGE_CONTRACT_ABI,
            this.adminWallet
        );
        this.supportContract = new ethers.Contract(
            CONTRACT_ADDRESSES.support,
            SUPPORT_CONTRACT_ABI,
            this.adminWallet
        );
    }

    // 네트워크 연결 상태 확인
    async checkConnection() {
        try {
            const network = await this.provider.getNetwork();
            const balance = await this.provider.getBalance(this.adminWallet.address);
            return {
                connected: true,
                network: network.name,
                chainId: network.chainId.toString(),
                adminBalance: ethers.formatEther(balance),
                adminAddress: this.adminWallet.address
            };
        } catch (error) {
            return {
                connected: false,
                error: error.message
            };
        }
    }

    // 트랜잭션 상태 확인
    async getTransactionStatus(txHash) {
        try {
            const receipt = await this.provider.getTransactionReceipt(txHash);
            return {
                hash: txHash,
                status: receipt ? (receipt.status === 1 ? 'success' : 'failed') : 'pending',
                blockNumber: receipt?.blockNumber,
                gasUsed: receipt?.gasUsed?.toString(),
                confirmations: receipt ? await this.provider.getBlockNumber() - receipt.blockNumber : 0
            };
        } catch (error) {
            throw new Error(`트랜잭션 상태 확인 실패: ${error.message}`);
        }
    }

    // 가스 비용 추정
    async estimateGas(contract, method, ...args) {
        try {
            const gasEstimate = await contract[method].estimateGas(...args);
            return {
                gasLimit: gasEstimate.toString(),
                gasPrice: GAS_CONFIG.gasPrice.toString(),
                estimatedCost: ethers.formatEther(gasEstimate * GAS_CONFIG.gasPrice)
            };
        } catch (error) {
            throw new Error(`가스 비용 추정 실패: ${error.message}`);
        }
    }

    // 이벤트 로그 조회
    async getEventLogs(contract, eventName, fromBlock = 0, toBlock = 'latest') {
        try {
            const filter = contract.filters[eventName]();
            const logs = await contract.queryFilter(filter, fromBlock, toBlock);
            return logs;
        } catch (error) {
            throw new Error(`이벤트 로그 조회 실패: ${error.message}`);
        }
    }

    // 컨트랙트 정보 조회
    async getContractInfo() {
        try {
            return {
                challengeContract: {
                    address: CONTRACT_ADDRESSES.challenge,
                    network: await this.provider.getNetwork()
                },
                supportContract: {
                    address: CONTRACT_ADDRESSES.support,
                    network: await this.provider.getNetwork()
                }
            };
        } catch (error) {
            throw new Error(`컨트랙트 정보 조회 실패: ${error.message}`);
        }
    }
}

module.exports = new BlockchainService();

