import Blockchain from './blockchain'
import {getUuid} from './common'
import request from 'request-promise'


class NetworkNodeBlockchain extends Blockchain{
    constructor(){
        super()
        this.UUID = getUuid()
    }

    broadcastPost(endpoint, message, receivers=[...this.networkNodes]){
        return receivers.map((url)=>{
            return request.post({
                uri: `${url}${endpoint}`,
                body: message,
                json: true,
            })
        })
    }
}

export default NetworkNodeBlockchain