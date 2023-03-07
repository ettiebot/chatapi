import { Collection, MongoClient } from 'mongodb';
import { User } from '../../ts/mongo.js';

export type DB = {
  users: Collection<User>;
};

export default async function initMongo(mongoURL: string, mongoDB: string) {
  const client = new MongoClient(mongoURL);
  await client.connect();

  const db = client.db(mongoDB);

  const cols: DB = {
    users: db.collection<User>('users'),
  };

  return cols;
}
