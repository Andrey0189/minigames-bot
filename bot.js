const Discord = require('discord.js');
const fs = require('fs');
const hastebin = require('hastebin-gen');
const jimp = require('jimp');
const mongoose = require('mongoose');

/** @namespace process.env.BOT_TOKEN */
/** @namespace process.env.DB_LINK */

mongoose.connect(process.env.DB_LINK, {useNewUrlParser: true, useUnifiedTopology: true}, err => {
  if (!err) console.log('Successfully connected to database');
  else console.log(err);
});

class Bot {
    constructor() {
        let _this = this;

        this.Discord = Discord;
        this.fs = fs;
        this.hastebin = hastebin;
        this.jimp = jimp;
        this.mongoose = mongoose;

        this.client = new Discord.Client({disableEveryone: true});
        this.client.login(process.env.BOT_TOKEN).then(() => delete process.env.BOT_TOKEN);
        this.userSchema = new mongoose.Schema({
          id: String,
          coins: Number,
          raiting: Number
        });

        this.shipSchema = new mongoose.Schema({
            lover1: String,
            lover2: String,
            percents: Number,
          });

        this.userData = mongoose.model('userData', _this.userSchema);
        this.shipData = mongoose.model('ship', _this.shipSchema);

        this.unstable = true;
        this.name = _this.unstable? 'Minigames Bot Unstable': 'Minigames Bot';
        this.prefixes = _this.unstable? ['m.'] : ['m!', 'm1'];
        this.prefix = _this.prefixes[0];

        this.creator = 'ANDREY#2623';
        this.topgg = 'https://top.gg/bot/522731595858313217';
        this.github = 'https://github.com/Andrey0189/minigames-bot';
        this.server = 'https://discord.gg/6XBBMDU';

        this.commands = [];

        RegExp.quote = str => str.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");

        this.emoji = (id) => _this.client.emojis.get(id) || '';

        this.random = (min, max) => Math.floor(Math.random() * (max + 1 - min)) + min;

        this.randomBoolean = () => Math.random() > 0.5? true : false;

        this.randomElement = arr => arr[Math.ceil(Math.random() * arr.length - 1)];

        this.sendIn = (id, msg) => _this.client.channels.get(id).send(msg);

        this.addCommas = (int) => int.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

        this.toMoscowTime = (time) => time.toLocaleString('ru-RU', {timeZone: 'Europe/Moscow', hour12: false}).replace(/\/|\./g, '-');

        this.multipleReact = async (message, arr) => {
          if (0 in arr) await message.react(arr.shift()).then(() => _this.multipleReact(message, arr).catch());
        };

        _this.client.on('ready', () => {
            _this.prefixes.push(`<@${this.client.user.id}>`);
            _this.creatorTag = _this.client.users.get(_this.creatorID).tag;
            setInterval(() => _this.client.user.setActivity(`${_this.prefix}help | ${_this.client.guilds.size} servers`, {type: 'PLAYING'}), 12e4);
            _this.client.user.setStatus('idle');
            console.log(`${this.client.user.tag} is Logged successfully.\nGuilds: ${this.client.guilds.size}\nUsers: ${this.client.users.size}\nChannels: ${this.client.channels.size}`);
            fs.readdir('./Commands', (err, cmds) => {
                if (err) throw err;
                cmds.forEach(command => {
                    const cmd = require(`./Commands/${command}`);
                    this.commands.push({
                        name: cmd.name,
                        regex: cmd.regex,
                        args: cmd.args,
                        desc: cmd.desc,
                        example: cmd.example,
                        private: cmd.private || false,
                        hidden: cmd.hidden || false,
                        argsCheck: cmd.argsCheck,
                        run: cmd.run
                    });
                });
            });
        });

        _this.onMessage = async (message) => {
            const msgPrefix = _this.prefixes.find(p => message.content.toLowerCase().startsWith(p));

            if (!message.guild || message.author.bot) return;
            //something
            if (!msgPrefix) return;
            if (!await _this.userData.findOne({id: message.author.id})) await _this.userData.create({
              id: message.author.id,
              coins: 0,
              raiting: 0
            });

            const args = message.content.slice(msgPrefix.length).trim().split(/ +/g);
            const command = args.shift().toLowerCase();
            const mentionMember = message.mentions.members.find(u => u.id !== _this.client.user.id) || message.guild.members.get(args[0]) || (args[0]? message.guild.members.find(m => m.user.tag.match(new RegExp(RegExp.quote(args[0]), 'i'))) : null);
            const user = message.mentions.users.find(u => u.id !== _this.client.user.id) || _this.client.users.get(args[0]) || (args[0]? _this.client.users.find(u => u.tag.match(new RegExp(RegExp.quote(args[0]), 'i'))) : null);

            const cmd = _this.commands.find(c => command.match(c.regex));
            if (cmd && (!cmd.private || message.author.id === _this.creatorID)) {
                for (let i = 0; cmd.args? i < cmd.args.length : false; i++) {
                    let type = cmd.args[i].slice(-1) === ']'? 'optional' : 'required';
                    if (!(i in args) && type === 'required') return _this.invalidArgs(message, cmd, 'Missing Argument')
                };
                
                if (cmd.args && await cmd.argsCheck(message, args, mentionMember) === 1) return;
                await cmd.run(message, args, mentionMember, user);
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
                if (!args[0]) {
                    const helpCommands = _this.commands.filter(c => !c.private && !c.hidden)
                    const arr = helpCommands.map(cmd => `◽ **${_this.prefix + cmd.name} ${cmd.args?`\`${cmd.args.join(' ')}\``:''} -** ${cmd.desc}`);
                    const embed = new Discord.RichEmbed()
                    .setAuthor('Help', message.author.avatarURL)
                    .setDescription(`**Type ${_this.prefix}help \`<command-name>\` for more help about any command\n\`<...>\` - Required parameter.\n\`[...]\` - Optional parameter.\n\`|\` - OR operator.\n\`n\` - Number.**\n\n${arr.join('\n')}`)
                    .setColor(_this.colors.main)
                    .addField('More info', `**🆙 Vote for me: ${_this.topgg}\n:link: Official server: ${_this.server}\n:tools: Fork me on GitHub ${_this.github}\n:kiwi: Qiwi - https://qiwi.me/andreybots\n:moneybag: PayPal - __alekseyvarnavskiy84@gmail.com__\n◽ Type ${_this.prefixes[0]}donate for more info**`)
                    .setFooter(`<> with ❤ by ${_this.creatorTag}`)
                    message.channel.send(embed);
                } else {
                    const argCmd = args[0];
                    const helpCmd = _this.commands.find(c => argCmd.match(c.regex));
                    if (!helpCmd) return _this.err(message, 'Invalid command was provided.');
                    const embed = new Discord.RichEmbed()
                    .addField(`Command ${_this.prefix + helpCmd.name}`, helpCmd.desc + (helpCmd.example? '. GIF example of using:' : ''))
                    .setImage(helpCmd.example)
                    .setColor(_this.colors.main);
                    message.channel.send(embed);
                };
            }
        };
        
        _this.client.on('message', async msg => _this.onMessage(msg));
        _this.client.on('messageUpdate', async (_oldMsg, msg) => _this.onMessage(msg));

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
            const channel = guild.channels.find(channel => channel.type === 'text' && channel.permissionsFor(guild.me).has('SEND_MESSAGES'));
            if (channel) channel.send(`Thank you for inviting me! Type ${this.prefixes[0]}help for help!\nJoin our official server if you having some troubles or want to find some freinds: ${_this.server}\nFork me on GitHub: <${_this.github}>\nVote for me: <${_this.topgg}>`);
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

        this.colors = {
            discord: '36393f',
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

        this.randomPhrases = [`<> with ❤ by ${_this.creator}`, 
        'Vote for Minigames Bot!\nhttps://top.gg/bot/522731595858313217',
        `Enjoying Minigames Bot?\nYou can help us by donating! Type ${_this.prefix}donate`,
        'Having troubles or want to\nfind some friends to play\nMinigames Bot? Join our official\nserver! https://discord.gg/6XBBMDU',
        'Are you JavaScript developer?\nFork me on GitHub!\nhttps://github.com/Andrey0189/minigames-bot',
        `Tell us about bugs with ${_this.prefix}bug command.\nOr about your ideas with ${_this.prefix}idea command`];

        this.err = (message, reason) => {
            const embed = new Discord.RichEmbed()
            .setAuthor('Error', message.author.avatarURL)
            .setColor('ff5555')
            .setFooter(_this.randomElement(_this.randomPhrases))
            .setDescription(`Reason: **${reason}**`);
            message.channel.send(embed);
        };

        this.invalidArgs = (message, cmd, reason) => {
            const embed = new Discord.RichEmbed()
            .setAuthor('Error', message.author.avatarURL)
            .setColor('ff5555')
            .setDescription(`**${reason}**\n\nUsage: **${_this.prefix + cmd.name} \`${cmd.args.join(' ')}\`\n**Example:`)
            .setImage(cmd.example)
            .setFooter(_this.randomElement(_this.randomPhrases));
            message.channel.send(embed);
        }

        this.channels = {
            commandsUsing: '648114944486801408',
            serverLeaveJoin: '648114960777347087',
            reports: '648114992595599381',
            minigamesLog: '661540288690651138'
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
                greenSquare: 'https://cdn.discordapp.com/attachments/648115093850030091/661520878286143520/GreenSquare.png',
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
                'bd', 'at', 'hu', 'np', 'id', 'uy', 'py',
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
