module.exports.info = {
  name: 'chess',
  regex: /ch(ess)?/,
  args: '[user]',
  desc: 'Chess',
  hidden: true,
};

module.exports.run = async (message, args, mentionMember) => {
  if (![Bot.creatorID, '401739659945967626', '424254345031188480', '307492203092246528', '428036906723573760', '489443611113422868'].includes(message.author.id)) return;
  const gameField = Array(64);
  const opponent = mentionMember;
  // if (!opponent) return Bot.err(message, 'You didn\'t mentioned somebody')

  // const x = args[0][0].toLowerCase();
  // const y = parseInt(args[0][1]);

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

  const figuresEmojis = [Bot.emojis.whitePawn, Bot.emojis.whiteHourse, Bot.emojis.whiteEleph, Bot.emojis.whiteLadya, Bot.emojis.whiteFerz, Bot.emojis.whiteKing,
    Bot.emojis.blackPawn, Bot.emojis.blackHourse, Bot.emojis.blackEleph, Bot.emojis.blackLadya, Bot.emojis.blackFerz, Bot.emojis.blackKing];

  const figuresImgs = [Bot.images.chess.whitePawn, Bot.images.chess.whiteHourse, Bot.images.chess.whiteEleph, Bot.images.chess.whiteLadya, Bot.images.chess.whiteFerz, Bot.images.chess.whiteKing,
    Bot.images.chess.blackPawn, Bot.images.chess.blackHourse, Bot.images.chess.blackEleph, Bot.images.chess.blackLadya, Bot.images.chess.blackFerz, Bot.images.chess.blackKing];

  figuresToEmojis = (figure) => {
    for (let i = 0; i < figures.length; i++) if (figure = figures[i]) return figuresEmojis[i];
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

  getMoves = (def, gameField) => {
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
      if (condition && !(def + jump * 2 in gameField)) moves.push(def + jump * 2);
      if (!(def + jump in gameField)) moves.push(def + jump);
      const toCheck = [def + horizontalCheck[0], def + horizontalCheck[1]];
      for (let i in toCheck) if (toCheck[i] in gameField && gameField[toCheck[i]].match(new RegExp(colorChange(figure), 'i'))) moves.push(toCheck[i]);
    };

    console.log(`${figure} ${def}`);
    let moves = [];
    if (figure.match(/white pawn/i)) pawnMoves(-8, def >= 48, [-9, -7]);
    else if (figure.match(/black pawn/i)) pawnMoves(8, def <= 16, [9, 7]);
    else if (figure.match(/knight/i)) {
      const toCheck = [-17, -15, -10, -6, 6, 10, 15, 17];
      for (let i in toCheck) if (!(def + toCheck[i] in gameField)) moves.push(def + toCheck[i]);
    } else if (figure.match(/king/i)) {
      gameField[def] = 'White king+';
      const toCheck = [-9, -8, -7, -1, 1, 7, 8, 9];
      for (let i in toCheck) if (!(def + toCheck[i] in gameField)) moves.push(def + toCheck[i]);
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
    console.log(moves.sort((m1, m2) => m2 - m1));
    return moves;
  };

  move = (gameField, img) => {
    const collector = new Bot.Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 3e5 });
    collector.on('collect', async msg => {
        collector.stop();

        const args = msg.content.trim().split(/ +/g);

        figurePlace = async (figureCords, toPlace) => {
          const moves = getMoves(figureCords[2], gameField);

          if (!moves.includes(toPlace[2]) && !msg.content.match(/o/i)) {
            await message.reply('Ты не можешь сюда пойти алло');
            return move(gameField, img);
          };

          const figure = gameField[figureCords[2]];

          delete gameField[toPlace[2]];
          delete gameField[figureCords[2]];
          gameField[toPlace[2]] = figure;

          const blackSquare = await Bot.jimp.read(Bot.images.chess.blackSquare);
          const whiteSquare = await Bot.jimp.read(Bot.images.chess.whiteSquare);

          if (whiteSquares.includes(figureCords[2])) await img.composite(whiteSquare, figureCords[0], figureCords[1]);
          else await img.composite(blackSquare, figureCords[0], figureCords[1]);
          if (whiteSquares.includes(toPlace[2])) await img.composite(whiteSquare, toPlace[0], toPlace[1]);
          else await img.composite(blackSquare, toPlace[0], toPlace[1]);

          for (let i = 0; i < figures.length; i++) {
            if (figure === figures[i]) {
            const figureImg = await Bot.jimp.read(figuresImgs[i]);
            img.composite(figureImg, toPlace[0], toPlace[1]);
            return img;
          }};
        };

        if (msg.content.match(/[a-h][1-8] [a-h][1-8]/i)) {
            const x = msg.content[0].toLowerCase();
            const y = parseInt(msg.content[1]);

            const xSet = args[1][0].toLowerCase();
            const ySet = parseInt(args[1][1]);

            const coordinats = piadap(x, y);
            const moveCords = piadap(xSet, ySet);

            img = await figurePlace(coordinats, moveCords);

            img.getBuffer(Bot.jimp.MIME_PNG, (err, buffer) => {
              message.channel.send(`Type \`o-o\` or \`o-o-o\` for castling btw`, {files: [{ name: 'field.png', attachment: buffer }]});
              return move(gameField, img);
            });
        } else if (msg.content.match(/o-o(-o)?/i)) {
          const jump = msg.content.length < 4? 3 : -4;
          let kingDef;
          const king = gameField.find((c, index) => {
            if (c && c.match(/white king/i) && !c.match(/\+/)) {
              kingDef = index;
              return true;
            };
          });

          if (king && kingDef + jump in gameField && gameField[kingDef + jump].match(/rook/i)) {
            for (let i = jump; i > 0? i < 3 : i > -4; i > 0? i++ : i--) if (i in gameField) return;
          };

          const kingJump = jump > 0? 2 : -2;
          const rookJump = jump > 0? -2 : 3;

          const y = arrToCords(kingDef)[1] + 1;
          const x = arrToCords(kingDef)[0] + 1;
          const rookX = arrToCords(kingDef + jump)[0] + 1;
          console.log(`Old: ${piadap(x, y)[2]} ${piadap(rookX, y)[2]}\nNew: ${piadap(x + kingJump, y)[2]} ${piadap(rookX + rookJump, y)[2]}`);
          console.log(`${x} ${y}`);

          img = await figurePlace(piadap(x, y), piadap(x + kingJump, y));
          //img = await figurePlace(piadap(rookX, y), piadap(rookX + rookJump, y));

          img.getBuffer(Bot.jimp.MIME_PNG, (err, buffer) => {
            message.channel.send(`Type \`o-o\` or \`o-o-o\` for castling btw`, {files: [{ name: 'field.png', attachment: buffer }]});
            return move(gameField, img);
          });
        } else if (Bot.prefixes.find(p => msg.content.toLowerCase().startsWith(p)) || msg.content.toLowerCase() === 'stop') return;
        else return (gameField, img);
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
    message.channel.send({files: [{ name: 'field.png', attachment: buffer }]}).then(() => move(gameField, field))
  });
};
