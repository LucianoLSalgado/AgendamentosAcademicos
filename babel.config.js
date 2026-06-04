// babel.config.js
module.exports = function (api) {
  api.cache(true);

  // Quando roda via Jest, usa presets simples para Node.js
  if (process.env.NODE_ENV === 'test') {
    return {
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        '@babel/preset-typescript',
        ['@babel/preset-react', { runtime: 'automatic' }],
      ],
    };
  }

  // Quando roda via Metro (expo start / expo run:android), usa o preset oficial
  return {
    presets: ['babel-preset-expo'],
  };
};