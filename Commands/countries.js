module.exports.info = {
  name: 'countries',
  regex: /countr(ies|y)|стран[ыа]/,
  desc: 'Guess flag of the country',
  args: '[easy | normal | hard]',
  example: 'hard'
};

module.exports.run = (message, args) => {
  //message, variants, answers, minigameName, difficulty, question, score, seconds, placingAlgoritm
  Bot.chooseVariantsCmd(message,
    Bot.minigames.countries,
    Bot.minigames.flags.map(f => `:flag_${f}:`),
    module.exports.info.desc,
    args.join(' '),
    variant => `What flag does **${variant}** have`,
    5, 10,
    answers => answers[Bot.random(0, answers.length - 1)]);
}
