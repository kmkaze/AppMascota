export const colors = {
  // Backgrounds
  background: '#FFF5F7',
  surface: '#FFFFFF',

  // Brand
  primary: '#FF6B9D',
  secondary: '#C77DFF',
  accent: '#FFB347',

  // Pet anatomy
  petBody: '#FFB6C1',
  petInnerEar: '#FF9FB0',
  petEye: '#3D2B56',
  petMouth: '#D95F7E',
  petBlush: '#FFB0C0',

  // Text
  text: '#3D3D3D',
  textLight: '#8A8A8A',
  textOnPrimary: '#FFFFFF',

  // UI
  border: '#FFD6E7',
  divider: '#FFE4EE',
  cardShadow: 'rgba(0,0,0,0.09)',

  // Drawer
  drawerBackground: '#FFF0F5',
  drawerActive: '#FFE4EE',

  // Semantic
  success: '#7BC67E',
  warning: '#FFD166',
  error: '#EF476F',

  white: '#FFFFFF',
  transparent: 'transparent',
} as const;

export type ColorKey = keyof typeof colors;
