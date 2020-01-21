module.exports = {
    name: 'idea',
    regex: /idea/,
    args: ['<idea-desc>'],
    desc: 'Send idea-report to the developer',
    example: 'https://media.discordapp.net/attachments/648115093850030091/668503523465494528/ideaEx.gif',
    argsCheck: async (message) => {
      if (Bot.unstable) {
        Bot.err(message, 'You can\'t use this command in unstable version');
        return 1;
      }
    },
    run: (message, args) => {
        const idea = args.join(' ');
        const id = Bot.random(1e4, 1e5);
        const embed = new Bot.Discord.RichEmbed()
        .setAuthor('Idea succesfully sent', message.author.avatarURL)
        .setDescription(`**Your report ID is \`${id}\`. Remember it!**`)
        .setColor(Bot.colors.main);
        message.channel.send(embed)
        Bot.sendIn(Bot.channels.reports, `**Idea Report \`${id}\` from ${message.author} \`[${message.author.tag}]\`:\n${idea}**`)
    }
};

