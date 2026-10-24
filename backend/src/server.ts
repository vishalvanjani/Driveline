import { createApp } from './app.js';
import { config } from './config.js';
import { prisma } from './lib/prisma.js';

createApp(prisma).listen(config.port, () => {
  console.log(`API listening on http://localhost:${config.port}`);
});
