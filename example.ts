import { User, Discord, Utils } from 'discord-self.js';

(async () => {
    const discord = new Discord("DISCORD-TOKEN-HERE");

    // Login will throw if cannot login
    await discord.init();
    await discord.login();
    console.log("Logged in as " + discord.userTag);

    // Testing, if using on your own account, change the channel id to one you have access to
    const messages = await discord.getAllMessages("897219587714719748");
    console.log("Got " + messages.length + " messages");

    // The library does support events but they're raw meaning no type information
    // Could change in the future, but it wasn't a priority. The methods and functions were more important.
    discord.on("MESSAGE_CREATE", (data) => {
        console.log(data);
    });
})();