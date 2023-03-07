import { InMemoryRateLimiter } from 'rolling-rate-limiter';
import type { HTTPClient } from '../index.js';
import UserService from '../../shared/modules/database/services/user.js';

const limiter = new InMemoryRateLimiter({
  interval: 60 * 1000,
  maxInInterval: 10,
});

export default async function verifyToken(this: HTTPClient, request, _, done) {
  const token = request.headers['x-token'] as string;
  if (!token) {
    return done(new Error('Missing token'));
  }

  const userObj = await UserService.getByToken(this.db, token);
  if (!userObj) return done(new Error('Invalid token'));

  request.headers.user = userObj;

  await limiter.limit(userObj._id).then((wasBlocked) => {
    if (wasBlocked) {
      return done(new Error('Limit exceeded'));
    } else {
      return done();
    }
  });
}
