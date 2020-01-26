module.exports = {
  name: 'chess',
  regex: /chess/,
  args: ['<user>'],
  desc: 'Chess',
  example: 'https://media.discordapp.net/attachments/648115093850030091/668503498458923038/chessEx.gif',
  argsCheck: async (message, args, mentionMember) => {
    const opponent = mentionMember;
    if (!opponent || opponent.id === message.author.id) {
      Bot.err(message, 'Invalid user was provided');
      return 1;
    }
    if (opponent.user.bot) {
      Bot.err(message, 'You can\'t play with bots');
      return 1;
    }
  },
  run: async (message, args, mentionMember) => {
    const standartText = `Type the coordinats of the figure, what you want to move and coordinats of the place, where you want to move. Example: \`e7 e5\`\nType \`0-0\` or \`0-0-0\` for castling\nType \`stop\` to stop playing\nChess are only in __BETA__ so there may be some bugs.\nIf you found any bugs, you can tell about them with command "${Bot.prefix}bug \`<bug desc>\`"`;
    const gameField = Array(64);
    const opponent = mentionMember;
    message.author.send(`Here is some instructions: ${module.exports.example}`);
    opponent.user.send(`Here is some instructions: ${module.exports.example}`);
  
    const white = {
      id: message.author.id,
      color: 'white',
    };
  
    const black = {
      id: opponent.id,
      color: 'black',
    };
  
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8];
    const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  
    const whiteSquares = [0, 2, 4, 6, 9, 11, 13, 15,
    16, 18, 20, 22, 25, 27, 29, 31,
    32, 34, 36, 38, 41, 43, 45, 47,
    48, 50, 52, 54, 57, 59, 61, 63];
  
    const parallels = [
      [0, 7],
      [8, 15],
      [16, 23],
      [24, 31],
      [32, 39],
      [40, 47],
      [48, 55],
      [56, 63]
    ];
  
    const figures = ['White pawn', 'White knight', 'White bishop', 'White rook', 'White queen', 'White king',
      'Black pawn', 'Black knight', 'Black bishop', 'Black rook', 'Black queen', 'Black king'];
  
    const figuresImgs = [Bot.images.chess.whitePawn, Bot.images.chess.whiteHourse, Bot.images.chess.whiteEleph, Bot.images.chess.whiteLadya, Bot.images.chess.whiteFerz, Bot.images.chess.whiteKing,
      Bot.images.chess.blackPawn, Bot.images.chess.blackHourse, Bot.images.chess.blackEleph, Bot.images.chess.blackLadya, Bot.images.chess.blackFerz, Bot.images.chess.blackKing];
  
    debug = (field) => {
      const fieldLog = field.join().split(',').map((c, i) => {
      let figure;
      switch (c) {
        case 'White pawn':
          figure = '♙';
          break;
        case 'White knight':
          figure = '♘';
          break;
        case 'White bishop':
          figure = '♗';
          break;
        case 'White rook':
          figure = '♖';
          break;
        case 'White queen':
          figure = '♕';
          break;
        case 'White king' || 'White king+':
          figure = '♔';
          break;
        case 'Black pawn':
          figure = '♟';
          break;
        case 'Black knight':
          figure = '♞';
          break;
        case 'Black bishop':
          figure = '♝';
          break;
        case 'Black rook':
          figure = '♜';
          break;
        case 'Black queen':
          figure = '♛';
          break;
        case 'Black king' || 'Black king+':
          figure = '♚';
          break;
        default: 
          figure = whiteSquares.includes(i)? ' ' : '◼';
      };
      
      return ` ${((i % 8 === 0)? i / 8 + 1 + ' ' : '') + figure + ((((i + 1) % 8 === 0) && i !== 0)? '\n' : '')}`
      });

      return fieldLog.join('') + '   a b c d e f g h';
    };
  
    piadap = (x, y) => {
      for (let i = 0; i < letters.length; i++) if (x === letters[i]) x = numbers[i];
      y--; x--;
      return [x*100 + 100, y*100, y * 8 + x];
    };
  
    colorChange = (figure) => figure.match(/white/i)? 'black' : 'white';
  
    arrToCords = (num) => {
      const x = num - parallels.find(p => p[0] <= num && p[1] >= num)[0];
      const y = (num - x) / 8;
      return [x, y];
    };
  
    getMoves = (def, gameField, checking) => {
      const figure = gameField[def];
  
      extendedMoves = (jump, type) => {
        const def2 = whiteSquares.includes(def)? true : false;
        const parallel = parallels.find(p => p[0] <= def && p[1] >= def);
        const moves = [];
        for (let i = def + jump; (type === 'bishop'? whiteSquares.includes(i) === def2 : ((jump < 2 && jump > -2)? parallel === parallels.find(p => p[0] <= i && p[1] >= i) : true)) && i < 64 && i >= 0; i += jump) {
          if (i in gameField && !gameField[i].match(new RegExp(colorChange(figure), 'i'))) return moves;
          moves.push(i);
          if (i in gameField) return moves;
        }
        return moves;
      };
  
      pawnMoves = (jump, condition, horizontalCheck) => {
        if (condition && !(def + jump * 2 in gameField) && !(def + jump in gameField)) moves.push(def + jump * 2);
        if (!(def + jump in gameField)) moves.push(def + jump);
        const toCheck = [def + horizontalCheck[0], def + horizontalCheck[1]];
        for (let i in toCheck) if (toCheck[i] in gameField && !(def % ([-9, 7].includes(toCheck[i] - def)? 8 : 7) === 0)) moves.push(toCheck[i]);
      };
  
      if (!checking) console.log(`${figure} ${def}`);
      let moves = [];
      if (figure.match(/white pawn/i)) pawnMoves(-8, def >= 48, [-9, -7]);
      else if (figure.match(/black pawn/i)) pawnMoves(8, def <= 16, [9, 7]);
      else if (figure.match(/knight/i)) {
        const toCheck = [-17, -15, -10, -6, 6, 10, 15, 17];
        for (let i in toCheck) moves.push(def + toCheck[i]);
      } else if (figure.match(/king/i)) {
        if (!checking && !figure.match(/\+/)) gameField[def] = figure + '+';
        const toCheck = [-9, -8, -7, -1, 1, 7, 8, 9];
        for (let i in toCheck) moves.push(def + toCheck[i]);
      } else if (figure.match(/bishop/i)) {
        const jumps = [9, 7, -9, -7];
        for (let i in jumps) moves = moves.concat(extendedMoves(jumps[i], 'bishop'));
      } else if (figure.match(/rook/i)) {
        const jumps = [8, 1, -8, -1];
        for (let i in jumps) moves = moves.concat(extendedMoves(jumps[i], 'rook'));
      } else if (figure.match(/queen/i)) {
        const jumps = [9, 7, -9, -7];
        const jumps2 = [8, 1, -8, -1];
        for (let i in jumps) moves = moves.concat(extendedMoves(jumps[i], 'bishop'));
        for (let i in jumps2) moves = moves.concat(extendedMoves(jumps2[i], 'rook'));
      };
      if (!checking) console.log(moves.filter(n => !(n in gameField && gameField[n].match(new RegExp(figure.split(/ /)[0], 'i')))).sort((m1, m2) => m2 - m1));
      return moves.filter(n => n >= 0 && n < 63 && !(n in gameField && gameField[n].match(new RegExp(figure.split(/ /)[0], 'i'))));
    };
  
    move = (gameField, img, player) => {
      console.log(debug(gameField));
      Bot.sendIn('661540288690651138', `**\`\`\`${debug(gameField)}\`\`\`**`);
      const otherPlayer = player.id === white.id? black : white;
      const collector = new Bot.Discord.MessageCollector(message.channel, m => m.author.id === player.id, { time: 3e5 });
      const stop = setTimeout(() => {
        return message.channel.send(`Time is up! ${Bot.client.users.get(otherPlayer.id)} won!`)
      }, 3e5);
      collector.on('collect', async msg => {
          clearTimeout(stop);
          await collector.stop();
          Bot.sendIn('661540288690651138', `**\`${Bot.client.users.get(player.id).username}:\` ${msg.content}**`);
  
          figurePlace = async (figureCords, toPlace) => {
            const from = arrToCords(figureCords[2]);
            const to = arrToCords(toPlace[2]);
            from[0] = letters[from[0]];
            from[1]++;
            to[0] = letters[to[0]];
            to[1]++;
  
            if (!gameField[figureCords[2]] || !gameField[figureCords[2]].match(new RegExp(player.color, 'i'))) {
              Bot.err(message, `This isn't your figure or there are no figure on ${from[0]}${from[1]}`);
              return move(gameField, img, player);
            };
  
            const moves = getMoves(figureCords[2], gameField);
  
            if (!moves.includes(toPlace[2]) && !msg.content.match(/0/)) {
              Bot.err(message, `You can't move the ${gameField[figureCords[2]]} from ${from[0]}${from[1]} to ${to[0]}${to[1]}`);
              return move(gameField, img, player);
            };
  
            let figure = gameField[figureCords[2]];
  
            const gameFieldCopy = gameField.concat([]);
            delete gameField[toPlace[2]];
            delete gameField[figureCords[2]];
            gameField[toPlace[2]] = figure;
  
            let kingDef;
            gameField.forEach((c, index) => { if (c && c.match(new RegExp(`${player.color} king`, 'i'))) kingDef = index });
            let otherKingDef;
            gameField.forEach((c, index) => { if (c && c.match(new RegExp(`${otherPlayer.color} king`, 'i'))) otherKingDef = index });
            let _check = false;
            let checkmate = false;
            gameField.forEach((f, index) => {
              if (f.match(new RegExp(otherPlayer.color, 'i'))) {
                const moves = getMoves(index, gameField, true);
                if (moves.includes(kingDef)) {
                  _check = true;
                };
              } else if (f.match(new RegExp(player.color, 'i'))) {
                const moves = getMoves(index, gameField, true);
                if (moves.includes(otherKingDef)) {
                  checkmate = true;
                }
              };
            });
  
            if (checkmate) gameField.forEach((f, index) => {
              if (f.match(new RegExp(otherPlayer.color, 'i')) && checkmate) {
                getMoves(index, gameField, true).forEach(move => {
                  const fieldTest = gameField.concat([]);
                  delete fieldTest[index];
                  delete fieldTest[move];
                  fieldTest[move] = f;
                  let otherMoves = [];
                  let otherKingDef;
                  fieldTest.forEach((c, i) => { if (c && c.match(new RegExp(`${otherPlayer.color} king`, 'i'))) otherKingDef = i });
                  fieldTest.forEach((otherFigure, otherIndex) => {
                    if (otherFigure.match(new RegExp(player.color, 'i'))) otherMoves = otherMoves.concat(getMoves(otherIndex, fieldTest, true));
                  });
  
                  if (!otherMoves.includes(otherKingDef)) {
                    console.log(`If you move figure ${f} from ${index} to ${move}, you won't die btw`);
                    console.log(fieldTest);
                    return checkmate = false;
                  }
                });
              };
            });
  
            if (checkmate) {
              message.channel.send('Checkmate');
              return 'checkmate'
            }
  
            if (_check && !checkmate) {
              Bot.err(message, 'Your king is under attack!');
              return move(gameField, img, player);
            };
  
            const blackSquare = await Bot.jimp.read(Bot.images.chess.blackSquare);
            const whiteSquare = await Bot.jimp.read(Bot.images.chess.whiteSquare);
  
            if (whiteSquares.includes(figureCords[2])) await img.composite(whiteSquare, figureCords[0], figureCords[1]);
            else await img.composite(blackSquare, figureCords[0], figureCords[1]);
            if (whiteSquares.includes(toPlace[2])) await img.composite(whiteSquare, toPlace[0], toPlace[1]);
            else await img.composite(blackSquare, toPlace[0], toPlace[1]);
  
            for (let i = 0; i < figures.length; i++) {
              if (figure.match(/pawn/i) && arrToCords(toPlace[2])[1] === (player.color === 'white'? 0 : 7)) {
                gameField[toPlace[2]] = `${figure.split(' ')[0]} queen`;
                figure = gameField[toPlace[2]];
              };
  
              if (figure.match(new RegExp(figures[i], 'i'))) {
                const figureImg = await Bot.jimp.read(figuresImgs[i]);
                await img.composite(figureImg, toPlace[0], toPlace[1]);
                return img;
              }
            };
          };
  
          const match = msg.content.match(/[a-h][1-8] +[a-h][1-8]/i, '$');
          if (match) {
              const args = match[0].trim().split(/ +/g);
              const x = match[0][0].toLowerCase();
              const y = parseInt(match[0][1]);
  
              const xSet = args[1][0].toLowerCase();
              const ySet = parseInt(args[1][1]);
  
              const coordinates = piadap(x, y);
              const moveCords = piadap(xSet, ySet);
  
              img = await figurePlace(coordinates, moveCords);
              if (img === 'checkmate') return message.channel.send(`${player.id === message.author.id? message.author : opponent} Won!`);
  
              const greenSquare = await Bot.jimp.read(Bot.images.chess.greenSquare);
              const imgGreen = img.clone();
              await imgGreen.composite(greenSquare, coordinates[0], coordinates[1]);
              await imgGreen.composite(greenSquare, moveCords[0], moveCords[1]);
              try {
                imgGreen.getBuffer(Bot.jimp.MIME_PNG, (err, buffer) => {
                  if (err) console.log(err);
                  message.channel.send(`**${msg.author.username} successfully moved \`${gameField[moveCords[2]]}\` from \`${x}${y}\` to \`${xSet}${ySet}\`\n${player.id === message.author.id? opponent : message.author}, your move.\n${standartText}**`, {files: [{ name: 'field.png', attachment: buffer }]});
                  Bot.sendIn('661540288690651138', {files: [{ name: 'field.png', attachment: buffer }]});
                  return move(gameField, img, otherPlayer);
                });
              } catch (e) {};
  
          } else if (msg.content.match(/0-0(-0)?/i)) {
            const jump = msg.content.length < 4? 3 : -4;
            let kingDef;
            const king = gameField.find((c, index) => {
              if (c && c.match(new RegExp(`${player.color} king`, 'i')) && !c.match(/\+/)) {
                kingDef = index;
                return true;
              };
            });
  
            if (king && kingDef + jump in gameField && gameField[kingDef + jump].match(new RegExp(`${player.color} rook`, 'i'))) {
              if (jump > 0) for (let i = 2; i > 0; i--) if (kingDef + i in gameField) return move(gameField, img, player);
              if (jump < 0) for (let i = -3; i < 0; i++) if (kingDef + i in gameField) return move(gameField, img, player);
            } else {
              Bot.err(message, 'Not all conditions for castling are met');
              return move(gameField, img, player);
            }
  
            const kingJump = jump > 0? 2 : -2;
            const rookJump = jump > 0? -2 : 3;
  
            const y = arrToCords(kingDef)[1] + 1;
            const x = arrToCords(kingDef)[0] + 1;
            const rookX = arrToCords(kingDef + jump)[0] + 1;
  
            img = await figurePlace(piadap(x, y), piadap(x + kingJump, y));
            img = await figurePlace(piadap(rookX, y), piadap(rookX + rookJump, y));
  
            img.getBuffer(Bot.jimp.MIME_PNG, (err, buffer) => {
              message.channel.send(`**${msg.author.username} was successfully castled.\n${player.id === message.author.id? opponent : message.author}, your move.\nType \`0-0\` or \`0-0-0\` for castling btw**`, {files: [{ name: 'field.png', attachment: buffer }]});
              return move(gameField, img, otherPlayer);
            });
          } else if (Bot.prefixes.find(p => msg.content.toLowerCase().startsWith(p)) || msg.content.toLowerCase() === 'stop') return msg.reply('Game has successfully stopped');
          else return move(gameField, img, player);
      });
    };
  
    const field = await Bot.jimp.read(Bot.images.chess.field);
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
  
    field.getBuffer(Bot.jimp.MIME_PNG, (err, buffer) => {
      message.channel.send(`**${message.author}, your move\n${standartText}**`, {files: [{ name: 'field.png', attachment: buffer }]}).then(() => move(gameField, field, white))
    });
  },
};
