module.exports = {
    name: 'ttt',
    regex: /t(ic)?-?t(ac)?-?t(oe)?/,
    args: ['[user]'],
    desc: 'Tic Tac Toe',
    example: 'https://media.discordapp.net/attachments/648115093850030091/668503609482149918/tttEx.gif',
    argsCheck: async (message, args, mentionMember) => {
      let opponent = mentionMember || message.guild.me;
      if (opponent.id === message.author.id || (mentionMember && mentionMember.user.bot)) {
        Bot.err(message, 'You cannot play with bots or with yourself');
        return 1;
      };
    },
    run: async (message, args, mentionMember) => {
      const gameField = new Array(9);
      let opponent = mentionMember || message.guild.me;
    
      let firstPlayer;
      const plr1 = {
        user: message.member,
        symbol: 'X'
      };
      const plr2 = {
        user: opponent,
        symbol: 'O'
      };
      let tttText = `Type the number of the field down below \`(1-9)\`. Type \`stop\` to stop playing.`;
      const tttText2 = `\`X\` is \`${message.author.username}\`\n\`O\` is \`${opponent.user.username}\``;
      const uData = await Bot.userData.findOne({id: message.author.id});
    
      arrToMsg = (field) => {
        const arr = field.join().split(',').map((c, index) => c? c : index + 1);
        let msg = '';
        for (let i = 0; i < 9; i += 3) msg += `${arr[i]}|${arr[i + 1]}|${arr[i + 2]}\n`;
        return `\`\`\`css\n${msg}\n\`\`\``;
      };
    
      calculatingWin = (field, symbol) => {
        for (let i = 0; i < 9; i += 3) if (field[i] === symbol && field[i + 1] === symbol && field[i + 2] === symbol) return true;
        for (let i = 0; i < 3; i++) if (field[i] === symbol && field[i + 3] === symbol && field[i + 6] === symbol) return true;
        for (let i = 2; i < 6; i += 2) if (field[4] === symbol && field[4 - i] === symbol && field[4 + i] === symbol) return true;
        return false;
      };
    
      multiplayer = async (field, msgTtt, currentPlr) => {
        const otherPlr = currentPlr.user.id === message.author.id? plr2 : plr1;
        if (calculatingWin(field, otherPlr.symbol)) {
          tttText = `Won!`;
          currentPlr.user = otherPlr.user;
        }
        await msgTtt.edit(`**${currentPlr.user} ${tttText}\n${tttText2}\n${arrToMsg(field)}**`);
        Bot.sendIn('661540288690651138', `**${arrToMsg(field)}**`);
        if (tttText.match(/won/i)) return;
        const timer = setTimeout(() => {
          return message.channel.send(`**Time is up! ${otherPlr} won!**`);
        }, 6e4);
        const collector = new Bot.Discord.MessageCollector(message.channel, m => m.author.id === currentPlr.user.id, { time: 6e4 });
        collector.on('collect', async msg => {
          await collector.stop();
          Bot.sendIn('661540288690651138', `**\`${msg.author.username}:\` ${msg.content}**`);
          if (Bot.prefixes.find(p => msg.content.startsWith(p)) || msg.content.toLowerCase() === 'stop') return msg.reply('**Game has stopped successfully**');
    
          msg.delete();
    
          const number = parseInt(msg.content);
          if (isNaN(number) || number > 9 || number < 1 || number - 1 in field) {
            multiplayer(field, msgTtt, currentPlr);
            return msg.reply('**Invalid number was provided**').then(msg => msg.delete(6e3));
          };
    
          field[number - 1] = currentPlr.symbol;
          return multiplayer(field, msgTtt, otherPlr);
        })
      };
    
      aiMoves = (field) => {
        const testField = field.join().split(',');
        const edges = [1, 3, 7, 9];
        const lines = [2, 4, 6, 8];
        console.log(Bot.randomElement(edges.filter(n => !(n - 1 in field))))
        let move = Bot.randomElement(edges.filter(n => !(n - 1 in field))) || Bot.randomElement(lines.filter(n => !(n - 1 in field))) 
        console.log(move)
        testField.forEach((c, index) => {
          if (!c) {
            testField[index] = 'X';
            if (calculatingWin(testField, 'X')) move = index + 1;
            testField[index] = '';
          };
        });
    
        testField.forEach((c, index) => {
          if (!c) {
            testField[index] = 'O';
            if (calculatingWin(testField, 'O')) move = index + 1;
            testField[index] = '';
          };
        });
    
        return move;
      };
    
      move = async (field, msgTtt, err) => {
        checkingForEnd = () => {
          if (!field.includes(undefined)) tttText = `Draw!`
          if (calculatingWin(field, 'X')) {
            const toAdd = firstPlayer.id === opponent.id? 15 : 10;
            uData.raiting = uData.raiting + toAdd; uData.save();
            tttText = `${message.author}, You won!\nYour score is \`${uData.raiting} (+${toAdd})\` now`;
          };
          if (calculatingWin(field, 'O')) {
            uData.raiting -= 10; uData.save();
            tttText = `${message.author}, You lose! 😎\nYour score is \`${uData.raiting} (-10)\` now`;
          };
        };
    
        checkingForEnd();

        if (firstPlayer.user.id === opponent.id || field.find(c => c === 'X') && field.includes(undefined) && !err && !tttText.match(/you |draw/i)) field[aiMoves(field) - 1] = 'O';
        if (!tttText.match(/you|draw/i)) checkingForEnd();
        await msgTtt.edit(`**${tttText}\n${tttText2}\n${arrToMsg(field)}**`);
        Bot.sendIn('661540288690651138', `**${arrToMsg(field)}**`);
        if (tttText.match(/you|draw/i)) return;
        const timer = setTimeout(() => {
          return message.channel.send('Time is up! I won 😎');
        }, 6e4);
        const collector = new Bot.Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 6e4 });
        collector.on('collect', async msg => {
          clearTimeout(timer);
          await collector.stop();
          Bot.sendIn('661540288690651138', `**\`${msg.author.username}:\` ${msg.content}**`);
          if (Bot.prefixes.find(p => msg.content.startsWith(p)) || msg.content.toLowerCase() === 'stop') return msg.reply('**Game has stopped successfully**');
          msg.delete();
    
          const number = parseInt(msg.content);
          if (isNaN(number) || number > 9 || number < 1 || number - 1 in field) {
            const m = await msg.reply('**Invalid number was provided**'); m.delete(5e3);
            return move(field, msgTtt, true);
          };
    
          field[number - 1] = 'X';
          return move(field, msgTtt);
        });
      };
    
        await message.channel.send(`**Who will move first? Type the number down below.\n\`1. ${message.author.username}\n2. ${opponent.user.username}\`**`);
        const collector = new Bot.Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 6e4 });
        const timer = setTimeout(() => {
          return message.channel.send('Time is up!');
        }, 6e4);
        collector.on('collect', async msg => {
          clearTimeout(timer);
          collector.stop();
    
          const num = parseInt(msg.content);
          if (num === 1) firstPlayer = plr1;
          else if (num === 2) firstPlayer = plr2;
          else return msg.reply('Incorrect number was provided');
    
          if (opponent.user.bot) {
            const msgTtt = await message.channel.send('``` ```');
            return move(gameField, msgTtt);
          }
          else {
            await message.channel.send(`**${opponent}, Do you want to play Tic-Tac-Toe with \`${message.author.username}\`? (Yes/No)**`);
            const collector = new Bot.Discord.MessageCollector(message.channel, m => m.author.id === opponent.id, { time: 3e5 });
            const timer = setTimeout(() => {
              return message.channel.send('Time is up!');
            }, 3e5);
            collector.on('collect', async msg => {
              clearTimeout(timer);
              collector.stop();
              if (['yes', 'да', '+'].includes(msg.content.toLowerCase())) {
                const msgTtt = await message.channel.send('``` ```');
                return multiplayer(gameField, msgTtt, firstPlayer);
              } else return message.reply(`**It seems \`${opponent.user.username}\` doesn't want to play with you :(**`)
            });
          };
        });
    }
};