const Discord = require('discord.js');
const bot = require('../Storage/constants');

module.exports.random = function (min, max) {
    return Math.floor(Math.random() * (max + 1 - min)) + min;
}

module.exports.embed = function (title, img, desc, color, client) {
    const embed = new Discord.RichEmbed()
    .setAuthor(title, img)
    .setDescription(desc)
    .setColor(color)
    .setFooter(`${client.user.username} ${bot.version}`)
    .setTimestamp();
    return embed;
}

module.exports.send = function (id, msg, client) {
    if (!msg.author === bot.creatorID) client.channels.get(id).send(msg)
}

module.exports.err = function (desc, perms, msg) {
    const embed = new Discord.RichEmbed()
    .setAuthor('Ошибка', msg.author.avatarURL)
    .setDescription(`Причина: **${desc}**`)
    .setColor('ff5555')
    .setFooter(`${bot.name} ${bot.version}`)
    .setTimestamp();
    if (perms) embed.setDescription(`У вас нет права **${perms}**`);
    return msg.channel.send({embed});
}