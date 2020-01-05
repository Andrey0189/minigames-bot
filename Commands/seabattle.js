module.exports.info = {
  name: 'battleship',
  regex: /battle-?ship/,
  desc: 'Battleship',
};

module.exports.run = async (message, args, mentionMember) => {
  let firstField = new Array(100);
  let secondField = new Array(100);
  const standartText = `Battleship (BETA)\n**Type the coordinates of your move. Example: \`h6\`. Type \`stop\` to stop playing**`;

  const opponent = mentionMember;
  if (opponent && opponent.user.bot) return Bot.err(message, 'You can\'t play with bots');

  const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  //piadap - Putting images an definding array position
  piadap = (x, y, shift, generation) => {
    for (let i = 0; i < letters.length; i++) if (y === letters[i]) y = numbers[i] - 1;
    if (x === 0) x = 10;
    if (generation) { y--; x--; };
    return [x*100 + shift, y*100, (y * 10 + x)];
  };

  toNum = (letter) => {
    for (let i = 0; i < letters.length; i++) if (letter === letters[i]) return numbers[i];
  };

  settingShips = (field, img, shipsToSet, ship, show) => {
    const horisontal = Bot.randomBoolean();

    const x = numbers[Bot.random(shipsToSet - 1, numbers.length - 1)] + 1;
    const y = letters[Bot.random(shipsToSet, letters.length - 1)];
    const numbersToCheck = [0, 1, -1, 10, -10, 11, -11, 9, -9];
    const shift = show? 0 : 1100;

    for (let i = 0; i < shipsToSet; i++) {
      const def = horisontal? piadap(x - i, y, shift, true) : piadap(x, toNum(y) - i, shift, true);
      if (numbersToCheck.map(n => def[2] + n).find(n => n in field)) {
        return settingShips(field, img, shipsToSet, ship, show);
      }
    }

    for (let i = 0; i < shipsToSet; i++) {
      const cords = horisontal? piadap(x - i, y, shift, true) : piadap(x, toNum(y) - i, shift, true);
      field[cords[2]] = true;
      if (show) img.composite(ship, cords[0], cords[1]);
    };

    return field;
  };

  calculatingWin = (field) => {
    if (!field.find(sq => sq === true)) return true;
  };

  multiplayer = async (currentPlr) => {
    const otherPlr = (currentPlr.user.id === message.author.id)? plrInfo2 : plrInfo1;
    const collector = new Bot.Discord.MessageCollector(currentPlr.user.dmChannel, m => m.author.id === currentPlr.user.id, { time: 3e5 });
    collector.on('collect', async msg => {
      collector.stop();

      if (msg.content.match(/\/?[a-j][0-9]/i)) {
        const y = msg.content[0].toLowerCase();
        const x = parseInt(msg.content[1]);
        let currRes = 'Miss';

        const coordinates = piadap(x, y, 1100);
        const coordinatesNoShift = piadap(x, y, 0);
        const dot = await Bot.jimp.read(Bot.images.sb.dot);
        const ship = await Bot.jimp.read(Bot.images.sb.ship);
        const blast = await Bot.jimp.read(Bot.images.sb.blast);

        if (!(coordinates[2] in currentPlr.attacked)) {
          await currentPlr.img.composite(dot, coordinates[0], coordinates[1]);
          await otherPlr.img.composite(dot, coordinatesNoShift[0], coordinatesNoShift[1]);
        } if (coordinates[2] in otherPlr.field) {
          currRes = 'Strike! 🚀';
          delete otherPlr.field[coordinates[2]];
          if (!otherPlr.field.find(sq => sq)) {
            msg.channel.send('You won!');
            return otherPlr.send(`**${currentPlr.user.username} destroyed your last ship on \`${msg.content}\`! You lose >:D**`)
          };
          await currentPlr.img.composite(ship, coordinates[0], coordinates[1]);
          await currentPlr.img.composite(blast, coordinates[0], coordinates[1]);
          await otherPlr.img.composite(blast, coordinatesNoShift[0], coordinatesNoShift[1]);
        };

        msg.channel.send(`**${currRes}. Watinig for answer from ${otherPlr.user.username}...**`);
        const embed = new Bot.Discord.RichEmbed()
        .setTitle('Move results')
        .setDescription(`**\`${currentPlr.user.username}:\` ${currRes} \`(${msg.content})\`**`)
        .setColor(Bot.colors.main);

        otherPlr.img.getBuffer(Bot.jimp.MIME_PNG, (err, buffer) => {
          otherPlr.user.send(standartText, { files: [{ name: 'field.png', attachment: buffer }], embed: embed});
          currentPlr.attacked[coordinates[2]] = 1;
          return multiplayer(otherPlr);
        });
      } else if (msg.content.toLowerCase() === 'stop') {
        otherPlr.user.send(`It seems that ${currentPlr.user.username} stopped the game`)
        return msg.reply(`Game has successfully stopped`);
      }
      else return multiplayer(currentPlr);
    });
  };

  move = (arr1, arr2, img, attacked1, attacked2) => {
    const collector = new Bot.Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 3e5 });
    collector.on('collect', async msg => {
      collector.stop();

      if (msg.content.match(/\/?[a-j][0-9]/i)) {
        const yPlr = msg.content[0].toLowerCase();
        const xPlr = parseInt(msg.content[1]);

        let xBot = numbers[Bot.random(0, numbers.length - 1)];
        let yBot = letters[Bot.random(0, letters.length - 1)];

        if (attacked2[piadap(xBot, yBot, 1100)[2]]) while (attacked2[piadap(xBot, yBot, 1100)[2]]) {
          xBot = numbers[Bot.random(0, numbers.length - 1)];
          yBot = letters[Bot.random(0, letters.length - 1)];
        };

        const coordinatesBot = piadap(xBot, yBot, 0);
        const coordinatesPlr = piadap(xPlr, yPlr, 1100);

        const dot = await Bot.jimp.read(Bot.images.sb.dot);
        const ship = await Bot.jimp.read(Bot.images.sb.ship);
        const blast = await Bot.jimp.read(Bot.images.sb.blast);

        const tenToZero = (xBot === 10? 0 : xBot);
        const embed = new Bot.Discord.RichEmbed()
        .setTitle('Move results')
        .setColor(Bot.colors.main);
        let plrRes = 'Miss';
        let botRes = 'Miss';

        if (!(coordinatesPlr[2] in attacked1)) await field.composite(dot, coordinatesPlr[0], coordinatesPlr[1]);
        await field.composite(dot, coordinatesBot[0], coordinatesBot[1]);
        if (arr1[coordinatesBot[2]]) {
          botRes = 'Strike! 🚀';
          delete arr1[coordinatesBot[2]];
          if (calculatingWin(arr1)) return message.reply('You lose! >:D');
          await field.composite(blast, coordinatesBot[0], coordinatesBot[1]);
        } if (arr2[coordinatesPlr[2]]) {
          plrRes = 'Strike! 🚀'
          delete arr2[coordinatesPlr[2]];
          if (calculatingWin(arr2)) return message.reply('You won!');
          await field.composite(ship, coordinatesPlr[0], coordinatesPlr[1]);
          await field.composite(blast, coordinatesPlr[0], coordinatesPlr[1]);
        };

        embed.setDescription(`**\`You:\` ${plrRes} \`(${msg.content})\`\n\`Bot:\` ${botRes} \`(${yBot + tenToZero})\`**`)

        field.getBuffer(Bot.jimp.MIME_PNG, (err, buffer) => {
          message.channel.send(standartText, { files: [{ name: 'field.png', attachment: buffer }], embed: embed});

          attacked2[coordinatesBot[2]] = 1;
          attacked1[coordinatesPlr[2]] = 1;
          return move(arr1, arr2, field, attacked1, attacked2);
      });
    } else if (msg.content.toLowerCase() === 'stop' || Bot.prefixes.find(p => msg.content.startsWith(p))) return msg.reply(`Game has successfully stopped`)
      else {
        move(arr1, arr2, field, attacked1, attacked2);
        return msg.delete(2e4);
      };
    })
  };

  const field = await Bot.jimp.read(Bot.images.sb.field);
  const ship = await Bot.jimp.read(Bot.images.sb.ship);

  settingOnField = (arr, img, show) => {
    arr = settingShips(arr, img, 4, ship, show);
    for (let i = 0; i < 2; i++) arr = settingShips(arr, img, 3, ship, show);
    for (let i = 0; i < 3; i++) arr = settingShips(arr, img, 2, ship, show);
    for (let i = 0; i < 4; i++) arr = settingShips(arr, img, 1, ship, show);
  };

  const plrInfo1 = opponent? {
    user: message.author,
    field: firstField,
    attacked: new Array(100)
  } : null;
  const plrInfo2 = opponent? {
    user: opponent.user,
    field: secondField,
    attacked: new Array(100)
  } : null;

  if (!opponent) {
    settingOnField(firstField, field, true);
    settingOnField(secondField, field, false);
  } else {
    plrInfo1.img = field; plrInfo2.img = field.clone();
    settingOnField(plrInfo1.field, plrInfo1.img, true); settingOnField(plrInfo2.field, plrInfo2.img, true);
  };

  if (!opponent) field.getBuffer(Bot.jimp.MIME_PNG, (err, buffer) => {
    message.channel.send(standartText, {files: [{ name: 'field.png', attachment: buffer }]}).then(() => {
      move(firstField, secondField, field, new Array(100), new Array(100));
    });
  }); else {
    plrInfo1.img.getBuffer(Bot.jimp.MIME_PNG, (err, buffer) => {
      plrInfo2.user.send(`**Waiting for answer from ${message.author.username}**`)
      message.author.send(standartText, {files: [{ name: 'field.png', attachment: buffer }]}).then(() => {
        multiplayer(plrInfo1);
      });
    });
  }
};
