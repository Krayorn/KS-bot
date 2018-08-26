const discord = require('discord.js')
const config = require('../config.json')

const channelRequest = require('../models/channelRequest')
const project = require('../models/project')

module.exports = {

    // Send the request to the moderators
    requestChannel: (message, args) => {
        return new Promise((resolve, reject) => {

            const url = args[0].split('?')[0]

            if(/www\.kickstarter\.com\/projects\/*\/*/.test(url)) {

                const name = url.split('kickstarter')[1].split('/')[3]

                return channelRequest.findOne({projectName: name, guild: message.guild})
                    .then((data, err) => {
                        if (!data || ((data.status === 'DECLINED' || data.status === 'DELETED' ) && message.member.roles.find('name', config.role_king))) {
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
    validateChannel: (message, args) => {
        return new Promise((resolve, reject) => {
            return channelRequest.findOne({projectName: args[0], guild: message.guild})
                .then((data, err) => {
                    if(err) return resolve(err)

                    if (!data) {
                        return resolve({res:'PROJECT_NOT_REQUESTED'})
                    }

                    if (data.status === 'NEW') {
                        let parent, name

                        if(args[2]) {
                            name = args[2]
                        } else {
                            name = data.projectName
                        }

                        const category = args[1] || 'active'

                        if (!['active', 'future', 'after'].includes(category)) {
                            return resolve({res: 'ARGS_1_NOT_VALID'})
                        } else {

                            if (category === 'after') {
                                parent = name.charAt(0).toLowerCase() <= 'g'
                                ? config.afterAD
                                : name.charAt(0).toLowerCase() <= 'o'
                                ? config.afterDO
                                : config.afterOZ
                            } else {
                                parent = category === 'active' ? config.default_category : config[category]
                            }

                            return project.findOne({name: name, guild: message.guild})
                            .then((projectData) => {
                                if (projectData) {
                                    return resolve({res:'NAME_ALREADY_USED'})
                                }

                                return message.guild.createChannel(name, 'text')
                                    .then(channel => {
                                        return channel.setParent(message.guild.channels.find(channel => channel.name.toLowerCase() === parent.toLowerCase()))
                                    })
                                    .then(channel => {
                                        channel.setTopic(data.projectUrl)
                                        channel.send(`${name}, requested by ${data.requestedBy}. \n ${data.projectUrl}`)
                                        .then(message => message.pin())

                                        project.create({
                                                name: name,
                                                displayName: name.split('-').join(' '),
                                                url: data.projectUrl,
                                                guild: message.guild,
                                            })
                                    })
                                    .then(() => {
                                        data.update({status: 'ACCEPTED'}).then(() =>  resolve({res:'REQUEST_VALIDATED', parent}))
                                    })
                            })
                        }
                    } else {
                        return resolve({res:'REQUEST_NOT_NEW'})
                    }
                })
        })
    },

    // Refute a request
    refuteChannel: (message, args) => {
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
    },

    getHangingRequests: (message, args) => {
        return new Promise((resolve, reject) => {
            return channelRequest.find({guild: message.guild, status: 'NEW'})
                .then((data, err) => {
                    if(err) return resolve(err)

                    if (!data || data.length === 0) {
                        return resolve('NO_REQUESTS')
                    }

                    const richMessage = new discord.RichEmbed()

                    richMessage.setTitle('Hanging Requests')
                    richMessage.setAuthor(message.author.username, message.author.displayAvatarURL)
                    richMessage.setColor('DARK_ORANGE')
                    richMessage.setFooter(`You can now validate or refute the creation of a new channel for a project with the two following commands : !validate \`name\` or !refute \`name\``)

                    let unansweredRequests = ''

                    data.forEach(request => {
                        unansweredRequests += `- ${request.projectName} at ${request.projectUrl} \n`
                    })

                    richMessage.setDescription(unansweredRequests)

                    message.channel.send(richMessage)

                    return resolve('REQUESTS_DISPLAYED')
                })
        })
    },
}


