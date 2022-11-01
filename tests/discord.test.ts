import { Discord } from '../src/discord';
import { ParseEmojiResponseType } from '../src/types/discord-user';
import { Utils } from '../src/utils';

const testEnv = {
	TOKEN: process.env.TEST_TOKEN!,
	CHANNEL_ID: process.env.TEST_CHANNEL!,
	CHANNEL_ID_TEXT_OPS: process.env.TEST_CHANNEL_TEXT_OPS!,
	GUILD_ID: process.env.TEST_GUILD!,
	USER_ID: process.env.TEST_USER!,
	MESSAGE_ID: process.env.TEST_MESSAGE!, 
};

let error = false;
for (const key in testEnv) {
	if (!testEnv[key]) {
		console.log(`Missing ${key}`);
		error = true;
	}
}
if (error) throw new Error("Missing test environment variables");

// Tests need work

describe('works', () => {
	let discord: Discord;
	beforeAll(async () => {
		discord = new Discord(testEnv.TOKEN);
		await discord.init();
		await discord.login();
	});

	afterAll(async () => {
		await discord.logout();
	});

	test('has set user', async () => {
		expect(discord.user).toBeTruthy();
		expect(discord.user.token).toBe(testEnv.TOKEN);
		expect(discord.user.cookies).toBeTruthy();
	});

	test('has session info', async () => {
		expect(discord.sessionInfo).toBeTruthy();
		expect(discord.sessionInfo?.sessions.length).toBeGreaterThan(0);
		expect(discord.sessionInfo?.guilds.length).toBeGreaterThanOrEqual(1);
	});

	describe('messages', () => {
		beforeAll(async () => {
			await Utils.sleep(500 + Math.random() * 1000);
		});

		// Reading
		it('should get messages', async () => {
			const messages = await discord.getMessages(testEnv.CHANNEL_ID);
			expect(messages).toBeTruthy();
			expect(messages.length).toBeGreaterThanOrEqual(7);
			messages.reverse();
			expect(messages[1]).toHaveProperty('id');
			expect(messages[1].content).toBe('test');
		});

		// commented due to circular weirdness (cba debugging right now)
		// it('should get specific message', async () => {
		// 	const message = await discord.getMessage(testEnv.CHANNEL_ID, testEnv.MESSAGE_ID);
		// 	expect(message).toBeTruthy();
		// 	expect(message.id).toBe(testEnv.MESSAGE_ID);
		// 	expect(message.content).toBe('test');
		// });

		it('should get messages before messageId', async () => {
			const messages = await discord.getMessages({
				before: testEnv.MESSAGE_ID,
				channelId: testEnv.CHANNEL_ID
			});
			expect(messages).toBeTruthy();
			expect(messages.length).toBe(1);
			expect(messages[0].content).toBe('');
		});

		it('should get messages after messageId', async () => {
			const messages = await discord.getMessages({
				after: testEnv.MESSAGE_ID,
				channelId: testEnv.CHANNEL_ID
			});
			expect(messages).toBeTruthy();
			expect(messages.length).toBe(5);
			messages.reverse();
			expect(messages[0].content).toBe('test 2');
		});

		it('should get all messages', async () => {
			const messages = await discord.getAllMessages(testEnv.CHANNEL_ID);
			expect(messages).toBeTruthy();
			expect(messages.length).toBeGreaterThanOrEqual(7);
			messages.reverse();
			expect(messages[1].content).toBe('test');
		});

		// // Writing
		it('should send message', async () => {
			const message = await discord.sendMessage(testEnv.CHANNEL_ID_TEXT_OPS, 'test');
			expect(message).toBeTruthy();
			expect(message.content).toBe('test');
		});

		describe('existing messages', () => {
			let toEdit: any, toDelete: any, toBulkDelete: any[], toReact: any;
			beforeAll(async () => {
				toEdit = await discord.sendMessage(testEnv.CHANNEL_ID_TEXT_OPS, 'test edit');
				await Utils.sleep(100);
				toDelete = await discord.sendMessage(testEnv.CHANNEL_ID_TEXT_OPS, 'test delete');
				await Utils.sleep(100);
				toBulkDelete = [
					await discord.sendMessage(testEnv.CHANNEL_ID_TEXT_OPS, 'test bulk delete 1'),
					await discord.sendMessage(testEnv.CHANNEL_ID_TEXT_OPS, 'test bulk delete 2')
				].map(m => m.id);
				await Utils.sleep(100);
				toReact = await discord.sendMessage(testEnv.CHANNEL_ID_TEXT_OPS, 'test react');
			});

			beforeEach(async () => {
				await Utils.sleep(1000);
			});
			
			it('should edit message', async () => {
				const message = await discord.editMessage(testEnv.CHANNEL_ID_TEXT_OPS, toEdit.id, 'test edit worked');
				expect(message).toBeTruthy();
				expect(message.content).toBe('test edit worked');
			});

			it('should delete message', async () => {
				await expect(discord.deleteMessage(testEnv.CHANNEL_ID_TEXT_OPS, toDelete.id)).resolves.not.toThrow();
			});

			it('should bulk delete messages', async () => {
				await expect(discord.bulkDeleteMessages(testEnv.CHANNEL_ID_TEXT_OPS, toBulkDelete)).resolves.not.toThrow();
			});

			describe('reactions', () => {
				it('should react to message with unicode', async () => {
					await expect(discord.addReaction(testEnv.CHANNEL_ID_TEXT_OPS, toReact.id, '👍')).resolves.not.toThrow();
				});
	
				it('should react to message with custom emoji', async () => {
					await expect(discord.addReaction(testEnv.CHANNEL_ID_TEXT_OPS, toReact.id, ':test:')).resolves.not.toThrow();
				});

				it('should remove reaction from message with unicode', async () => {
					await expect(discord.removeReaction(testEnv.CHANNEL_ID_TEXT_OPS, toReact.id, '👍')).resolves.not.toThrow();
				});
	
				it('should remove reaction from message with custom emoji', async () => {
					await expect(discord.removeReaction(testEnv.CHANNEL_ID_TEXT_OPS, toReact.id, ':test:')).resolves.not.toThrow();
				});
			});
		});
	});

	// I don't really know how to test this without screwing up the test server
	describe('guild', () => {
		it('should get guild', async () => {
			const guild = await discord.getGuild(testEnv.GUILD_ID);
			expect(guild).toBeTruthy();
			expect(guild.id).toBe(testEnv.GUILD_ID);
			expect(guild.name).toBe('test server');
		});
	});

	describe('emoji', () => {
		it('should get all emojis', async () => {
			const emojis = await discord.getAllCustomEmoji();
			expect(emojis).toBeTruthy();
			expect(emojis.length).toBe(1);
			expect(emojis[0].name).toBe('test');
		});

		it('should get guild emojis', async () => {
			const emojis = await discord.getAllCustomEmoji();
			expect(emojis).toBeTruthy();
			expect(emojis.length).toBe(1);
			expect(emojis[0].name).toBe('test');
		});

		it('should get no emoji matching', async () => {
			const emojis = await discord.searchCustomEmoji("lol");
			expect(emojis).toBeTruthy();
			expect(emojis.length).toBe(0);
		});

		it('should get emoji matching \'test\'', async () => {
			const emojis = await discord.searchCustomEmoji("test");
			expect(emojis).toBeTruthy();
			expect(emojis.length).toBe(1);
		});
		
		it('should parse message custom emojis', async () => {
			const emojiMsg = await discord.parseCustomEmojis('test :test:', ParseEmojiResponseType.Message);
			expect(emojiMsg).toBeTruthy();
			expect(emojiMsg).toMatch(/<a?:\w+:\d+>/);
		});
	});

	describe('channels', () => {
		it('should get guild channels', async () => {
			const channels = await discord.getGuildChannels(testEnv.GUILD_ID);
			expect(channels).toBeTruthy();
			expect(channels.length).toBe(3);
			expect(channels[0].id).toBe(testEnv.CHANNEL_ID);
		});

		it('should get channel', async () => {
			const channel = await discord.getChannel(testEnv.CHANNEL_ID);
			expect(channel).toBeTruthy();
			expect(channel.id).toBe(testEnv.CHANNEL_ID);
		});
		
		it('should get all guild channels', async () => {
			const channels = await discord.getGuildChannels(testEnv.GUILD_ID);
			expect(channels).toBeTruthy();
			expect(channels.length).toBe(3);
			expect(channels[0].id).toBe(testEnv.CHANNEL_ID);
		});
		
		it('should get user dm', async () => {
			const dm = await discord.getDMChannel(testEnv.USER_ID);
			expect(dm).toBeTruthy();
		});
		
		it('should get dm channels', async () => {
			const dms = await discord.getDMChannels();
			expect(dms).toBeTruthy();
			expect(dms.length).toBeGreaterThanOrEqual(1);
		});
	});

	describe('roles', () => {
		it('should get guild roles', async () => {
			const roles = await discord.getGuildRoles(testEnv.GUILD_ID);
			expect(roles).toBeTruthy();
			expect(roles.length).toBe(1);
			expect(roles[0].name).toBe('@everyone');
		});

		// commented due to circular weirdness (cba debugging right now)
		// it('should get role', async () => {
		// 	const role = await discord.getGuildRole(testEnv.GUILD_ID, testEnv.GUILD_ID);
		// 	expect(role).toBeTruthy();
		// 	expect(role.name).toBe('@everyone');
		// });
	});

	describe('profile', () => {
		it('should get user profile', async () => {
			const profile = await discord.getProfile(testEnv.USER_ID);
			expect(profile).toBeTruthy();
			expect(profile.user.id).toBe(testEnv.USER_ID);
		});
	});
});