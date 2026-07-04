import { useRouter } from 'expo-router';
import {
  Bell,
  CaretRight,
  CircleHalfTilt,
  CreditCard,
  Gear,
  Globe,
  Heart,
  PencilSimple,
  Question,
  SignOut,
} from 'phosphor-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { Text } from '@/components/ui/Text';
import { setAppLanguage, type AppLanguage } from '@/i18n';
import { useIsRTL } from '@/i18n/useIsRTL';
import { useAuth } from '@/lib/AuthContext';
import { useTheme, useThemeMode } from '@/theme/ThemeContext';
import { fonts } from '@/theme/fonts';
import { radii, shadows } from '@/theme/tokens';

interface MenuRowProps {
  icon: React.ComponentType<{ size: number; color: string; weight?: string }>;
  label: string;
  note?: string;
  onPress?: () => void;
  isRTL: boolean;
  last?: boolean;
  danger?: boolean;
}

function MenuRow({ icon: Icon, label, note, onPress, isRTL, last, danger }: MenuRowProps) {
  const theme = useTheme();
  const row = { flexDirection: isRTL ? ('row-reverse' as const) : ('row' as const) };
  return (
    <Pressable onPress={onPress}>
      <View
        style={[
          row,
          {
            alignItems: 'center',
            gap: 14,
            paddingVertical: 15,
            paddingHorizontal: 16,
            borderBottomWidth: last ? 0 : 1,
            borderBottomColor: theme.border,
          },
        ]}>
        <Icon size={20} color={danger ? theme.danger : theme.brand} />
        <Text
          style={{
            flex: 1,
            fontFamily: isRTL ? fonts.arSans.medium : fonts.sans.medium,
            fontSize: 14.5,
            color: danger ? theme.danger : theme.fg1,
          }}>
          {label}
        </Text>
        {note && (
          <Text variant="small" color={theme.fg3}>
            {note}
          </Text>
        )}
        {!danger && <CaretRight size={15} color={theme.fg3} style={isRTL ? { transform: [{ scaleX: -1 }] } : undefined} />}
      </View>
    </Pressable>
  );
}

function StatBox({ value, label, isRTL }: { value: string; label: string; isRTL: boolean }) {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 2 }}>
      <Text
        style={{
          fontFamily: isRTL ? fonts.arDisplay.semibold : fonts.display.semibold,
          fontSize: 22,
          color: theme.fg1,
        }}>
        {value}
      </Text>
      <Text variant="caption" color={theme.fg3} style={{ textAlign: 'center' }}>
        {label}
      </Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const isRTL = useIsRTL();
  const theme = useTheme();
  const { mode, setMode } = useThemeMode();
  const router = useRouter();
  const { profile, signOut } = useAuth();
  const row = { flexDirection: isRTL ? ('row-reverse' as const) : ('row' as const) };
  const lang = i18n.language;

  const name = profile?.full_name ?? '—';
  const seed = profile?.avatar_seed ?? 0;

  const rows: MenuRowProps[] = [
    { icon: Heart, label: t('profile.rows.savedPlanners'), note: '—', onPress: () => {}, isRTL },
    { icon: CreditCard, label: t('profile.rows.paymentMethods'), onPress: () => {}, isRTL },
    { icon: Bell, label: t('profile.rows.notifications'), onPress: () => router.push('/notifications'), isRTL },
    {
      icon: Globe,
      label: t('profile.rows.language') + ` · ${lang === 'ar' ? 'العربية' : 'English'}`,
      onPress: () => setAppLanguage((lang === 'ar' ? 'en' : 'ar') as AppLanguage),
      isRTL,
    },
    {
      icon: CircleHalfTilt,
      label: t('profile.rows.appearance'),
      note: t(`profile.appearance.${mode}`),
      onPress: () => setMode(mode === 'system' ? 'light' : mode === 'light' ? 'dark' : 'system'),
      isRTL,
    },
    { icon: Gear, label: t('profile.rows.settings'), onPress: () => {}, isRTL },
    { icon: Question, label: t('profile.rows.helpSupport'), onPress: () => {}, isRTL, last: true },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.bgCanvas }} contentContainerStyle={{ paddingBottom: 110 }}>
      <SafeAreaView edges={['top']}>
        {/* header row */}
        <View style={[row, { justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingTop: 6, marginBottom: 14 }]}>
          <Text variant="h2">
            {t('profile.title')}
          </Text>
        </View>

        <View style={{ paddingHorizontal: 18, gap: 14 }}>
          {/* identity card */}
          <View
            style={[
              shadows.sm,
              row,
              {
                alignItems: 'center',
                gap: 14,
                backgroundColor: theme.bgSurface,
                borderWidth: 1,
                borderColor: theme.border,
                borderRadius: radii.lg,
                padding: 16,
              },
            ]}>
            <Avatar seed={seed} size={58} initials={name.charAt(0)} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text
                style={{
                  fontFamily: isRTL ? fonts.arDisplay.semibold : fonts.display.semibold,
                  fontSize: 21,
                  color: theme.fg1,
                }}
                numberOfLines={1}>
                {name}
              </Text>
              <Text variant="small" color={theme.fg3} numberOfLines={1}>
                {profile?.phone ?? ''}
              </Text>
            </View>
            <Pressable
              onPress={() => {}}
              style={{
                width: 36,
                height: 36,
                borderRadius: radii.pill,
                borderWidth: 1.5,
                borderColor: theme.border,
                backgroundColor: theme.bgSurface,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <PencilSimple size={18} color={theme.brand} />
            </Pressable>
          </View>

          {/* stats */}
          <View
            style={[
              row,
              {
                backgroundColor: theme.bgSurface,
                borderWidth: 1,
                borderColor: theme.border,
                borderRadius: radii.lg,
                paddingVertical: 16,
              },
            ]}>
            <StatBox value="3" label={t('profile.eventsPlanned')} isRTL={isRTL} />
            <View style={{ width: 1, backgroundColor: theme.border }} />
            <StatBox value="8" label={t('profile.saved')} isRTL={isRTL} />
            <View style={{ width: 1, backgroundColor: theme.border }} />
            <StatBox value="4.9" label={t('profile.avgRating')} isRTL={isRTL} />
          </View>

          {/* menu */}
          <View
            style={{
              backgroundColor: theme.bgSurface,
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: radii.lg,
              overflow: 'hidden',
            }}>
            {rows.map((r) => (
              <MenuRow key={r.label} {...r} />
            ))}
          </View>

          {/* sign out */}
          <View
            style={{
              backgroundColor: theme.bgSurface,
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: radii.lg,
              overflow: 'hidden',
            }}>
            <MenuRow
              icon={SignOut}
              label={t('profile.signOut')}
              onPress={signOut}
              isRTL={isRTL}
              last
              danger
            />
          </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
}
