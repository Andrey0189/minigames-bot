const Discord = require('discord.js');
const bot = require('../Storage/constants.json');
const func = require('./functions.js');
const jimp = require('jimp');

module.exports.run = function (message, args, client,) {
    const gameField = new Array(9);
    const firstMoves = [1, 5, 9];
    const firstMove = firstMoves[func.random(0, firstMoves.length - 1)];
    let opponent = message.mentions.members.first(); 

    function puttingImages(numberOfSquare) {
        if (numberOfSquare === 1) return [50, 48];
        if (numberOfSquare === 2) return [400, 48];
        if (numberOfSquare === 3) return [750, 48];
        if (numberOfSquare === 4) return [50, 400];
        if (numberOfSquare === 5) return [404, 400];
        if (numberOfSquare === 6) return [750, 400];
        if (numberOfSquare === 7) return [48, 752];
        if (numberOfSquare === 8) return [400, 752];
        if (numberOfSquare === 9) return [752, 752];
    }

    function calculatingWin(field, player) {
        if (field[0] === player && field[1] === player && field[2] === player) return true;
        else if (field[3] === player && field[4] === player && field[5] === player) return true;
        else if (field[6] === player && field[7] === player && field[8] === player) return true;
        else if (field[0] === player && field[3] === player && field[6] === player) return true;
        else if (field[1] === player && field[4] === player && field[7] === player) return true;
        else if (field[2] === player && field[5] === player && field[8] === player) return true;
        else if (field[0] === player && field[4] === player && field[8] === player) return true;
        else if (field[2] === player && field[4] === player && field[6] === player) return true;
        else return false;
    }

    function checkingDoubleMoves(field, position, player) {
        for (let i = 0; i < 3; i++) //Чекаем 2 горизональных справа
            if (field[i] === player && field[i + 3] === player && !field[i + 6]) return position = i + 6;
        for (let i = 0; i < 3; i++) //Чекаем 2 горизональных слева
            if (field[i + 6] === player && field[i + 3] === player && !field[i]) return position = i;
            
        for (let i = 0; i < 9; i = i + 3) //Чекаем 2 вертикальных сверху
            if (field[i] === player && field[i + 1] === player && !field[i + 2]) return position = i + 2;
        for (let i = 0; i < 9; i = i + 3) //Чекаем 2 вертикальных снизу
            if (field[i + 2] === player && field[i + 1] === player && !field[i]) return position = i;

        for (let i = 0; i < 3; i++) //Чекаем 2 вертикальных с пустым пронстанством между фигурами
            if (field[i] === player && field[i + 6] === player && !field[i + 3]) return position = i + 3;
        for (let i = 0; i < 9; i = i + 3) //Чекаем 2 горизонатльных с пустым пронстанством между фигурами
            if (field[i] === player && field[i + 2] === player && !field[i + 1]) return position = i + 1;

        for (let i = 0; i < 9; i = i + 2) { //Чекаем 2 диагональных
            if (i === 4) continue;
            if (field[4] === player && field[i] === player && !field[Math.abs(i - 8)]) return position = Math.abs(i - 8);
        }

        for (let i = 0; i < 3; i = i + 2)  //Чекаем 2 диагональных с пустым пронстанством между фигурами
            if (field[i] === player && field[Math.abs(i - 8)] === player && !field[4]) return position = 4;
        return null;
    }

    function moveWithOpponent (currentField, img, numberOfMoves, firstPlayer, secondPlayer, currentPlayer) {
        let link = '';
        if (currentPlayer === firstPlayer) link = bot.images.ttt.cross;
        if (currentPlayer === secondPlayer) link = bot.images.ttt.circle;
        const playerMention = client.users.get(currentPlayer);
        const firstMention = client.users.get(firstPlayer);
        const secondMention = client.users.get(secondPlayer);
        jimp.read(bot.images.ttt.field, (err, field) => {
            if (err) throw err;
            if (img) field = img;
            jimp.read(link, (err, figure) => {
                field.getBuffer(jimp.MIME_PNG, (error, buffer) => {
                    message.channel.send(`${playerMention}, твой ход. Укажите номер поля внизу (1-9)\nX - ${firstMention.username}\nO - ${secondMention.username}`, {files: [{ name: 'field.png', attachment: buffer }]}).then((messagee) => {
                        const collector = new Discord.MessageCollector(message.channel, m => m.author.id === currentPlayer, { time: 60000 });
                        collector.on('collect', msg => {
                            collector.stop();
                            const number = parseInt(msg.content)
                            if ((isNaN(number) || number > 9 || number < 1 || currentField[number - 1]) && msg.content.toLowerCase() !== 'end') {
                                func.err('Вы укзали неверное значение, либо клетка уже занята', null, message);
                                return moveWithOpponent(currentField, img, numberOfMoves, firstPlayer, secondPlayer, currentPlayer) && messagee.delete(1);
                            } else if (msg.content.toLowerCase() === 'end' || msg.content.startsWith(bot.prefix)) return message.reply('Вы успешно остановили игру').then((messagee) => { messagee.delete(1500) });
                            field.composite(figure, puttingImages(number)[0], puttingImages(number)[1]);
                            currentField[number - 1] = currentPlayer;
                            field.getBuffer(jimp.MIME_PNG, (error, buffer) => {
                                if (calculatingWin(currentField, currentPlayer)) return message.channel.send({files: [{ name: 'field.png', attachment: buffer }], embed : func.embed(
                                    `${playerMention.username} выиграл!`, 
                                    playerMention.avatarURL,
                                    `${playerMention} совершил это за **${Math.ceil((numberOfMoves + 1) / 2)}** ${func.declOfNum(numberOfMoves, ['ход', 'хода', 'ходов'])}`,
                                    bot.colors.green, client)});
                                if (!currentField.includes(undefined)) return message.channel.send({files: [{ name: 'field.png', attachment: buffer }], embed : func.embed(
                                    `Ничья!`, 
                                    playerMention.avatarURL,
                                    `И снова ничья?`,
                                    bot.colors.yellow, client)});
                                if (currentPlayer === firstPlayer) currentPlayer = secondPlayer;
                                else currentPlayer = firstPlayer;
                                numberOfMoves++;
                                return moveWithOpponent(currentField, field, numberOfMoves, firstPlayer, secondPlayer, currentPlayer);  
                            })
                        });
                    });
                })
            });
        });
    };

    function move (currentField, img, position, numberOfMoves, aiMovingFirst, aiMovedFirst) {
        jimp.read(bot.images.ttt.field, (err, field) => {
            if (err) throw err;
            if (img) field = img;
            jimp.read(bot.images.ttt.cross, (err, cross) => {
                if (checkingDoubleMoves(currentField, position, 'player')) position = checkingDoubleMoves(currentField, position, 'player') + 1;
                if (checkingDoubleMoves(currentField, position, 'ai')) position = checkingDoubleMoves(currentField, position, 'ai') + 1;
                if (!calculatingWin(currentField, 'player') && ((aiMovingFirst >= 2 && aiMovingFirst !== 6) || aiMovedFirst)) {
                    field.composite(cross, puttingImages(position)[0], puttingImages(position)[1]);
                    currentField[position - 1] = 'ai';
                }
                field.getBuffer(jimp.MIME_PNG, (error, buffer) => {
                    if (calculatingWin(currentField, 'player')) return message.channel.send({files: [{ name: 'field.png', attachment: buffer }], embed : func.embed(
                        `Ты выиграл!`, 
                        message.author.avatarURL,
                        `Ты совершил это за **${numberOfMoves}** ${func.declOfNum(numberOfMoves, ['ход', 'хода', 'ходов'])}`,
                        bot.colors.green, client)});
                    if (calculatingWin(currentField, 'ai')) return message.channel.send({files: [{ name: 'field.png', attachment: buffer }], embed : func.embed(
                        `Ты проиграл >:D`, 
                        message.author.avatarURL,
                        `Я победил тебя за **${numberOfMoves + 1}** ${func.declOfNum(numberOfMoves, ['ход', 'хода', 'ходов'])}`,
                        bot.colors.red, client)});
                    if (!currentField.includes(undefined)) return message.channel.send({files: [{ name: 'field.png', attachment: buffer }], embed : func.embed(
                        `Ничья!`, 
                        message.author.avatarURL,
                        `И снова ничья?`,
                        bot.colors.yellow, client)});
                    message.reply(`Укажите номер поля внизу (1-9)\nX - ${message.guild.me}\nO - ${message.author}`, {files: [{ name: 'field.png', attachment: buffer }]}).then((messagee) => {
                        const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 60000 });
                        collector.on('collect', msg => {
                            collector.stop();
                            const number = parseInt(msg.content)
                            if ((isNaN(number) || number > 9 || number < 1 || currentField[number - 1]) && msg.content.toLowerCase() !== 'end') {
                                func.err('Вы укзали неверное значение, либо клетка уже занята', null, message);
                                return move(currentField, img, position, numberOfMoves, aiMovingFirst, aiMovedFirst);
                            } else if (msg.content.toLowerCase() === 'end') return message.reply('Вы успешно остановили игру').then((messagee) => { messagee.delete(1500) });
                            messagee.delete(1);
                            jimp.read(bot.images.ttt.circle, (err, circle) => {
                                field.composite(circle, puttingImages(number)[0], puttingImages(number)[1]);
                                currentField[number - 1] = 'player';
                                field.getBuffer(jimp.MIME_PNG, (error, newBuffer) => {
                                    let newPosition = func.random(1, 9);
                                    numberOfMoves++;
                                    aiMovingFirst++;
                                    if (currentField[newPosition - 1] && aiMovingFirst !== 6) {
                                        while (currentField[newPosition - 1]) newPosition = func.random(1, 9);
                                        return move(currentField, field, newPosition, numberOfMoves, aiMovingFirst, aiMovedFirst)
                                    }
                                    else return move(currentField, field, newPosition, numberOfMoves, aiMovingFirst, aiMovedFirst)
                                });
                            });
                        });
                    });
                });
            });
        });
    }
    if (opponent) {
        if (opponent.user.bot) return func.err('Соперник не может быть ботом', null, message);
        if (opponent.user.presence.status === 'offline') return func.err(`${opponent} не в сети`, null, message);
        if (opponent.id === message.author.id) return func.err('Оу, у тебя нет друзей :(', null, message);
        message.channel.send(`${opponent}, Вы хотите сыграть в крестики-нолики с ${message.author}? Ответьте \`+\`, если хотите сыграть, ответьте \`-\` если нет`).then((messagee) => {
            const collector = new Discord.MessageCollector(message.channel, m => m.author.id === opponent.id, { time: 60000 });                  
            collector.on('collect', msg => {
                collector.stop();
                if (!['+', 'Да', 'Yes'].includes(msg.content.toLowerCase())) return message.reply(`К сожалению ${opponent} отказался с вами играть`).then((messagee) => { messagee.delete(1500) });
                else {
                    messagee.delete(1);
                    message.channel.send(func.embed(
                        `Кто пойдет первым?`,
                        message.author.avatarURL,
                        `**1 - ${opponent}\n2 - ${message.author}**\nУкажите цифру внизу`,
                        bot.colors.main, client
                    )).then((messagee) => {
                        function choosing () {
                            const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 60000 });
                            collector.on('collect', msg => {
                                collector.stop();
                                const num = parseInt(msg.content);
                                let firstPlayer;
                                let secondPlayer;
                                if (num === 1) {
                                    firstPlayer = opponent.id
                                    secondPlayer = message.author.id
                                    messagee.delete(1);
                                    return moveWithOpponent(gameField, null, 0, firstPlayer, secondPlayer, firstPlayer);
                                } else if (num === 2) {
                                    firstPlayer = message.author.id
                                    secondPlayer = opponent.id
                                    messagee.delete(1);
                                    return moveWithOpponent(gameField, null, 0, firstPlayer, secondPlayer, firstPlayer);
                                } else {
                                    func.err('Вы должны указать либо `1`, либо `2`. Попробуйте еще раз', null, message);
                                    return choosing();
                                }
                            });
                        }
        
                        choosing();
                    })
                }
            });
        });
    };
    if (!opponent) {
        opponent = message.guild.me;
        message.channel.send(func.embed(
            `Кто пойдет первым?`,
            message.author.avatarURL,
            `**1 - ${message.author}\n2 - ${opponent}**\nУкажите цифру внизу`,
            bot.colors.main, client
        )).then((messagee) => {
            function choosing () {
                const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 60000 });
                collector.on('collect', msg => {
                    collector.stop();
                    const num = parseInt(msg.content);
                    if (num === 1) move(gameField, null, firstMove, 0, num) && messagee.delete(1);
                    else if (num === 2) move(gameField, null, firstMove, 0, num, true) && messagee.delete(1);
                    else {
                        func.err('Вы должны указать либо `1`, либо `2`. Попробуйте еще раз', null, message);
                        return choosing();
                    }
                })
            }
            choosing();
        })
    }
}
