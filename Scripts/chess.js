const Discord = require('discord.js');
const bot = require('../Storage/constants');
const func = require('./functions');
const jimp = require('jimp');

module.exports.run = function (client, message, args) {
    //const user = message.mentions.members.first();
    //if (!user) return func.err('Вы не уопмянули пользователя', null, message);

    const numbers = [1, 2, 3, 4, 5, 6, 7, 8];
    const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    //const x = args[0][0].toLowerCase();
    //const y = parseInt(args[0][1]);

    function puttingImages (x, y) {
        for (let i = 0; i < letters.length; i++) if (x === letters[i]) x = numbers[i];
        y--; x--;
        return [x*100 + 100, y*100];
    }

    jimp.read(bot.images.chess.field, (err, field) => {
        jimp.read(bot.images.chess.whitePawn, (err, whitePawn) => {
            jimp.read(bot.images.chess.ladya, (err, ladya) => {
                jimp.read(bot.images.chess.ladya, (err, ) => {
                
                })
            })
            for (let i = 0; i < 9; i++) field.composite(whitePawn, puttingImages(letters[i-1], 7)[0], puttingImages(letters[i-1], 7)[1]);
            for (let i = 0; i < 9; i = i + 9) field.composite(whitePawn, puttingImages(letters[i-1], 7)[0], puttingImages(letters[i-1], 7)[1]);
            field.getBuffer(jimp.MIME_PNG, (err, buffer) => {
                message.channel.send({files: [{ name: 'field.png', attachment: buffer }]})
            })
        })
    })
}