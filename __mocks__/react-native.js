// __mocks__/react-native.js

module.exports = {
  View:              'View',
  Text:              'Text',
  TouchableOpacity:  'TouchableOpacity',
  TextInput:         'TextInput',
  ScrollView:        'ScrollView',
  FlatList:          'FlatList',
  Modal:             'Modal',
  ActivityIndicator: 'ActivityIndicator',
  StyleSheet: {
    create:  (s) => s,
    flatten: (s) => (Array.isArray(s) ? Object.assign({}, ...s.filter(Boolean)) : s || {}),
    hairlineWidth: 1,
    absoluteFill: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  },
  Platform:   { OS: 'android', select: (obj) => obj.android ?? obj.default },
  Alert:      { alert: jest.fn() },
  Dimensions: { get: jest.fn(() => ({ width: 375, height: 812 })) },
};