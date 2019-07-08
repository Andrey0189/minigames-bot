module.exports.info = {
    name: 'user-info',
    desc: 'Information about user',
    regex: /user/,
    hidden: true
};

module.exports.run = (message, args, mentionMember) => {
    const argsReg = new RegExp(args[1] || null, 'i');
    const user = Bot.client.users.find(u => u.tag.match(argsReg) || u.id === args[1]) || message.mentions.users.find(m => m.id !== Bot.client.user.id) || message.author;
    const member = message.guild.members.get(user.id);
    const status = user.presence.status[0].toUpperCase() + user.presence.status.slice(1);
    let mutualServers = Bot.client.guilds.map(guild => {
        if (guild.members.find(m => m.id === user.id)) return `\n:white_medium_small_square: \`${guild.name}\``;
    });

    mutualServers = mutualServers.filter(g => g);

    const serversOnPage = 10;
    let page = parseInt(args[0]) || 1;
    const totalPages = Math.ceil(mutualServers.length / serversOnPage);
    if (page > totalPages || page < 1) page = 1;
    const content = mutualServers.slice(((page - 1) * serversOnPage), (serversOnPage) + ((page - 1) * serversOnPage)).join('');

    const embed = new Bot.Discord.RichEmbed()
    .setAuthor(`${user.bot? 'Bot':'User'} ${user.tag} (${user.id})`, user.avatarURL)
    .setColor(Bot.colors.main)
    .setThumbnail(user.avatarURL)
    .setDescription(`Created Account: \`${Bot.toMoscowTime(user.createdAt)}\`
    Joined this Server: \`${member? Bot.toMoscowTime(member.joinedAt) : 'Not joined'}\`
    Mutual servers:\n\n**Total \`${mutualServers.length}\`${content}${mutualServers.length > 10? `\nAnd \`${mutualServers.length - 10}\` more`: ''}**`)
    .setFooter(`Page ${page}/${totalPages} | m!user-info <user> ${page + 1} For next page`);
    message.channel.send(embed);

    /*
    message.delete();
    test = (user, p) => {
    user = client.users.get(user);
    const member = message.guild.members.get(user.id);
    const status = user.presence.status[0].toUpperCase() + user.presence.status.slice(1);

    let mutualServers = client.guilds.map(guild => {
        if (guild.members.find(m => m.id === user.id)) return `\n:white_medium_small_square: \`${guild.name}\``;
    });

    mutualServers = mutualServers.filter(g => g);

    const serversOnPage = 10;
    let page = p || 1;
    const totalPages = Math.ceil(mutualServers.length / serversOnPage);
    if (page > totalPages || page < 1) page = 1;
    const content = mutualServers.slice(((page - 1) * serversOnPage), (serversOnPage) + ((page - 1) * serversOnPage)).join('');

    const embed = new Discord.RichEmbed()
    .setAuthor(`${user.bot? 'Bot':'User'} ${user.tag} (${user.id})`, user.avatarURL)
    .setColor('af00ff')
    .setThumbnail(user.avatarURL)
    .setDescription(`Created Account: \`${user.createdAt.toLocaleString('ru-RU', {timeZone: 'Europe/Moscow', hour12: false}).replace(/\//g, '.')}\`
    Joined this Server: \`${member? member.joinedAt.toLocaleString('ru-RU', {timeZone: 'Europe/Moscow', hour12: false}).replace(/\//g, '.'):'Not joined'}\`
    Mutual servers:\n\n**Total \`${mutualServers.length}\`${content}${mutualServers.length > 10? `\nAnd \`${mutualServers.length - 10}\` more`: ''}**`)
    .setFooter(`Page ${page}/${totalPages} | m!user-info <user> ${page + 1} For next page`);
    message.channel.send(embed);
    }*/

}
