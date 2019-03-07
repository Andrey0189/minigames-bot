module.exports.info = {
    name: 'ttt',
    regex: /t(ic)?-?t(ac)?-?t(oe)?-?|к(рестики)?-?н(олики)?/,
    desc: 'Tic Tac Toe',
};

module.exports.run = (message, args) => {
  const gameField = new Array(9);
  const firstMoves = [1, 5, 9];
  const firstMove = firstMoves[Bot.random(0, firstMoves.length - 1)];
  const mention = message.content.match(/ <@!?(\d+)>/);
  let opponent = mention? message.guild.members.get(mention[1]) : null;

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
      if (currentPlayer === firstPlayer) link = Bot.images.ttt.cross;
      if (currentPlayer === secondPlayer) link = Bot.images.ttt.circle;
      const playerMention = Bot.client.users.get(currentPlayer);
      const firstMention = Bot.client.users.get(firstPlayer);
      const secondMention = Bot.client.users.get(secondPlayer);
      Bot.jimp.read(Bot.images.ttt.field, (err, field) => {
          if (err) throw err;
          if (img) field = img;
          Bot.jimp.read(link, (err, figure) => {
              field.getBuffer(Bot.jimp.MIME_PNG, (error, buffer) => {
                  message.channel.send(`${playerMention}, your move, type the number of the field down bellow (1-9)\nX - ${firstMention.username}\nO - ${secondMention.username}`, {files: [{ name: 'field.png', attachment: buffer }]}).then(msgBot => {
                      const collector = new Bot.Discord.MessageCollector(message.channel, m => m.author.id === currentPlayer, { time: 60000 });
                      collector.on('collect', msg => {
                          collector.stop();
                          const number = parseInt(msg.content)
                          if ((isNaN(number) || number > 9 || number < 1 || currentField[number - 1]) && msg.content.toLowerCase() !== 'end') {
                              return Bot.err(message, 'Invalid number of the field was provided');
                              return moveWithOpponent(currentField, img, numberOfMoves, firstPlayer, secondPlayer, currentPlayer);
                          } else if (msg.content.toLowerCase() === 'end' || msg.content.startsWith(bot.prefix)) return message.reply('Вы успешно остановили игру');

                          msg.delete();

                          field.composite(figure, puttingImages(number)[0], puttingImages(number)[1]);
                          currentField[number - 1] = currentPlayer;
                          field.getBuffer(Bot.jimp.MIME_PNG, (error, buffer) => {
                              const embedWin = new Bot.Discord.RichEmbed()
                              .setAuthor(`${playerMention.username} Won!`, playerMention.avatarURL)
                              .setColor(Bot.colors.green)
                              .setDescription(`${playerMention} did it in **${Math.ceil((numberOfMoves + 1) / 2)}** moves`);
                              const embedDraw = new Bot.Discord.RichEmbed()
                              .setAuthor('Draw!')
                              .setColor(Bot.colors.yellow)
                              .setDescription('Again?');
                              if (calculatingWin(currentField, currentPlayer)) return message.channel.send({files: [{ name: 'field.png', attachment: buffer }], embed: embedWin});
                              if (!currentField.includes(undefined)) return message.channel.send({files: [{ name: 'field.png', attachment: buffer }], embed: embedDraw});
                              if (currentPlayer === firstPlayer) currentPlayer = secondPlayer;
                              else currentPlayer = firstPlayer;
                              numberOfMoves++;

                              msgBot.delete();
                              return moveWithOpponent(currentField, field, numberOfMoves, firstPlayer, secondPlayer, currentPlayer);
                          })
                      });
                  });
              })
          });
      });
  };

  function move (currentField, img, position, numberOfMoves, aiMovingFirst, aiMovedFirst) {
      Bot.jimp.read(Bot.images.ttt.field, (err, field) => {
          if (err) throw err;
          if (img) field = img;
          Bot.jimp.read(Bot.images.ttt.cross, (err, cross) => {
              if (checkingDoubleMoves(currentField, position, 'player')) position = checkingDoubleMoves(currentField, position, 'player') + 1;
              if (checkingDoubleMoves(currentField, position, 'ai')) position = checkingDoubleMoves(currentField, position, 'ai') + 1;
              if (!calculatingWin(currentField, 'player') && ((aiMovingFirst >= 2 && aiMovingFirst !== 6) || aiMovedFirst)) {
                  field.composite(cross, puttingImages(position)[0], puttingImages(position)[1]);
                  currentField[position - 1] = 'ai';
              }
              field.getBuffer(Bot.jimp.MIME_PNG, (error, buffer) => {
                  const embedWin = new Bot.Discord.RichEmbed()
                  .setAuthor('You won!')
                  .setColor(Bot.colors.green)
                  .setDescription(`You did it in **${numberOfMoves}** moves!`);
                  const embedLose = new Bot.Discord.RichEmbed()
                  .setAuthor('You lose >:D')
                  .setColor(Bot.colors.red)
                  .setDescription(`I did it in **${numberOfMoves + 1}** moves!`);
                  const embedDraw = new Bot.Discord.RichEmbed()
                  .setAuthor('Draw!')
                  .setColor(Bot.colors.yellow)
                  .setDescription('Again?');
                  if (calculatingWin(currentField, 'player')) {
                    console.log('win')
                    return message.channel.send({files: [{ name: 'field.png', attachment: buffer }], embed: embedWin});
                  }
                  else if (calculatingWin(currentField, 'ai')) {
                    console.log('lose')
                    return message.channel.send({files: [{ name: 'field.png', attachment: buffer }], embed: embedLose});
                  }
                  else if (!currentField.includes(undefined)) {
                    console.log('draw');
                    return message.channel.send({files: [{ name: 'field.png', attachment: buffer }], embed: embedDraw});
                  }
                  message.reply(`Type the number of the field down bellow (1-9)\nX - ${message.guild.me}\nO - ${message.author}`, {files: [{ name: 'field.png', attachment: buffer }]}).then(msgBot => {
                      const collector = new Bot.Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 60000 });
                      collector.on('collect', msg => {
                          collector.stop();
                          const number = parseInt(msg.content)
                          if ((isNaN(number) || number > 9 || number < 1 || currentField[number - 1]) && msg.content.toLowerCase() !== 'end') {
                              Bot.err(message, 'Invalid number of the field was provided')
                              return move(currentField, img, position, numberOfMoves, aiMovingFirst, aiMovedFirst);
                          } else if (msg.content.toLowerCase() === 'end') return message.reply('Game was stopped successfully')

                          msg.delete();

                          Bot.jimp.read(Bot.images.ttt.circle, (err, circle) => {
                              field.composite(circle, puttingImages(number)[0], puttingImages(number)[1]);
                              currentField[number - 1] = 'player';
                              field.getBuffer(Bot.jimp.MIME_PNG, (error, newBuffer) => {
                                  let newPosition = Bot.random(1, 9);
                                  numberOfMoves++;
                                  aiMovingFirst++;
                                  msgBot.delete();
                                  if (currentField[newPosition - 1] && aiMovingFirst !== 6) {
                                      while (currentField[newPosition - 1]) newPosition = Bot.random(1, 9);
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
      if (opponent.user.bot) return Bot.err(message, 'You cannot play with bots');
      if (opponent.user.presence.status === 'offline') return Bot.err(message, `${opponent} is offline`);
      if (opponent.id === message.author.id) return Bot.err(message, 'Oh, you don\'t have friends :(');
      message.channel.send(`${opponent}, Do you want to play "Tic-Tac-Toe" with ${message.author}? Yes/no`).then(() => {
          const collector = new Discord.MessageCollector(message.channel, m => m.author.id === opponent.id, { time: 60000 });
          collector.on('collect', msg => {
              collector.stop();
              if (!['+', 'да', 'yes'].includes(msg.content.toLowerCase())) return message.reply(`Sorry, but ${opponent} doesn\'t want to play with you`);
              else {
                  const embed = new Bot.Discord.RichEmbed()
                  .setAuthor('Choose the first player', message.author.avatarURL)
                  .setDescription(`**1 - ${opponent}\n2 - ${message.author}**\nType the number down bellow`)
                  .setColor(Bot.colors.main)
                  message.channel.send(embed).then(() => {
                      function choosing () {
                          const collector = new Bot.Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 60000 });
                          collector.on('collect', msg => {
                              collector.stop();
                              const num = parseInt(msg.content);
                              let firstPlayer;
                              let secondPlayer;
                              if (num === 1) {
                                  firstPlayer = opponent.id
                                  secondPlayer = message.author.id
                                  return moveWithOpponent(gameField, null, 0, firstPlayer, secondPlayer, firstPlayer);
                              } else if (num === 2) {
                                  firstPlayer = message.author.id
                                  secondPlayer = opponent.id
                                  return moveWithOpponent(gameField, null, 0, firstPlayer, secondPlayer, firstPlayer);
                              } else {
                                  Bot.err(message, 'Invalid number of the field was provided');
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
      const embed = new Bot.Discord.RichEmbed()
      .setAuthor('Choose the first player', message.author.avatarURL)
      .setDescription(`**1 - ${message.author}\n2 - ${opponent}**\nType the number down bellow`)
      .setColor(Bot.colors.main)
      message.channel.send(embed).then(() => {
          function choosing () {
              const collector = new Bot.Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 60000 });
              collector.on('collect', msg => {
                  collector.stop();
                  const num = parseInt(msg.content);
                  if (num === 1) move(gameField, null, firstMove, 0, num);
                  else if (num === 2) move(gameField, null, firstMove, 0, num, true);
                  else {
                      Bot.err(message, 'Invalid number of the filed was provided');
                      return choosing();
                  }
              })
          }
          choosing();
      })
  }
};
