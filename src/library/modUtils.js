// const discord = require('discord.js')
const config = require('../config.json')

const project = require('../models/project')
const channelRequest = require('../models/channelRequest')

module.exports = {

    // get projects from server
    getProjectsFromChannels: (message, args) => {
        return new Promise((resolve, reject) => {

            message.guild.channels.forEach(channel => {
                if(channel.parent && [config.default_category, config.future, config.afterAL, config.afterMZ].indexOf(channel.parent.name) !== -1 ) {
                    const displayName = channel.name.split('-').join(' ')
                    const url = channel.topic ||'not defined'

                    project.findOneAndUpdate({name: channel.name, guild: message.guild} ,{
                        name: channel.name,
                        displayName,
                        url,
                        guild: message.guild,
                    }, {upsert: true, new: true})
                    .then(data => null)

                }
            })
        })
    },

    // Delete a channel and update his request type
    deleteChannel: (message, args) => {
        return new Promise((resolve, reject) => {

            const name = args[0]

            const channel = message.guild.channels.find(channel => channel.name === name)

            if (channel) {
                return channel.delete()
                    .then(deleted => {
                        return channelRequest.findOne({projectName: args[0], guild: message.guild})
                        .then((data, err) => {
                            if(data) {
                                return channelRequest.findOneAndUpdate({projectName: args[0], guild: message.guild}, {status: 'DELETED', deletedBy: message.author})
                                    .then(() => resolve('CHANNEL_DELETED'))
                            } else {
                                return channelRequest.create({
                                    projectName: args[0],
                                    guild: message.guild,
                                    projectUrl: deleted.topic || 'not defined',
                                    status: 'DELETED',
                                    deletedBy: message.author,
                                    requestedBy: message.author
                                })
                                .then(() => resolve('CHANNEL_DELETED'))
                            }
                        })
                    })
            } else {
                return resolve('CHANNEL_NOT_FOUND')
            }
        })
    }
}
