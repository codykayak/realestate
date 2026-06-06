import { createApp } from './app.js';
import { config } from './config.js';

const app = createApp();

app.listen(config.port, () => {
  console.log(`code-on-go backend listening on :${config.port}`);
  if (config.useInMemoryStore) {
    console.log('Using in-memory store (set USE_IN_MEMORY_STORE=false for Firestore)');
  }
});
