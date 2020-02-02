module.exports = {
  name: 'year',
  regex: /year|event/,
  args: ['[easy | medium | hard]'],
  desc: 'Guess the year of the event',
  example: 'https://media.discordapp.net/attachments/648115093850030091/668503602196643882/yearEx.gif',
  auto: true,
  argsCheck: async () => 0,
  run: (message, args) => {
    //message, variants, answers, minigameName, difficulty, question, score, seconds, placingAlgoritm
    Bot.chooseVariantsCmd(message,
      Bot.minigames.events,
      Bot.minigames.years,
      module.exports,
      args.join(' '),
      variant => `In what year **${variant}**`,
      15, 20,
      (answers, definder, numberOfVariants) => (parseInt(answers[definder].toString().split(/ /)[0]) + Bot.random(-numberOfVariants, numberOfVariants) + (typeof answers[definder] === 'string'? ' BC' : 0))
    );
  }
  
};
