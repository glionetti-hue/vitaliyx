import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { useAuthStore } from '../store/authStore';
import { useAppStore }  from '../store/appStore';

// Screens
import LoginScreen from '../screens/LoginScreen';
import PairingScreen from '../screens/PairingScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ECGScreen from '../screens/ECGScreen';
import RecommendationScreen from '../screens/RecommendationScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MetricDetailScreen from '../screens/MetricDetailScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import GoalsScreen from '../screens/GoalsScreen';
import SleepScreen from '../screens/SleepScreen';
import HealthConnectScreen from '../screens/HealthConnectScreen';
import StressScreen from '../screens/StressScreen';
import BodyCompositionScreen from '../screens/BodyCompositionScreen';
import BloodComponentsScreen from '../screens/BloodComponentsScreen';
import WorkoutScreen from '../screens/WorkoutScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

// ─── Icone SVG tab bar ────────────────────────────────────────────────────────
function IconHome({ color, size }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z"
        stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </Svg>
  );
}

function IconECG({ color, size }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M2 12H6L9 5L12 19L15 9L17 12H22"
        stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function IconPatch({ color, size }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="18" height="18" rx="4"
        stroke={color} strokeWidth="2" />
      <Path d="M12 8V16M8 12H16"
        stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function IconHistory({ color, size }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 3V15H21" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Path d="M7 11L11 7L15 10L20 5"
        stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function IconProfile({ color, size }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2" />
      <Path d="M4 20C4 17 7.6 15 12 15C16.4 15 20 17 20 20"
        stroke={color} strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

const TAB_ICONS = {
  Dashboard:      IconHome,
  ECG:            IconECG,
  Recommendation: IconPatch,
  History:        IconHistory,
  Profile:        IconProfile,
};

function TabIcon({ name, focused }) {
  const IconComponent = TAB_ICONS[name];
  const color = focused ? colors.cyan : colors.textMuted;
  return (
    <View style={[tabStyles.iconWrap, focused && tabStyles.iconWrapActive]}>
      {IconComponent ? <IconComponent color={color} size={22} /> : null}
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: tabStyles.tabBar,
        tabBarActiveTintColor: colors.cyan,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: tabStyles.tabLabel,
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="ECG"
        component={ECGScreen}
        options={{ tabBarLabel: 'ECG' }}
      />
      <Tab.Screen
        name="Recommendation"
        component={RecommendationScreen}
        options={{ tabBarLabel: 'Patch X' }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{ tabBarLabel: 'Storico' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profilo' }}
      />
    </Tab.Navigator>
  );
}

const NAV_THEME = {
  dark: true,
  colors: {
    primary:      colors.cyan,
    background:   colors.background,
    card:         colors.card,
    text:         colors.text,
    border:       colors.border,
    notification: colors.cyan,
  },
};

export default function AppNavigator() {
  const { token }        = useAuthStore();
  const { onboardingDone } = useAppStore();

  return (
    <NavigationContainer theme={NAV_THEME}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!onboardingDone ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : !token ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="Pairing"
              component={PairingScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen
              name="MetricDetail"
              component={MetricDetailScreen}
              options={{ presentation: 'card', animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="Goals"
              component={GoalsScreen}
              options={{ presentation: 'card', animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="Sleep"
              component={SleepScreen}
              options={{ presentation: 'card', animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="HealthConnect"
              component={HealthConnectScreen}
              options={{ presentation: 'card', animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="Stress"
              component={StressScreen}
              options={{ presentation: 'card', animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="BodyComposition"
              component={BodyCompositionScreen}
              options={{ presentation: 'card', animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="BloodComponents"
              component={BloodComponentsScreen}
              options={{ presentation: 'card', animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="Workout"
              component={WorkoutScreen}
              options={{ presentation: 'card', animation: 'slide_from_right' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const tabStyles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.card,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: 72,
    paddingBottom: 12,
    paddingTop: 8,
  },
  tabLabel: {
    fontFamily: fonts.medium,
    fontSize: 10,
    marginTop: 2,
  },
  iconWrap: {
    width: 36,
    height: 28,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapActive: {
    backgroundColor: colors.cyan + '22',
  },
  iconText: {
    fontSize: 18,
    opacity: 0.5,
  },
  iconTextActive: {
    opacity: 1,
  },
});
