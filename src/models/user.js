const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
    user : { type: String, required: true },
    projectsBacked : { type: Array, required: false }
})

module.exports = mongoose.model('User', UserSchema)
