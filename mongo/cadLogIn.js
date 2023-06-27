const mongoose = require('mongoose')

const Schema = mongoose.Schema({
    ip: String,
    userId: String,
    loggedIn: Boolean
})

module.exports = mongoose.model('CAD Log In Info', Schema)