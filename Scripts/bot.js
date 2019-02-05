/*
* Никто не запрещает брать Вам брать или читать куски этого кода для обучения
* Но не желательно его форкать, чтобы сделать копию бота или для подобных причин
* Если Вы хотите поддержать разработку, то можете зайти на наш дискорд сервер https://discord.gg/NvcAKdt или кинуть денежку https://qiwi.me/andreybots
*/

const Discord = require('discord.js');
const hastebinGen = require('hastebin-gen');
const jimp = require('jimp');
const client = new Discord.Client({disableEveryone: true});
const bot = require('../Storage/constants.js');
const func = require('./functions.js');
const tictactoe = require('./tictactoe.js');
//const seabattle = require('./seabattle.js');
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
    console.log(`${client.user.tag} запущен.\nСервера: ${client.guilds.size}\nЮзеры: ${client.users.size}\nКаналы: ${client.channels.size}`);
    setInterval(() => client.user.setActivity(`${prefix}help | ${client.guilds.size} servers`, {type : "PLAYING"}), 12e4)
    setInterval(() => commandsPerHour = 0, 36e5);

    if (false) setInterval(() => {
        client.channels.get(bot.channels.stats).fetchMessage('539749513246670861').then(msg => msg.edit(new Discord.RichEmbed()
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
    }, 6e4);
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
    func.send(bot.channels.serverLeaveJoin, embed, client);
    let channels = guild.channels.filter(channel => channel.type === 'text' && channel.permissionsFor(guild.members.get(client.user.id)).has('SEND_MESSAGES'));
    if (channels.size > 0) channels.first().send(`Спасибо за приглашение меня на сервер, чтобы узнать как мной пользоваься и какие миниигры у меня есть, то напишите ${prefix}help. Больше помощи можно получить тут --> https://discord.gg/DxptT7N`);
});

client.on('guildDelete', (guild) => {
    const embed = new Discord.RichEmbed()
    .addField(':outbox_tray: OH NO WE LOST THE SERVER!!!', `
Name: \`${guild.name}\`
ID: \`${guild.id}\`
Objects count: \`m: ${guild.memberCount}, r: ${guild.roles.size}, ch: ${guild.channels.size}, e: ${guild.emojis.size}\`
Owner: ${guild.owner.user} \`${guild.owner.user.tag}\`
Created at: \`${guild.createdAt.toLocaleString('ru-RU', {timeZone: 'Europe/Moscow', hour12: false}).replace(/\//g, '.')}\``)
    .setColor(bot.colors.red)
    .setThumbnail(guild.iconURL)
    .setFooter(`Bye bye...`)

    func.send(bot.channels.serverLeaveJoin, embed, client);
});

client.on('message', message => {
    if (!message.guild || message.author.bot) return;
    msgs++;

    if (!message.content.startsWith(bot.prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    const authorAvatar = message.author.avatarURL || message.author.defaultAvatarURL;

    for (let i in commands) if (commands[i].aliases.includes(command)) {
        commandsPerHour++;
        usedCommands++;
        
        if (!commands[i].used) commands[i].used = 0;
        commands[i].used++;
        jimp.read(authorAvatar).then(avatar => {
            avatar.resize(50, 50)
            jimp.read(bot.images.circle).then(mask => {
                avatar.mask(mask, 0, 0)
                jimp.read(bot.images.bg).then(bg => {
                    bg.composite(avatar, 10, 15);
                    jimp.loadFont(jimp.FONT_SANS_16_WHITE).then(font => {
                        bg.print(font, 80, 20, message.author.username);
                        let user;
                        if (args.join(' ').match(/<!?@(\d+)?>/)) user = `@${client.users.get(args.join(' ').match(/<!?@(\d+)?>/)[1]).tag}`
                        bg.print(font, 80, 43, message.content.replace(/<!?@(\d+)?>/, user))
                        bg.getBuffer(jimp.MIME_PNG, (err, buffer) => {
                            const screenshot = new Discord.Attachment(buffer, 'screenshot.png');
                            const embed = new Discord.RichEmbed()
                            .setAuthor(message.author.tag, authorAvatar)
                            .setDescription(`\`${message.author.tag}\` использовал команду **${bot.prefix}${command}** ${(args[0]? `\`${args.join(' ').replace(/<!?@(\d+)?>/, user)}\`` : '')} на сервере \`${message.guild.name}\``)
                            .attachFile(screenshot)
                            .setColor(bot.colors.green);
                            func.send(bot.channels.commandsUsing, embed, client);
                        })
                    })
                })
            })
        })
    }
 
    if (commands.rsp.aliases.includes(command)) {
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

    if (commands.countries.aliases.includes(command) || commands.capitals.aliases.includes(command)) {
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

    if (commands.bug.aliases.includes(command) || commands.idea.aliases.includes(command)) {
        let err = 'Не указан баг';
        if (commands.idea.aliases.includes(command)) err = 'Не указана идея'

        const id = func.random(1e4, 1e5);

        if (!args[0]) return func.err(err, null, message)
        const bug = args.join(' ');

        const embed = new Discord.RichEmbed()
        .setAuthor('Отправлено', authorAvatar)
        .setColor(bot.colors.main)
        .setDescription(`Репорт успешно отправлен. Его ID \`${id}\`, запомните его!`);
        message.channel.send(embed);

        func.send(bot.channels.bugsIdeas, `Репорт от ${message.author} \`${message.author.tag}\` (Report ID: \`${id}\`):\n**${bug}**`, client);
    }

    if (commands.rand.aliases.includes(command)) {
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

    if (commands.update.aliases.includes(command)) {
        const update = args[0] || bot.version;
        if (!bot.updatesList.includes(update)) return func.err(`Вы неправильно указали номер обновления. Существующие версии:\b${bot.updatesList.join(', ')}`, null, message);
        message.channel.send(func.embed(
            `Обновление ${update}`,
            message.author.avatarURL,
            `**•** ${bot.updates[update].join('\n\n**•** ')}`,
            bot.colors.main, client
        ));
    }
            
    if (commands.ttt.aliases.includes(command)) tictactoe.run(message, args, client);
    //if (['seabattle', 'sb'].includes(command)) seabattle.run(message, args, client);
    //if (['ch', 'chess'].includes(command) && message.author.id === bot.creatorID) chess.run(client, message, args);

    if (commands.donate.aliases.includes(command)) {
        const embed = new Discord.RichEmbed()
        .addField(':moneybag: Информация о донате', '**Если вам нравится данный бот, то вы можете поддержать автора, чтобы бот стал еще лучше! А вы получите __кучу плюшек__ на официальном сервере! :point_right: https://discord.gg/NvcAKdt**')
        .addField('Способы оплаты', '**Пока что, есть только Qiwi ¯\\_(ツ)_/¯ https://qiwi.me/andreybots**')
        .setColor(bot.colors.main);
        message.channel.send(embed);
    }

    if (commands.info.aliases.includes(command)) {
        const embed = new Discord.RichEmbed()
        .setAuthor('Инофрмация о боте', message.author.avatarURL)
        .addField('Базовая информация', `**Servers: \`${addCommas(client.guilds.size)}\`\nChannels: \`${addCommas(client.channels.size)}\`\nUsers: \`${addCommas(client.users.size)}\`\nRAM: \`${addCommas(Math.round(process.memoryUsage().rss / 1024 / 1024 ))}/1,024 MB\`**`)
        .addField('Наша команда', `**${client.users.get(bot.creatorID)} \`${client.users.get(bot.creatorID).tag}\` - Главный разработчик и дизайнер\n${client.users.get(bot.zzigerID)} \`${client.users.get(bot.zzigerID).tag}\` - Помощник в написании кода\n${client.users.get(bot.artemCordId)} \`${client.users.get(bot.artemCordId).tag}\` - Автор аватарки**`)
        .setTitle('Пригласить бота')
        .setURL(`https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=379904`)
        .setColor(bot.colors.main)
        message.channel.send(embed)
    }

    if (commands.used.aliases.includes(command)) {
        let arr = [];
        for (let i in commands) if (commands[i].used) arr.push(commands[i]);
        if (arr.length < 1) return message.reply('Кажется, никто еще не использовал команды ¯\\_(ツ)_/¯. Поздравляем, Вы стали первым')
        arr.sort((cmd1, cmd2) => {return cmd2.used - cmd1.used});
        for (let i in arr) arr[i] = (`${bot.prefix}${arr[i].name} - \`${addCommas(arr[i].used)}\``);

        const embed = new Discord.RichEmbed()
        .setAuthor('Отчет о командах', authorAvatar)
        .setDescription(arr.join('\n'))
        .setColor(bot.colors.main);
        message.channel.send(embed);
    }
 
    if (commands.help.aliases.includes(command)) {
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
            if (commands[i].disableHelp) continue;
            arr.push(`:white_medium_small_square: **${bot.prefix}${commands[i].name}`);
            for (let a in commands[i].args) if (commands[i].args) arr[arr.length - 1] += ` \`${commands[i].args[a]}\` `
            arr[arr.length - 1] += `** - ${commands[i].desc}`;
        }

        let content = arr/*.slice(1 + ((page - 1) * cmdsCount), (cmdsCount + 1) + ((page - 1) * cmdsCount))*/.join('\n');
        content += `\n\n**:moneybag: Нравится бот? Поддержите автора донатом и получите кучу плюшек на официальном сервере! https://qiwi.me/andreybots\n:link: Ссылка на официальный сервер бота, где можно получить больше помощи: https://discord.gg/NvcAKdt**`
        embed.setDescription(desc + content);
        message.channel.send(embed)
    };

    if (commands.cmd_help.aliases.includes(command)) {
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
        const code = args.join(" "); //Константа с кодом

        try {
            let output = eval(code); //Константа с эмуляцией кода

            if (output.length < 1950) message.author.send(`\`\`\`js\n${output}\n\`\`\``).then(() => {message.react("✅")}); //Отправка результатов симуляции
            else message.author.send(`${output}`, {split:"\n", code:"js"}); //Отправка результатов симуляции если их длина больше 1950-ти
        } catch (error) { message.author.send(`Анхэндлэд промайз риджекшн ворнинг \`\`\`js\n${error}\`\`\``).then(() => message.react("❎")) }; //Отправка ошибки
        
    }

    if (command === 'report-answer' && message.author.id === bot.creatorID) {
        try {
            const id = args[0];
            const user = client.users.get(args[1]);
            const answer = args.slice(2).join(' ');
            user.send(`**Ваш ответ на репорт под ID \`${id}\`**:\n${answer}`)
        } catch (err) {
            message.channel.send(`//Сарян, ащипка))0)\n${err}`, {code: 'js'});
        }
    }

    if (command === 'mass-say' && message.author.id === bot.creatorID) {
        client.guilds.forEach(guild => {
            let channels = guild.channels.filter(channel => channel.type === 'text' && channel.permissionsFor(guild.members.get(client.user.id)).has('SEND_MESSAGES'));
            if (channels.size > 0) channels.first().send(args.join(' '));
        })
    }

    if (command === 'guilds' && message.author.id === bot.creatorID) {
        const guildsCollection = client.guilds.sort((guild1, guild2) => { return guild2.memberCount-guild1.memberCount });
        let guilds = [];
        guildsCollection.forEach(guild => {
            guilds.push(`
            Server Inforamtion:
                Name: ${guild.name}
                ID: ${guild.id}
                Objects count: m: ${guild.memberCount}, r: ${guild.roles.size}, ch: ${guild.channels.size}, e: ${guild.emojis.size}
                Owner: ${guild.owner.user.id} ${guild.owner.user.tag}
                Created at: ${guild.createdAt.toLocaleString('ru-RU', {timeZone: 'Europe/Moscow', hour12: false}).replace(/\//g, '-')}
            `)
        })
        try { hastebinGen(guilds.join('\n========================================================\n\n'), 'txt').then(link => message.channel.send(`Мои севрера --> ${link}`)) }
        catch (err) { message.channel.send(`Сарян, ащипка)0))\`\`\`js\n${err}\n\`\`\``) };
    }
});

client.login(process.env.BOT_TOKEN);