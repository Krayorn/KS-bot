const discord = require('discord.js')
const config = require('./config.json')
const mongoose = require('mongoose')

// Library
const newKickstarter = require('./library/newKickstarter')
const userProfile = require('./library/userProfile')
const modUtils = require('./library/modUtils')
const helpers = require('./library/helpers')

mongoose.Promise = global.Promise

const client = new discord.Client()

client.on('ready', () => {
    client.user.setActivity('Saber And Blood')
    console.log(`Bot started`)
})

client.on('message', (message) => {
    if(message.author.bot) return

    if(message.content.indexOf(config.prefix) !== 0) return

    const args = message.content.slice(config.prefix.length).trim().split(/ +/g)
    const command = args.shift().toLowerCase()

    if (command === 'ping') {
        return message.channel.send('Ping?')
        .then(m => m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`))
    }

    const modChannel = message.guild.channels.find(channel => channel.name === config.moderator_channel && channel.type === "text")

    if (message.channel === modChannel && message.member.roles.find('name', config.role_king)) {
        if (command === 'validate' ) {
            return newKickstarter.validateChannel(message, args)
                .then(response => {
                    switch (response.res) {
                        case 'REQUEST_NOT_NEW':
                            message.reply(`This request isn't new anymore, it already has been rejected or approved.`)
                            break
                        case 'REQUEST_VALIDATED':
                            message.reply(`Channel ${args[0]} created in ${response.parent} !`)
                            break
                        case 'PROJECT_NOT_REQUESTED':
                            message.reply(`There is currently no request for ${args[0]}.`)
                            break
                        case 'NAME_ALREADY_USED':
                            message.reply(` The name ${args[2]} is or was already used on this server.`)
                            break
                        case 'ARGS_1_NOT_VALID':
                            message.reply(`You didn't use a valid value for the category. The available values are 'active', 'future', and 'after'`)
                            break
                    }
                })
        }

        if (command === 'getrequests' ) {
            return newKickstarter.getHangingRequests(message, args)
                .then(response => {
                    switch (response) {
                        case 'REQUESTS_DISPLAYED':
                            break
                        case 'NO_REQUESTS':
                            message.reply(`There is no hanging request in that server !`)
                            break
                    }
                })
        }

        if (command === 'refute') {
            return newKickstarter.refuteChannel(message, args)
                .then(response => {
                    switch (response) {
                        case 'REQUEST_NOT_NEW':
                            message.reply(`This request isn't new anymore, it already has been rejected or approved.`)
                            break
                        case 'REQUEST_DECLINED':
                            message.reply(`The request for the project ${args[0]} has been successfully declined.`)
                            break
                        case 'PROJECT_NOT_REQUESTED':
                            message.reply(`There is currently no request for ${args[0]}.`)
                            break
                    }
                })
        }

        if (command === 'delete') {
            return modUtils.deleteChannel(message, args)
                .then(response => {
                    switch (response) {
                        case 'CHANNEL_DELETED':
                            message.reply(`Channel ${args[0]} successfully deleted !`)
                            break
                        case 'CHANNEL_NOT_FOUND':
                            message.reply(`Channel ${args[0]} not found in this server !`)
                            break
                    }
                })
        }

        if (command === 'help') {
            return helpers.sendModeratorHelp(message, args)
        }
    }

    if (command === 'help') {
        return helpers.sendRegularHelp(message, args)
    }

    if (command === 'request') {
        return newKickstarter.requestChannel(message, args)
            .then(response => {
                switch (response) {
                    case 'REQUEST_SEND':
                        message.reply('A request has been sent !')
                        break
                    case 'NO_CHANNEL_FOUND':
                        message.reply(`The admins of the server haven't configured a moderator channel yet !`)
                        break
                    case 'URL_NOT_VALID_KS':
                        message.reply('The url you provided was not a valid Kickstarter url !')
                        break
                    case 'PROJECT_ALREADY_REQUESTED':
                        message.reply('This project already got requested !')
                        break
                    case 'PROJECT_ALREADY_DECLINED':
                        message.reply('This project already got requested and was declined by an administrator !')
                        break
                    case 'PROJECT_ALREADY_ACCEPTED':
                        message.reply('This project already got a channel !')
                        break
                }
            })
    }

    if (command === 'backed') {
        return userProfile.addNewBackedProject(message, args)
            .then(response => {
                switch (response) {
                    case 'PROJECT_ADDED':
                        message.reply(`The game ${args[0]} was successfully added to your profile !`)
                        break
                    case 'PROJECT_NOT_FOUND':
                        message.reply(`The game ${args[0]} was not found into this server database !`)
                        break
                    case 'PROJECT_ALREADY_ADDED':
                        message.reply(`The game ${args[0]} was already in your profile !`)
                        break
                }
            })
    }

    if (command === 'ksprofile') {
        return userProfile.setOfficialKickStarterLink(message, args)
            .then(response => {
                switch (response) {
                    case 'URL_NOT_VALID_KS':
                        message.reply('The url you provided was not a valid Kickstarter profile url !')
                        break
                    case 'LINK_SET':
                        message.reply(`The url ${args[0]} will now appears in your profile !`)
                        break
                }
            })
    }

    if (command === 'removebacked') {
        return userProfile.removeBackedProject(message, args)
            .then(response => {
                switch (response) {
                    case 'PROJECT_REMOVED':
                        message.reply(`The game ${args[0]} was successfully removed from your profile !`)
                        break
                    case 'PROJECT_NOT_FOUND':
                        message.reply(`The game ${args[0]} was not found into this server database !`)
                        break
                    case 'PROJECT_NOT_ON_PROFILE':
                        message.reply(`The game ${args[0]} was not in your profile !`)
                        break
                }
            })
    }

    if (command === 'profile') {
        return userProfile.getUserInfos(message, args)
            .then(response => {
                switch (response) {
                    case 'NO_INFO_USER':
                        message.reply(`Sorry, this user hasn't filled any informations about him !`)
                        break
                    case 'USER_NOT_FOUND_SERVER':
                        message.reply(`Sorry, couldn't find this user on this server !`)
                        break
                }
            })
    }

    if (command === 'incoming') {
        return helpers.sendIncomingFeatures(message, args)
    }

    if (command === 'getprojects') {
        return modUtils.getProjectsFromChannels(message)
            .then(response => {
                console.log('RESPONSE')
            })
    }
})

mongoose.connect('mongodb://localhost/KSbot')
    .then(() => console.log(`MongoDB: ready`))
    .then(() => client.login(config.token))
