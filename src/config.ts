import { readFileSync } from 'fs';
import { join } from 'path';
import { z } from 'zod';

export const Config = z.object({
  port: z.number(),
  mongoConfig: z.string(),
  mongoDb: z.string(),
  browserPath: z.string().optional(),
  appName: z.string(),
});

export default (): z.infer<typeof Config> => {
  const file = JSON.parse(
    readFileSync(
      join('config', process.env.NODE_ENV ?? 'development', 'config.json'),
      'utf8',
    ),
  );

  return Config.parse(file);
};
