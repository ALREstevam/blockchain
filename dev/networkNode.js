import express from 'express'
import bodyParser from 'body-parser'
import uuid from 'uuid/v1'
import Blockchain from './blockchain'
import request from 'request-promise'
import { oneLine } from 'common-tags'

const port = process.argv[2]

let app = express()
const someCoin = new Blockchain()
const nodeUUID = uuid().split('-').join('')

console.log(`The node UUID is ${nodeUUID}`)

function setHasOnly(set, element){
    return set.size === 1 && set.has(element)
}

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: false
}))

app.get('/', (req, res) => {
    res.json({
        message: `someCoin API`,
        stats: {
            blocksCreated: someCoin.chain.length,
            pendingTransactions: someCoin.transactions.length,
        }
    })
})

app.get('/blockchain', (req, res) => {
    res.send(someCoin)
})

app.post('/transaction', (req, res) => {
    const blockIndex = someCoin.createTransaction(req.body.amount, req.body.sender, req.body.recipient)
    res.json({
        message: `The transaction will be added in block #${blockIndex}`,
        blockIndex: blockIndex,
    })
})

app.get('/mine', (req, res) => {
    const lastBlock = someCoin.getLastBlock()
    const currentBlockData = {
        transactions: someCoin.pendingTransactions,
        index: lastBlock.index + 1
    }
    const nonce = someCoin.proofOfWork(lastBlock.hash, currentBlockData)
    const blockHash = someCoin.hashBlock(lastBlock.hash, currentBlockData, nonce)

    someCoin.createTransaction(1, "00", nodeUUID) // 00 => SENDER is mining reward
    const block = someCoin.createBlock(nonce, lastBlock.hash, blockHash);

    res.json({
        message: `A new block was mined sucessfully`,
        block: block,
    })
})



app.get('/nodes', (req, res) => {
    res.json({
        connectedToNodes: someCoin.networkNodes,
        nodeUrl: someCoin.nodeUrl
    })
})

/**
 * Registers a node and broadcasts it to the entire network
 */
app.post('/nodes/broadcast', (req, res) => {
    const newNodeUrl = req.body.node.url
    if(someCoin.networkNodes.size !== 0 && !setHasOnly(someCoin.networkNodes, newNodeUrl)){
        const registerNodesPromises = [...someCoin.networkNodes].map((url) => {
            return request.post({
                uri: `${url}/nodes/add`,
                body: {
                    node: {
                        url: newNodeUrl
                    },
                },
                json: true,
            })
        })
        Promise.all(registerNodesPromises).then(data => {
            return request.post({
                uri: `${newNodeUrl}/nodes/bulk`,
                body: {
                    nodesUri: [...someCoin.networkNodes, someCoin.nodeUrl]
                },
                json: true,
    
            })
        }).then(() => {
            someCoin.networkNodes.add(newNodeUrl)
            res.json({
                message: "The node was registered within the network sucessfully"
            })
        }).catch((err)=>{
            res.status(500)
            res.json({
                message: 'A unknown error happened',
                error:{
                    code: 0,
                    name: 'UNKNOWN_ERROR',
                    errorDump: err,
                }
            })
        })
    }
    else{
        someCoin.networkNodes.add(newNodeUrl)
        res.status(500)
        res.json({
            message: oneLine`This node has no friends :'(, 
                but you were added as the first. Please try other nodes`,
            error: {
                code: 47023,
                name: 'TRIED_TO_BE_ADDED_BY_A_LONELY_NODE'
            }
        })
    }



})

/**
 * Registers a node onto the network
 * This endpoint should be called from a node that received a requet to
 * add a new node to the network, broadcasting its address to the remaining nodes 
 * by calling on this endpoint, so there will not be infinit broadcast calls 
 */
app.post('/nodes/add', (req, res) => {
    const newNodeUrl = req.body.node.url
    console.log('Receiving a broadcast...')
    if (newNodeUrl === someCoin.nodeUrl) {
        res.json({
            message: oneLine`The broadcasted node was sucessfully received, 
            but it will not be saved since the address is the same of the receiver node`
        })
    } else {
        someCoin.networkNodes.add(newNodeUrl)
        res.json({
            message: "The broadcasted node was sucessfully regitered"
        })
    }
})


app.post('/nodes/reflective-add', (req,res)=>{
    const newNodeUrl = req.body.node.url
    
    if (newNodeUrl === someCoin.nodeUrl) {
        res.json({
            message: oneLine`The received node is the current node`
        })
    } else {
        someCoin.networkNodes.add(newNodeUrl)
        
        request.post({
            uri: `${newNodeUrl}/nodes/add`,
            body: {
                node: {
                    url: someCoin.nodeUrl
                },
            },
            json: true,
        }).then(()=>{
            res.json({
                message: oneLine`The received node was registered, a 
                    broadcast was successfully sent to the node to add you`
            })
        }).catch((err)=>{
            res.status(500)
            res.json({
                message: 'A unknown error happened',
                error:{
                    code: 0,
                    name: 'UNKNOWN_ERROR',
                    errorDump: err,
                }
            })
        })
    }

})

app.post('/nodes/bulk', (req, res) => {
    const nodes = req.body.nodesUri
    nodes.filter((node)=> {return node !== someCoin.nodeUrl})
        .forEach(node => {
        someCoin.networkNodes.add(node)
    });

    res.json({
        message: `Bulk registration was sucessful`
    })
})


app.listen(port, () => {
    console.log(`Listeing on port ${port}...`)
})