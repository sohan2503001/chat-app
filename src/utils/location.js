const generateLocationMessage = (url) => {
    return {
        url,
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateLocationMessage
}