module.exports = {
  name: 'bug',
  regex: /bug/,
  desc: 'Send bug-report to the developer',
  args: ['<bug-desc>'],
  example: 'https://media.discordapp.net/attachments/648115093850030091/668503449700270080/bugEx.gif',
  argsCheck: async (message) => {
    if (Bot.unstable) {
      Bot.err(message, 'You can\'t use this command in unstable version');
      return 1;
    }
  },
  run: (message, args) => {
    const bug = args.join(' ');
    const id = Bot.random(1e4, 1e5)
    const embed = new Bot.Discord.RichEmbed()
    .setAuthor('Bug succesfully sent', message.author.avatarURL)
    .setDescription(`**Your report ID is \`${id}\`. Remember it!**`)
    .setColor(Bot.colors.main);
    message.channel.send(embed)
    Bot.sendIn(Bot.channels.reports, `**Bug Report \`${id}\` from ${message.author} \`[${message.author.tag}]\`:\n${bug}**`)
  }  
};
