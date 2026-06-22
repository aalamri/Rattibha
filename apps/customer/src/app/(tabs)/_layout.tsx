import { Tabs } from 'expo-router/js-tabs';
import {
  CalendarCheck,
  ChatCircle,
  Compass,
  Megaphone,
  User,
  type Icon,
} from 'phosphor-react-native';
import { useTranslation } from 'react-i18next';
import { Text } from 'react-native';

import { useIsRTL } from '@/i18n/useIsRTL';
import { useTheme } from '@/theme/ThemeContext';
import { fonts } from '@/theme/fonts';

const TAB_ICONS: Record<string, Icon> = {
  index: Compass,
  requests: Megaphone,
  bookings: CalendarCheck,
  messages: ChatCircle,
  profile: User,
};

const TAB_NAMES = ['index', 'requests', 'bookings', 'messages', 'profile'] as const;

/** Bottom tab navigator — matches `BottomNav` in screens2.jsx. */
export default function TabsLayout() {
  const theme = useTheme();
  const { t } = useTranslation();
  const isRTL = useIsRTL();
  const activeFont = isRTL ? fonts.arSans.bold : fonts.sans.bold;
  const inactiveFont = isRTL ? fonts.arSans.semibold : fonts.sans.semibold;
  // The native tab bar always renders tabs in array order — unlike CSS flex,
  // it never auto-mirrors for RTL — so Discover (the primary/first tab)
  // needs to be explicitly reordered to the right end in Arabic.
  const tabOrder = isRTL ? [...TAB_NAMES].reverse() : TAB_NAMES;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.brand,
        tabBarInactiveTintColor: theme.fg3,
        tabBarStyle: {
          backgroundColor: 'rgba(250,247,242,0.92)',
          borderTopWidth: 1,
          borderTopColor: theme.border,
          paddingTop: 8,
          height: 64,
        },
      }}>
      {tabOrder.map((name) => {
        const IconComp = TAB_ICONS[name];
        const labelKey = name === 'index' ? 'discover' : name;
        const label = t(`nav.${labelKey}`);
        return (
          <Tabs.Screen
            key={name}
            name={name}
            options={{
              title: label,
              tabBarIcon: ({ color, focused }) => (
                <IconComp size={23} color={color as string} weight={focused ? 'fill' : 'regular'} />
              ),
              tabBarLabel: ({ color, focused }) => (
                <Text style={{ fontFamily: focused ? activeFont : inactiveFont, fontSize: 10.5, color }}>
                  {label}
                </Text>
              ),
            }}
          />
        );
      })}
    </Tabs>
  );
}
