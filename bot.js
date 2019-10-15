//Подключаем библиотеки
const Discord = require('discord.js');
const fs = require('fs');
const hastebin = require('hastebin-gen');
const jimp = require('jimp');
const mongoose = require('mongoose');

//Переменные среды
/** @namespace process.env.BOT_TOKEN */
/** @namespace process.env.DB_LINK */

mongoose.connect(process.env.DB_LINK, {}, err => {
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
        this.client.login(process.env.BOT_TOKEN).then(() => delete process.env.BOT_TOKEN);
        this.userSchema = new mongoose.Schema({
          id: String,
          coins: Number,
          countries: {
            raiting: Number,
            strike: Number
          },
          capitals: {
            raiting: Number,
            strike: Number
          },
          ttt: {
            raiting: Number,
            strike: Number
          }
        });

        this.userData = mongoose.model('userData', _this.userSchema);
        //Имя и версия бота
        this.unstable = false;
        this.name = _this.unstable? 'Minigames Bot Unstable': 'Minigames Bot';
        this.version = _this.unstable? 'Rolling Realease' : 'alpha 0.8.0';

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
            if (_this.unstable) _this.prefixes = ['m.', `<@${this.client.user.id}>`];
            else _this.prefixes = ['m!', 'm1', `<@${this.client.user.id}>`];
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
            _this.mentionMember = message.mentions.members.find(m => m.id !== _this.client.user.id);

            if (!message.guild || message.author.bot) return;
            //something
            if (!_this.msgPrefix) return;
            if (!await _this.userData.findOne({id: message.author.id})) await _this.userData.create({
              id: message.author.id,
              coins: 0,
              countries: {
                raiting: 0,
                strike: 0
              },
              capitals: {
                raiting: 0,
                strike: 0
              },
              ttt: {
                raiting: 0,
                strike: 0
              }
            });

            const date = new Date();
            if (date.getDay() === 1) {};

            const args = message.content.slice(_this.msgPrefix.length).trim().split(/ +/g);
            const command = args.shift().toLowerCase();
            const mentionMember = message.mentions.members.find(m => m.id !== _this.client.user.id);

            const cmd = _this.commands.find(c => command.match(new RegExp(c.regex)));
            if (cmd && (!cmd.private || message.author.id === _this.creatorID)) {
                await cmd.run(message, args, mentionMember);
                const gamno = _this.msgPrefix + command;
                const authorAvatar = message.author.avatarURL || message.author.defaultAvatarURL;
                const avatar = await _this.jimp.read(authorAvatar);
                avatar.resize(50, 50)
                const bg = await _this.jimp.read(_this.images.bg);
                bg.composite(avatar, 10, 15);
                const font = await _this.jimp.loadFont(_this.jimp.FONT_SANS_16_WHITE);
                bg.print(font, 80, 20, message.author.username);
                const mentionReg = /<@!?(\d+)?>/g;
                const mentions = message.content.match(mentionReg);
                let content = message.content;
                if (mentions) mentions.forEach(m => content = content.replace(m, `@${_this.client.users.get(m.match(/!/)? m.slice(3, -1) : m.slice(2, -1)).tag}`));
                bg.print(font, 80, 43, content);
                bg.getBuffer(_this.jimp.MIME_PNG, (err, buffer) => {
                    const screenshot = new Discord.Attachment(buffer, 'screenshot.png');
                    const embed = new Discord.RichEmbed()
                    .setAuthor(message.author.tag, authorAvatar)
                    .setDescription(`\`${message.author.tag}\` used command **"${content}"** on the server \`${message.guild.name}\``)
                    .attachFile(screenshot)
                    .setColor(_this.colors.green);
                    if (!_this.unstable) _this.sendIn(_this.channels.commandsUsing, embed);
                });
            }

            if (command === 'help') {
                const page = parseInt(args[0]) || 1;
                const helpCommands = _this.commands.filter(c => !c.private && !c.hidden)
                const arr = helpCommands.map(cmd => `◽ **${_this.prefix + cmd.name} ${cmd.args?`\`${cmd.args}\``:''} -** ${cmd.desc}`);
                const embed = new Discord.RichEmbed()
                .setAuthor('Help', message.author.avatarURL)
                .setDescription(`**\`<...>\` - Required parameter.\n\`[...]\` - Optional parameter.\n\`&\` - AND operator.\n\`|\` - OR operator.\n\`n\` - Number.**\n\n${arr.join('\n')}`)
                .setColor(_this.colors.main)
                .addField('More info', `**:link: Official server: ${_this.serverLink}\n:kiwi: Qiwi - https://qiwi.me/andreybots\n:moneybag: PayPal - https://donatebot.io/checkout/496233900071321600\n◽ Type ${_this.prefixes[0]}donate for more info**`)
                .setFooter(`<> with ❤ by ${_this.creatorTag}`)
                message.channel.send(embed);
            }
        };

        _this.client.on('message', msg => _this.onMessage(msg));
        _this.client.on('messageUpdate', (oldMsg, msg) => _this.onMessage(msg));

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

        this.serverLink = 'https://discord.gg/6FKP7f2';

        this.colors = {
            discord: '36393F',
            green: '55ff55',
            red: 'ff5555',
            yellow: 'ffff55',
            main: 'af00ff'
        };

        this.chooseVariantsCmd = (message, variants, answers, minigameName, difficulty, question) => {
            let seconds = 0;
            let numberOfVariants = 0;
            if (difficulty.match(/eas[yi]|ле[гх]ко/i)) {
                seconds = 10;
                numberOfVariants = 3;
            } else if (difficulty.match(/har[dt]|сло[жш]но|хар[дт]/i)) {
                seconds = 8;
                numberOfVariants = 12;
            } else {
              seconds = 10;
              numberOfVariants = 6;
            }

            async function youLose (phrase) {
              const uData = await _this.userData.findOne({id: message.author.id});
              let minigame;
              if (minigameName === 'Guess capital of the country') minigame = uData.capitals;
              else if (minigameName === 'Guess flag of the country') minigame = uData.countries;
              minigame.raiting -= 5;
              minigame.strike = 0;
              await uData.save();
              const embed = new _this.Discord.RichEmbed()
              .setAuthor(phrase, message.author.avatarURL)
              .setDescription(`**The correct answer is \`${numberInList})\` ${answers[definder]}\nYour score is \`${minigame.raiting}\` now\nYour place in leaderboard is \`nullth\`\nYour strike has been reset**`)
              .setColor(_this.colors.red)
              await message.channel.send(embed);
            } async function youWon () {
              const uData = await _this.userData.findOne({id: message.author.id});
              let minigame;
              if (minigameName === 'Guess capital of the country') minigame = uData.capitals;
              else if (minigameName === 'Guess flag of the country') minigame = uData.countries;
              minigame.raiting += 5 * (minigame.strike / 100 + 1);
              minigame.strike += 1;
              await uData.save();
              const embed = new _this.Discord.RichEmbed()
              .setAuthor('You won!', message.author.avatarURL)
              .setDescription(`**The correct answer is \`${numberInList})\` ${answers[definder]}\nYour score is \`${minigame.raiting}\` now\nYour place in leaderboard is \`nullth\`\nYour strike is \`${minigame.strike}\`**`)
              .setColor(_this.colors.green)
              await message.channel.send(embed);
            };

            const definder = _this.random(0, variants.length - 1);
            const numberInList = _this.random(1, numberOfVariants);
            const variantsInMenu = [];
            const embed = new Discord.RichEmbed()
            .setAuthor(`Minigame "${minigameName}"`, message.author.avatarURL,)
            .setDescription(`${message.member}, ${question} **"${variants[definder]}"**?`)
            .setColor(_this.colors.main)
            .setFooter(`Write the correct answer down bellow (You have only ${seconds} seconds!)`)
            .setTimestamp();
            for (let i = 1; i < numberOfVariants + 1; i++) {
                let answer = answers[_this.random(0, answers.length - 1)];
                if (i === numberInList) answer = answers[definder];
                else variantsInMenu.forEach(variantInMenu => {
                    while ([variantInMenu, answers[definder]].includes(answer)) answer = answers[_this.random(0, answers.length - 1)];
                })
                variantsInMenu.push(answer);
                embed.addField(`${i})`, `**${answer}**`, true);
            };
            message.channel.send({embed}).then(() => {
                const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { time: seconds * 1e3 });
                const stopTimer = setTimeout(() => {
                  return youLose('Time is up! You lose >:D')
                }, seconds * 1e3)
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

        this.versionsList = ['0.1.0', '0.2.0', '0.3.0', '0.3.1', '0.3.2', '0.4.0', '0.5.0', '0.6.0', '0.6.1', '0.7.0', '0.7.1', '0.7.2', '0.7.3', '0.7.4'];

        this.channels = {
            commandsUsing: '631025205430583306',
            serverLeaveJoin: '631025228100927488',
            reports: '631025248371998721',
            // stats: '558548048175955979',
        };

        this.versions = {
            '0.1.0': [`На мoмент создания бота были команды ${this.prefix}countries, ${this.prefix}rsp, ${this.prefix}help, ${this.prefix}idea, ${this.prefix}bug и ${this.prefix}creator`],
            '0.2.0': [`Добавлена команда ${this.prefix}capitals`],
            '0.3.0': [`Добавлена команда ${this.prefix}ttt', 'Добавлена возможность выбирать уровень сложности в командах ${this.prefix}capitals и ${this.prefix}countries`],
            '0.3.1': [`Крестики-нолики (${this.prefix}ttt) стали намного умнее', 'Были добавлены команды ${this.prefix}update и ${this.prefix}rand`],
            '0.3.2': [`Дизайн команды ${this.prefix}ttt был изменен с черно-белого на радужный, на клетках появились цифры', 'Теперь когда вы делаете ход в ${this.prefix}ttt, то бот вас упоминает, чтобы не было путаницы', 'Изменены фразы после проигрыша/выигрыша в ${this.prefix}ttt`],
            '0.4.0': [`В ${this.prefix}ttt теперь можно играть с другом', 'Добавлена возможность выбирать кто пойдет первым в ${this.prefix}ttt`],
            '0.5.0': [`Добавлена команда ${this.prefix}seabattle (морской бой)`],
            '0.6.0': [`Была убрана команда ${this.prefix}seabattle из-за перегрузок', 'Был изменен дизай команды ${this.prefix}help', 'Добавлены команды ${this.prefix}cmd-info \`<Название команды>\` и ${this.prefix}info', 'Крестики-нолики теперь не засоряют чат', '*Пссс, еще был добавлен донат, ${this.prefix}donate, только никому не говори!*`],
            '0.6.1': [`Была добавлена команда ${this.prefix}used, которая позволяет просматривать какие команды чаще используют', 'Функция, которая отправляет информацию о том где и кто использует команды была улучшена ~~(чтобы это увидеть, то нужно прийти к нам на серве...)~~', 'Теперь, каждому репорту бага или идеи присваивается уникальный ID, чтобы на них было легче отвечать`],
            '0.7.0': ['Optimization and bugfix', 'Translating on English'],
            '0.7.1': ['Fixed bug with difficulties in `m!countries` and `m!capitals`', 'Fixed bug with multiplayer in`m!ttt`'],
            '0.7.2': [`Added commands log (You can see log in ${_this.serverLink})`, 'Now bot answers on the commands after the message was edited', 'Fixed bug with `m!update`'],
            '0.7.3': ['Fixed bugs with mentions'],
            '0.7.4': ['A lot of bugs with capitals/countries and other commands commands were fixed', 'Removed some partially useless commands', 'Some other minor changes']
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
                'Egypt', 'India', 'Austalia', 'New Zealand', 'Singapore', 'Malaysia', 'Pakistan',
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
                'Cairo', 'New Delhi', 'Caberra', 'Wellington', 'Singapore', 'Kuala Lumpur', 'Islamabad',
                'Tashkent', 'Beijing', 'Kiev', 'Berlin', 'Paris', 'Tokio', 'Brasília',
                'Dhaka', 'Vienna', 'Budapest', 'Kathmandu', 'Jakarta', 'Montevideo', 'Asunción',
                'Buenos Aires', 'Santiago', 'Havana', 'Lima', 'Damascus', 'Baghdad', 'Tehran',
                'Prague',
            ]
        };
    };
};

global.Bot = new Bot();
