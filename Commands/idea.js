module.exports.info = {
    name: 'idea',
    regex: /idea-?(report)?|идея-?(репорт)?/,
    args: '[idea desc]',
    example: 'Chess',
    desc: 'Send idea-report to the developer'
};

module.exports.run = (message, args) => {
    if (Bot.unstable) return Bot.err(message, 'You can\'t use this command in unstable version')
    if (!args[0]) return Bot.invalidArgs(message, module.exports.info);
    const idea = args.join(' ');
    const id = Bot.random(1e4, 1e5);
    const embed = new Bot.Discord.RichEmbed()
    .setAuthor('Idea succesfully sent', message.author.avatarURL)
    .setDescription(`**Your report ID is \`${id}\`. Remember it!**`)
    .setColor(Bot.colors.main);
    message.channel.send(embed)
    Bot.sendIn(Bot.channels.reports, `**Idea Report \`${id}\` from ${message.author} \`[${message.author.tag}]\`:\n${idea}**`)
}
