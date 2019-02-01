const Discord = require('discord.js');
const hastebinGen = require('hastebin-gen');
const client = new Discord.Client({disableEveryone: true});
const bot = require('../Storage/constants.js');
const func = require('./functions.js');
const tictactoe = require('./tictactoe.js');
const seabattle = require('./seabattle.js');
const commands = require('../Storage/commands.js');
//const chess = require('./chess');

const prefix = '/';

const serverLeaveJoin = '536187820243550228';
const commandsUsing = '536187872655704074';
const bugsAndIdeas = '536187892968587285';

let usedCommands = 0;
let commandsPerHour = 0;
let msgs = 0;

Discord.Message.prototype.multipleReact = async function (arr) {
    if (arr[0]) {
        await this.react(arr.shift());
        this.multipleReact(arr);
    }
}

const addCommas = (int) => int.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

Discord.TextChannel.prototype.betterFetch = async function (int, arr = new Discord.Collection(), lastMessage) {
    let obj = {limit: 99};
    if (lastMessage) obj.before = lastMessage;

    if (int >= 100) {
        const d = await this.fetchMessages(obj);
        d.forEach((data, id) => arr.set(id, data));
        return await this.betterFetch(int - 99, arr, arr.last().id);
    } else {
        obj.limit = int;
        const d = await this.fetchMessages(obj);
        d.forEach((data, id) => arr.set(id, data));
        return arr;
    }
};

/** @namespace process.env.BOT_TOKEN */

client.on('ready', () => {
    console.log(`Бот запущен.\nСервера: ${client.guilds.size}\nЮзеры: ${client.users.size}\nКаналы: ${client.channels.size}`);
    setInterval(() => client.user.setActivity(`${prefix}help | ${client.guilds.size} servers`, {type : "PLAYING"}), 120000)
    setInterval(() => commandsPerHour = 0, 3600000);

    setInterval(() => {
        client.channels.get('539737874032230437').fetchMessage('539749513246670861').then(msg => msg.edit(new Discord.RichEmbed()
        .setTitle(`Бот "${bot.name}"`)
        .setThumbnail(client.user.avatarURL)
        .addField(`Пинг :ping_pong:`, `${addCommas(Math.round(client.ping))} ms`, true)
        .addField('ОЗУ :gear:', `${addCommas(Math.round(process.memoryUsage().rss / 1024 / 1024 ))}/\`1,024 МБ\``, true)
        .addField('Использовано команд :wrench:', `${addCommas(usedCommands)} times`,  true)
        .addField('Команд за час :clock11:', `${addCommas(commandsPerHour)} per hour`, true)
        .addField('Сообщений :envelope:', `${addCommas(msgs)} msgs`, true)
        .addField(`Юзеры :bust_in_silhouette:`, `${addCommas(client.users.size)} users`, true)
        .addField(`Каналы :keyboard:`, `${addCommas(client.channels.size)} channels`, true)
        .addField(`Сервера :desktop:`, `${addCommas(client.guilds.size)} servers`, true)
        .addField(`Эмодзи :joy:`, `${addCommas(client.emojis.size)} emojis`, true)
        .addField(`Голосовые каналы :microphone:`, `${addCommas(client.voiceConnections.size)} channels`, true)
        .addField(`Время работы :stopwatch:`, `${addCommas(Math.round(client.uptime / (1000 * 60 * 60)))} hours, ${addCommas(Math.round(client.uptime / (1000 * 60)) % 60)} minutes`, true)
        .addField(`Включен :on:`, client.readyAt.toLocaleString('ru-RU', {timeZone: 'Europe/Moscow', hour12: false}), true)
        .addField(`Версия :floppy_disk:`, bot.version, true)
        .addField(`Авторизация :key:`, client.user.tag, true)
        .setColor(bot.colors.main)));
    }, 16000);
});

client.on('guildCreate', (guild) => {
    const embed = new Discord.RichEmbed()
    .addField(':inbox_tray: New server information', `
Name: \`${guild.name}\`
ID: \`${guild.id}\`
Objects count: \`m: ${guild.memberCount}, r: ${guild.roles.size}, ch: ${guild.channels.size}, e: ${guild.emojis.size}\`
Owner: ${guild.owner.user} \`${guild.owner.user.tag}\`
Created at: \`${guild.createdAt.toLocaleString('ru-RU', {timeZone: 'Europe/Moscow', hour12: false}).replace(/\//g, '.')}\``)
    .setColor(bot.colors.green)
    .setThumbnail(guild.iconURL)
    .setFooter(`This is our ${client.guilds.size} server`)
    func.send(serverLeaveJoin, embed, client);
    let channels = guild.channels.filter(channel => channel.type === 'text' && channel.permissionsFor(guild.members.get(client.user.id)).has('SEND_MESSAGES'));
    if (channels.size > 0) channels.first().send(`Спасибо за приглашение меня на сервер, чтобы узнать как мной пользоваься и какие миниигры у меня есть, то напишите ${prefix}help. Больше помощи можно получить тут --> https://discord.gg/DxptT7N`);
});

client.on('guildDelete', (guild) => {
    const embed = new Discord.RichEmbed()
    .addField(':outbox_tray: OH NO WE LEFT THE SERVER!!!', `
Name: \`${guild.name}\`
ID: \`${guild.id}\`
Objects count: \`m: ${guild.memberCount}, r: ${guild.roles.size}, ch: ${guild.channels.size}, e: ${guild.emojis.size}\`
Owner: ${guild.owner.user} \`${guild.owner.user.tag}\`
Created at: \`${guild.createdAt.toLocaleString('ru-RU', {timeZone: 'Europe/Moscow', hour12: false}).replace(/\//g, '.')}\``)
    .setColor(bot.colors.red)
    .setThumbnail(guild.iconURL)
    .setFooter(`Bye bye...`)

    func.send(serverLeaveJoin, embed, client);
});

client.on('message', message => {
    if(message.channel.type !== `text` || message.author.bot) return;

    msgs++;

    if (!message.content.startsWith(bot.prefix)) return;

    commandsPerHour++;
    usedCommands++;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (message.author.id !== bot.creatorID) func.send(commandsUsing, func.embed(
        message.author.tag, message.author.avatarURL,
        `**${message.author.tag}** использовал команду **${bot.prefix}${command}** ${(args[0]? `\`${args.join(' ')}\`` : '')} на сервере **${message.guild.name}**`, bot.colors.green, client
    ), client);


 
    if (['rsp', 'кнб'].includes(command)) {
        let choice = args[0];

        if (['r', 'rock', 'камень', 'к'].includes(choice)) choice = client.emojis.get(bot.emojis.rock)
        else if (['p', 'paper', 'бумага', 'б'].includes(choice)) choice = ':page_with_curl:';
        else if (['s', 'scissors', 'ножницы', 'н'].includes(choice)) choice = ':scissors:';
        else return func.err('Вы указали неправильное значение', null, message)

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
                (isWin? bot.colors.green : bot.colors.red), client
            ));

        else message.channel.send(func.embed('Ничья!', message.author.avatarURL, `**Оба выбрали** ${choice}`, bot.colors.yellow, client));
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

        if (['e', 'easy', 'л', 'легко'].includes(args[0])) {seconds = 20; numberOfVariants = 3}
        else if (['h', 'hard', 'сл', 'сложно'].includes(args[0])) {seconds = 15; numberOfVariants = 12}
        else if (['i', 'impossible', 'н', 'невозможно'].includes(args[0])) {seconds = 20; numberOfVariants = 24}
        else {seconds = 10; numberOfVariants = 6};

        const definder = func.random(0, variants.length - 1);
        const numberInList = func.random(1, numberOfVariants);
        const variantsInMenu = [];
        const embed = new Discord.RichEmbed()
        .setAuthor(`Миниигра "${minigameName}"`, message.author.avatarURL,)
        .setDescription(`${message.member}, ${question} **"${variants[definder]}"**?`)
        .setColor(bot.colors.main)
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
                        bot.colors.red, client
                    ));
                }
                if (msg.content || !isNaN(parseInt(msg.content))) {
                    const number = parseInt(msg.content) - 1;

                    if (variantsInMenu[number] === answers[definder]) {
                        message.channel.send(func.embed(
                            'Ты выиграл!',
                            message.author.avatarURL,
                            `Правильный ответ **${number + 1})** ${answers[definder]}`,
                            bot.colors.green, client
                        ));
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

    if (['roll', 'dice', 'rand', 'random'].includes(command)) {
        let num1 = parseInt(args[0]) || 1;
        let num2 = parseInt(args[1]) || 6;

        if (num1 > num2) {
            let num3 = num2;
            num2 = num1;
            num1 = num3;
        }

        const randomNum = func.random(num1, num2);

        message.channel.send(func.embed(
            `Генератор случайных чисел (От ${num1} до ${num2})`,
            message.author.avatarURL,
            `Выпало число ${randomNum} :game_die:`,
            bot.colors.main, client
        ));
    };

    if (command === 'update') {
        const update = args[0] || bot.version;
        if (!bot.updatesList.includes(update)) return func.err(`Вы неправильно указали номер обновления. Существующие версии:\b${bot.updatesList.join(', ')}`, null, message);
        message.channel.send(func.embed(
            `Обновление ${update}`,
            message.author.avatarURL,
            `**•** ${bot.updates[update].join('\n\n**•** ')}`,
            bot.colors.main, client
        ));
    }
            
    if (['ttt', 'tic-tac-toe', 'крестики-нолики'].includes(command)) tictactoe.run(message, args, client);
    //if (['seabattle', 'sb'].includes(command)) seabattle.run(message, args, client);
    //if (['ch', 'chess'].includes(command) && message.author.id === bot.creatorID) chess.run(client, message, args);

    if (['donate', 'донат', 'пожертвование'].includes(command)) {
        const embed = new Discord.RichEmbed()
        .addField(':moneybag: Информация о донате', '**Если вам нравится данный бот, то вы можете поддержать автора, чтобы бот стал еще лучше! А вы получите __кучу плюшек__ на официальном сервере! :point_right: https://discord.gg/NvcAKdt**')
        .addField('Способы оплаты', '**Пока что, есть только Qiwi ¯\\_(ツ)_/¯ https://qiwi.me/andreybots**')
        .setColor(bot.colors.main);
        message.channel.send(embed);
    }

    if (['info', 'information', 'ифна', 'информация'].includes(command)) {
        const embed = new Discord.RichEmbed()
        .setAuthor('Инофрмация о боте', message.author.avatarURL)
        .addField('Базовая информация', `**Servers: \`${client.guilds.size}\`\nChannels: \`${client.channels.size}\`\nUsers: \`${client.users.size}\`\nRAM: \`${addCommas(Math.round(process.memoryUsage().rss / 1024 / 1024 ))}/1,024 MB\`**`)
        .addField('Наша команда', `**\`${client.users.get(bot.creatorID).tag}\` - Главный разработчик и дизайнер\n\`${client.users.get(bot.zzigerID).tag}\` - Помощник в написании кода\n\`${client.users.get(bot.artemCordId).tag}\` - Автор аватарки**`)
        .setTitle('Пригласить бота')
        .setURL(`https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=379904`)
        .setColor(bot.colors.main)
        message.channel.send(embed)
    }

    if (command === 'help') {
        let arr = [];
        const page = parseInt(args[0]) || 1;
        const cmdsCount = 5;
        const embed = new Discord.RichEmbed()
        .setColor(bot.colors.main)
        .setAuthor('Помощь', message.author.avatarURL || message.author.defaultAvatarURL)
        //.setFooter(`Страница ${page}/${Math.ceil(Object.keys(commands).length / cmdsCount)} | Для перехода на следующую страницу напишите ${bot.prefix}help ${page + 1}`);
        const desc = `**Для лучшего понимания работы бота советуем прочитать данный текст:\n
\`<...>\` - Обязательный параметр
\`[...]\` - Необязательный параметр
\`&\` - Оператор И
\`|\` - Оператор ИЛИ
\`n\` - Число\n
ВНИМАНИЕ! не включайте скобки, а также знаки \`|\` и \`&\` в написание команды, они изображены здесь только для того, чтобы использование команды понималось легче. Если вам все таки не понятно, как пользоваться той или иной командой, то напишите ${bot.prefix}cmd-help **\`<Название команды>\`\n\n`;

        for (let i in commands) {
            arr.push(`:white_medium_small_square: **${bot.prefix}${commands[i].name}`);
            for (let a in commands[i].args) if (commands[i].args) arr[arr.length - 1] += ` \`${commands[i].args[a]}\` `
            arr[arr.length - 1] += `** - ${commands[i].desc}`;
        }

        let content = arr/*.slice(1 + ((page - 1) * cmdsCount), (cmdsCount + 1) + ((page - 1) * cmdsCount))*/.join('\n');
        content += `\n\n**:moneybag: Нравится бот? Поддержите автора донатом и получите кучу плюшек на официальном сервере! https://qiwi.me/andreybots\n:link: Ссылка на официальный сервер бота, где можно получить больше помощи: https://discord.gg/NvcAKdt**`
        embed.setDescription(desc + content);
        message.channel.send(embed)
    };

    if (command === 'cmd-help') {
        if (['help', 'cmd-help'].includes(args[0])) return func.err('Ты ебобо?', null, message)
        let cmd
        for (let i in commands) if (commands[i].aliases.includes(args[0])) cmd = commands[i]
        if (!cmd) return func.err('Вы не указали команду', null, message);

        const embed = new Discord.RichEmbed()
        if (cmd.detailedDesc) embed.addField(`Информация о команде ${bot.prefix}${cmd.name}`, `**${cmd.detailedDesc}**`)
        embed.addField('Сокращения', `\`${bot.prefix}${cmd.aliases.join(`, ${bot.prefix}`)}\``)
        .setColor(bot.colors.main);
        message.channel.send(embed);
    }

    if (command === 'eval') {

        if (![bot.creatorID, '391592337685610496', '426338672342990850'].includes(message.author.id)) return func.err('Эта команда недоступна обычным пользователям', null, message);
        const code = args.join(" "); //Константа с ботом

        try {
            let output = eval(code); //Константа с эмуляцией кода

            if (output.length < 1950) message.author.send(`\`\`\`js\n${output}\n\`\`\``).then(() => {message.react("✅")}); //Отправка результатов симуляции
            else message.author.send(`${output}`, {split:"\n", code:"js"}); //Отправка результатов симуляции если их длина больше 1950-ти
        } catch (error) { message.author.send(`Анхэндлэд промайз риджекшн ворнинг \`\`\`js\n${error}\`\`\``).then(() => message.react("❎")) }; //Отправка ошибки
        
    }

    if (command === 'mass-say' && message.author.id !== bot.creatorID) {
        client.guilds.forEach(guild => {
            let channels = guild.channels.filter(channel => channel.type === 'text' && channel.permissionsFor(guild.members.get(client.user.id)).has('SEND_MESSAGES'));
            if (channels.size > 0) channels.first().send(args.join(' '));
        })
    }

    if (command === 'guilds' && message.author.id !== bot.creatorID) {
        const guildsCollection = client.guilds.sort((guild1, guild2) => { return guild2.memberCount-guild1.memberCount });
        let guilds = [];
        guildsCollection.forEach(guild => {
            guilds.push(`
            Это ${guild.name}. Информация о серере:
                Основатель: ${guild.owner.user.tag} (${guild.ownerID})
                Акроним и ID: ${guild.nameAcronym} | ${guild.id}
                Пользователи: ${guild.memberCount}
                Каналы: ${guild.channels.size}
                Роли: ${guild.roles.size}
                Создана: ${guild.createdAt.toString().slice(4, -33)}
                Иконка: ${guild.iconURL}
            `)
        })
        try { hastebinGen(guilds.join('\n========================================================\n\n'), 'txt').then(link => message.channel.send(`Мои севрера --> ${link}`)) }
        catch (err) { message.channel.send(`Сарян, ащипка)0))\`\`\`js\n${err}\n\`\`\``) };
    }
});

client.login(process.env.BOT_TOKEN);