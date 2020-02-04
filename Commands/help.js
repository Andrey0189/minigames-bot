module.exports = {
  regex: /help/,
  args: ['[command]'],
  hidden: true,
  argsCheck: async (message, args) => {
    if (args[0] && !Bot.commands.find(c => args[0].match(c.regex))) {
       Bot.err(message, 'Invalid command was provided.');
       return 1;
    }
  },
  run: (message, args) => {
    if (!args[0]) {
      const helpCommands = Bot.commands.filter(c => !c.private && !c.hidden)
      const arr = helpCommands.map(cmd => `◽ **${Bot.prefix + cmd.name} ${cmd.args?`\`${cmd.args.join(' ')}\``:''} -** ${cmd.desc}`);
      const embed = new Bot.Discord.RichEmbed()
      .setAuthor('Help', message.author.avatarURL)
      .setDescription(`**Type ${Bot.prefix}help \`<command-name>\` for more help about any command\n\`<...>\` - Required parameter.\n\`[...]\` - Optional parameter.\n\`|\` - OR operator.\n\`n\` - Number.**\n\n${arr.join('\n')}`)
      .setColor(Bot.colors.main)
      .addField('More info', `**🆙 Vote for me: ${Bot.topgg}\n:link: Official server: ${Bot.server}\n:tools: Fork me on GitHub ${Bot.github}\n:kiwi: Qiwi - https://qiwi.me/andreybots\n:moneybag: PayPal - __alekseyvarnavskiy84@gmail.com__\n◽ Type ${Bot.prefix}donate for more info**`)
      .setFooter(`<> with ❤ by ${Bot.creatorTag}`)
      message.channel.send(embed);
  } else {
      const helpCmd = Bot.commands.find(c => args[0].match(c.regex));
      const embed = new Bot.Discord.RichEmbed()
      .addField(`Command ${Bot.prefix + helpCmd.name}`, helpCmd.desc + (helpCmd.example? '. GIF example of using:' : ''))
      .setImage(helpCmd.example)
      .setColor(Bot.colors.main);
      message.channel.send(embed);
  };
  }
};
