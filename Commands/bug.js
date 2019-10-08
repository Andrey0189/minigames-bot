module.exports.info = {
  name: 'bug',
  regex: /bug-?(report)?|ба[гк]-?(репорт)?/,
  args: '[bug desc]',
  desc: 'Send bug-report to the developer'
};

module.exports.run = (message, args) => {
  if (Bot.unstable) return Bot.err('You can\'t use this command in unstable version', message);
  if (!args[0]) return Bot.invalidArgs(message, module.exports.info);
  const bug = args.join(' ');
  const id = Bot.random(1e4, 1e5)
  const embed = new Bot.Discord.RichEmbed()
  .setAuthor('Bug succesfully sent', message.author.avatarURL)
  .setDescription(`**Your report ID is \`${id}\`. Remember it!**`)
  .setColor(Bot.colors.main);
  message.channel.send(embed)
  Bot.sendIn(Bot.channels.reports, `**Bug Report \`${id}\` from ${message.author} \`[${message.author.tag}]\`:\n${bug}**`)
}
