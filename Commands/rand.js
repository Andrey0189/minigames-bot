module.exports.info = {
    name: 'random',
    desc: 'Random number generator',
    regex: /rand(om)?/
};

module.exports.run = (message, args) => {
    let num1 = parseInt(args[0]) || 1;
    let num2 = parseInt(args[1]) || 6;

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
