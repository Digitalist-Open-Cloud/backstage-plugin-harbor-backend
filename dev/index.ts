import { createBackend } from '@backstage/backend-defaults';
import { harborBackendPlugin } from '../src/plugin';

async function main() {
  const backend = createBackend();

  backend.add(harborBackendPlugin);

  await backend.start();
}

main().catch(error => {
  console.error('Backend startup failed:', error);
  process.exit(1);
});