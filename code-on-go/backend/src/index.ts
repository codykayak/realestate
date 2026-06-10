import { createApp } from './app.js';
import { config } from './config.js';

const app = createApp();

app.listen(config.port, '0.0.0.0', () => {
  console.log(`code-on-go backend listening on http://0.0.0.0:${config.port}`);
  if (config.useInMemoryStore) {
    console.log('Using in-memory store (set USE_IN_MEMORY_STORE=false for Firestore)');
  }
});
