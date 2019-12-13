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
    this.newTransactions = [] // new transactions that don't form a block yet
}

Blockchain.prototype.createNewBlock = function(nonce, previousBlockHash, hash){
    const newBlock = {
        index: this.chain.length + 1,
        timestamp: Date.now(),
        transactions: this.transactions, // transactions waiting to be placed onto a block
        nonce: nonce,
        hash: hash, // hash generated considering the block's transactions as a single string
        previousBlockHash: previousBlockHash,
    }

    this.newTransactions = []
    this.chain.push(newBlock)

    return newBlock
}


