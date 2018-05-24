const discord = require('discord.js')

const user = require('../models/user')
const project = require('../models/project')

module.exports = {

    // See the list of all the availables projects
    seeProjects: (message, args) => {
        return new Promise((resolve, reject) => {
            project.find({guild: message.guild})
            .then(projects => {
                if (projects.length === 0) {
                    return resolve('NO_PROJECTS')
                }

                const richMessage = new discord.RichEmbed()

                richMessage.setTitle('Projects List')
                richMessage.setAuthor(message.author.username, message.author.displayAvatarURL)
                richMessage.setColor('DARK_AQUA')
                richMessage.setFooter('To add a project to your profile just type !backed <projectName> and replace every space in the project name by a `-`')

                let projectsList = ''

                projects.forEach((project) => {
                    projectsList += `- ${project.displayName} \n`
                })

                richMessage.setDescription(projectsList)

                message.channel.send(richMessage)

                return resolve('MESSAGE_SEND')
            })
        })
    },

    // Add a new project to the user Profile
    addNewBackedProject: (message, args) => {
        return new Promise((resolve, reject) => {
            return project.findOne({name: args[0], guild: message.guild})
                .then(project => {
                    if (!project) {
                        return resolve('PROJECT_NOT_FOUND')
                    }

                    user.findOne({user: message.author})
                        .then(data => {
                                if (data) {
                                    if (data.projectsBacked.indexOf(project._id.toString()) !== -1) {
                                        return resolve('PROJECT_ALREADY_ADDED')
                                    }

                                    data.projectsBacked.push(project._id)
                                    data.save()
                                } else {
                                    user.create({
                                        user: message.author,
                                        projectsBacked: [project._id]
                                    })
                                }
                            })
                        .then(data => resolve('PROJECT_ADDED'))
                })
        })
    },

    // Remove a project from the user Profile
    removeBackedProject: (message, args) => {
        return new Promise((resolve, reject) => {
            return project.findOne({name: args[0], guild: message.guild})
                .then(project => {
                    if (!project) {
                        return resolve('PROJECT_NOT_FOUND')
                    }

                    user.findOne({user: message.author})
                        .then(data => {

                            console.log('data', data)

                            if (!data) {
                                return resolve('PROJECT_NOT_ON_PROFILE')
                            }

                            if (data.projectsBacked.indexOf(project._id.toString()) === -1) {
                                return resolve('PROJECT_NOT_ON_PROFILE')
                            }

                            data.projectsBacked.splice(data.projectsBacked.indexOf(project._id.toString()), 1)
                            data.save()

                        })
                        .then(data => resolve('PROJECT_REMOVED'))
                })
        })
    },

    // Send a message with all the informations from one user
    getUserInfos: (message, args) => {
        return new Promise((resolve, reject) => {
            const member = message.guild.members.find(member => member.user.username === args[0])

            if (!member) {
                return resolve('USER_NOT_FOUND_SERVER')
            }

            const richMessage = new discord.RichEmbed()

            user.findOne({user: member})
                .then(data => {
                    if (!data) {
                        return resolve('NO_INFO_USER')
                    }

                    richMessage.setAuthor(member.user.username, member.user.displayAvatarURL)
                    richMessage.setColor('RED')
                    richMessage.setDescription(member.user)

                    project.find({_id: {$in: data.projectsBacked}})
                    .then(projects => {
                        let formattedProjects = ''
                        projects.forEach((project, i) => {
                            formattedProjects += `- ${project.displayName} \n`
                        })

                        richMessage.addField('Backed Projects', formattedProjects === '' ? `This user doesn't have any projects in his profile` : formattedProjects, true)

                        message.channel.send(richMessage)
                    })
                })
        })
    },

    // Add the Kickstarter Profile url to the user Profile
    setOfficialKickStarterLink: (message, args) => {
        return new Promise((resolve, reject) => {

        })
    },

}
