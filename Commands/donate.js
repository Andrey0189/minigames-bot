module.exports = {
  name: 'donate',
  regex: /d[oa]nate?|(з[ао])?д[оа]нат(ить?)?/,
  desc: 'Information about donation',
  run: (message) => {
    const embed = new Bot.Discord.RichEmbed()
    .addField(':moneybag: Information about donation', `**Enjoing Minigames Bot? Help developer by donation and get some useful perks on our official server! :point_right: ${Bot.server}**`)
    .addField('Payment Methods', '**◽ PayPal -** alekseyvarnavskiy84@gmail.com\n**◽ Qiwi -** https://qiwi.me/andreybots\n**◽ Patreon - SOON** \n**◽ Yandex money - SOON**')
    .setColor(Bot.colors.main);
    message.channel.send(embed);
  }
};
