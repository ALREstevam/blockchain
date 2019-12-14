import express from 'express'
import bodyParser from 'body-parser'
import uuid from 'uuid/v1'
import Blockchain from './blockchain'

const port = process.argv[2]

let app = express()
const someCoin = new Blockchain()
const nodeAddress = uuid().split('-').join('')

console.log(`The node UUID is ${nodeAddress}`)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

app.get('/blockchain', (req, res) => {
    res.send(someCoin)
})

app.post('/transaction', (req, res) => {
    const blockIndex = someCoin.createTransaction(req.body.amount, req.body.sender, req.body.recipient)
    res.json(
        {
            message: `The transaction will be added in block #${blockIndex}`, 
            blockIndex: blockIndex, 
        }
    )
})

app.get('/mine', (req, res) => {
    const lastBlock = someCoin.getLastBlock()
    const currentBlockData = {
        transactions: someCoin.pendingTransactions,
        index: lastBlock.index + 1
    }
    const nonce = someCoin.proofOfWork(lastBlock.hash, currentBlockData)
    const blockHash = someCoin.hashBlock(lastBlock.hash, currentBlockData, nonce)

    someCoin.createTransaction(1, "00", nodeAddress) // 00 => SENDER is mining reward
    const block = someCoin.createBlock(nonce, lastBlock.hash, blockHash);

    res.json({
        message: `A new block was mined sucessfully`,
        block: block,
    })
})

app.get('/', (req, res) => {
    res.json({
        message: `someCoin API`,
        stats:{
            blocksCreated: someCoin.chain.length,
            pendingTransactions: someCoin.transactions.length,
        }
    })
})

app.listen(port, ()=>{
    console.log(`Listeing on port ${port}...`)
})