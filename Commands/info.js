module.exports = {
    name: 'invite',
    regex: /info|invite?/,
    desc: 'Invite the bot & Information about the bot',
    run: (message) => {
        if (Bot.unstable) return Bot.err(message, `Unstable version is private. So, to invite it you should have the Donator role on our official server ${Bot.server}`);
        const embed = new Bot.Discord.RichEmbed()
        .setAuthor('Information about bot', message.author.avatarURL)
        .addField('Base Info', `**Servers: \`${Bot.addCommas(Bot.client.guilds.size)}\`\nChannels: \`${Bot.addCommas(Bot.client.channels.size)}\`\nUsers: \`${Bot.addCommas(Bot.client.users.size)}\`\nRAM: \`${Bot.addCommas(Math.round(process.memoryUsage().rss / 1024 / 1024 ))}/1,024 MB\`**`)
        .addField('Our Team', `**${Bot.client.users.get(Bot.creatorID)} \`${Bot.client.users.get(Bot.creatorID).tag}\` - Main developer and designer\n${Bot.client.users.get(Bot.helperID)} \`${Bot.client.users.get(Bot.helperID).tag}\` - Helper**`)
        .setTitle('Invite Bot')
        .setURL(`https://discordapp.com/oauth2/authorize?client_id=${Bot.client.user.id}&scope=bot&permissions=379904`)
        .setColor(Bot.colors.main);
        message.channel.send(embed);
    }
};
