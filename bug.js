module.exports.info = {
    name: 'bug',
    regex: /bug-?(report)?|ба[гк]-?(репорт)?/,
    args: '[bug desc]',
    desc: 'Send bug-report to the developer'
};

module.exports.run = (message, args) => {
    const bug = args.join(' ');
    if (!bug) return Bot.err('Invalid arguments were provided', message, module.exports.info);
    const id = Bot.random(1e4, 1e5)
    const embed = new Bot.Discord.RichEmbed()
    .setAuthor('Bug succesfully sent', message.author.avatarURL)
    .setDescription(`**Your report ID is \`${id}\`. Remember it!**`)
    .setColor(Bot.colors.main);
    message.channel.send(embed)
    Bot.sendIn(Bot.channels.reports, `**Bug Report \`${id}\` from ${message.author} \`[${message.author.tag}]\`:\n${bug}**`)
}
