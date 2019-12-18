//Подключаем библиотеки
const Discord = require('discord.js');
const fs = require('fs');
const hastebin = require('hastebin-gen');
const jimp = require('jimp');
const mongoose = require('mongoose');

//Переменные среды
/** @namespace process.env.BOT_TOKEN */
/** @namespace process.env.DB_LINK */

mongoose.connect('mongodb+srv://andrey:chillik@minigamesbot-hoz75.mongodb.net/test?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true}, err => {
  if (!err) console.log('Successfully connected to database');
  else console.log(err);
});

//Класс бота
class Bot {
    //Конструктор
    constructor() {
        //Делаем this класса Bot более глобальным
        let _this = this;
        //Подключаем боту библиотеки
        this.Discord = Discord;
        this.fs = fs;
        this.hastebin = hastebin;
        this.jimp = jimp;
        this.mongoose = mongoose;
        //Создаем клиент бота
        this.client = new Discord.Client({disableEveryone: true});
        //Регистрируем бота
        this.client.login('NTIyNzMxNTk1ODU4MzEzMjE3.XblIPA.uuf6pen5Q9mhuY_pxZsH9M6Vv9s').then(() => delete process.env.BOT_TOKEN);
        this.userSchema = new mongoose.Schema({
          id: String,
          coins: Number,
          raiting: Number
        });

        this.userData = mongoose.model('userData', _this.userSchema);
        //Имя и версия бота
        this.unstable = false;
        this.name = _this.unstable? 'Minigames Bot Unstable': 'Minigames Bot';
        this.prefixes = _this.unstable? ['m.'] : ['m!', 'm1'];

        //Объект с командами
        this.commands = [];

        this.embed = new Discord.RichEmbed().setFooter(`<> with ❤ by ANDREY#2623`);
        //Функция, возвращающая объект embed, стилизованный под ошибку
        this.embedErr = (message) => {
            const embed = _this.embed
            .setAuthor('Error', message.author.avatarURL)
            .setColor('ff5555')
            return embed;
        };

        this.err = (message, reason) => message.channel.send(_this.embedErr(message).setDescription(`Reason: **${reason}**`));

        this.invalidArgs = (message, cmd) => {
            const embed = _this.embedErr(message).setDescription(`Invalid arguments were provided\n
            Usage: **${cmd.name} \`${cmd.args}\`**
            Example: **${cmd.name} ${cmd.example}**`);
            message.channel.send(embed);
        }

        //Функция, возвращающая объект Emoji
        this.emoji = (id) => _this.client.emojis.get(id) || '';

        //Функция для генерации случайного числа в определенном диапазоне
        this.random = (min, max) => Math.floor(Math.random() * (max + 1 - min)) + min;

        //Функция, отправляющая сообщение в указанный канал
        this.sendIn = (id, msg) => _this.client.channels.get(id).send(msg);

        this.addCommas = (int) => int.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

        this.toMoscowTime = (time) => time.toLocaleString('ru-RU', {timeZone: 'Europe/Moscow', hour12: false}).replace(/\/|\./g, '-');

        this.multipleReact = async (message, arr) => {
          if (0 in arr) {
            await message.react(arr.shift()).then(() => _this.multipleReact(message, arr).catch());
          };
        };

        //Событие запуска клиента
        _this.client.on('ready', () => {
            _this.prefixes.push(`<@${this.client.user.id}>`);
            _this.prefix = _this.prefixes[0];
            _this.creatorTag = _this.client.users.get(_this.creatorID).tag;
            setInterval(() => _this.client.user.setActivity(`${_this.prefixes[0]}help | ${_this.client.guilds.size} servers`, {type: 'PLAYING'}), 12e4);
            console.log(`${this.client.user.tag} is Logged successfully.\nGuilds: ${this.client.guilds.size}\nUsers: ${this.client.users.size}\nChannels: ${this.client.channels.size}`);
            fs.readdir('./Commands', (err, cmds) => {
                if (err) throw err;
                cmds.forEach(command => {
                    const cmd = require(`./Commands/${command}`);
                    this.commands.push({
                        name: cmd.info.name,
                        regex: cmd.info.regex.toString().slice(1, -1),
                        args: cmd.info.args,
                        desc: cmd.info.desc,
                        run: cmd.run,
                        private: cmd.info.private || false,
                        hidden: cmd.info.hidden || false,
                    });
                });
            });
        });

        _this.onMessage = async (message) => {
            _this.msgPrefix = _this.prefixes.find(p => message.content.toLowerCase().startsWith(p));

            if (!message.guild || message.author.bot) return;
            _this.mentionMember = message.mentions.members.find(m => m.id !== _this.client.user.id);
            //something
            if (!_this.msgPrefix) return;
            if (!await _this.userData.findOne({id: message.author.id})) await _this.userData.create({
              id: message.author.id,
              coins: 0,
              raiting: 0
            });

            const args = message.content.slice(_this.msgPrefix.length).trim().split(/ +/g);
            const command = args.shift().toLowerCase();
            const mentionMember = message.mentions.members.find(m => m.id !== _this.client.user.id);

            const cmd = _this.commands.find(c => command.match(new RegExp(c.regex)));
            if (cmd && (!cmd.private || message.author.id === _this.creatorID)) {
                await cmd.run(message, args, mentionMember);
                const mentionReg = /<@!?(\d+)?>/g;
                const mentions = message.content.match(mentionReg);
                let content = message.content;
                if (mentions) mentions.forEach(m => content = content.replace(m, `@${_this.client.users.get(m.match(/!/)? m.slice(3, -1) : m.slice(2, -1)).tag}`));
                const embed = new Discord.RichEmbed()
                .setAuthor(`${message.author.tag} (${message.author.id})`, message.guild.iconURL)
                .setDescription(`<@${message.author.id}> used command **"${content}"** on the server \`${message.guild.name}\``)
                .setThumbnail(message.author.avatarURL || message.author.defaultAvatarURL)
                .setColor(_this.colors.green)
                .setTimestamp();
                if (!_this.unstable) _this.sendIn(_this.channels.commandsUsing, embed);
            };

            if (command === 'help') {
                const page = parseInt(args[0]) || 1;
                const helpCommands = _this.commands.filter(c => !c.private && !c.hidden)
                const arr = helpCommands.map(cmd => `◽ **${_this.prefix + cmd.name} ${cmd.args?`\`${cmd.args}\``:''} -** ${cmd.desc}`);
                const embed = new Discord.RichEmbed()
                .setAuthor('Help', message.author.avatarURL)
                .setDescription(`**\`<...>\` - Required parameter.\n\`[...]\` - Optional parameter.\n\`&\` - AND operator.\n\`|\` - OR operator.\n\`n\` - Number.**\n\n${arr.join('\n')}`)
                .setColor(_this.colors.main)
                .addField('More info', `**:link: Official server: ${_this.serverLink}\n:tools: Fork me on GitHub https://github.com/Andrey0189/minigames-bot\n:kiwi: Qiwi - https://qiwi.me/andreybots\n:moneybag: PayPal - __alekseyvarnavskiy84@gmail.com__\n◽ Type ${_this.prefixes[0]}donate for more info**`)
                .setFooter(`<> with ❤ by ${_this.creatorTag}`)
                message.channel.send(embed);
            }
        };

        _this.client.on('message', async msg => _this.onMessage(msg));
        _this.client.on('messageUpdate', async (oldMsg, msg) => _this.onMessage(msg));

        _this.client.on('guildCreate', (guild) => {
            const embed = new Discord.RichEmbed()
            .addField(':inbox_tray: New server information', `
        Name: \`${guild.name}\`
        ID: \`${guild.id}\`
        Objects count: \`m: ${guild.memberCount}, r: ${guild.roles.size}, ch: ${guild.channels.size}, e: ${guild.emojis.size}\`
        Owner: ${guild.owner.user} \`${guild.owner.user.tag}\`
        Created at: \`${_this.toMoscowTime(guild.createdAt)}\``)
            .setColor(_this.colors.green)
            .setThumbnail(guild.iconURL)
            .setFooter(`Now we have ${_this.client.guilds.size} servers`)
            if (!_this.unstable) _this.sendIn(_this.channels.serverLeaveJoin, embed);
            let channels = guild.channels.filter(channel => channel.type === 'text' && channel.permissionsFor(guild.me).has('SEND_MESSAGES'));
            if (channels.size > 0) channels.first().send(`Thank you for ading me! Type ${this.prefixes[0]}help for help! ${_this.serverLink}`);
        });

        this.client.on('guildDelete', (guild) => {
            const embed = new Discord.RichEmbed()
            .addField(':outbox_tray: Server was removed', `
        Name: \`${guild.name}\`
        ID: \`${guild.id}\`
        Objects count: \`m: ${guild.memberCount}, r: ${guild.roles.size}, ch: ${guild.channels.size}, e: ${guild.emojis.size}\`
        Owner: ${guild.owner.user} \`${guild.owner.user.tag}\`
        Created at: \`${_this.toMoscowTime(guild.createdAt)}\``)
            .setColor(_this.colors.red)
            .setThumbnail(guild.iconURL)
            .setFooter(`Now we have ${_this.client.guilds.size} servers`)
            if (!_this.unstable)  _this.sendIn(_this.channels.serverLeaveJoin, embed);
        });


        /*
        * Costants
        */

        this.serverLink = 'https://discord.gg/6XBBMDU';

        this.colors = {
            discord: '36393F',
            green: '55ff55',
            red: 'ff5555',
            yellow: 'ffff55',
            main: 'af00ff'
        };

        this.chooseVariantsCmd = (message, variants, answers, minigameName, difficulty, question, score, seconds, placingAlgoritm) => {
            let numberOfVariants = 6;
            if (difficulty.match(/eas[yi]|ле[гх]ко/i)) {
              seconds *= 1.5;
              numberOfVariants = 3;
              score *= 0.8;
            } else if (difficulty.match(/har[dt]|сло[жш]но|хар[дт]/i)) {
              seconds *= 0.8;
              numberOfVariants = 12;
              score *= 1.2;
            };

            async function youLose (phrase) {
              const uData = await _this.userData.findOne({id: message.author.id});
              uData.raiting -= 5;
              await uData.save();
              const embed = new _this.Discord.RichEmbed()
              .setAuthor(phrase, message.author.avatarURL)
              .setDescription(`**The correct answer is \`${numberInList})\` ${answers[definder]}\nYour score is \`${uData.raiting} (-5)\` now**`)
              .setColor(_this.colors.red)
              await message.channel.send(embed);
            } async function youWon () {
              const uData = await _this.userData.findOne({id: message.author.id});
              uData.raiting = uData.raiting + score;
              await uData.save();
              const embed = new _this.Discord.RichEmbed()
              .setAuthor('You won!', message.author.avatarURL)
              .setDescription(`**The correct answer is \`${numberInList})\` ${answers[definder]}\nYour score is \`${uData.raiting} (+${score})\` now**`)
              .setColor(_this.colors.green)
              await message.channel.send(embed);
            };

            const definder = _this.random(0, variants.length - 1);
            const numberInList = _this.random(1, numberOfVariants);
            const variantsInMenu = [];
            const embed = new Discord.RichEmbed()
            .setAuthor(`Minigame "${minigameName}"`, message.author.avatarURL,)
            .setDescription(`${message.member}, ${question(variants[definder])}?`)
            .setColor(_this.colors.main)
            .setFooter(`Write the correct answer down bellow (You have only ${seconds} seconds!)`)
            .setTimestamp();
            for (let i = 1; i < numberOfVariants + 1; i++) {
                let answer = placingAlgoritm(answers, definder, numberOfVariants);
                if (i === numberInList) answer = answers[definder];
                else variantsInMenu.forEach(variantInMenu => {
                    while ([variantInMenu, answers[definder]].includes(answer)) answer = placingAlgoritm(answers, definder, numberOfVariants);
                })
                variantsInMenu.push(answer);
                embed.addField(`${i})`, `**${answer}**`, true);
            };
            message.channel.send({embed}).then(() => {
                const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: seconds * 1e3 + 1e3 });
                const stopTimer = setTimeout(() => {
                  return youLose('Time is up! You lose >:D')
                }, seconds * 1e3 + 1e3);
                collector.on('collect', msg => {
                    clearTimeout(stopTimer);
                    collector.stop();
                    if (msg.content || !isNaN(parseInt(msg.content))) {
                        const number = parseInt(msg.content) - 1;
                        if (variantsInMenu[number] === answers[definder]) youWon();
                        else youLose('You lose >:D');
                    } else youLose('You chose an invalid number :/');
                })
            });
        }

        this.creatorID = '242975403512168449';
        this.helperID = '421030089732653057';
        this.avatarCreatorID = '453531199894323201';
        this.evalWhitelist = [this.creatorID, this.helperID];

        this.channels = {
            commandsUsing: '648114944486801408',
            serverLeaveJoin: '648114960777347087',
            reports: '648114992595599381',
        };

        this.emojis = {
            yoba: '522739254825058304',
            rock: '522738393566937089',
            typing: '526365694183342087',

            whitePawn: '527399844093100042',
            whiteHourse: '527399872521961482',
            whiteEleph: '527399891962691584',
            whiteLadya: '527399926838067200',
            whiteFerz: '527399969469235200',
            whiteKing: '527400008144650280',

            blackPawn: '527400035776856065',
            blackHourse: '527400068345626625',
            blackEleph: '527400077363511296',
            blackLadya: '527400087299817484',
            blackFerz: '527400003105107828',
            blackKing: '527400109890207755'
        };

        this.images = {
            circle: 'https://cdn.discordapp.com/attachments/496233900071321602/559780092964765697/SPOILER_krug.png',
            bg: 'https://cdn.discordapp.com/attachments/496233900071321602/559779189142716464/unknown.png',

            ttt: {
                field: 'https://cdn.discordapp.com/attachments/524159437464797184/526470580115996672/tttField.png',
                cross: 'https://cdn.discordapp.com/attachments/524159437464797184/526470512310878208/cross.png',
                circle: 'https://cdn.discordapp.com/attachments/524159437464797184/526470469092769793/circle.png'
            },

            sb: {
                field: 'https://cdn.discordapp.com/attachments/524159437464797184/526470930721931265/seabattleField.png',
                ship: 'https://cdn.discordapp.com/attachments/524159437464797184/526470967237672960/ship.png',
                cross: 'https://cdn.discordapp.com/attachments/524159437464797184/526471033104891905/redCross.png',
                dot: 'https://cdn.discordapp.com/attachments/524159437464797184/526471615387795466/dot.png',
                blast: 'https://cdn.discordapp.com/attachments/524159437464797184/526493484543246348/blast.png',
            },

            chess: {
                field: 'https://cdn.discordapp.com/attachments/524159437464797184/527395245386629121/chessField.png',
                blackSquare: 'https://cdn.discordapp.com/attachments/524159437464797184/527417268842397716/blackSquare.png',
                whiteSquare: 'https://cdn.discordapp.com/attachments/524159437464797184/527417312878395410/whiteSquare.png',
                greenSquare: 'https://cdn.discordapp.com/attachments/636186792353071114/640145858125365258/1572692874060_photo-resizer.ru.png',
                blackPawn: 'https://cdn.discordapp.com/attachments/524159437464797184/527131436382158879/blackPawn.png',
                blackHourse: 'https://cdn.discordapp.com/attachments/524159437464797184/527131380858224641/blackHourse.png',
                blackEleph: 'https://cdn.discordapp.com/attachments/524159437464797184/527131309282295809/blackEleph.png',
                blackLadya: 'https://cdn.discordapp.com/attachments/524159437464797184/527131421605756941/blackLadya.png',
                blackFerz: 'https://cdn.discordapp.com/attachments/524159437464797184/527131366618300416/blackFerz.png',
                blackKing: 'https://cdn.discordapp.com/attachments/524159437464797184/527131405055033354/blackKing.png',
                whitePawn: 'https://cdn.discordapp.com/attachments/524159437464797184/527131598462779393/whitePawn.png',
                whiteHourse: 'https://cdn.discordapp.com/attachments/524159437464797184/527131534898233344/whiteHourse.png',
                whiteEleph: 'https://cdn.discordapp.com/attachments/524159437464797184/527131491059236864/whiteEleph.png',
                whiteLadya: 'https://cdn.discordapp.com/attachments/524159437464797184/527131578598424607/whiteLadya.png',
                whiteFerz: 'https://cdn.discordapp.com/attachments/524159437464797184/527131508947943434/whiteFerz.png',
                whiteKing: 'https://cdn.discordapp.com/attachments/524159437464797184/527131558205849601/whiteKing.png'
            }
        };

        this.minigames = {
            countries: ['Zimbabwe', 'Croatia', 'Latvia', 'Kazakhstan', 'Russia', 'Greece',
                'Denmark', 'Uganda', 'Finland', 'Belarus', 'Romania', 'Albania', 'Switzerland',
                'Monaco', 'Poland', 'Italy', 'America', 'Britain', 'Portugal', 'Turkey',
                'Egypt', 'India', 'Australia', 'New Zealand', 'Singapore', 'Malaysia', 'Pakistan',
                'Uzbekistan', 'China', 'Ukraine', 'Germany', 'France', 'Japan', 'Brasil',
                'Bangladesh', 'Austria', 'Hungary', 'Nepal', 'Indonesia', 'Uruguay', 'Paraguay',
                'Argentina', 'Chile', 'Cuba', 'Peru', 'Syria', 'Iraq', 'Iran',
                'Czech Republic',
            ],

            flags: ['zw', 'hr', 'lv', 'kz', 'ru', 'gr',
                'dk', 'ug', 'fi', 'by', 'ro', 'al', 'ch',
                'mc', 'pl', 'it', 'us', 'gb', 'pt', 'tr',
                'eg', 'in', 'au', 'nz', 'sg', 'my', 'pk',
                'uz', 'cn', 'ua', 'de', 'fr', 'jp', 'br',
                'bd', 'at', 'hu', 'np', 'my', 'uy', 'py',
                'ar', 'cl', 'cu', 'pf', 'sy', 'iq', 'ir',
                'cz',
            ],

            capitals: ['Harare', 'Zagreb', 'Riga' , 'Astana', 'Moscow', 'Athens',
                'Copenhagen', 'Kampala', 'Helsinki', 'Minsk', 'Bucharest', 'Tirana', 'Bern',
                'Monaco', 'Warsaw', 'Rome', 'Washington', 'London', 'Lisbon', 'Ankara',
                'Cairo', 'New Delhi', 'Canberra', 'Wellington', 'Singapore', 'Kuala Lumpur', 'Islamabad',
                'Tashkent', 'Beijing', 'Kiev', 'Berlin', 'Paris', 'Tokio', 'Brasília',
                'Dhaka', 'Vienna', 'Budapest', 'Kathmandu', 'Jakarta', 'Montevideo', 'Asunción',
                'Buenos Aires', 'Santiago', 'Havana', 'Lima', 'Damascus', 'Baghdad', 'Tehran',
                'Prague',
            ],

            events: ['did the Roman Empire collapse', 'did The Soviet Union collapse', 'was Leonardo Da Vinci born',
            'did William the Conqueror die', 'did the First World War end', 'was Napoleon Bonaparte born',
            'did the Pax Romana end', 'did Oliver Cromwell become Lord Protector', 'did the St. Petersberg was founded',
            'did the New York City was founded', 'did the London (Londinium) was founded', 'was Aristotle born',
            'did Gaius Julius Caesar die', 'did the last Third Punic War end', 'did Rome was founded',
            'was Cleopatra VII Philopator born', 'did Trojan War started', 'did Justinian I die',
            'was the Taj Mahal completed', 'was The Last Supper (Leonardo) completed'],

            years: [476, 1991, 1452,
            1087, 1918, 1769,
            180, 1653, 1703,
            1624, 47, '384 BC',
            '44 BC', '146 BC', '753 BC',
            '69 BC', '1260 BC', 565,
            1653, 1496]
        };
    };
};

global.Bot = new Bot();
