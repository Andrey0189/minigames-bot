module.exports.info = {
    name: 'update',
    regex: /updates?-?(info)?|versions?-?(info)?/,
    desc: 'Changelog',
    args: '[n.n.n]',
    example: '0.3.2',
};

module.exports.run = (message, args) => {
    if (Bot.unstable) return Bot.err(message, 'Unstable version is rolling release',)
    const version = args[0] || Bot.version;
    if (!Bot.versionsList.includes(version)) return Bot.err(message, `Invalid version code was provided. Version codes:\n${Bot.versionsList.join(', ')}`);
    const embed = new Bot.Discord.RichEmbed()
    .setAuthor(`Version ${version}`, message.author.avatarURL)
    .setDescription(`**•** ${Bot.versions[version].join('\n\n**•** ')}`)
    .setColor(Bot.colors.main)
    .setFooter(`<> with ❤ by ${Bot.creatorTag}`);
    message.channel.send(embed);
}
