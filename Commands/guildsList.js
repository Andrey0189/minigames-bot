module.exports.info = {
    name: 'guilds',
    regex: /guilds-?list/,
    desc: 'Shows servers list of the bot',
    hidden: true
};

module.exports.run = (message) => {
    const guildsCollection = Bot.client.guilds.sort((guild1, guild2) => guild2.memberCount-guild1.memberCount);
    console.log(guildsCollection.first().name);
    const guilds = guildsCollection.map(guild =>
        `Server Inforamtion:
            Name: ${guild.name}
            ID: ${guild.id}
            Objects count: m: ${guild.memberCount}, r: ${guild.roles.size}, ch: ${guild.channels.size}, e: ${guild.emojis.size}
            Owner: ${guild.owner.user.id} ${guild.owner.user.tag}
            Created at: ${Bot.toMoscowTime(guild.createdAt)}`);
    try {
        Bot.hastebin(guilds.join(`\n${'='.repeat(50)}\n\n`), 'txt').then(link => message.channel.send(`Servers list --> ${link}`))
    } catch (err) {
        message.channel.send(`//Error ❎\n${err}`, {code: 'js'})
    };
};
