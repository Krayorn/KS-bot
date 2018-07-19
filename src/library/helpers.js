module.exports = {

    // Send the Simple Help message for regular Users
    sendRegularHelp: (message, args) => {


        switch (args[0]) {
            case 'help':
                return message.channel.send('Are you that dumb ? :open_mouth:')
            case 'request':
                return message.channel.send(`
To send a request to the moderators just type \`!request\` followed by the url of the game you want to see added to this discord.

For example => \`!request https://www.kickstarter.com/projects/saberandblood/saber-and-blood\` will send a request for the game "saber&blood".

The moderators will then have the opportunity to validate or refute this request. If the request is validated, you'll be notified in the created channel !
                `)
            case 'backed':
                return message.channel.send(`
To add a game to your local profile, just type \`!backed\` followed by the name of the channel existing for your game.

For example => \`!backed saber-and-blood\` will add the game "saber&blood" to your local profile.

You'll then have the possiblity to visualize your local profile using the !profile command.
                `)
            case 'removebacked':
                return message.channel.send(`
To remove a game from your local profile, just type \`!removebacked\` followed by the name of the channel existing for your game.

For example => \`!removebacked overturn-rising-sands\` will remove the game "overturn rising sands" from your local profile.

You'll then have the possiblity to visualize your local profile using the !profile command.
                `)
            case 'ksprofile':
                return message.channel.send(`
To add a link to your profile on the KickStarter website, just type \`!ksprofile\` followed by the url of your profile on KickStarter

For example => \`!ksprofile https://www.kickstarter.com/profile/<yourUsernameOrYourId>\` should add your KS profile to your local profile.

You'll then have the possiblity to visualize your local profile using the !profile command.

Please Note that since the last laws about the user data protection, Kickstarter automatiquely put user's profile to private mode. So nobody'll be able to check it, if you want to share it with this community, switch it to public mode !
                `)
            case 'profile':
                return message.channel.send(`
To see the profile of someone, just type \`!profile\` followed by a tag of the user whose profile you want to view

For example => \`!profile @__#9676 \` should display the profile of my useless creator.
                `)
        }

        return message.channel.send(`
The currently availables commands for the bot are the following :

    - \`!request <aValidKickStarterGameUrl>\` will send a request to the moderators from the server for this game.

    - \`!backed <gameName>\` will add the game to your local profile. Please note that only game wich have or had a channel on this server are currently accepted.

    - \`!removebacked <gameName>\` will remove the game from your local profile.

    - \`!ksprofile <yourProfileKickStarterUrl>\` will add the link to your KS profile in your local profile.

    - \`!profile <thePseudoFromAUserInThatServer>\` will show the profile from an user, including all the games he has added to his local profile. (Coming soon => A link to his Kickstarter profile and a category with some games tagged as favorites)

    - \`!help <commandName>\` will send you more infos about the way to use a specific command with some examples.

    - \`!incoming\` will display to you a simple message about what the next features should be.

    - \`!help\` You just type that one you know what it does ... right ?`)
    },

    sendModeratorHelp: (message, args) => {
        return message.channel.send(`
The currently availables mods commands for the bot are the following :

        - \`!getprojects\` *should* update the database and create entries for projects entered manually.

        - \`!getrequests\` will displaythe currently waiting requests.

        - \`!validate <gameName>\` will create a channel for the game requested, put a link to the KS page and pin the link in that channel.

        - \`!refute <gameName>\` will cancel the request for the game requested. Maybe send a message to the requester explaining why the request couldn't be accepted.

        - \`!delete <channel-name>\` will delete the channel for that project, people should still be available to add it to their profile.

        - \`!help <commandName> \` I'm just lyin, i haven't write more explanation for the mods commands :3 Sorry guys `)
    },

    sendIncomingFeatures: (message, args) => {
        return message.channel.send(`
- You'll be able to use the backed command and directly tag a channel instead of the name, should help you typing the right name the first time and will allow you to use the autocomplete.

- Moderators'll have the possibility to rename the channels when they validate it. So you won't have to suffer with horrible channels name like xxx-yyy-SECOND-EDITION-REPRINT-2019 and everything should be more readable.

That's all for the short term improvements. The programmer behind me already have plenty of work to do for his job & studies so let's not watch for too long-term improvements. (Some crazy stuff will come tho :wink:).

If you have any idea about cool features that could really be useful here, feel free to tag that dumbass with @__#9676 and submit your idea :).
        `)
    },
}
