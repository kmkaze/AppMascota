import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';

import Pet from '../components/Pet';
import { colors } from '../theme/colors';
import { spacing, borderRadius, typography } from '../theme/spacing';

import DragRotateScreen from '../screens/DragRotateScreen';
import LoadingScreen from '../screens/LoadingScreen';
import MultitouchScreen from '../screens/MultitouchScreen';
import BounceScreen from '../screens/BounceScreen';
import CarouselScreen from '../screens/CarouselScreen';
import ShakeScreen from '../screens/ShakeScreen';

export type DrawerParamList = {
  DragRotate: undefined;
  Loading: undefined;
  Multitouch: undefined;
  Bounce: undefined;
  Carousel: undefined;
  Shake: undefined;
};

const Drawer = createDrawerNavigator<DrawerParamList>();

interface ScreenConfig {
  name: keyof DrawerParamList;
  component: React.ComponentType<any>;
  label: string;
  subtitle: string;
  icon: string;
  emoji: string;
  headerTitle: string;
}

const SCREENS: ScreenConfig[] = [
  {
    name: 'DragRotate',
    component: DragRotateScreen,
    label: 'Pasear',
    subtitle: 'Drag & Rotate',
    icon: 'footsteps-outline',
    emoji: '🐾',
    headerTitle: '🐾 Pasear',
  },
  {
    name: 'Loading',
    component: LoadingScreen,
    label: 'Despertar',
    subtitle: 'Loading Animation',
    icon: 'sunny-outline',
    emoji: '☀️',
    headerTitle: '☀️ Despertar',
  },
  {
    name: 'Multitouch',
    component: MultitouchScreen,
    label: 'Decorar',
    subtitle: 'Multitouch Gestures',
    icon: 'hand-left-outline',
    emoji: '✨',
    headerTitle: '✨ Decorar',
  },
  {
    name: 'Bounce',
    component: BounceScreen,
    label: 'Acariciar',
    subtitle: 'Bounce Animation',
    icon: 'heart-outline',
    emoji: '💖',
    headerTitle: '💖 Acariciar',
  },
  {
    name: 'Carousel',
    component: CarouselScreen,
    label: 'Elegir',
    subtitle: 'Animated Carousel',
    icon: 'apps-outline',
    emoji: '🎠',
    headerTitle: '🎠 Elegir',
  },
  {
    name: 'Shake',
    component: ShakeScreen,
    label: 'Asustar',
    subtitle: 'Accelerometer Shake',
    icon: 'phone-portrait-outline',
    emoji: '📱',
    headerTitle: '📱 Asustar',
  },
];

// ── Custom drawer content ──────────────────────────────────────────────────
const CustomDrawerContent: React.FC<DrawerContentComponentProps> = (props) => {
  const { state, navigation } = props;
  const activeIndex = state.index;

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.scrollContainer}
    >
      {/* Header with Pet mascot */}
      <View style={styles.header}>
        <Pet size={88} expression="happy" />
        <Text style={styles.appName}>PetLab</Text>
        <Text style={styles.appSubtitle}>Tu mascota virtual 🐾</Text>
      </View>

      <View style={styles.divider} />

      {/* Menu items */}
      <View style={styles.menuContainer}>
        {SCREENS.map((screen, index) => {
          const isActive = activeIndex === index;
          return (
            <TouchableOpacity
              key={screen.name}
              style={[styles.menuItem, isActive && styles.menuItemActive]}
              onPress={() => navigation.navigate(screen.name)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconWrapper, isActive && styles.iconWrapperActive]}>
                <Ionicons
                  // @ts-ignore — icon string is known-valid
                  name={screen.icon}
                  size={20}
                  color={isActive ? colors.primary : colors.textLight}
                />
              </View>
              <View style={styles.menuTextBlock}>
                <Text style={[styles.menuLabel, isActive && styles.menuLabelActive]}>
                  {screen.emoji} {screen.label}
                </Text>
                <Text style={styles.menuSubtitle}>{screen.subtitle}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </DrawerContentScrollView>
  );
};

// ── Navigator ──────────────────────────────────────────────────────────────
const DrawerNavigator: React.FC = () => (
  <Drawer.Navigator
    drawerContent={(props) => <CustomDrawerContent {...props} />}
    screenOptions={{
      headerStyle: { backgroundColor: colors.background },
      headerShadowVisible: false,
      headerTintColor: colors.primary,
      headerTitleStyle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
      },
      drawerStyle: {
        backgroundColor: colors.drawerBackground,
        width: 290,
      },
      drawerType: 'front',
      swipeEdgeWidth: 50,
    }}
  >
    {SCREENS.map((screen) => (
      <Drawer.Screen
        key={screen.name}
        name={screen.name}
        component={screen.component}
        options={{ title: screen.headerTitle }}
      />
    ))}
  </Drawer.Navigator>
);

// ── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1 },

  header: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  appName: {
    ...typography.h1,
    color: colors.primary,
    marginTop: spacing.sm,
  },
  appSubtitle: {
    ...typography.caption,
    color: colors.textLight,
    marginTop: spacing.xs,
  },

  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },

  menuContainer: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  menuItemActive: { backgroundColor: colors.drawerActive },

  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  iconWrapperActive: { backgroundColor: colors.drawerActive },

  menuTextBlock: { flex: 1 },
  menuLabel: { ...typography.label, color: colors.text },
  menuLabelActive: { color: colors.primary, fontWeight: '700' },
  menuSubtitle: { ...typography.caption, color: colors.textLight, marginTop: 1 },
});

export default DrawerNavigator;
