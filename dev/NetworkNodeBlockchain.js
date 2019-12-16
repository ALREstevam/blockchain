import Blockchain from './blockchain'
import {getUuid} from './common'
import request from 'request-promise'


class NetworkNodeBlockchain extends Blockchain{
    constructor(){
        super()
        this.UUID = getUuid()
    }

    broadcast(endpoint, message, receivers=[...this.networkNodes]){
        return receivers.map((url)=>{
            return request.post({
                uri: `${url}${endpoint}`,
                body: message,
                json: true,
            })
        })
    }

    receiveMiningReward(amount){
        return request.post({
            uri: `${this.nodeUrl}/broadcast/transaction`,
            body: {
                amount: amount,
                sender: "00",// 00 => SENDER is mining reward
                recipient: this.UUID,
            },
            json: true,
        })
    }
}

export default NetworkNodeBlockchain