import Blockchain from './blockchain'
import {
    getUuid
} from './common'
import request from 'request-promise'
import sha256 from "sha256";
import DigitalSignature from './DigitalSignature'

class NetworkNodeBlockchain extends Blockchain {
    constructor() {
        super()
        this.UUID = getUuid()
        this.signer = new DigitalSignature(
            (transaction)=>{return `${transaction.sender}|${transaction.recipient}|${transaction.amount}`},
            (transaction)=>{return transaction.signature}
        )
    }

    generateKeyPair(callback){
        this.signer.generateKeyPairAsync(callback)
    }

    signature(privateKey, transaction){
        console.log('SIGNING')
        return this.signer.doSign(transaction, privateKey)
    }

    verifySignature(signedTransaction, publicKey){
        console.log('VERIFY')
        console.log('pseudonym: ', this.pseudonym(publicKey),  signedTransaction.sender)



        return (this.pseudonym(publicKey) === signedTransaction.sender) && 
        this.signer.doVerify(signedTransaction, publicKey)
    }

    pseudonym(publicKey){
        return 'PSEUDONYM-' + sha256(publicKey).toUpperCase().substring(5,15)
    }

    broadcast(endpoint, receivers = [...this.networkNodes], message) {
        return {
            post: ()=>{
                return receivers.map((url) => request.post({
                        uri: `${url}${endpoint}`,
                        body: message,
                        json: true,
                    })
                )
            },
            get: ()=>{
                return receivers.map((url) => {
                    return request.get({uri: `${url}${endpoint}`, json: true})
                })
            }
        }
    }

    receiveMiningReward(amount) {
        return request.post({
            uri: `${this.nodeUrl}/broadcast/transaction`,
            body: {
                amount: amount,
                sender: "00", // 00 => SENDER is mining reward
                recipient: this.UUID,
            },
            json: true,
        })
    }

    isChainValid(chain) {

        //This methods validate single blocks or links between block
        const blockValidationMethods = {
            BROKEN_CHAIN: {
                validate: (currentBlock, previousBlock, chain) => {
                    if (currentBlock.previousBlockHash !== previousBlock.hash) {
                        return {
                            valid: false,
                            evidence: {
                                blocks: [currentBlock, previousBlock],
                            }
                        }
                    }
                    return {
                        valid: true
                    }
                }
            },
            INVALID_HASH: {
                validate: (currentBlock, previousBlock, chain) => {
                    const hash = this.hashBlock(previousBlock.hash,
                        this.extractData(currentBlock),
                        currentBlock.nonce)
                    if (!this.isHashValid(hash) || hash !== currentBlock.hash) {
                        return {
                            valid: false,
                            evidence: {
                                blocks: [currentBlock],
                            }
                        }
                    }
                    return {
                        valid: true
                    }
                }
            },
        }

        //This methods validate the chain as a hole (tests that should be called just once)
        const chainValidationMethods = {
            INVALID_GENESIS_BLOCK: {
                validate: (chain) => {
                    const genesisBlock = chain[0]
                    if ((genesisBlock.transactions && genesisBlock.transactions.length !== 0) ||
                        genesisBlock.nonce !== 42 ||
                        genesisBlock.previousBlockHash !== 'NONE' ||
                        genesisBlock.hash !== sha256('genesis_block')) {
                        return {
                            valid: false,
                            evidence: {
                                blocks: [genesisBlock],
                            }
                        }
                    }
                    return {
                        valid: true
                    }
                }
            },
        }


        let method, validationResult
        for (let methodName in chainValidationMethods) {
            method = chainValidationMethods[methodName]
            validationResult = method.validate(chain)
            if (!validationResult.valid) {
                return {
                    valid: false,
                    reason: methodName,
                    evidence: validationResult.evidence
                }
            }
        }

        for (let i = 1; i < chain.length; i += 1) {
            const currentBlock = chain[i]
            const previousBlock = chain[i - 1]

            for (let methodName in blockValidationMethods) {
                method = blockValidationMethods[methodName]
                validationResult = method.validate(currentBlock, previousBlock, chain)
                if (!validationResult.valid) {
                    return {
                        valid: false,
                        reason: methodName,
                        evidence: validationResult.evidence
                    }
                }
            }
        }

        return {
            valid: true,
        }

    }
}



export default NetworkNodeBlockchain