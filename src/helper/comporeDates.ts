import {ChatType} from "../types/chat";

const compareDates = (a: ChatType, b: ChatType): number => {
    const date1 = new Date(a.updatedAt)
    const date2 = new Date(b.updatedAt)
    if (date1.getFullYear() > date2.getFullYear()) {
        return -1
    }
    if (date1.getFullYear() < date2.getFullYear()) {
        return 1
    }
    if (date1.getMonth() > date2.getMonth()) {
        return -1
    }
    if (date1.getMonth() < date2.getMonth()) {
        return 1
    }
    if(date1.getDate() > date2.getDate()) {
        return -1
    }
    if(date1.getDate() < date2.getDate()) {
        return 1
    }
    if(date1.getTime() > date2.getTime()) {
        return -1
    }
    return 1
}

export default compareDates