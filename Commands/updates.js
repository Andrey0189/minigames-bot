module.exports.info = {
    name: 'update',
    regex: /updates?-?(info)?|versions?-?(info)?/,
    desc: 'Changelog',
    args: '[n.n.n]',
    example: '0.3.2',
};

module.exports.run = (message, args) => {
    const version = args[0] || Bot.version;
    if (!Bot.versionsList.includes(version)) return Bot.err(message, `Invalid version code was provided. Version codes:\n${Bot.versionsList.join(', ')}`);
    const embed = new Bot.Discord.RichEmbed()
    .setAuthor(`Version ${version}`, message.author.avatarURL)
    .setDescription(`**•** ${Bot.versions[version].join('\n\n**•** ')}`)
    .setColor(Bot.colors.main)
    .setFooter(`<> with ❤ by ${Bot.client.users.get(Bot.creatoID).tag}`);
    message.channel.send(embed);
}
