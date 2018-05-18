const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ChannelRequestSchema = new Schema({
    projectName : { type: String, required: true },
    projectUrl : { type: String, required: true },
    requestedBy : { type: String, required: true },
    status : { type: String, required: true },
    guild: { type: String, required: true },
    deletedBy: { type: String },
})

module.exports = mongoose.model('ChannelRequest', ChannelRequestSchema)
