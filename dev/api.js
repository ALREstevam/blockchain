import express from 'express'
import bodyParser from 'body-parser'
import Blockchain from './blockchain'
import request from 'request-promise'
import { oneLine } from 'common-tags'
import {setHasOnly, getUuid} from './common'
import NetworkNodeBlockchain from './NetworkNodeBlockchain'

const port = process.argv[2]

let app = express()
//const someCoin = new Blockchain()
const someCoin = new NetworkNodeBlockchain()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: false
}))


/**
 * Default endpoint, returns some basic information about the node
 */
app.get('/', (req, res) => {
    res.json({
        message: `someCoin API`,
        stats: {
            blocksCreated: someCoin.chain.length,
            pendingTransactions: someCoin.transactions.length,
        }
    })
})

/**
 * Returns the entire blockchain stored by the node
 */
app.get('/blockchain', (req, res) => {
    res.send(someCoin)
})

/**
 * Adds a transaction on the node
*/
app.post('/transaction', (req, res) => {
    console.log('Receiving a broadcast with a transaction')
    const transaction = req.body
    const blockIndex = someCoin.addPendingTransaction(transaction)
    res.json({
        message: `The transaction will be added in block #${blockIndex}`,
        blockIndex: blockIndex,
    })
})

/**
 * Adds a new transaction and broadcasts it to the network
 */
app.post('/broadcast/transaction/', (req, res)=>{
    const transaction = someCoin.createTransaction(req.body.amount, req.body.sender, req.body.recipient)
    const blockIndex = someCoin.addPendingTransaction(transaction)

    Promise.all(
        someCoin.broadcastPost('/transaction', transaction)
    ).then((response)=>{
        res.json({
            message: oneLine`Transaction created and broadcasted successfully. 
                It will be added in block #${blockIndex}`,
            blockIndex: blockIndex,
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

})



app.post('/block', (req, res)=> {

})



/**
 * Mines a new coin and adds the pending transactions to a new block
 */
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
        message: `A new block was mined successfully`,
        block: block,
    })
})


/**
 * Returns the friend nodes of this node
 */
app.get('/nodes', (req, res) => {
    res.json({
        connectedToNodes: someCoin.networkNodes,
        nodeUrl: someCoin.nodeUrl
    })
})

/**
 * Registers a node and broadcasts it to the entire network
 */
app.post('/broadcast/nodes', (req, res) => {
    const newNodeUrl = req.body.node.url

    if(someCoin.nodeUrl === newNodeUrl){
        res.status(500)
        res.json({
            message: oneLine`You can't add a reference to itself on the node network`,
            error: {
                code: 5377,
                name: 'TRIED_TO_LOOP_NETWORK'
            }
        })
    }
    else if(someCoin.networkNodes.size === 0 || setHasOnly(someCoin.networkNodes, newNodeUrl)){
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
    else{
        const registerNodesPromises = someCoin.broadcastPost(
            '/nodes/add', 
            {node: {url: newNodeUrl}, senderUrl: someCoin.nodeUrl},
            [...someCoin.networkNodes].filter((url)=>{return url != someCoin.nodeUrl && url != newNodeUrl}))

        Promise.all(registerNodesPromises).then(data => {
            return request.post({
                uri: `${newNodeUrl}/bulk/nodes`,
                body: {
                    nodesUri: [...someCoin.networkNodes, someCoin.nodeUrl]
                },
                json: true,
            })
        }).then(() => {
            someCoin.networkNodes.add(newNodeUrl)
            res.json({
                message: "The node was registered within the network successfully"
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

/**
 * Registers a node onto the network
 * This endpoint should be called from a node that received a request to
 * add a new node to the network, broadcasting its address to the remaining nodes 
 * by calling on this endpoint, so there will not be infinity broadcast calls 
 */
app.post('/nodes/add', (req, res) => {
    const newNodeUrl = req.body.node.url
    const senderUrl = req.body.senderUrl

    let successMessages = []

    console.log('Receiving a broadcast...')

    if (newNodeUrl === someCoin.nodeUrl) {
        res.status(500)
        res.json({
            message: oneLine`You can't add a reference to itself on the node network`,
            error: {
                code: 5377,
                name: 'TRIED_TO_LOOP_NETWORK'
            }
        })
        return
    } else {
        someCoin.networkNodes.add(newNodeUrl)
        successMessages.push("The broadcasted node was successfully registered")
    }

    if(senderUrl && newNodeUrl !== someCoin.nodeUrl && !someCoin.networkNodes.has(senderUrl)){
        someCoin.networkNodes.add(senderUrl)
        successMessages.push('You were added as a friend node')
    }
    res.json({message: successMessages})
    
})

/**
 * For manual use / tests purpose only, this should be used when you know a address of another node,
 * and wants to connect it to your 
 */
app.post('/nodes/reflective-add', (req,res)=>{
    const newNodeUrl = req.body.node.url
    
    if (newNodeUrl === someCoin.nodeUrl) {
        res.status(500)
        res.json({
            message: oneLine`You can't add a reference to itself on the node network`,
            error: {
                code: 5377,
                name: 'TRIED_TO_LOOP_NETWORK'
            }
        })
    } else {
        someCoin.networkNodes.add(newNodeUrl)
        
        request.post({
            uri: `${newNodeUrl}/nodes/add`,
            body: {
                node: {
                    url: someCoin.nodeUrl
                },
                senderUrl: someCoin.nodeUrl,
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

app.post('/bulk/nodes', (req, res) => {
    const nodes = req.body.nodesUri
    nodes.filter((node)=> {return node !== someCoin.nodeUrl})
        .forEach(node => {
        someCoin.networkNodes.add(node)
    });

    res.json({
        message: `Bulk registration was successfully`
    })
})


app.listen(port, () => {
    console.log(`Listening on port ${port}...`)
})