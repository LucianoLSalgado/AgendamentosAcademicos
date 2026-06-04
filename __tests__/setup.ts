// __tests__/setup.ts

jest.mock(
  '@react-native-async-storage/async-storage',
  () => require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('expo-router', () => ({
  useRouter:   jest.fn(() => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() })),
  useSegments: jest.fn(() => []),
  usePathname: jest.fn(() => '/'),
  Link:        ({ children }: any) => children,
  Slot:        jest.fn(() => null),
  Stack:       { Screen: jest.fn() },
  Tabs:        { Screen: jest.fn() },
}));

// Suprime o aviso de deprecação do react-test-renderer no React 19
// O aviso é informativo — não afeta o comportamento dos testes
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation((msg) => {
    if (typeof msg === 'string' && msg.includes('react-test-renderer is deprecated')) return;
    console.error(msg);
  });
});