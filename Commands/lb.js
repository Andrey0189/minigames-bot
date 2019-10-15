module.exports.info = {
  name: 'top',
  regex: /l(eader)?b(oard?)|top/,
  desc: 'Best players',
  args: '[countries | capitals | coins]',
  example: 'capitals',
  hidden: true
};

module.exports.run = async (message, args) => {
  if (!args[0] || !['capitals', 'countries', 'coins'].includes(args[0])) return Bot.invalidArgs(message, module.exports.info);
  let page = parseInt(args[1]) || 1;
  const data = await Bot.userData.find({});
  const maxElements = 3;
  const maxPages = Math.ceil(data.length / maxElements);

  function sdjgfgd (value1, value2, value3) {
    if (args[0] === 'capitals') return value1;
    else if (args[0] === 'countries') return value2;
    else if (args[0] === 'coins') return value3;
  };

  function book (page) {
    const title = sdjgfgd(`Top players ${Bot.prefix}capitals`, `Top players ${Bot.prefix}countries`, `Top richest`)
    const embed = new Bot.Discord.RichEmbed()
    .setAuthor(title, Bot.client.user.avatarURL)
    .setColor(Bot.colors.main)
    .setFooter(`Page ${page}/${maxPages}`);
    return embed.setDescription(`**${((args[0] === 'coins')? 'You can get coins after reset in other leaderboards!\n\n' : 'Next reset on sunday at 11:59 PM (UTC)\n\n') + data.sort((a, b) => sdjgfgd(b.capitals.raiting - a.capitals.raiting, b.countries.raiting - a.countries.raiting, b.coins - a.coins)).map((u, index) => {
      if (index + 1 <= page * maxElements && index + 1 > (page - 1) * maxElements) return `\`${index + 1}. ${Bot.client.users.get(u.id).tag}:${('.').repeat(35 - Bot.client.users.get(u.id).tag.length)}${sdjgfgd(u.capitals.raiting, u.countries.raiting, u.coins)}\``
    }).join('\n')}**`);
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
