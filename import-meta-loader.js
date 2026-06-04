// Webpack custom loader to replace import.meta.url with a safe string expression.
// This prevents Webpack from transpiling import.meta into incompatible objects,
// and prevents the Terser/SWC minifier from crashing in classic script bundles.

module.exports = function (source) {
  if (source.includes('import.meta.url')) {
    // Replace import.meta.url with a dynamic string expression that resolves to window.location.href or empty string
    return source.replace(
      /import\.meta\.url/g,
      '(typeof window !== "undefined" ? window.location.href : "")'
    );
  }
  return source;
};
