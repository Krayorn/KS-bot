const discord = require('discord.js')
const config = require('./config.json')
const mongoose = require('mongoose')

// Library
const newKickstarter = require('./library/newKickstarter')
const userProfile = require('./library/userProfile')
const modUtils = require('./library/modUtils')

mongoose.Promise = global.Promise

const client = new discord.Client()

client.on('ready', () => {
    client.user.setActivity('Playing Saber And Blood')
    console.log(`Bot started`)
})

client.on('message', (message) => {
    if(message.author.bot) return;

    if(message.content.indexOf(config.prefix) !== 0) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (command === 'ping') {
        return message.channel.send('Ping?')
        .then(m => m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`))
    }

    if (command === 'help') {
        return message.channel.send(`I can't help you i don't know anything yet`)
    }

    if (command === 'request') {
        return newKickstarter.RequestChannel(message, args)
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
    }

    const modChannel = message.guild.channels.find(channel => channel.name === config.moderator_channel && channel.type === "text")

    if (message.channel === modChannel && message.member.roles.find('name', config.role_king)) {
        if (command === 'validate' ) {
            return newKickstarter.ValidateChannel(message, args)
                .then(response => {
                    switch (response) {
                        case 'REQUEST_NOT_NEW':
                            message.reply(`This request isn't new anymore, it already has been rejected or approved.`)
                            break
                        case 'REQUEST_VALIDATED':
                            message.reply(`Channel ${args[0]} created in ${config.default_category} !`)
                            break
                        case 'PROJECT_NOT_REQUESTED':
                            message.reply(`There is currently no request for ${args[0]}.`)
                            break
                    }
                })
        }

        if (command === 'refute') {
            return newKickstarter.RefuteChannel(message, args)
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

        if (command === 'getprojects') {
            return modUtils.getProjectsFromChannels(message)
                .then(response => {
                    console.log('RESPONSE')
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
    }

})

mongoose.connect('mongodb://localhost/KSbot')
    .then(() => console.log(`MongoDB: ready`))
    .then(() => client.login(config.token))
