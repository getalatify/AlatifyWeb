declare module 'gif.js';
declare module 'imagetracerjs';

// onnxruntime-web's package.json "exports" map omits a "types" condition, so
// bundler module resolution can't find its bundled ./types.d.ts. Re-declare the
// module here (mirroring that file) so we keep full ORT typings.
declare module 'onnxruntime-web' {
  export * from 'onnxruntime-common';
}
