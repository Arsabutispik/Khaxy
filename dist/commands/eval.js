const clean = async (text) => {
    if (text && text.constructor.name == "Promise")
        text = await text;
    text = text
        .replace(/`/g, "`" + String.fromCharCode(8203))
        .replace(/@/g, "@" + String.fromCharCode(8203));
    return text;
};
export default {
    name: "eval",
    description: "Evaluates a code.",
    usage: `{prefix}eval <code>`,
    examples: `{prefix}eval message.channel.send("Hello World!")`,
    category: "Bot Sahibi",
    async execute({ message, args }) {
        if (message.author.id !== "903233069245419560")
            return;
        try {
            const evaled = eval(args.join(" "));
            const cleaned = await clean(evaled);
            message.channel.send(`\`\`\`js\n${cleaned}\n\`\`\``);
        }
        catch (err) {
            message.channel.send(`\`ERROR\` \`\`\`xl\n${err.message}\n\`\`\``);
        }
    }
};
//# sourceMappingURL=eval.js.map