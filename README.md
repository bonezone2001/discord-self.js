<a name="readme-top"></a>


<!-- PROJECT LOGO -->
<br />
<div align="center">
  <img src="images/lib-logo.png" alt="Logo" width="80" height="80">

  <h3 align="center">Discord User Control Library</h3>

  <p align="center">
    Automate your discord account however you so choose
    <br />
    <br />
    <a href="https://github.com/bonezone2001/discord-self.js/blob/main/example.ts">View Example</a>
    ·
    <a href="https://github.com/bonezone2001/discord-self.js/issues">Report Bug</a>
    ·
    <a href="https://github.com/bonezone2001/discord-self.js/issues">Request Feature</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#about-the-project">About The Project</a></li>
    <li><a href="#getting-started">Getting Started</a></li>
    <li><a href="#usage-and-examples">Usage and Examples</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<br>

<!-- ABOUT THE PROJECT -->
## About The Project

Automating discord is cumbersome when all the mature options seem to restrict access to user accounts. This prevents so many cool things from being able to work and I often found myself wanting to create these things so I decided to throw together a library that is fast and robust (hopefully).

Here are some use cases:
* Auto responding to messages
* Exporting your DM or guild messages.
* Leaving all your guilds
* Copying data you typically don't see
* Downloading media
* Auto filter your chat messages

The project is still fairly young so it's missing some vital features but for most it should suffice. If you need a particular feature implemented just create a feature request in the issues section.

<br>

<!-- GETTING STARTED -->
## Getting Started

To start using discord-self.js you will need to install it via npm or yarn. You will also need access to your discord token -> [One of the methods](https://www.youtube.com/watch?v=i658UNXNRJQ)

* npm
  ```sh
  npm install discord-self.js
  ```
* yarn
  ```sh
  yarn add discord-self.js
  ```

<br>

<!-- USAGE EXAMPLES -->
## Usage and Examples

Using discord-self.js is simple, just provide it your token, initialize and login. After that, for most features, it won't matter if the websocket disconnects or not. Just request away.

* Login and retrieve all DM messages (for exporting for example)
```ts
import { Discord } from 'discord-self.js';

(async () => {
    const discord = new Discord("DISCORD-TOKEN-HERE");

    // Login
    await discord.init();
    if (!await discord.login()) throw new Error("Cannot login");
    console.log("Logged in as " + discord.userTag);

    // Get all DM channels
    const channels = await discord.getDMChannels();
    console.log(`Found ${channels.length} DM channels`);

    // Get all messages from each channel
    for (const channel of channels) {
        const messages = await discord.getAllMessages(channel.id);
        console.log(`Found ${messages.length} messages in channel ${channel.id}`);
    }
})();
```

* Custom Emoji are parsed from content automatically
```ts
await discord.sendMessage("897219587714719748", ":balls_emoji:");
```

* Save all your valuable information
```ts
import { Utils, Discord } from 'discord-self.js';
import fs from 'fs';

(async () => {
    const discord = new Discord("DISCORD-TOKEN-HERE");

    await discord.init();
    if (!await discord.login()) throw new Error("Cannot login");
    fs.writeFileSync("user.json", Utils.jsonFormat(Object.assign({}, discord.sessionInfo.user, { country_code: discord.sessionInfo.country_code })));
    fs.writeFileSync("user_settings.json", Utils.jsonFormat(discord.sessionInfo.user_settings));
    fs.writeFileSync("sessions.json", Utils.jsonFormat(discord.sessionInfo.sessions));
    fs.writeFileSync("relationships.json", Utils.jsonFormat(discord.sessionInfo.relationships));
    fs.writeFileSync("guilds.json", Utils.jsonFormat(discord.sessionInfo.guilds));
    fs.writeFileSync("connected_accounts.json", Utils.jsonFormat(discord.sessionInfo.connected_accounts));
    fs.writeFileSync("payment_sources.json", Utils.jsonFormat(await discord.getPaymentSources()));
    fs.writeFileSync("payments.json", Utils.jsonFormat(await discord.getPayments()));
})();
```
These are just a few examples but you can do most of the things a typical user can do and more.

<!-- ROADMAP -->
## Roadmap
Although I say it can do most things. There is still much to do
- Implement voice connection and streaming
- Implement some method for gracefully handling rate limits
- Cover most of the REST API
- Possibly wrap the event emitter up and add type information instead of raw websocket events
- Lazy guild loading. Super easy just need to find the time

Find somethings missing and it's not here? [Open an issue](https://github.com/othneildrew/Best-README-Template/issues) and let me know what could be improved.

<br>



<!-- CONTRIBUTING -->
## Contributing

Any contributions you can make are **super appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Mwah!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<br>


<!-- LICENSE -->
## License

Distributed under the MIT License. See [LICENSE](https://github.com/bonezone2001/discord-self.js/blob/main/LICENSE) for more information.

<br>

<!-- ACKNOWLEDGMENTS -->
## Acknowledgments

* [Amazing github template thanks a bunch](https://github.com/othneildrew/Best-README-Template)
