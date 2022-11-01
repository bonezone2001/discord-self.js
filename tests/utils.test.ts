import { Utils } from '../src/utils';

// Tests need work

describe('Utils', () => {
	describe('createMessageForm', () => {
		it('should create message form json only', () => {
			const form = Utils.createMessageForm({ test: 'is test' });
			const headers = form.getHeaders();
			expect(headers['content-type']).toBe('multipart/form-data; boundary=' + form.getBoundary());
	
			const body = form.getBuffer();
			expect(body.toString()).toContain('Content-Type: application/json');
			expect(body.toString()).toContain('{"test":"is test"}');
		});
	
		it('should create message form with file name only', () => {
			const form = Utils.createMessageForm(undefined, ['../lib-logo.png']);
			const headers = form.getHeaders();
			expect(headers['content-type']).toBe('multipart/form-data; boundary=' + form.getBoundary());
	
			const body = form.getBuffer();
			expect(body.toString()).toContain('Content-Disposition: form-data; name="file"');
		});
	
		it('should create message form with file buffer only', () => {
			const form = Utils.createMessageForm(undefined, [Buffer.from('test')]);
			const headers = form.getHeaders();
			expect(headers['content-type']).toBe('multipart/form-data; boundary=' + form.getBoundary());
	
			const body = form.getBuffer();
			expect(body.toString()).toContain('Content-Disposition: form-data; name="file"');
		});
	
		it('should create message form with file name and buffer', () => {
			const form = Utils.createMessageForm(undefined, ['../lib-logo.png', Buffer.from('test')]);
			const headers = form.getHeaders();
			expect(headers['content-type']).toBe('multipart/form-data; boundary=' + form.getBoundary());
	
			const body = form.getBuffer();
			expect(body.toString()).toContain('Content-Disposition: form-data; name="file"');
		});
	
		it('should create message form with file name and buffer and json', () => {
			const form = Utils.createMessageForm({ test: 'is test' }, ['../lib-logo.png']);
			const headers = form.getHeaders();
			expect(headers['content-type']).toBe('multipart/form-data; boundary=' + form.getBoundary());
	
			const body = form.getBuffer();
			expect(body.toString()).toContain('Content-Disposition: form-data; name="payload_json"');
			expect(body.toString()).toContain('Content-Type: application/json');
			expect(body.toString()).toContain('{"test":"is test"}');
			expect(body.toString()).toContain('Content-Disposition: form-data; name="file"');
		});
	});

	describe('waitIfRateLimited', () => {
		it('should wait if rate limited', async () => {
			const now = Date.now();
			let i = 0;
			await Utils.waitIfRateLimited(async () => {
				// i is here Here so not infinite loop but not needed in real code ofc.
				if (i++ === 0)
					throw { response: { data: { retry_after: 1 } } };
			});
			expect(Date.now() - now).toBeGreaterThanOrEqual(1000);
		});

		it('should throw error instantly', async () => {
			const now = Date.now();
			await expect(Utils.waitIfRateLimited(async () => {
				throw new Error('test');
			})).rejects.toThrowError('test');
			expect(Date.now() - now).toBeLessThan(50);
		});

		it('should throw "Rate limit very high, aborting wait"', async () => {
			const now = Date.now();
			await expect(Utils.waitIfRateLimited(async () => {
				throw { response: { data: { retry_after: 100000000 } } };
			})).rejects.toThrowError('Rate limit very high, aborting wait');
			expect(Date.now() - now).toBeLessThan(50);
		});

		it('should return instantly', async () => {
			const now = Date.now();
			expect(await Utils.waitIfRateLimited(async () => {
				return 'test';
			})).toBe('test');
			expect(Date.now() - now).toBeLessThan(50);
		});

		it('should throw error instantly', async () => {
			const now = Date.now();
			await expect(Utils.waitIfRateLimited(async () => {
				throw new Error('test');
			})).rejects.toThrowError('test');
			expect(Date.now() - now).toBeLessThan(50);
		});
	});
	
	test('if sleep 100ms', async () => {
		const start = Date.now();
		await Utils.sleep(100);
		const end = Date.now();
		expect(end - start).toBeGreaterThanOrEqual(100);
		expect(end - start).toBeLessThan(150);
	});

	test('if encode anything to base64', () => {
		expect(Utils.base64Encode('test')).toBe('dGVzdA==');
		expect(Utils.base64Encode({ test: 'is test' })).toBe('eyJ0ZXN0IjoiaXMgdGVzdCJ9');
		expect(Utils.base64Encode(123)).toBe('MTIz');
		expect(Utils.base64Encode(true)).toBe('dHJ1ZQ==');
		expect(Utils.base64Encode(false)).toBe('ZmFsc2U=');
		expect(Utils.base64Encode(null)).toBe('bnVsbA==');
		expect(Utils.base64Encode(undefined)).toBe('dW5kZWZpbmVk');
	});
	
	test('if throw if is not an array', () => {
		expect(() => Utils.arrayResponseAssert("a", 'test')).toThrow();
		expect(() => Utils.arrayResponseAssert(1, 'test')).toThrow();
		expect(() => Utils.arrayResponseAssert({ "asd": 123 }, 'test')).toThrow();
		expect(() => Utils.arrayResponseAssert([1, 2, 3], 'test')).not.toThrow();
	});

	test('if throw on object containing code property (discord error)', () => {
		expect(() => Utils.hasErrorAssert("a", 'test')).not.toThrow();
		expect(() => Utils.hasErrorAssert(1, 'test')).not.toThrow();
		expect(() => Utils.hasErrorAssert([1, 2, 3], 'test')).not.toThrow();
		expect(() => Utils.hasErrorAssert({ "asd": 123 }, 'test')).not.toThrow();
		expect(() => Utils.hasErrorAssert({ code: 123, message: 'test' }, 'test')).toThrow();
	});

	test('if throw on object missing id property', () => {
		expect(() => Utils.missingIdAssert("a", 'test')).toThrow();
		expect(() => Utils.missingIdAssert(1, 'test')).toThrow();
		expect(() => Utils.missingIdAssert({ code: 123, message: 'test' }, 'test')).toThrow();
		expect(() => Utils.missingIdAssert({ "asd": 123 }, 'test')).toThrow();
		expect(() => Utils.missingIdAssert([1, 2, 3], 'test')).toThrow();
		expect(() => Utils.missingIdAssert({ id: 123 }, 'test')).not.toThrow();
	});

	test('if throw on missing missing property', () => {
		expect(() => Utils.missingPropertyAssert("a", 'test', 'test')).toThrow();
		expect(() => Utils.missingPropertyAssert(1, 'test', 'test')).toThrow();
		expect(() => Utils.missingPropertyAssert({ code: 123, message: 'test' }, 'test', 'test')).toThrow();
		expect(() => Utils.missingPropertyAssert({ "asd": 123 }, 'test', 'test')).toThrow();
		expect(() => Utils.missingPropertyAssert([1, 2, 3], 'test', 'test')).toThrow();
		expect(() => Utils.missingPropertyAssert({ id: 123 }, 'test', 'test')).toThrow();
		expect(() => Utils.missingPropertyAssert({ test: 123 }, 'test', 'test')).not.toThrow();
	});
	
	test('if stringify object and format it nicely', () => {
		expect(Utils.jsonFormat({ test: 'is test' })).toBe('{\n    "test": "is test"\n}');
		expect(Utils.jsonFormat({ test: 'is test', test2: 'is test2' })).toBe('{\n    "test": "is test",\n    "test2": "is test2"\n}');
		expect(Utils.jsonFormat({ test: 'is test', test2: 'is test2', test3: 'is test3' })).toBe('{\n    "test": "is test",\n    "test2": "is test2",\n    "test3": "is test3"\n}');
	});
	
	test('if convert emoji obj or unicode to appropriate url', () => {
		expect(Utils.emojiToUrl({ name: '👍' })).toBe('https://twemoji.maxcdn.com/v/latest/72x72/1f44d.png');
		expect(Utils.emojiToUrl({ id: '123', name: 'test' })).toBe('https://cdn.discordapp.com/emojis/123.png');
		expect(Utils.emojiToUrl({ id: '123', name: 'test', animated: true })).toBe('https://cdn.discordapp.com/emojis/123.gif');
	});
	
	test('if match all emoji cases', () => {
		expect(Utils.isEmojiObj({})).toBe(false);
		expect(Utils.isEmojiObj({ id: '123' })).toBe(false);
		expect(Utils.isEmojiObj({ name: '👍' })).toBe(false);
		expect(Utils.isEmojiObj({ name: 'test' })).toBe(false);
		expect(Utils.isEmojiObj({ animated: true })).toBe(false);
		expect(Utils.isEmojiObj({ id: '123', name: 'test', animated: true, test: 'test' })).toBe(true);

		expect(Utils.isEmojiObj({ id: '123', name: 'test' })).toBe(true);
		expect(Utils.isEmojiObj({ id: '123', name: 'test', animated: true })).toBe(true);
	});

	test('if download remote file', async () => {
		const file = await Utils.downloadFile('https://twemoji.maxcdn.com/v/latest/72x72/1f44d.png');
		expect(file).toBeInstanceOf(Buffer);
		expect(file.length).toBeGreaterThan(0);
	});
});