module.exports = function getDate() {
    const today = new Date()
    today.setHours(today.getHours() + 3)
    return today
}
