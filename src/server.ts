/**
 * GODBRAIN APEX - MAIN ENTRYPOINT
 *
 * This file initializes the entire GodBrain system based on the
 * Kingdom Divine Architecture principles.
 *
 * It performs the following steps:
 * 1. Initializes the central ServiceRegistry.
 * 2. Dynamically discovers and imports all service and agent modules.
 * 3. Instantiates and registers each module with the registry.
 * 4. Starts the Gateway API to begin accepting tasks.
 */

import 'reflect-metadata'; // Required for decorator-based systems, might be used in future
import { glob } from 'glob';
import path from 'path';
import { serviceRegistry } from './services/serviceRegistry';
import { ModuleInterface } from './services/moduleInterface';

async function bootstrap() {
  console.log('[GodBrain] Bootstrapping Apex Architecture...');

  // --- 1. Discover and Register Modules ---
  const modulePaths = await new Promise<string[]>((resolve, reject) => {
    glob('src/{services,agents}/**/*.ts', (err, matches) => {
      if (err) return reject(err);
      resolve(matches);
    });
  });
  
  console.log(`[GodBrain] Discovered ${modulePaths.length} potential module files.`);

  for (const modulePath of modulePaths) {
    // Exclude interface/registry files themselves
    if (modulePath.includes('moduleInterface.ts') || modulePath.includes('serviceRegistry.ts')) {
      continue;
    }

    const moduleName = path.basename(modulePath, '.ts');
    console.log(`[GodBrain] Loading module: ${moduleName}`);

    try {
      const moduleExports = await import(path.resolve(modulePath));
      for (const key in moduleExports) {
        const exportedItem = moduleExports[key];
        // Check if the export is a class with metadata (from @Module decorator)
        if (typeof exportedItem === 'function' && exportedItem.prototype.metadata) {
          const moduleInstance = new exportedItem() as ModuleInterface;
          await serviceRegistry.register(moduleInstance);
          break; // Assume one module class per file
        }
      }
    } catch (error) {
      console.error(`[GodBrain] Failed to load or register module ${moduleName}.`, error);
    }
  }

  console.log('[GodBrain] All modules registered.');
  console.log('[GodBrain] Current registered modules:', serviceRegistry.listModules().map(m => m.name));

  // --- 2. Start the Gateway ---
  console.log('[GodBrain] Starting Gateway API...');
  await import('./gateway/gateway');

  console.log('[GodBrain] Apex Architecture bootstrap complete. System is operational.');
}

bootstrap().catch(error => {
  console.error('[GodBrain] FATAL BOOTSTRAP ERROR:', error);
  process.exit(1);
});