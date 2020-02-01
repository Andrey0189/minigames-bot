module.exports = {
  name: 'change',
  regex: /change/,
  private: true,
  args: ['<id>', '<field>', '<fieldValue>'],
  argsCheck: async (message, args) => {
    const uData = await Bot.userData.findOne({id: args[0]});
    console.log(uData[args[1]])
    if (!uData) {
      Bot.err(message, 'Invalid ID was provided');
      return 1;
    } else if (!uData[args[1]]) {
      Bot.err(message, 'Invalid value was provided');
      return 1;
    }
  },
  run: async (message, args) => {
    const uData = await Bot.userData.findOne({id: args[0]});
    const value = args[1];
    let newValue = args.slice(2).join(' ');
    if (typeof uData[value] === 'number') newValue = parseInt(newValue);
    const oldValue = uData[value];
    uData[value] = newValue;
    await uData.save();
    message.channel.send(`**Found document: \`${args[0]}\`.\nFound value: \`${value}\`.\nOld \`${value}\` value: \`${oldValue}\`\.\nNew \`${value}\` value: \`${newValue}\`.**`);
  }
};
