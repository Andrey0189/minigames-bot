module.exports.info = {
    name: 'rsp',
    desc: '"Rock, scissors, paper"',
    regex: /rsp|кнб/,
    args: '[rock | scissors | paper]',
    example: 'rock',
};

module.exports.run = (message, args) => {
    let choice = args[0];

    if (['r', 'rock', 'камень', 'к'].includes(choice)) choice = Bot.client.emojis.get(Bot.emojis.rock)
    else if (['p', 'paper', 'бумага', 'б'].includes(choice)) choice = ':page_with_curl:';
    else if (['s', 'scissors', 'ножницы', 'н'].includes(choice)) choice = ':scissors:';
    else return Bot.invalidArgs(message, module.exports.info)

    let computerChoice = Math.random();

    if (computerChoice < 0.34) computerChoice = Bot.client.emojis.get(Bot.emojis.rock);
    else if (computerChoice <= 0.67) computerChoice = ':page_with_curl:';
    else computerChoice = ':scissors:';

    function calculatingWin(choice1, choice2) {
        if (choice1 === choice2) return 'draw';

        else if(choice1 === Bot.client.emojis.get(Bot.emojis.rock)) {
            if (choice2 === ':scissors:') return true;
            else return false;
        }

        else if(choice1 === ':page_with_curl:') {
            if (choice2 === Bot.client.emojis.get(Bot.emojis.rock)) return true;
            else return false;
        }

        else if(choice1 === ':scissors:') {
            if (choice2 === ':page_with_curl:') return true;
            else return false;
        }
    }

    const isWin = calculatingWin(choice, computerChoice);
    let embed

    if (isWin !== 'draw') {
        embed = new Bot.Discord.RichEmbed()
        .setAuthor(isWin? 'You won!':'You lose >:D', message.author.avatarURL)
        .setColor(isWin? Bot.colors.green : Bot.colors.red)
        .setDescription(`**${message.author.username}** - chosed ${choice}\n**${Bot.name}** - chosed ${computerChoice}`)
    } else {
        embed = new Bot.Discord.RichEmbed()
        .setAuthor('Draw!', message.author.avatarURL)
        .setColor(Bot.colors.yellow)
        .setDescription(`**We chosed** ${choice}`)
    }

    message.channel.send(embed);

}
