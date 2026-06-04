// __mocks__/expo-slite.js

const mockDb = {
  execAsync:     jest.fn().mockResolvedValue(undefined),
  runAsync:      jest.fn().mockResolvedValue({ lastInsertRowId: 1, changes: 1 }),
  getAllAsync:    jest.fn().mockResolvedValue([]),
  getFirstAsync: jest.fn().mockResolvedValue(null),
};

module.exports = {
  openDatabaseSync: jest.fn(() => mockDb),
  __mockDb: mockDb,
};