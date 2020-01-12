module.exports.info = {
  name: 'top',
  regex: /l(eader)?b(oard?)|top/,
  desc: 'Best players',
  args: '<minigames | coins>',
  example: 'coins'
};

module.exports.run = async (message, args) => {
  if (!args[0] || !['minigames', 'coins'].includes(args[0])) return Bot.invalidArgs(message, module.exports.info);
  let page = parseInt(args[1]) || 1;
  const data = await Bot.userData.find({});
  const maxElements = 20;
  const maxPages = Math.ceil(data.filter(u => Bot.client.users.get(u.id) && u.raiting).length / maxElements);

  function sdjgfgd (value1, value2) {
    if (args[0] === 'minigames') return value1;
    else if (args[0] === 'coins') return value2;
  };

  function book (page) {
    const arr = [];
    const title = sdjgfgd(`Best players`, `Top richest`)
    const embed = new Bot.Discord.RichEmbed()
    .setAuthor(title, Bot.client.user.avatarURL)
    .setColor(Bot.colors.main)
    .setFooter(`Page ${page}/${maxPages}`);

    data.sort((a, b) => sdjgfgd(b.raiting - a.raiting, b.coins - a.coins)).filter(u => Bot.client.users.get(u.id) && u.raiting).forEach((u, index) => {
      const usr = Bot.client.users.get(u.id).tag;
      if (index + 1 <= page * maxElements && index + 1 > (page - 1) * maxElements) arr.push(`\`${index + 1}. ${usr}:${('.').repeat(50 - usr.length)}${sdjgfgd(u.raiting, u.coins)}\``)
    });

    const top = arr.join('\n').replace(/`/g, '\`');
    return embed.setDescription(`**${((args[0] === 'coins')? 'You can get coins after reset in other leaderboards!\n\n' : 'Next reset on Jan 1\n\n') + top}**`);
  };

  message.channel.send(book(page)).then(msg => {
    Bot.multipleReact(msg, ['◀', '▶']);
    const reactCollector = new Bot.Discord.ReactionCollector(msg, r => r, {time: 3e5});
    reactCollector.on('collect', (reaction) => {
      let reactionAuthor
      reaction.users.forEach(user => { if (user.id === message.author.id) reactionAuthor = user.id });
      if (message.author.id !== reactionAuthor) return;
      reaction.remove(reactionAuthor);
      if (reaction.emoji.name === '◀') {
        if (page === 1) page = maxPages
        else page--;
        msg.edit({embed: book(page)});
      } else if (reaction.emoji.name === '▶') {
        if (page === maxPages) page = 1
        else page++;
        msg.edit({embed: book(page)});
      };
    });
  });
};
