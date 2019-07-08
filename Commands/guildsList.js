module.exports.info = {
    name: 'guilds',
    regex: /list/,
    desc: 'Shows servers list of the bot',
    hidden: true
};

module.exports.run = (message) => {
    const guildsCollection = Bot.client.guilds.sort((guild1, guild2) => guild2.memberCount-guild1.memberCount);
    console.log(guildsCollection.first().name);
    const guilds = guildsCollection.map(guild => `Name: ${guild.name}\nID: ${guild.id}\nObjects count: m: ${guild.memberCount}, r: ${guild.roles.size}, ch: ${guild.channels.size}, e: ${guild.emojis.size}\nOwner: ${guild.owner.user.id} ${guild.owner.user.tag}\nCreated at: ${Bot.toMoscowTime(guild.createdAt)}`);
    try {
        Bot.hastebin(guilds.join(`\n\n${'='.repeat(50)}\n\n`), 'txt').then(link => message.channel.send(`Servers list --> ${link}`))
    } catch (err) {
        message.channel.send(`//Error ❎\n${err}`, {code: 'js'})
    };
};
