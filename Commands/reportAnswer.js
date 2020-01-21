module.exports = {
    regex: /r(eport)?-a(nsw?er)?/,
    private: true,
    run: (message, args) => {
        const id = args[0];
        if (!id) return Bot.invalidArgs(message, module.exports.info);
        const user = Bot.client.users.get(args[1]);
        if (!user) return Bot.invalidArgs(message, module.exports.info);
        const answer = args.slice(2).join(' ');
        if (answer === '') Bot.invalidArgs(message, module.exports.info);
        user.send(`**Your answer on a report with ID \`${id}\`**:\n${answer}`).then(msg => {
            message.channel.send(`I sent to ${user.tag} that message:\n${msg.content}`);
        });
    }
};
