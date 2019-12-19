module.exports.info = {
  name: 'capitals',
  regex: /capitals?|столиц[аы]/,
  desc: 'Guess capital of the country',
  args: '[easy | normal | hard]',
  example: 'hard'
};

module.exports.run = (message, args) => {
  //message, variants, answers, minigameName, difficulty, question, score, seconds, placingAlgoritm
  Bot.chooseVariantsCmd(message,
    Bot.minigames.countries,
    Bot.minigames.capitals,
    module.exports.info.desc,
    args.join(' '),
    variant => `What is the capital of **${variant}**`,
    5, 10,
    answers => answers[Bot.random(0, answers.length - 1)]);
};
