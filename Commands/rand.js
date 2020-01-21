module.exports = {
    name: 'random',
    regex: /rand(om)?/,
    args: ['[n]', '[n]'],
    desc: 'Random number generator',
    example: 'https://media.discordapp.net/attachments/648115093850030091/668503532965593108/randomEx.gif',
    argsCheck: async () => 0,
    run: (message, args) => {
        let num1 = parseInt(args[0]);
        let num2 = parseInt(args[1]);
        if (isNaN(num1)) num1 = 1;
        if (isNaN(num2)) num2 = 6;
    
        if (num1 > num2) {
            let num3 = num2;
            num2 = num1;
            num1 = num3;
        }
    
        const randomNum = Bot.random(num1, num2);
        const embed = new Bot.Discord.RichEmbed()
        .setAuthor(`Random number from ${num1} to ${num2}`, message.author.avatarURL)
        .setDescription(`**Result: \`${randomNum}\`**:game_die:`)
        .setColor(Bot.colors.main)
        message.channel.send(embed)
    }
};
