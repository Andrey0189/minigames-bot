const Discord = require('discord.js');
const bot = require('../Storage/constants.json');

/*module.exports.command = function (name, perms, correctArgs, message, command) {
    if (!name.includes(command)) return;
    if (!message.member.hasPermission(perms)) return module.exports.err('У вас недостаточно прав', null, message);
    if (!correctArgs) return module.exports.err()
}*/

module.exports.random = function (min, max) {
    return Math.floor(Math.random() * (max + 1 - min)) + min;
} 

module.exports.randomBoolean = function () { 
    if (Math.random() > 0.5) return true;
    else false;
}

module.exports.declOfNum = function (number, titles) {
    let cases = [2, 0, 1, 1, 1, 2];
    return titles[(number % 100 > 4 && number % 100 < 20)? 2 : cases[(number % 10 < 5)?number % 10 : 5]];
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
    client.channels.get(id).send(msg)
}

module.exports.err = function (desc, perms, msg) {
    const embed = new Discord.RichEmbed()
    .setAuthor('Ошибка', msg.author.avatarURL)
    .setDescription(`Причина: **${desc}**`)
    .setColor(bot.colors.red)
    .setFooter(`${bot.name} ${bot.version}`)
    .setTimestamp();
    if (perms) embed.setDescription(`У вас нет права **${perms}**`);
    return msg.channel.send({embed});
}

module.exports.loading = function (text, client) {
    const embed = new Discord.RichEmbed()
    .setDescription(`**${text}** ${client.emojis.get(bot.emojis.typing)}`)
    .setColor(bot.colors.discord);
    return embed;
}

module.exports.isNum = function (number) {
    return !isNaN(parseFloat(number)) && isFinite(number);
}

module.exports.avaibleToMove = (coordinatsFigure, coordinatsSet, field, arr) => {
    const figure = arr[coordinatsFigure];
    const whitePawns = [48, 49, 50, 51, 52, 53, 54, 55];
    const blackPawns = [8, 9, 10, 11, 12, 13, 14, 15];

    if (arr[coordinatsFigure].match(/черный/i)) jimp.read(bot.images.chess.blackPawn, (err, blackPawn) => jimp.read(bot.images.chess.blackHourse, (err, blackHourse) => jimp.read(bot.images.chess.blackEleph, (err, blackEleph) => jimp.read(bot.images.chess.blackLadya, (err, blackLadya) => jimp.read(bot.images.chess.blackFerz, (err, blackFerz) => jimp.read(bot.images.chess.blackKing, (err, blackKing) => {
        if (figure.match(/пешка/i) && blackPawns.includes()) {

        }
    })))))); else jimp.read(bot.images.chess.blackPawn, (err, blackPawn) => jimp.read(bot.images.chess.blackHourse, (err, blackHourse) => jimp.read(bot.images.chess.blackEleph, (err, blackEleph) => jimp.read(bot.images.chess.blackLadya, (err, blackLadya) => jimp.read(bot.images.chess.blackFerz, (err, blackFerz) => jimp.read(bot.images.chess.blackKing, (err, blackKing) => {
        
    }))))));
};