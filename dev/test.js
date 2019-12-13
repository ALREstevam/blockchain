
import Blockchain from "./blockchain";

const someCoin = new Blockchain()

someCoin.createBlock(21520, 'ASWER36A3A85', 'SASDDD74FE')

const transactions = [{amount: 152, sender: 'person1_9685ASDE', recipient:'person2_8ER8R55'}]

console.log(someCoin.hashBlock('687435412', transactions, 995526))

console.log(someCoin)

