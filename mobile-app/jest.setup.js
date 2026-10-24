// The store talks to AsyncStorage directly, so tests run against the in-memory mock the package
// ships rather than a stub of our own.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
