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
        return this.signer.doSign(transaction, privateKey)
    }

    verifySignature(signedTransaction, publicKey){
        //console.log(this.pseudonym(publicKey), signedTransaction.sender)
        return (signedTransaction.sender === '00' || this.pseudonym(publicKey) === signedTransaction.sender) && 
        this.signer.doVerify(signedTransaction, publicKey)
    }

    pseudonym(publicKey){
        const hash = sha256(publicKey)

        const name = {
            "0": "ASPEN", 
            "1":"ELM", 
            "2": "PINE", 
            "3":"MAPLE",
            "4": "JELLY", 
            "5": "POCKY", 
            "6": "DUMLE",
            "7": "MARIOLA", 
            "8": "DOLPHIN", 
            "9": "MEERKATS", 
            "A": "GRID",
            "B": "RAVEN", 
            "C": "PASSER", 
            "D": "SPRING", 
            "E": "WAGON", 
            "F": "CANDLE" 
        }
        
        return `PSE-${name[hash.charAt(0).toUpperCase()]}-${name[hash.charAt(1).toUpperCase()]}-${hash.toUpperCase().substring(0,15)}`
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

    receiveMiningReward(amount, coinReceiver) {
        const pair = this.signer.generateKeyPairSync()
        let transaction = {
            amount: amount,
            sender: "00", // 00 => SENDER is mining reward
            recipient: coinReceiver,
        }

        const signature = this.signer.doSign(transaction, pair.privateKey)

        transaction.signature = signature

        return request.post({
            uri: `${this.nodeUrl}/broadcast/transaction`,
            body: {
                transaction: transaction,
                publicKey: pair.publicKey,
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