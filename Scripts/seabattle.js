const Discord = require('discord.js');
const bot = require('../Storage/constants.json');
const func = require('./functions.js');
const jimp = require('jimp');

module.exports.run = function (message, args, client) {
    message.channel.startTyping();

    let firstField = new Array(100);
    let secondField = new Array(100);

    const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    //piadap - Putting images an definding array position
    function piadap(x, y, shift, generation) {
        for (let i = 0; i < letters.length; i++) if (y === letters[i]) y = numbers[i] - 1;
        if (x === 0) x = 10;
        if (generation) { y--; x--; };
        return [x*100 + shift, y*100, (y * 10 + x)];
        //Первый возвращаемый элемент - это куда поставить картинку по X
        //Второй возвращаемый элемент - это куда поставить картинку по Y
        //Третий - это позиция в массиве
    };

    function toNum (letter) { 
        for (let i = 0; i < letters.length; i++) if (letter === letters[i]) return numbers[i];
    }
    
    function settingShips (field, img, shipsToSet, ship, show) {
        const horisontal = func.randomBoolean();

        const x = numbers[func.random(shipsToSet, numbers.length - 1)];
        const y = letters[func.random(shipsToSet, letters.length - 1)];

        let shift = 0;
        if (!show) shift = 1100;

        for (let i = 0; i < shipsToSet; i++) {
            const yHigher = toNum(y) - i;
            const xLefter = x - i;

            let definder = 0
            if (horisontal) definder = piadap(xLefter, y, shift, true)[2];
            else definder = piadap(x, yHigher, shift, true)[2];

            const numbersToCheck = [0, 1, -1, 10, -10, 11, -11, 9, -1];
            for (let i in numbersToCheck) if (field[definder + numbersToCheck[i]]) return settingShips(field, img, shipsToSet, ship, show);
        }

        for (let i = 0; i < shipsToSet; i++) {
            const yHigher = toNum(y) - i;
            const xLefter = x - i;

            let coordinats
            if (horisontal) coordinats = piadap(xLefter, y, shift, true);
            else coordinats = piadap(x, yHigher, shift, true);
            field[coordinats[2]] = true;
            if (show) img.composite(ship, coordinats[0], coordinats[1]);
        };
        return field;
    }

    function calculatingWin (field) { if (!field.find(sq => sq === true)) return true };

    function move (arrPlr, arrBot, field, attaked) {
        const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 300000 });
        collector.on('collect', msg => {
            collector.stop();
            let embed;

            let xPlr = 0;
            let yPlr = '';

            let hitPlr = false;
            let hitBot = false;

            if (msg.content.match(/[a-z][0-9]/i)) {
                yPlr = msg.content[0].toLowerCase();
                xPlr = parseInt(msg.content[1]);
            } else if (msg.content.toLowerCase() === 'end' || msg.content.startsWith(bot.prefix)) return message.reply('Вы успешно остановили игру')
             else {
                func.err(`Неправильно значение. Правильное использование: ${letters[func.random(0, letters.length - 1)]+numbers[func.random(0, numbers.length - 1)]}`, null, message);
                return move(arrPlr, arrBot, field, attaked);
            };

            let xBot = numbers[func.random(0, numbers.length - 1)];
            let yBot = letters[func.random(0, letters.length - 1)];

            if (attaked[piadap(xBot, yBot, 1100)[2]]) while (attaked[piadap(xBot, yBot, 1100)[2]]) {
                xBot = numbers[func.random(0, numbers.length - 1)];
                yBot = letters[func.random(0, letters.length - 1)];
            }

            const coordinatsBot = piadap(xBot, yBot, 0);
            const coordinatsPlr = piadap(xPlr, yPlr, 1100);

            const tenToZero = (xBot === 10? 0:xBot);

            if (arrPlr[coordinatsBot[2]]) {
                hitBot = true;
                embed = func.embed(`Я попал!`, client.user.avatarURL, `${client.user} - Позиция: **${yBot+tenToZero}.**\n${message.author} - Позиция: **${yPlr+xPlr}.**`, bot.colors.red, client);
            } if (arrBot[coordinatsPlr[2]]) {
                hitPlr = true;
                embed = func.embed(`Ты попал!`, message.author.avatarURL, `${client.user} - Позиция: **${yBot+tenToZero}.**\n${message.author} - Позиция: **${yPlr+xPlr}.**`, bot.colors.green, client);
            } if (!arrPlr[coordinatsBot[2]] && !arrBot[coordinatsPlr[2]]) embed = func.embed(`Мимо`, message.author.avatarURL, `${client.user} - Позиция: **${yBot+tenToZero}.**\n${message.author} - Позиция: **${yPlr+xPlr}.**`, bot.colors.discord, client)
            
            jimp.read(bot.images.sb.dot, (err, dot) => {
                jimp.read(bot.images.sb.ship, (err, ship) => {
                    jimp.read(bot.images.sb.blast, (err, blast) => {
                        jimp.read(bot.images.sb.target, (err, target) => {
                            if (hitPlr) {
                                arrBot[coordinatsPlr[2]] = undefined;
                                field.composite(ship, coordinatsPlr[0], coordinatsPlr[1]);
                                field.composite(blast, coordinatsPlr[0], coordinatsPlr[1]);
                            } else field.composite(dot, coordinatsPlr[0], coordinatsPlr[1]);
                            if (hitBot) {
                                arrPlr[coordinatsBot[2]] = undefined;
                                field.composite(blast, coordinatsBot[0], coordinatsBot[1]);
                            } else field.composite(dot, coordinatsBot[0], coordinatsBot[1]);

                            field.getBuffer(jimp.MIME_PNG, (err, buffer) => {
                                if (calculatingWin(arrPlr)) return message.channel.send('Ты проиграл >:D', { files: [{ name: 'field.png', attachment: buffer }], embed: func.embed('Ты проиграл >:D', client.user.avatarURL, 'В следующий раз повезет!', bot.colors.red, client)});
                                if (calculatingWin(arrBot)) return message.channel.send('Ты победил!', { files: [{ name: 'field.png', attachment: buffer }], embed: func.embed('Ты победил!', message.author.avatarURL, 'Мои поздравления!', bot.colors.green, client)});

                                message.channel.send(`Укажите внизу букву (a-j) и цифру. Например: \`h6\`. Напишите \`end\` чтобы закончить`, { files: [{ name: 'field.png', attachment: buffer }], embed: embed});
                                
                                attaked[coordinatsBot[2]] = true;
                                move(arrPlr, arrBot, field, attaked);
                            });
                        })
                    })
                })
            })
        });
    }

    jimp.read(bot.images.sb.field, (err, field) => {
        if (err) throw err;
        jimp.read(bot.images.sb.ship, (err, ship) => {
            message.channel.send(func.loading('Генерация кораблей', client)).then(msg => {
                firstField = settingShips(firstField, field, 4, ship, true);
                for (let i = 0; i < 2; i++) firstField = settingShips(firstField, field, 3, ship, true);
                for (let i = 0; i < 3; i++) firstField = settingShips(firstField, field, 2, ship, true);
                for (let i = 0; i < 4; i++) firstField = settingShips(firstField, field, 1, ship, true);

                secondField = settingShips(secondField, field, 4, ship, false);
                for (let i = 0; i < 2; i++) secondField = settingShips(secondField, field, 3, ship, false);
                for (let i = 0; i < 3; i++) secondField = settingShips(secondField, field, 2, ship, false);
                for (let i = 0; i < 4; i++) secondField = settingShips(secondField, field, 1, ship, false);

                field.getBuffer(jimp.MIME_PNG, (err, buffer) => {
                msg.delete();
                message.channel.stopTyping();
                return message.channel.send({files: [{ name: 'field.png', attachment: buffer }]}).then(() => move(firstField, secondField, field, new Array(100)));
            });
            })
        })
    })
}
