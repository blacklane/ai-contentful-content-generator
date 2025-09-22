import dotenv from 'dotenv';

// Load environment variables BEFORE importing other modules
dotenv.config();

import express, { Router } from 'express';
import { getServerConfig, logEnvironmentStatus } from './server/config';
import { setupMiddleware } from './server/middleware';
import { setupRoutes } from './server/routes';

const app = express();
const router = Router();
const config = getServerConfig();

logEnvironmentStatus();

setupMiddleware(app);
setupRoutes(router);

app.use(router);

app.listen(config.port, config.host, () => {
  console.log(`🚀 Backend Server ready!`);
  console.log(`📝 Environment: ${config.nodeEnv}`);

  if (config.host === '0.0.0.0') {
    console.log(`   ➜  Local:   http://localhost:${config.port}/`);
    console.log(`   ➜  Network: http://192.168.0.102:${config.port}/`);
  } else {
    console.log(`   ➜  Running on: http://${config.host}:${config.port}`);
  }
});
