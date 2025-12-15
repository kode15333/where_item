import 'react-native-gesture-handler/jestSetup';

jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock expo-file-system
jest.mock('expo-file-system', () => ({
    documentDirectory: 'file:///test-directory/',
    cacheDirectory: 'file:///test-cache/',
    makeDirectoryAsync: jest.fn(),
    getInfoAsync: jest.fn(() => Promise.resolve({ exists: true })),
    copyAsync: jest.fn(),
    deleteAsync: jest.fn(),
}));
