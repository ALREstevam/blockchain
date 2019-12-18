
import Blockchain from "./blockchain"
import NetworkNodeBlockchain from "./NetworkNodeBlockchain"
import {findIndex} from './common'

const someCoin = new NetworkNodeBlockchain()

const bc1 = [
    {
      "index": 1,
      "timestamp": 1576503459101,
      "transactions": [],
      "nonce": 42,
      "hash": "a1c0749b5b39ae000916b037528fe92676b68cc28ce91dc6762e50698c98214e",
      "previousBlockHash": "NONE"
    },
    {
      "index": 2,
      "timestamp": 1576503511289,
      "transactions": [
        {
          "amount": 500,
          "sender": "RSEF3R4F5G5423RRGF3335V",
          "recipient": "SDGF43FSDG4WDEV88524",
          "transactionId": "TID-4d86b610200911ea80304b892ae57255"
        },
        {
          "amount": 300,
          "sender": "RSEF3R4F5G5423RRGF3335V",
          "recipient": "SDGF43FSDG4WDEV88524",
          "transactionId": "TID-4f7fc6f0200911ea80304b892ae57255"
        },
        {
          "amount": 200,
          "sender": "RSEF3R4F5G5423RRGF3335V",
          "recipient": "SDGF43FSDG4WDEV88524",
          "transactionId": "TID-51b851d0200911ea80304b892ae57255"
        }
      ],
      "nonce": 116889,
      "hash": "0000295edea9104407207d95b1488df8228ecddc4eeff220b3a2a2d2baf9af2a",
      "previousBlockHash": "a1c0749b5b39ae000916b037528fe92676b68cc28ce91dc6762e50698c98214e"
    },
    {
      "index": 3,
      "timestamp": 1576503540010,
      "transactions": [
        {
          "amount": 1,
          "sender": "00",
          "recipient": "3a1a5460200911ea8d4db1cda12ed995",
          "transactionId": "TID-595b4690200911ea8d4db1cda12ed995"
        },
        {
          "amount": 200,
          "sender": "RSEF3R4F5G5423RRGF3335V",
          "recipient": "SDGF43FSDG4WDEV88524",
          "transactionId": "TID-60bc9e70200911ea80304b892ae57255"
        },
        {
          "amount": 600,
          "sender": "RSEF3R4F5G5423RRGF3335V",
          "recipient": "SDGF43FSDG4WDEV88524",
          "transactionId": "TID-6441a680200911ea80304b892ae57255"
        },
        {
          "amount": 666,
          "sender": "RSEF3R4F5G5423RRGF3335V",
          "recipient": "SDGF43FSDG4WDEV88524",
          "transactionId": "TID-66c989e0200911ea80304b892ae57255"
        }
      ],
      "nonce": 56219,
      "hash": "00001de5cd4e27ace310c7787577ed3e13c0df7091e397f67377bacf835c86f3",
      "previousBlockHash": "0000295edea9104407207d95b1488df8228ecddc4eeff220b3a2a2d2baf9af2a"
    },
    {
      "index": 4,
      "timestamp": 1576503550727,
      "transactions": [
        {
          "amount": 1,
          "sender": "00",
          "recipient": "3a1a5460200911ea8d4db1cda12ed995",
          "transactionId": "TID-6a6a0930200911ea8d4db1cda12ed995"
        }
      ],
      "nonce": 9691,
      "hash": "0000994c03f9b2aad281ae1609e37ee9020a35e225cc6f750e378b67efddb8db",
      "previousBlockHash": "00001de5cd4e27ace310c7787577ed3e13c0df7091e397f67377bacf835c86f3"
    },
    {
      "index": 5,
      "timestamp": 1576503566976,
      "transactions": [
        {
          "amount": 1,
          "sender": "00",
          "recipient": "3a2ca3e0200911eaab8fc91563d57493",
          "transactionId": "TID-70dae690200911eaab8fc91563d57493"
        },
        {
          "amount": 666,
          "sender": "RSEF3R4F5G5423RRGF3335V",
          "recipient": "SDGF43FSDG4WDEV88524",
          "transactionId": "TID-77b1ffd0200911ea80304b892ae57255"
        }
      ],
      "nonce": 45428,
      "hash": "00005d36e6d955ce008e62d546106ac06f2a4b1f966d3f1fb62084ce4603f220",
      "previousBlockHash": "0000994c03f9b2aad281ae1609e37ee9020a35e225cc6f750e378b67efddb8db"
    }
  ]




import DigitalSignature from './DigitalSignature'

const signer = new DigitalSignature()

const keys = signer.generateKeyPairSync()

console.log(keys)

const data = {
  'something': 'hello'
}

const signature = signer.doSign(data, keys.privateKey) + 'a'

console.log(signature)


console.log(signer.doVerify(data, keys.publicKey, signature))