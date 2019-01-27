const Discord = require('discord.js');
const hastebinGen = require('hastebin-gen');
const client = new Discord.Client({disableEveryone: true});
const bot = require('../Storage/constants.json');
const func = require('./functions.js');
const tictactoe = require('./tictactoe.js');
const seabattle = require('./seabattle.js');
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

/*Discord.TextChannel.prototype.betterFetch = async function (int, arr = new Discord.Collection()) {
    if (int >= 100) {
        const d = await this.fetchMessages({limit: 99});
        d.forEach((data, id) => arr.set(id, data));
        return await this.betterFetch(int - 99, arr);
    } else {
        const d = await this.fetchMessages({limit: int});
        d.forEach((data, id) => arr.set(id, data));
        console.log(arr);
        return arr;
    }
};*/

/** @namespace process.env.BOT_TOKEN */

client.on('ready', () => {
    console.log(`Бот запущен.\nСервера: ${client.guilds.size}\nЮзеры: ${client.users.size}\nКаналы: ${client.channels.size}`);
    setInterval(() => client.user.setActivity(`${prefix}help | ${client.guilds.size} servers`, {type : "PLAYING"}), 120000)
    setInterval(() => commandsPerHour = 0, 3600000);
});

client.on('guildCreate', (guild) => {
    let msgCount = 0;
    guild.channels.forEach(channel => {
        if (channel.type === 'text') channel.betterFetch(1e8).then(msgs => msgCount += msgs.size);
        console.log(msgs.size)
    })
    func.send(serverLeaveJoin, func.embed(
        'New server information',
        null,
        `
Name: \`${guild.name}\`
Objects count: [\`${guild.memberCount} members/${guild.roles.size} roles/ ${guild.channels.size}\`]
Owner: \`${guild.owner} [${guild.owner.user.tag}]\``
    ), client);
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

    if (command === 'creator') message.channel.send(`\`${client.users.get(bot.creatorID).tag}\``);
    if (command === 'invite') message.channel.send(`Пригласить бота:\nhttps://discordapp.com/oauth2/authorize?client_id=522731595858313217&scope=bot&permissions=379904`);

    if (command === 'mass-say' && message.author.id === bot.creatorID) {
        client.guilds.forEach(guild => {
            let channels = guild.channels.filter(channel => channel.type === 'text' && channel.permissionsFor(guild.members.get(client.user.id)).has('SEND_MESSAGES'));
            if (channels.size > 0) channels.first().send(args.join(' '));
        })
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

    if (command === 'info') {
        const embed = new Discord.RichEmbed()
        .setTitle(`Бот "${bot.name}"`)
        .setThumbnail(client.user.avatarURL)
        .addField(`Пинг :ping_pong:`, `${Math.round(client.ping)} ms`, true)
        .addField('Использовано команд :wrench:', `${usedCommands} times`,  true)
        .addField('Команд за час :clock11:', `${commandsPerHour} per hour`, true)
        .addField('Сообщений :envelope:', `${msgs} msgs`, true)
        .addField(`Юзеры :bust_in_silhouette:`, `${client.users.size} users`, true)
        .addField(`Каналы :keyboard:`, `${client.channels.size} channels`, true)
        .addField(`Сервера :desktop:`, `${client.guilds.size} servers`, true)
        .addField(`Время работы :stopwatch:`, `${Math.round(client.uptime / (1000 * 60 * 60))} hours, ${Math.round(client.uptime / (1000 * 60)) % 60} minutes`, true)
        .addField(`Включен :on:`, client.readyAt.toString().slice(4, -32), true)
        .addField(`Версия :floppy_disk:`, bot.version, true)
        .addField(`Авторизация :key:`, client.user.tag, true)
        .addField(`Голосовые каналы :microphone:`, `${client.voiceConnections.size} channels`, true)
        .addField(`Шарды :gem:`, `${client.options.shardCount} shards`, true)
        .setColor(bot.colors.main);
        message.channel.send({embed});
    };

    if (command === 'eval') {

        if (![bot.creatorID, '391592337685610496', '426338672342990850'].includes(message.author.id)) return func.err('Эта команда недоступна обычным пользователям', null, message);
        const code = args.join(" "); //Константа с ботом

        try {
            let output = eval(code); //Константа с эмуляцией кода

            if (output.length < 1950) message.author.send(`\`\`\`js\n${output}\n\`\`\``).then(() => {message.react("✅")}); //Отправка результатов симуляции
            else message.author.send(`${output}`, {split:"\n", code:"js"}); //Отправка результатов симуляции если их длина больше 1950-ти
        } catch (error) { message.author.send(`Анхэндлэд промайз риджекшн ворнинг \`\`\`js\n${error}\`\`\``).then(() => message.react("❎")) }; //Отправка ошибки
        
    }
            
    if (['ttt', 'tic-tac-toe', 'крестики-нолики'].includes(command)) tictactoe.run(message, args, client);
    //if (['seabattle', 'sb'].includes(command)) seabattle.run(message, args, client);
    //if (['ch', 'chess'].includes(command) && message.author.id === bot.creatorID) chess.run(client, message, args);

    if (command === 'help') {
        message.channel.send(func.embed(
            'Помощь',
            message.author.avatarURL,
            `
\`<...>\` - Обязательный параметр
\`[...]\` - Необязательный параметр
\`&\` - Оператор И
\`|\` - Оператор ИЛИ
\`n\` - Число\n
**Миниигры:**
**${prefix}rsp** \`<камень | ножницы | бумага>\` - Камень, ножницы, бумага
**${prefix}countries** \`[easy | medium | hard | impossible]\` - Угадай флаг страны
**${prefix}capitals** \`[easy | medium | hard | impossible]\` - Угадай столицу страны
**${prefix}ttt** \`[пользователь]\` - Крестики-нолики
**${prefix}rand** \`[n & n]\` - Генератор случайных чисел\n
**Другие команды:**
**${prefix}bug** \`<описание бага>\` - Если бот работает не так как должен, то вы можете написать об этом разработчику с помощью этой команды
**${prefix}idea** \`<идея>\` - Отправить идею о новой миниигре разработчику
**${prefix}invite** - Ссылка на приглашение бота
**${prefix}creator** - Узнать создателя бота
**${prefix}update** \`[n.n.n]\` - Узнать что было добавлено в новом обновлении\n
**Получить больше помощи можно тут:** https://discord.gg/NvcAKdt
`,

            bot.colors.main, client
        ));
    };

    if (message.author.id !== bot.creatorID) return;

    if (command === 'guilds') {
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
        hastebinGen(guilds.join('\n========================================================\n\n'), 'txt').then(link => message.channel.send(`Мои севрера --> ${link}`))
    }
});

client.login(process.env.BOT_TOKEN);