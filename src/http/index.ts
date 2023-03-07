import fastify from 'fastify';
import registerRoutes from './router/index.js';
import registerOpenAPI from './router/routes/openapi.js';
import fastifyCors from '@fastify/cors';
import fastifyAuth from '@fastify/auth';
import config from '../config.js';
import initMongo, { DB } from '../shared/modules/database/index.js';
import Inquirer from '../inquirer/index.js';

export class HTTPClient {
  private c = config();
  public inq = new Inquirer();
  public router: fastify.FastifyInstance;
  public db: DB;

  constructor() {
    this.router = fastify({
      logger: true,
    });

    void this.startServer();
  }

  private async startServer() {
    // Start inquirer
    await this.inq.start();
    // Init MongoDB
    this.db = await initMongo(this.c.mongoConfig, this.c.mongoDb);
    // Register router
    await this.router
      .register(fastifyCors, {
        origin: '*',
      })
      .register(fastifyAuth);
    // Register OpenAPI
    await registerOpenAPI.bind(this)();
    // Register routes
    registerRoutes.bind(this)();
    // Listen server
    await this.router.listen({ host: '0.0.0.0', port: this.c.port });
  }
}
