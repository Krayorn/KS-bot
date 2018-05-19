const discord = require('discord.js')
const config = require('../config.json')

const channelRequest = require('../models/channelRequest')
const project = require('../models/project')

module.exports = {

    // Send the request to the moderators
    RequestChannel: (message, args) => {
        return new Promise((resolve, reject) => {

            if(/www\.kickstarter\.com\/projects\/*\/*/.test(args[0])) {

                const name = args[0].split('?')[0].split('kickstarter')[1].split('/')[3]

                return channelRequest.findOne({projectName: name, guild: message.guild})
                    .then((data, err) => {
                        if (!data || ((data.status === 'DECLINED' || data.status === 'DELETED' ) && message.member.roles.find('name', config.role_king))) {
                            const url = args[0]

                            const channel = message.guild.channels.find(channel => channel.name === config.moderator_channel && channel.type === "text")

                            if (channel) {
                                const richMessage = new discord.RichEmbed()

                                richMessage.setTitle('New channel Requested !')
                                richMessage.setAuthor(message.author.username, message.author.displayAvatarURL)
                                richMessage.setDescription(`
                                    A user just requested the creation of a new channel for ${name}. \n The kickstarter is accessible at ${url}.
                                    `)
                                richMessage.setColor('GOLD')
                                richMessage.setFooter(`You can now validate or refute the creation of a new channel for this kickstarter with the two following commands : !validate ${name} or !refute ${name}`)

                                channel.send(richMessage)

                                if (data) {
                                    return data.update({status: 'NEW'}).then(() => resolve('REQUEST_SEND'))
                                } else {

                                    return channelRequest.create({
                                        projectName: name,
                                        projectUrl: url,
                                        status: 'NEW',
                                        requestedBy: message.author,
                                        guild: message.guild,
                                        deletedBy: null
                                    })
                                    .then(() => resolve('REQUEST_SEND'))
                                }
                            } else {
                                return resolve('NO_CHANNEL_FOUND')
                            }
                        } else {
                            if (data.status === 'ACCEPTED') {
                                return resolve('PROJECT_ALREADY_ACCEPTED')
                            } else if (data.status === 'DECLINED') {
                                return resolve('PROJECT_ALREADY_DECLINED')
                            } else {
                                return resolve('PROJECT_ALREADY_REQUESTED')
                            }
                        }
                    })
            } else {
                return resolve('URL_NOT_VALID_KS')
            }

        })
    },

    // Validate a request
    ValidateChannel: (message, args) => {
        return new Promise((resolve, reject) => {
            return channelRequest.findOne({projectName: args[0], guild: message.guild})
                .then((data, err) => {
                    if(err) return resolve(err)

                    if (!data) {
                        return resolve('PROJECT_NOT_REQUESTED')
                    }

                    if (data.status === 'NEW') {

                        message.guild.createChannel(data.projectName, 'text')
                        .then(channel => {

                            const parent = config[args[1]] || config.default_category

                            return channel.setParent(message.guild.channels.find(channel => channel.name === parent))
                        })
                        .then(channel => {
                            channel.setTopic(data.projectUrl)
                            channel.send(`${data.projectName}, requested by ${data.requestedBy}. \n ${data.projectUrl}`)
                            .then(message => message.pin())

                            project.create({
                                name: data.projectName,
                                url: data.projectUrl,
                                guild: message.guild,
                            })

                        })
                        .then(() => {
                            data.update({status: 'ACCEPTED'}).then(() =>  resolve('REQUEST_VALIDATED'))
                        })
                    } else {
                        return resolve('REQUEST_NOT_NEW')
                    }
                })
        })
    },

    // Refute a request
    RefuteChannel: (message, args) => {
        return new Promise((resolve, reject) => {
            return channelRequest.findOne({projectName: args[0], guild: message.guild})
                .then((data, err) => {
                    if(err) return resolve(err)

                    if (!data) {
                        return resolve('PROJECT_NOT_REQUESTED')
                    }

                    if (data.status === 'NEW') {
                        data.update({status: 'DECLINED'}).then(() =>  resolve('REQUEST_DECLINED'))
                    } else {
                        return resolve('REQUEST_NOT_NEW')
                    }
                })
        })
    }
}


