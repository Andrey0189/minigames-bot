module.exports = {
  name: 'capitals',
  regex: /capitals?|столиц[аы]/,
  args: ['[easy | medium | hard]'],
  desc: 'Guess capital of the country',
  example: 'https://media.discordapp.net/attachments/648115093850030091/668503482374029332/capitalsEx.gif',
  auto: true,
  argsCheck: async () => 0,
   run: (message, args) => {
    //message, variants, answers, minigameName, difficulty, question, score, seconds, placingAlgoritm
    Bot.chooseVariantsCmd(message,
      Bot.minigames.countries,
      Bot.minigames.capitals,
      module.exports,
      args.join(' '),
      variant => `What is the capital of **${variant}**`,
      5, 10,
      answers => answers[Bot.random(0, answers.length - 1)]);
  }
};
