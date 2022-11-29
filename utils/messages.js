function formatMessage(username, message, image, donation, permission){
    return{
        username,
        message,
        image,
        donation,
        permission: permission == 1 ? true: false,
        time: new Date(),
    }
}

module.exports = formatMessage;