import type { DB } from '../index.js';

export default class UserService {
  static async getByToken(cols: DB, token: string) {
    try {
      return await cols.users.findOne({ token });
    } catch (e) {
      console.error(e);
      return null;
    }
  }
}
