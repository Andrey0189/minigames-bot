module.exports.info = {
    name: 'donate',
    regex: /d[oa]nate?|(з[ао])?д[оа]нат(ить?)?/,
    desc: 'Information about donation'
};

module.exports.run = (message) => {
    const embed = new Bot.Discord.RichEmbed()
    .addField(':moneybag: Information about donation', `**Enjoing Minigames Bot? Help developer by donation and get some useful perks on our official server! :point_right: ${Bot.serverLink}**`)
    .addField('Payment Methods', '**◽ PayPal -** https://donatebot.io/checkout/496233900071321600\n**◽ Qiwi -** https://qiwi.me/andreybots\n**◽ Patreon - SOON** \n**◽ Yandex money - SOON** \n**◽ Payeer - SOON** ')
    .setColor(Bot.colors.main);
    message.channel.send(embed);
}
