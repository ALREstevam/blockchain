import uuid from 'uuid/v1'

export function setHasOnly(set, element){
    return set.size === 1 && set.has(element)
}

export function replaceAll(str, change, to){
    return str.toString().split(change).join(to)
}

export function getUuid(){
    return replaceAll(uuid(), '-', '')
}

