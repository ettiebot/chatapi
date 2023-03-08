import { InMemoryRateLimiter } from 'rolling-rate-limiter';
import type { HTTPClient } from '../index.js';
import UserService from '../../shared/modules/database/services/user.js';

const limiter = new InMemoryRateLimiter({
  interval: 60 * 1000,
  maxInInterval: 10,
});

export default function verifyToken(this: HTTPClient, request, _, done) {
  const token = request.headers['x-token'] as string;

  if (!token) {
    return done(new Error('Missing token'));
  }

  UserService.getByToken(this.db, token)
    .then((userObj) => {
      if (!userObj) return done(new Error('Invalid token'));

      request.headers.user = userObj;

      limiter.limit(userObj._id).then((wasBlocked) => {
        if (wasBlocked) {
          return done(new Error('Limit exceeded'));
        } else {
          return done();
        }
      });
    })
    .catch((e) => done(e));
}
