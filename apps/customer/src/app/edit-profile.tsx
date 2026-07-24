import { useRouter } from 'expo-router';
import { ArrowClockwise, ArrowLeft, Check, Phone, User } from 'phosphor-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import { useIsRTL } from '@/i18n/useIsRTL';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/theme/ThemeContext';
import { radii } from '@/theme/tokens';

export default function EditProfileScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const isRTL = useIsRTL();
  const router = useRouter();
  const { session, profile } = useAuth();
  const { show: showToast } = useToast();
  const row = { flexDirection: isRTL ? ('row-reverse' as const) : ('row' as const) };

  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [seed, setSeed] = useState(profile?.avatar_seed ?? 0);
  const [saving, setSaving] = useState(false);

  // AuthContext fetches `profile` asynchronously after `session` resolves,
  // so it's very likely still null on this screen's first render — sync
  // the form once it arrives instead of only seeding state at mount.
  const [prevProfile, setPrevProfile] = useState(profile);
  if (profile !== prevProfile) {
    setPrevProfile(profile);
    if (profile) {
      setFullName(profile.full_name ?? '');
      setPhone(profile.phone ?? '');
      setSeed(profile.avatar_seed ?? 0);
    }
  }

  async function handleSave() {
    if (!session?.user.id) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim(), phone: phone.trim() || null, avatar_seed: seed })
      .eq('id', session.user.id);
    setSaving(false);

    if (error) {
      showToast(t('toast.error'));
      return;
    }

    showToast(t('profile.editProfile.saved'));
    router.back();
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.bgCanvas }}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View style={[row, { alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingTop: 8, paddingBottom: 12 }]}>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
            style={{
              width: 38,
              height: 38,
              borderRadius: radii.pill,
              borderWidth: 1.5,
              borderColor: theme.border,
              backgroundColor: theme.bgSurface,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            {isRTL ? <ArrowLeft size={18} color={theme.fg1} style={{ transform: [{ scaleX: -1 }] }} /> : <ArrowLeft size={18} color={theme.fg1} />}
          </Pressable>
          <Text variant="h3">{t('profile.editProfile.title')}</Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: 18, gap: 18 }}>
          <View style={{ alignItems: 'center', gap: 10 }}>
            <Avatar seed={seed} size={72} initials={fullName.charAt(0) || '—'} />
            <Pressable
              onPress={() => setSeed((s) => (s + 1) % 1000)}
              style={[row, { alignItems: 'center', gap: 6 }]}>
              <ArrowClockwise size={15} color={theme.brand} />
              <Text style={{ color: theme.brand, fontSize: 13 }}>{t('profile.editProfile.shuffleAvatar')}</Text>
            </Pressable>
          </View>

          <Input
            label={t('fields.fullName')}
            placeholder={t('fields.fullNamePlaceholder')}
            icon={User}
            value={fullName}
            onChangeText={setFullName}
          />
          <Input
            label={t('fields.mobile')}
            placeholder={t('fields.mobilePlaceholder')}
            icon={Phone}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <Button full icon={Check} onPress={handleSave} loading={saving} disabled={!fullName.trim()}>
            {t('profile.editProfile.save')}
          </Button>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
