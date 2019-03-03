module.exports.info = {
    name: 'mass-say',
    regex: /m(ass?)?-?s(a[yi])?/,
    desc: 'Send message to all the servers',
    args: '<content>',
    example: 'Update 1.0.0 is released!',
    private: true
};

module.exports.run = (message, args) => {
    if (!args[0]) Bot.invalidArgs(message, module.exports.info);
    const text = args.join(' ');

    Bot.client.guilds.forEach(guild => {
        let channels = guild.channels.filter(channel => channel.type === 'text' && channel.permissionsFor(guild.me).has('SEND_MESSAGES'));
        if (channels) channels.first().send(text).then(() => console.log(`Sent to ${guild.name}`));
    });
};
