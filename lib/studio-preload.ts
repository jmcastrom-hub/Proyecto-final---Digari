let modelModules: Promise<[typeof import('three'), typeof import('./procedural-models')]> | undefined;

/** Load render code only after the visitor signals intent to open the 3D study. */
export function preloadStudioModel() {
  modelModules ??= Promise.all([import('three'), import('./procedural-models')]).catch((error: unknown) => {
    modelModules = undefined;
    throw error;
  });
  return modelModules;
}
