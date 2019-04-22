module.exports.info = {
    name: 'capitals',
    regex: /capitals?|столиц[аы]/,
    desc: 'Guess capital of the country',
    args: '[easy | normal | hard | extreme]',
    example: 'hard'
};

module.exports.run = (message, args) => {
    //message, variants, answers, minigameName, difficulty, question
    Bot.chooseVariantsCmd(message, Bot.minigames.countries, Bot.minigames.capitals, module.exports.info.desc, args.join(' '), 'Which city is the capital of');
};
