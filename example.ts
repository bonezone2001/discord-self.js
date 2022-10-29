import { User, Discord, Utils } from 'discord-self.js';

(async () => {
    const discord = new Discord("DISCORD-TOKEN-HERE");

    await discord.init();
    // Login has the potential to throw
    if (await discord.login())
        console.log("Logged in as " + discord.userTag);
})();