# Blockchain

This repository contains some studies in blockchain that i created based on a Udemy course. It's a **toy example** of how a real blockchain would work.


# Main differences from what is shown in the course
This project :
* Uses `yarn` instead of `npm`
* Uses the babel transpiler
* Applies digital signature to do transactions
* Has no UI

# Setup

```sh
# clone the repo
yarn install
yarn node1 #nodes 1 to 5 will start example nodes on ports 5001 to 5005

# Manual start

# on babel
babel-node ./dev/api.js <port> <node address>

# on nodemon
nodemon --watch dev -e js --exec yarn start <port> <node address>
```



# Usage example



**Creating a network**

```
POST http://localhost:5001/broadcast/nodes

SENDING
{
	url: "http://localhost:5002" // :5003 :5004 :5005
}
```



**Creating  a new transaction**

Getting the credentials

```
GET http://localhost:5001/user

TO GET
* A public key
* A private key
* Pseudonym
```

Signing the transaction

```
POST http://localhost:5001/sign

SENDING

{
	transaction: {
		sender: "",
		recipient: "",
		amount: 0,
	},
	publicKey: ""
}

TO RECEIVE the signature
```

Sending the transaction

```
POST http://localhost:5001/broadcast/transaction
{
	transaction: {
		sender: "",
		recipient: "",
		amount: 0,
	},
	publicKey: "",
	signature: ""
}
```



**Mining a new block and receiving a mining reward**

```
GET http://localhost:5001/mine/<pseudonym>
```



# Endpoints

### `[GET] /` endpoint

Recovers the user's pseudonym giving the public key

**Response**

```javascript
{
    "message": "someCoin API",
    "stats": {
  		"blocksCreated": 0,
		"pendingTransactions": 0,
    }
}
```





## User related

## `[GET] /user` endpoint

Creates and returns a new key pair, not saving them.

**Response**

```javascript
{
    "keyPair": {
        "publicKey": "string",
        "privateKey": "string",
    },
    "pseudonym": "string"
}
```

The pseudonym is a short string derived from your public key, you will need it to do transactions, using it as the sender identifier.



### `[POST] /pseudonym` endpoint

Recovers the user's pseudonym given the public key

**Request**

```javascript
{
    publicKey: "string"
}
```

**Response**

```javascript
{
    "pseudonym":"string"
}
```



### `[POST] /pseudonym` endpoint

Recovers the user's pseudonym giving the public key

**Request**

```javascript
{
    publicKey: "string"
}
```

**Response**

```javascript
{
    "pseudonym":"string"
}
```



## Search related

### `[GET] /address/:address` endpoint

Generates a user balance given its identifier 

**Response**

```javascript
{
    transactions: {
            mined: minedTransactions,
            pending: pendingTransactions,
        },
        ballance: {
            ballance: 0,
            sended: 0,
            received: 0,
            miningRewards: 0
        }
    }
```



### `[GET] /transaction/:transactionId` endpoint

Gets a transaction and the block where it resides given its id

**Response**

If the transaction's block was mined

```javascript
{
            transaction: <Transaction>,
            block: <Block>,
            status: 'MINED'
        }
```

If it's a pending transaction

```javascript
{
            transaction: <Transaction>,
            status: 'PENDING'
        }
```



### `[GET] /block/:blockHash` endpoint

Gets a mined block from its hash value

```javascript
{
        "block": <Block>
}
```



## Node connection related

### `[POST] /broadcast/nodes` endpoint

This is the endpoint that you should be using to add new nodes to the network. It will:

1. Save the new node's URL address
2. Broadcast the URL to the network
3. Send the addresses of the network nodes to the new node

**Request**

```javascript
{
    url: "string"
}
```

**Response**

```javascript
// A success message
```



### `[POST] /nodes/add` endpoint

Adds a new node to the network without saying it to anyone.

**Request**

```javascript
{
    node: {
		url: ""
	},
	senderUrl: "",
}
```

**Response**

```javascript
// Success message
```



### `[POST] /bulk/nodes` endpoint

Adds network nodes in bulk mode

**Request**

```javascript
{
    nodesUri: ["string"]
}
```

**Response**

```javascript
// Success message
```



### `[POST] /nodes/reflective-add` endpoint

A special case where you want to add a node and wants that they add you.

**Request**

```javascript
{
    url: "string"
}
```

**Response**

```javascript
// Success message
```



## Listing related

### `[GET] /nodes` endpoint

Gets the network saved onto a node

```javascript
{
        connectedToNodes: [""],
        nodeUrl: ""
}
```



### `[GET] /block/:blockHash` endpoint

Gets a mined block from its hash value

```javascript
{
        "block": <Block>
}
```



### `[GET] /blockchain` endpoint

Gets all blockchain data and the chain from a node

```javascript
{
        ...
}
```



## Transaction related

### `[POST] /sign` endpoint

Creates the digital signature for a transaction to be made

**Request**

```javascript
{
    transaction:{
        sender: "",
        recipient: "",
        amount: ""
    },
    privateKey: "string"
}
```

**Response**

```javascript
{
    transaction:{
        sender: "",
        recipient: "",
        amount: ""
    },
    signature: ""
}
```



### `[POST] /broadcast/transactio` and `[POST] /transaction` endpoint

Only the first one should be used by a person, the second one is called on broadcasts and adds the transaction to the node where it's called only.

**Request**

```javascript
{
    transaction:{
        amount: "amount",
        sender: "sender",
		recipient: "recipient",
        signature: "signature"
    },
	publicKey: "string"
}
```

**Response**

```javascript
// Success message
```



## Mining related



### `[POST] /mine` endpoint

Mines a block to the pending transactions, broadcasts the new block's data to the network and broadcasts a new transaction with the mining reward to itself

**Request**

```javascript
{
    coinReceiver: ""
}
```

**Response**

```javascript
// Success message
```



### `[GET] /consensus` endpoint

Called when the node registers an error in the chain construction. It requests the chains of all nodes and uses the longest chain rule to replace its chain by the longest one

```javascript
// Chain replaced or not replaced
```