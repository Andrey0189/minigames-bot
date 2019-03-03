module.exports.info = {
    name: 'guild-info',
    regex: /guild-?info/,
    args: '[id]',
    args: 'Information about guild',
    hidden: true
};

module.exports.run = (message, args) => {
        const guild = Bot.client.guilds.get(args[0]) || message.guild;

        const listMembers = guild.members.map(member => {
            return `${member.id} - ${member.user.presence.status === 'offline'? 'off':'ON'} - (${member.user.tag})`;
        });

        const roles = guild.roles.sort((role1, role2) => { return role2.position - role1.position});

        const listRoles = roles.map(role => {
            return `@${role.name}`;
        })

        const listChannels = guild.channels.map(channel => {
            return (channel.type === 'text'? '#':' ')+channel.name;
        })

        const listEmojis = guild.emojis.map(emoji => {
            return `${emoji.animated? 'ANIMATED - ':''}:${emoji.name}: - ${emoji.url}`;
        })

        const online = `Online: ${guild.members.filter(m => m.user.presence.status === 'online').size}/${guild.memberCount}`;

        Bot.hastebin(`${online}\n\n${listMembers.join('\n')}`, 'txt').then(members => {
            Bot.hastebin(listRoles.join('\n'), 'txt').then(roles => {
                Bot.hastebin(listChannels.join('\n'), 'txt').then(channels => {
                    Bot.hastebin(listEmojis.join('\n'), 'txt').then(emojis => {
                    const embed = new Bot.Discord.RichEmbed()
                    .addField('Server information', `
                    Name: \`${guild.name}\`
                    ID: \`${guild.id}\`
                    Objects count: [m](${members}): ${guild.memberCount}, [r](${roles}): ${guild.roles.size}, [ch](${channels}): ${guild.channels.size}, [e](${emojis}): ${guild.emojis.size}
                    Owner: ${guild.owner.user} \`${guild.owner.user.tag}\`
                    Created at: \`${Bot.toMoscowTime(guild.createdAt)}\``)
                    .setColor(Bot.colors.main)
                    .setThumbnail(guild.iconURL)
                    message.channel.send(embed);
                })
            })
        });
    })
}
