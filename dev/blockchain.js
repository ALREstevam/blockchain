import sha256 from "sha256";
import {
    getUuid
} from './common'

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

function Blockchain() {
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
Blockchain.prototype.createBlock = function (nonce, previousBlockHash, hash) {
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

Blockchain.prototype.getLastBlock = function () {
    return this.chain[this.chain.length - 1]
}

/*
 * Creates a new transaction and pushes it to the pending transactions
 */
Blockchain.prototype.createTransaction = function (amount, sender, recipient, signature) {
    return {
        amount: amount,
        sender: sender,
        recipient: recipient,
        signature: signature,
        id: `TID-${getUuid()}`,
    }
}

Blockchain.prototype.addPendingTransaction = function (transaction) {
    this.pendingTransactions.push(transaction)
    return this.getLastBlock().index + 1
}

Blockchain.prototype.hashBlock = function (previousBlockHash, currentBlockData, nonce) {
    const blockAsText = `${previousBlockHash}${nonce.toString()}${JSON.stringify(currentBlockData)}`
    return sha256(blockAsText)
}

Blockchain.prototype.isHashValid = function (hash) {
    return hash.substring(0, 4) === '0000'
}

Blockchain.prototype.generateNextBlockData = function () {
    return this.extractData({
        transactions: this.pendingTransactions,
        index: this.getLastBlock().index + 1
    })
}

Blockchain.prototype.extractData = function (block) {
    return {
        transactions: block.transactions,
        index: block.index
    }
}

Blockchain.prototype.proofOfWork = function (previousBlockHash, currentBlockData) {
    let hash = 'undefined'
    let nonce = -1
    do {
        nonce += 1
        hash = this.hashBlock(previousBlockHash, currentBlockData, nonce)
    } while (!this.isHashValid(hash))
    return nonce
}

Blockchain.prototype.findBlockByHash = function (hash) {
    return this.chain.find(block => {
        return block.hash === hash
    })
}

Blockchain.prototype.getTransactionById = function (id) {

    const minedTransaction = this.chain
        .map(block => block.transactions
            .map(transaction => {
                return {
                    transaction: transaction,
                    block: block
                }
            })
        )
        .flat()
        .find(el => el.transaction.id === id)

    if (minedTransaction) {
        return {
            transaction: minedTransaction.transaction,
            block: minedTransaction.block,
            status: 'MINED'
        }
    }

    const pendingTransaction = this.pendingTransactions
        .find(transaction => transaction.id === id)

    if (pendingTransaction) {
        return {
            transaction: pendingTransaction,
            status: 'PENDING'
        }
    }

}

Blockchain.prototype.getAddressData = function (address) {
    const minedTransactions = this.chain.map(block => block.transactions)
        .flat()
        .filter(transaction => {
            return transaction.sender === address || transaction.recipient === address
        })

    const pendingTransactions = this.pendingTransactions
        .filter(transaction => {
            return transaction.sender === address || transaction.recipient === address
        })


    let ballance = minedTransactions.reduce((el, transaction) => {
        let amount = transaction.amount

        if (transaction.sender === address) {
            return { ballance: el.ballance - amount, sended: el.sended + amount, received: el.received, miningReward: el.miningReward
            }
        } else {

            if (transaction.sender === '00') {
                return { ballance: el.ballance + amount, sended: el.sended, received: el.received + amount, miningReward: el.miningReward + amount
                }
            } else {
                return { ballance: el.ballance + amount, sended: el.sended, received: el.received + amount, miningReward: el.miningReward
                }
            }
        }
    }, {
        ballance: 0,
        sended: 0,
        received: 0,
        miningRewards: 0
    })



    return {
        transactions: {
            mined: minedTransactions,
            pending: pendingTransactions,
        },
        ballance
    }
}

export default Blockchain