module.exports.info = {
  name: 'guild-info',
  regex: /guild/,
  args: '[id]',
  args: 'Information about guild',
  hidden: true
};

module.exports.run = (message, args) => {
  const guild = Bot.client.guilds.get(args[0]) || Bot.client.guilds.find(g => g.name.match(new RegExp(args[0], 'i'))) || message.guild;

  const embed = new Bot.Discord.RichEmbed()
  .addField('Server information', `
  Name: \`${guild.name}\`
  ID: \`${guild.id}\`
  Objects count: m: ${guild.memberCount}, r: ${guild.roles.size}, ch: ${guild.channels.size}, e: ${guild.emojis.size}
  Owner: ${guild.owner.user} \`${guild.owner.user.tag}\`
  Created at: \`${Bot.toMoscowTime(guild.createdAt)}\``)
  .setColor(Bot.colors.main)
  .setThumbnail(guild.iconURL)
  message.channel.send(embed);
}
