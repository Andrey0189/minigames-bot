module.exports.info = {
  name: 'countries',
  regex: /countr(ies|y)|стран[ыа]/,
  desc: 'Guess flag of the country',
  args: '[easy | normal | hard | extreme]',
  example: 'hard'
};

module.exports.run = (message, args) => {
  //message, variants, answers, minigameName, difficulty, question
  Bot.chooseVariantsCmd(message, Bot.minigames.countries, Bot.minigames.flags.map(f => `:flag_${f}:`), module.exports.info.desc, args.join(' '), 'Which flag has country');
}
