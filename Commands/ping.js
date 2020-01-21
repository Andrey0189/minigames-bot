module.exports = {
    regex: /ping/,
    hidden: true,
    run: (message) => {
        let embed = new Bot.Discord.RichEmbed()
        .setDescription(`${Bot.emoji(Bot.emojis.typing)} **Loading...**`)
        .setColor(Bot.colors.discord);
        message.channel.send(embed).then(msg => {
            msg.delete();
            embed = new Bot.Discord.RichEmbed()
            .addField('Pong! :ping_pong:', `:white_medium_small_square: **Discord API Ping: \`${Math.round(Bot.client.ping)}ms\`
            :white_medium_small_square: Server Ping: \`${msg.createdTimestamp - message.createdTimestamp}ms\`**`)
            .setColor(Bot.colors.main)
            message.channel.send(embed);
        })
    }
};