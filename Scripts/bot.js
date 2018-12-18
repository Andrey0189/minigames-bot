const Discord = require('discord.js');
const client = new Discord.Client({disableEveryone : true});
const bot = require('../Storage/constants');
const func = require('./functions');
const jimp = require('jimp');

const prefix = '/';

const serverLeaveJoin = '522729281349222410';
const commandsUsing = '522729347417767946';
const bugsAndIdeas = '522729302073147392';

/** @namespace process.env.BOT_TOKEN */

client.on('ready', () => {
    console.log(`Бот запущен.\nСервера: ${client.guilds.size}\nЮзеры: ${client.users.size}\nКаналы: ${client.channels.size}`);
    client.user.setActivity(`${prefix}help | ${client.guilds.size} servers`, {type : 1});
});

client.on('guildCreate', (guild) => {
    func.send(serverLeaveJoin, `
Я **пришел** :inbox_tray: на сервер **${guild.name}**. Информация о нем:
Акроним и ID: **${guild.nameAcronym} | ${guild.id}**
Основатель: **${guild.owner} (\`${guild.owner.user.tag}\`)**
Количество участников: **${guild.memberCount}**
Роли: **${guild.roles.size}**
Каналы: **${guild.channels.size}**
Создана: **${guild.createdAt.toString().slice(4, -32)}**
Иконка: ${guild.iconURL}
**Это наш ${client.guilds.size}-ый сервер!**`, client);
    client.user.setActivity(`${prefix}help | ${client.guilds.size} servers`,{ type: 'PLAYING' });
    let channels = guild.channels.filter(channel => channel.type === 'text' && channel.permissionsFor(guild.members.get(client.user.id)).has('SEND_MESSAGES'));
    if (channels.size > 0) channels.first().send(`Спасибо за приглашение меня на сервер, чтобы узнать как мной пользоваься и какие миниигры у меня есть, то наишите ${prefix}help. Больше помощи можно получить тут --> https://discord.gg/DxptT7N`);
});

client.on('guildDelete', (guild) => {
    func.send(serverLeaveJoin, `
Я **покинул** :outbox_tray: сервер **${guild.name}**. Информация о нем:
Акроним и ID: **${guild.nameAcronym} | ${guild.id}**
Основатель: **${guild.owner} (\`${guild.owner.user.tag}\`)**
Количество участников: **${guild.memberCount}**
Роли: **${guild.roles.size}**
Каналы: **${guild.channels.size}**
Создана: **${guild.createdAt.toString().slice(4, -32)}**
Иконка: ${guild.iconURL}`, client);
    client.user.setActivity(`${prefix}help | ${client.guilds.size} servers`,{ type: 'PLAYING' });
});

client.on('message', message => {
    if(message.channel.type !== `text` || message.author.bot || !message.content.startsWith(bot.prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (['rsp', 'кнб'].includes(command)) {
        let choice = args[0];

        if (['r', 'rock', 'камень', 'к'].includes(choice)) choice = client.emojis.get(bot.emojis.rock)
        else if (['p', 'paper', 'бумага', 'б'].includes(choice)) choice = ':page_with_curl:';
        else if (['s', 'scissors', 'ножницы', 'н'].includes(choice)) choice = ':scissors:';
        else return func.err('Вы указали неправильное значение', null, message)

        func.send(commandsUsing, `${message.author} (${message.author.tag}) играет в ${prefix}rsp на ${message.guild.name}`, client)

        let computerChoice = Math.random();

        if (computerChoice < 0.34) computerChoice = client.emojis.get(bot.emojis.rock);
        else if(computerChoice <= 0.67) computerChoice = ':page_with_curl:';
        else computerChoice = ':scissors:';
        
        function calculatingWin(choice1, choice2) {
            if (choice1 === choice2) return 'ничья';

            else if(choice1 === client.emojis.get(bot.emojis.rock)) {
                if(choice2 === ':scissors:') return true;
                else return false;
            }
            else if(choice1 === ':page_with_curl:') {
                if(choice2 === client.emojis.get(bot.emojis.rock)) return true;
                else return false;
                
            }
            else if(choice1 === ':scissors:') {
                if(choice2 === ':page_with_curl:') return true;
                else return false;
            }
        }
        const isWin = calculatingWin(choice, computerChoice);

        if (isWin !== 'ничья') 
            message.channel.send(func.embed(
                (isWin? 'Ты выиграл!':`Ты проиграл >:D`), 
                message.author.avatarURL,
                `**${message.author.username}** - выбрал ${choice}\n**${client.user.username}** - выбрал ${computerChoice}`, 
                (isWin? '55ff55':'ff5555'), client
            ));

        else message.channel.send(func.embed('Ничья!', message.author.avatarURL, `**Оба выбрали** ${choice}`, 'ffff55', client));
    }

    if (['countries', 'страны', 'capitals', 'столицы'].includes(command)) {
        const countriesCmd = ['countries', 'страны'];
        const capitalsCmd = ['capitals', 'столицы'];

        const countries = bot.minigames.countries;
        const flags = bot.minigames.flags;
        const capitals = bot.minigames.capitals;

        let variants = [];
        let answers = [];
        let minigameName = '';
        let question = '';
        let seconds = 0;
        let numberOfVariants = 0;

        if (countriesCmd.includes(command)) {variants = countries; answers = flags; minigameName = 'Угадай флаг страны'; question = 'Какой флаг у страны'};
        if (capitalsCmd.includes(command)) {variants = countries; answers = capitals; minigameName = 'Угадай столицу страны'; question = 'Какая столица у страны'};

        if (['e', 'easy', 'л', 'легко'].includes(args[0])) {seconds = 60; numberOfVariants = 3}
        else if (['h', 'hard', 'сл', 'сложно'].includes(args[0])) {seconds = 15; numberOfVariants = 12}
        else if (['i', 'impossible', 'н', 'невозможно'].includes(args[0])) {seconds = 20; numberOfVariants = 24}
        else {seconds = 10; numberOfVariants = 6};

        const definder = func.random(0, variants.length - 1);
        const numberInList = func.random(1, numberOfVariants);
        const variantsInMenu = [];
        const embed = new Discord.RichEmbed()
        .setAuthor(`Миниигра "${minigameName}"`, message.author.avatarURL,)
        .setDescription(`${message.member}, ${question} **"${variants[definder]}"**?`)
        .setColor('af00ff')
        .setFooter(`Напишите цифру внизу (У вас есть ${seconds} секунд!)`)
        .setTimestamp();
        for (let i = 1; i < numberOfVariants + 1; i++) {
            let answer = answers[func.random(0, answers.length - 1)];
            if (i === numberInList) answer = answers[definder];
            variantsInMenu.forEach(variantInMenu => {
                while (answer === variantInMenu) answer = answers[func.random(0, answers.length - 1)];
            })
            variantsInMenu.push(answer);
            embed.addField(`${i})`, `**${answer}**`, true);
        }
        message.channel.send({embed}).then(() => {
            const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: seconds*1000 });
            collector.on('collect', msg => {
                collector.stop();
                function youLose () {
                    message.channel.send(func.embed(
                        `Ты проиграл >:D`, 
                        message.author.avatarURL,
                        `Правильный ответ: **${numberInList})** ${answers[definder]}`,
                        'ff5555', client
                    ));
                    func.send(commandsUsing, `${message.author} (${message.author.tag}) **проиграл** в ${prefix}${command} на ${message.guild.name}`, client)
                }
                if (msg.content || !isNaN(parseInt(msg.content))) {
                    const number = parseInt(msg.content) - 1;

                    if (variantsInMenu[number] === answers[definder]) {
                        message.channel.send(func.embed(
                            'Ты выиграл!',
                            message.author.avatarURL,
                            `Правильный ответ **${number + 1})** ${answers[definder]}`,
                            '55ff55', client
                        ));
                        func.send(commandsUsing, `${message.author} (${message.author.tag}) **выиграл** в ${prefix}${command} на ${message.guild.name}`, client)
                    }

                    else youLose();

                } else youLose();
            })
        });
    }

    if (command === 'bug') {
        if (!args[0]) return func.err('Не указан баг', null, message)
        const bug = args.join(' ');
        message.channel.send('Баг успешно отправлен');
        func.send(bugsAndIdeas, `Баг от ${message.author} (${message.author.tag}):\n**${bug}**`, client);
    }

    if (command === 'idea') {
        if (!args[0]) return func.err('Не указана идея', null, message)
        const idea = args.join(' ');
        message.channel.send('Идея успешно отправлена');
        func.send(bugsAndIdeas, `Идея от ${message.author} (${message.author.tag}):\n**${idea}**`, client);
    }

    if (command === 'creator') message.channel.send(`\`${client.users.get(bot.creatorID).tag}\``);
    if (command === 'invite') message.channel.send(`Пригласить бота:\nhttps://discordapp.com/oauth2/authorize?client_id=522731595858313217&scope=bot&permissions=379904`);

    if (command === 'mass-say' && message.author.id === bot.creatorID) {
        client.guilds.forEach(guild => {
            let channels = guild.channels.filter(channel => channel.type === 'text' && channel.permissionsFor(guild.members.get(client.user.id)).has('SEND_MESSAGES'));
            if (channels.size > 0) channels.first().send(args.join(' '));
        })
    }

    if (['ttt', 'tic-tac-toe', 'крестики-нолики'].includes(command)) {
        let gameField = new Array(9);
        const firstMoves = [1, 3, 5, 7, 9];
        const firstMove = firstMoves[func.random(0, firstMoves.length - 1)];

        function puttingImages(numberOfSquare) {
            if (numberOfSquare === 1) return [70, 80];
            if (numberOfSquare === 2) return [390, 80];
            if (numberOfSquare === 3) return [710, 80];
            if (numberOfSquare === 4) return [70, 400];
            if (numberOfSquare === 5) return [390, 400];
            if (numberOfSquare === 6) return [710, 400];
            if (numberOfSquare === 7) return [70, 720];
            if (numberOfSquare === 8) return [390, 720];
            if (numberOfSquare === 9) return [710, 720];
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

        function move (currentField, img, position) {
            jimp.read('../Storage/tttField.png', (err, field) => {
                if (err) throw err;
                if (img) field = img;
                jimp.read('../Storage/cross.png', (err, cross) => {
                    if (!calculatingWin(currentField, 'player')) field.composite(cross, puttingImages(position)[0], puttingImages(position)[1]);
                    currentField[position - 1] = 'ai';
                    console.log(currentField);
                    field.getBuffer(jimp.MIME_PNG, (error, buffer) => {
                        if (calculatingWin(currentField, 'player')) return message.channel.send({files: [{ name: 'field.png', attachment: buffer }], embed : func.embed(
                            `Ты выиграл!`, 
                            message.author.avatarURL,
                            `Искусствнный интеллект проиграл :(`,
                            '55ff55', client)});
                        if (calculatingWin(currentField, 'ai')) return message.channel.send({files: [{ name: 'field.png', attachment: buffer }], embed : func.embed(
                            `Ты проиграл >:D`, 
                            message.author.avatarURL,
                            `*Изи вин*`,
                            'ff5555', client)});
                        if (!currentField.includes(undefined)) return message.channel.send({files: [{ name: 'field.png', attachment: buffer }], embed : func.embed(
                            `Ничья!`, 
                            message.author.avatarURL,
                            `Мы равны?`,
                            'ffff55', client)});
                        message.channel.send('Укажите номер поля внизу (1-9)', {files: [{ name: 'field.png', attachment: buffer }]}).then(() => {
                            const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: 60000 });
                            collector.on('collect', msg => {
                                collector.stop();
                                const number = parseInt(msg.content)
                                if (isNaN(number) || number > 9 || number < 1 || currentField[number - 1]) {
                                    return func.err('Вы укзали неверное значение, либо клетка уже занята', null, message);
                                } else if (msg.content.toLowerCase() === 'end') return message.channel.send('Вы успешно остановили игру')

                                jimp.read('../Storage/circle.png', (err, circle) => {
                                    field.composite(circle, puttingImages(number)[0], puttingImages(number)[1]);
                                    currentField[number - 1] = 'player';
                                    field.getBuffer(jimp.MIME_PNG, (error, newBuffer) => {
                                        let newPosition = func.random(1, 9);
                                        if (currentField[newPosition - 1]) {
                                            while (currentField[newPosition - 1]) newPosition = func.random(1, 9);
                                            move(currentField, field, newPosition)
                                        }
                                        else move(currentField, field, newPosition)
                                    });
                                });
                            });
                        });
                    });
                });
            });
        }
        move(gameField, null, firstMove)
    }

    if (command === 'help') {
        message.channel.send(func.embed(
            'Помощь',
            message.author.avatarURL,
            `
\`<...>\` - Обязательный параметр
\`[...]\` - Необязательный параметр
\`&\` - Оператор И
\`|\` - Оператор ИЛИ\n
**Миниигры:**
**${prefix}rsp** \`<камень | ножницы | бумага>\` - Камень, ножницы, бумага
**${prefix}countries** \`[easy | medium | hard | impossible]\` - Угадай флаг страны
**${prefix}capitals** \`[easy | medium | hard | impossible]\` - Угадай столицу страны
**${prefix}ttt** - Крестики-нолики\n
**Другие команды:**
**${prefix}bug** \`<описание бага>\` - Если бот работает не так как должен, то вы можете написать об этом разработчику с помощью этой команды
**${prefix}idea** \`<идея>\` - Отправить идею о новой миниигре разработчику
**${prefix}invite** - Ссылка на приглашение бота
**${prefix}creator** - Узнать создателя бота\n
**Получить больше помощи можно тут:** https://discord.gg/NvcAKdt
`,

            'af00ff', client
        ));
    };
});

client.login(process.env.BOT_TOKEN);