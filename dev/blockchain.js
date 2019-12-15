import sha256 from "sha256";
import {getUuid} from './common'

const nodeUrl = process.argv[3]

/*
//This also works
class Blockchain {
    constructor(){
        this.chain = []
        this.newTransactions = []
    }
}
*/

function Blockchain(){ 
    this.chain = [] // all blocks created
    this.pendingTransactions = [] // new transactions that don't form a block yet
    this.nodeUrl = nodeUrl
    this.networkNodes = new Set()

    //creating a Genesis Block
    this.createBlock(42, 'NONE', sha256('genesis_block'))
}

/**
* Gets the pending transactions
* Puts them into a block
* Pushes the block to the chain
* Removes all transactions on pending state
*/
Blockchain.prototype.createBlock = function(nonce, previousBlockHash, hash){
    const block = {
        index: this.chain.length + 1,
        timestamp: Date.now(),
        transactions: this.pendingTransactions, // transactions waiting to be placed onto a block
        nonce: nonce,
        hash: hash, // hash generated considering the block's transactions as a single string
        previousBlockHash: previousBlockHash,
    }
    this.pendingTransactions = []
    this.chain.push(block)
    return block
}

Blockchain.prototype.getLastBlock = function(){
    return this.chain[this.chain.length - 1]
}

/*
* Creates a new transaction and pushes it to the pending transactions
*/
Blockchain.prototype.createTransaction = function(amount, sender, recipient){
    return {
        amount: amount,
        sender: sender,
        recipient: recipient,
        transactionId: `TID${getUuid()}`,
    }
}

Blockchain.prototype.addPendingTransaction = function(transaction){
    this.pendingTransactions.push(transaction)
    return this.getLastBlock().index + 1
}

Blockchain.prototype.hashBlock = function(previousBlockHash, currentBlockData, nonce){
    const blockAsText = `${previousBlockHash}${nonce.toString()}${JSON.stringify(currentBlockData)}`
    const hash = sha256(blockAsText)
    return hash
}

Blockchain.prototype.isHashValid = function(hash){
    return hash.substring(0,4) === '0000'
}


Blockchain.prototype.proofOfWork = function(previousBlockHash, currentBlockData){
    let hash = 'undefined'
    let nonce = -1

    do{
        nonce += 1
        hash = this.hashBlock(previousBlockHash, currentBlockData, nonce)
        
    }while(!this.isHashValid(hash))

    return nonce
}

export default Blockchain

