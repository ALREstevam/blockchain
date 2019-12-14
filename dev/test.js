
import Blockchain from "./blockchain";

const someCoin = new Blockchain()

someCoin.createBlock(21520, 'ASWER36A3A85', 'SASDDD74FE')

const someHash = 'a23s54d6a3e84f32as'
const transactions = [{amount: 152, sender: 'person1_9685ASDE', recipient:'person2_8ER8R55'}]
const proofOfWork = someCoin.proofOfWork(someHash, transactions)

console.log(proofOfWork)

console.log(someCoin.hashBlock(someHash, transactions, proofOfWork))
