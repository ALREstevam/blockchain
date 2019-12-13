
import Blockchain from "./blockchain";

const someCoin = new Blockchain()

someCoin.createBlock(21520, 'ASWER36A3A85', 'SASDDD74FE')

someCoin.createTransaction(152, 'person1_8685ASDE', 'person2_8ER8R55')

// "mining" a new block
someCoin.createBlock(89320, 'DD3838ADEASDF', 'ASWER36A3A85')

someCoin.createTransaction(1250, 'person1_8685ASDE', 'person2_8ER8R55')
someCoin.createTransaction(13, 'person1_8685ASDE', 'person2_8ER8R55')

someCoin.createBlock(1279628, 'DD3838ADEASDF', 'ASWER36A3A85')


console.log(someCoin)

