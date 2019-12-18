import uuid from 'uuid/v1'

export function setHasOnly(set, element) {
    return set.size === 1 && set.has(element)
}

export function replaceAll(str, change, to) {
    return str.toString().split(change).join(to)
}

export function getUuid() {
    return replaceAll(uuid(), '-', '')
}

export const findIndex = {
    max: (array, minimum = -Infinity) => {
        let maxValue = minimum
        let maxIndex = undefined

        for (let i = 0; i < array.length; i++) {
            if (array[i] > maxValue) {
                maxValue = array[i]
                maxIndex = i
            }
        }
        return {
            value: maxValue,
            index: maxIndex
        }
    },
    min: (array) => {
        let minValue = -Infinity
        let minIndex = undefined

        for (let i = 0; i < array.length; i++) {
            if (array[i] < minValue) {
                minValue = array[i]
                minIndex = i
            }
        }
        return {
            value: minValue,
            index: minIndex
        }
    },
}