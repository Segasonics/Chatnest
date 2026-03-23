import app from './app.js';
import { env } from './config/env.js';
import { connectDb } from './config/db.js';
import { logger } from './config/logger.js';
import { queueService } from './services/scheduler/inMemoryQueue.service.js';

async function bootstrap() {
  await connectDb();
  queueService.start();

  app.listen(env.PORT, () => {
    logger.info(`Server listening on port ${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  logger.error(error, 'Failed to start server');
  process.exit(1);
});
