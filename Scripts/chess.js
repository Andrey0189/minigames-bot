const Discord = require('discord.js');
const bot = require('../Storage/constants.json');
const func = require('./functions.js');
const jimp = require('jimp');

module.exports.run = function (client, message, args) {
    const whiteSquares = [0, 2, 4, 6, 9, 11, 13, 15,
        16, 18, 20, 22, 25, 27, 29, 31,
        32, 34, 36, 38, 41, 43, 45, 47,
        48, 50, 52, 54, 57, 59, 61, 63];
    //const user = message.mentions.members.first();
    //if (!user) return func.err('Вы не уопмянули пользователя', null, message);
    const gameField = new Array(64);

    const numbers = [1, 2, 3, 4, 5, 6, 7, 8];
    const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    //const x = args[0][0].toLowerCase();
    //const y = parseInt(args[0][1]);

    const figures = ['Белая пешка', 'Белый конь', 'Белый слон', 'Белая ладья', 'Белый ферзь', 'Белый король', 
    'Черная пешка', 'Черный конь', 'Черный слон', 'Черная ладья', 'Черный ферзь', 'Черный король'];

    const figuresEmojis = [bot.emojis.whitePawn, bot.emojis.whiteHourse, bot.emojis.whiteEleph, bot.emojis.whiteLadya, bot.emojis.whiteFerz, bot.emojis.whiteKing,
        bot.emojis.blackPawn, bot.emojis.blackHourse, bot.emojis.blackEleph, bot.emojis.blackLadya, bot.emojis.blackFerz, bot.emojis.blackKing];

    function figuresToEmojis (figure) {
        for (let i = 0; i < figures.length; i++) if (figure = figures[i]) return figuresEmojis[i];
    }
    
    function piadap (x, y) {
        for (let i = 0; i < letters.length; i++) if (x === letters[i]) x = numbers[i];
        y--; x--;
        return [x*100 + 100, y*100, y * 8 + x];
    }

    function move (gameField, img) {
        const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 300000 });
        collector.on('collect', msg => {
            collector.stop();

            const args = msg.content.trim().split(/ +/g);

            if (msg.content.match(/[a-h][1-8] [a-h][1-8]/i)) {
                const x = msg.content[0].toLowerCase();
                const y = parseInt(msg.content[1]);

                const xSet = args[1][0].toLowerCase();
                const ySet = parseInt(args[1][1]);

                const coordinats = piadap(x, y);
                const figure = gameField[coordinats[2]];

                gameField[coordinats[2]] = undefined;

                jimp.read(bot.images.chess.blackSquare, (err, blackSquare) => {
                    jimp.read(bot.images.chess.whiteSquare, (err, whiteSquare) => {
                        if (whiteSquares.includes(coordinats[2])) img.composite(whiteSquare, coordinats[0], coordinats[1]);
                        else img.composite(blackSquare, coordinats[0], coordinats[1]);
                        
                        jimp.read(bot.images.chess.blackPawn, (err, blackPawn) => jimp.read(bot.images.chess.blackHourse, (err, blackHourse) => jimp.read(bot.images.chess.blackEleph, (err, blackEleph) => jimp.read(bot.images.chess.blackLadya, (err, blackLadya) => jimp.read(bot.images.chess.blackFerz, (err, blackFerz) => jimp.read(bot.images.chess.blackKing, (err, blackKing) => {
                    
                        }))))))
                        for (let i = 0; i < figures.length; i++) if (figure === figures[i]) {
                            //img.composite(imgs[i], piadap(xSet, ySet)[0], piadap(xSet, ySet)[1]);

                            img.getBuffer(jimp.MIME_PNG, (err, buffer) => {
                                message.channel.send({files: [{ name: 'field.png', attachment: buffer }]});
                                return move(gameField, img);
                            })
                        }
                    })
                })
            } else return;
        });
    }

    jimp.read(bot.images.chess.field, (err, field) => {
        for (let i = 8; i < 16; i++) gameField[i] = figures[6];
        for (let i = 1; i < 7; i = i + 5) gameField[i] = figures[7];
        for (let i = 2; i < 6; i = i + 3) gameField[i] = figures[8];
        for (let i = 0; i < 8; i = i + 7) gameField[i] = figures[9];
        gameField[3] = figures[10];
        gameField[4] = figures[11];

        for (let i = 48; i < 56; i++) gameField[i] = figures[0];
        for (let i = 57; i < 64; i = i + 5) gameField[i] = figures[1];
        for (let i = 58; i < 63; i = i + 3) gameField[i] = figures[2];
        for (let i = 56; i < 65; i = i + 7) gameField[i] = figures[3];
        gameField[59] = figures[4];
        gameField[60] = figures[5];
        field.getBuffer(jimp.MIME_PNG, (err, buffer) => {
            message.channel.send({files: [{ name: 'field.png', attachment: buffer }]}).then(() => move(gameField, field))
        })
    })
}