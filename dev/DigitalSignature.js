import crypto from 'crypto'
import NodeRSA from 'node-rsa'


function defaultTextConverter(data){
    if(data instanceof Object){
        console.log(JSON.stringify(data))
        return JSON.stringify(data)
    }else{
        console.log(data.toString())
        return data.toString()
    }
}

function defaultSignatureExtractor(data){
    return data['signature']
}

export default class DigitalSignature {
    constructor(textConverter = defaultTextConverter, signatureExtractor = defaultSignatureExtractor){
        this.textConverter = textConverter
        this.signatureExtractor = signatureExtractor
    }

    setTextConverter(converter){
        this.textConverter = converter
    }

    setSignatureExtractor(extractor){
        this.signatureExtractor = extractor
    }

    generateKeyPairAsync(callback, size = 1024) {
        const key = NodeRSA().generateKeyPair(size)
        callback(key.exportKey('pkcs8-public-pem'), key.exportKey('pkcs8-private-pem'))
    }

    generateKeyPairSync(size = 1024) {
        const key = NodeRSA().generateKeyPair(size)
        return {
            publicKey: key.exportKey('pkcs8-public-pem'),
            privateKey: key.exportKey('pkcs8-private-pem')
        }
    }

    doSign(data, privateKey){
        const text = this.textConverter(data)
        const signer = crypto.createSign("sha256")
        signer.update(text)
        signer.end()
        const signature = signer.sign(privateKey, "base64")

        console.log('CREATING SIGNATURE')
        console.log(`Data: ${text}`)
        console.log(`Signature: ${signature}`)
        console.log(privateKey)


        return signature
    }

    doVerify(signedData, publicKey, signature){
        console.log('signature ' + signature)
        
        if(!signature){
            signature = this.signatureExtractor(signedData)
        }

        const text = this.textConverter(signedData)
        const verifier = crypto.createVerify("sha256")
        verifier.update(text)
        verifier.end()
        const verified = verifier.verify(publicKey, signature, "base64")

        console.log('VERIFYING SIGNATURE')
        console.log(`Data: ${text}`)
        console.log(`Signature: ${signature}`)
        console.log(publicKey)
        console.log(`Result: ${verified}`)



        return verified
    }


}