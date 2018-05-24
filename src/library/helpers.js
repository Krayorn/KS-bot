module.exports = {

    // Send the Simple Help message for regular Users
    sendRegularHelp: (message, args) => {

        if (args[0] === 'help') {
            return message.channel.send('Are you that dumb ? :open_mouth:')
        }

        return message.channel.send(`
The currently availables commands for the bot are the following :

    - \`!request <aValidKickStarterProjectUrl>\` will send a request to the moderators from the server for this project.

    - \`!backed <projectName>\` will add the project to your local profile. Please note that only project wich have or had a channel on this server are currently accepted.

    - \`!projectsList \` will show you the list of all the accepted projects on the server.

    - \`!profile <thePseudoFromAUserInThatServer>\` will show the profile from an user, including all the projects he has added to his local profile. (Coming soon => A link to his Kickstarter profile and a category with some projects tagged as favorites)

    - \`!help\` You just type that one you know what it does ... right ?`)
}

}
