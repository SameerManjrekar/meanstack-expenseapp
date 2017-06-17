const secret = require('crypto').randomBytes(256).toString('hex');

module.exports = {
    uri: 'mongodb://localhost:27017/expense-app',
    db: 'expense-app',
    serverPort: '8080',
    secret: secret,
    tokenexp: 8000
}