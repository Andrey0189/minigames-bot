module.exports.info = {
  name: 'year',
  regex: /yea?r|го[дт]/,
  desc: 'Guess the year of the event',
  args: '[easy | normal | hard]',
  example: 'hard'
};

module.exports.run = (message, args) => {
  //message, variants, answers, minigameName, difficulty, question, score, seconds, placingAlgoritm
  Bot.chooseVariantsCmd(message,
    Bot.minigames.events,
    Bot.minigames.years,
    module.exports.info.desc,
    args.join(' '),
    variant => `In what year **${variant}**`,
    15, 20,
    (answers, definder, numberOfVariants) => (parseInt(answers[definder].toString().split(/ /)[0]) + Bot.random(-numberOfVariants, numberOfVariants) + (typeof answers[definder] === 'string'? ' BC' : 0))
  );
}
