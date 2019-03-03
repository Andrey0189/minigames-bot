module.exports.info = {
    name: 'idea',
    regex: /idea-?(report)?|идея-?(репорт)?/,
    args: '[idea desc]',
    example: 'Chess'
};

module.exports.run = (message, args) => {
    const bug = args.join(' ');
    if (!bug) return Bot.invalidArgs(message, module.exports.info);
    const id = Bot.random(1e4, 1e5)
    const embed = new Bot.Discord.RichEmbed()
    .setAuthor('Idea succesfully sent', message.author.avatarURL)
    .setDescription(`**Your report ID is \`${id}\`. Remember it!**`)
    .setColor(Bot.colors.main);
    message.channel.send(embed)
    Bot.sendIn(Bot.channels.reports, `**Idea Report \`${id}\` from ${message.author} \`[${message.author.tag}]\`:\n${bug}**`)
}
