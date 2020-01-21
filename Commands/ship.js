module.exports = {
  name: 'ship',
  regex: /ship|lover/,
  desc: 'Check love of 2 people',
  args: ['<lover1>', '[lover2]'],
  argsCheck: async (message, args) => 0,
  run: async (message, args) => {
    if (!args[1]) args[1] = `<@${message.author.id}>`;
    args[0] = args[0].toLowerCase();
    args[1] = args[1].toLowerCase();
    const loveTexts = ['Worse than ever :poop:', 'Terrible :sob:', 'Very bad :disappointed_relieved:', 'Bad :frowning2:', 'Idk :thinking:', 'Not bad :confused:', 'Friends :+1:', 'Mmmm ( ͡° ͜ʖ ͡°)', 'Fine! :heartpulse:', 'Incredible!!! :heart_eyes:', 'PERFECT!!! :heart_exclamation:'];
    if (!await Bot.shipData.findOne({lover1: args[0], lover2: args[1]})) await Bot.shipData.create({
      lover1: args[0],
      lover2: args[1],
      percents: Bot.random(1, 100)
    });

    const ship = await Bot.shipData.findOne({lover1: args[0], lover2: args[1]});
    const percents = ship.percents;
    const loveText = loveTexts[Math.floor(percents / 10)];
    const segments = '■'.repeat(Math.round(percents / 10));

    const embed = new Bot.Discord.RichEmbed()
    .setTitle('❤️ MATCHMAKING ❤️')
    .setColor('ff00b0')
    .setDescription(`▼***${args[0]}***\n▲***${args[1]}***\n\n💞 **${percents}%** [${segments + '□'.repeat(10 - segments.length)}]\n\n**${loveText}**`)
    .setFooter(Bot.randomElement(Bot.randomPhrases))
    .setTimestamp();
    message.channel.send({embed});
  },  
};
