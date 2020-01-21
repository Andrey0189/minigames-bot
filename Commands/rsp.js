module.exports = {
    name: 'rsp',
    regex: /rsp|кнб/,
    args: ['<rock | scissors | paper>'],
    desc: '"Rock, scissors, paper"',
    example: 'https://media.discordapp.net/attachments/648115093850030091/668503553454899226/rspEx.gif',
    argsCheck: (message, args) => 0,
    run: (message, args) => {
        let choice = args[0];
    
        if (['r', 'rock', 'камень', 'к'].includes(choice)) choice = '✊'
        else if (['p', 'paper', 'бумага', 'б'].includes(choice)) choice = '✋';
        else if (['s', 'scissors', 'ножницы', 'н'].includes(choice)) choice = '✌️';
        else return Bot.invalidArgs(message, module.exports, 'Invalid argument was provided')
    
        let computerChoice = Math.random();
    
        if (computerChoice < 0.34) computerChoice = '✊';
        else if (computerChoice <= 0.67) computerChoice = '✋';
        else computerChoice = '✌️';
    
        function calculatingWin(choice1, choice2) {
            if (choice1 === choice2) return 'draw';
    
            else if(choice1 === '✊') {
                if (choice2 === '✌️') return true;
                else return false;
            }
    
            else if(choice1 === '✋') {
                if (choice2 === '✊') return true;
                else return false;
            }
    
            else if(choice1 === '✌️') {
                if (choice2 === '✋') return true;
                else return false;
            }
        }
    
        const isWin = calculatingWin(choice, computerChoice);
        let embed
    
        if (isWin !== 'draw') {
            embed = new Bot.Discord.RichEmbed()
            .setAuthor(isWin? 'You won!':'You lose >:D', message.author.avatarURL)
            .setColor(isWin? Bot.colors.green : Bot.colors.red)
            .setDescription(`**\`${message.author.username}\` chose ${choice}\n\`${Bot.name}\` chose ${computerChoice}**`)
        } else {
            embed = new Bot.Discord.RichEmbed()
            .setAuthor('Draw!', message.author.avatarURL)
            .setColor(Bot.colors.yellow)
            .setDescription(`**We chose** ${choice}`)
        }
    
        message.channel.send(embed);
    
    }
};