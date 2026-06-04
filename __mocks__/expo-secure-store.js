// __mmocks__/expo-secure-store.js

const _store = {};

module.exports = {
  setItemAsync:    jest.fn(async (key, value) => { _store[key] = value; }),
  getItemAsync:    jest.fn(async (key) => _store[key] ?? null),
  deleteItemAsync: jest.fn(async (key) => { delete _store[key]; }),
};