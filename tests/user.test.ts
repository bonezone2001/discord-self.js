import { User } from '../src/user';
const token: string = process.env.TEST_TOKEN!;
if (!token) throw new Error("Missing token");

// Tests need work

describe('User', () => {
    let user: User;
    beforeAll(async () => {
        user = new User(token);
        await user.init();
    });

    it('should create instance', async () => {
        const user = new User(token);
        expect(user.token).toBe(token);
    });

    it('should get cookies', async () => {
        expect(user.cookies).toBeTruthy();
        expect(user.cookies).toContain("__dcfduid");
    });

    it('should get user headers', async () => {
        const headers = user.userHeaders();
        expect(headers).toBeTruthy();
        expect(headers).toHaveProperty('authorization');
        expect(headers).toHaveProperty('cookie');
        expect(headers).toHaveProperty('x-super-properties');
    });

    it('should send as user', async () => {
        const res = await user.sendAsUser({
            url: "https://discord.com/channels/@me",
            method: "GET",
        });
        expect(res.status).toBe(200);
    });
});