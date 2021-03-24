export default function getDate(): Date {
    const today = new Date()
    today.setHours(today.getHours() + 3)
    return today
}
