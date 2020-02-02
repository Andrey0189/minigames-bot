module.exports = {
  name: 'countries',
  regex: /countr(ies|y)|стран[ыа]/,
  args: ['[easy | medium | hard]'],
  desc: 'Guess flag of the country',
  example: 'https://media.discordapp.net/attachments/648115093850030091/668503522240626708/countriesEx.gif',
  auto: true,
  argsCheck: async () => 0,
  run: async (message, args) => {
    //message, variants, answers, minigameInfo, difficulty, question, score, seconds, placingAlgoritm
    Bot.chooseVariantsCmd(message,
      Bot.minigames.countries,
      Bot.minigames.flags.map(f => `:flag_${f}:`),
      module.exports,
      args.join(' '),
      variant => `What flag does **${variant}** have`,
      5, 10,
      answers => answers[Bot.random(0, answers.length - 1)]);
  }  
};
