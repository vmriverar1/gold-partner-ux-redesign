import { lstat, realpath, rm } from 'node:fs/promises';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const cleanBuildOutput = {
  name: 'clean-build-output',
  apply: 'build',
  async buildStart() {
    const projectRoot = await realpath(fileURLToPath(new URL('.', import.meta.url)));
    const output = resolve(projectRoot, 'dist');
    if (dirname(output) !== projectRoot || basename(output) !== 'dist') {
      throw new Error('La limpieza solo puede actuar en dist dentro de este proyecto.');
    }
    const entry = await lstat(output).catch(error => {
      if (error.code === 'ENOENT') return null;
      throw error;
    });
    if (!entry) return;
    if (!entry.isDirectory() || entry.isSymbolicLink()) {
      throw new Error('dist debe ser una carpeta de compilación, no un archivo ni un enlace.');
    }
    // Async rm avoids the Windows Unicode-path bug in supported Node versions.
    await rm(output, { recursive: true, force: true });
  },
};

export default defineConfig({
  plugins: [cleanBuildOutput, react()],
  build: { emptyOutDir: false },
});
