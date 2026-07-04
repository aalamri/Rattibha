import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ArrowRight, EnvelopeSimple, Eye, EyeSlash, LockSimple, Phone, User } from 'phosphor-react-native';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';

import { AuthHeader, Checkbox, Divider, SocialRow } from '@/components/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/Text';
import { useToast } from '@/components/ui/Toast';
import { useIsRTL } from '@/i18n/useIsRTL';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/theme/ThemeContext';
import { fonts } from '@/theme/fonts';

/** Sign-up screen — matches `RegisterScreen` in screens3.jsx. */
export default function RegisterScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const isRTL = useIsRTL();
  const { show: showToast } = useToast();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const linkFontFamily = isRTL ? fonts.arSans.bold : fonts.sans.bold;

  const linkStyle = { color: theme.brand, fontFamily: linkFontFamily };

  const handleCreateAccount = async () => {
    setError('');

    if (password.length < 6) {
      setError(t('auth.errors.weakPassword'));
      return;
    }

    setLoading(true);

    // full_name/phone also go into user_metadata (not just the profiles
    // insert below) because that insert requires an authenticated session —
    // if the project has email confirmation enabled, signUp() returns no
    // session yet, and metadata is the only place this data survives until
    // AuthContext can create the profile row after the user confirms.
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, phone: mobile || null } },
    });
    if (signUpError) {
      setLoading(false);
      const message = signUpError.message.toLowerCase();
      if (message.includes('already')) {
        setError(t('auth.errors.emailInUse'));
      } else if (message.includes('password')) {
        // Only claim "weak password" when Supabase's own message says so —
        // our client-side check above already confirmed 6+ characters, so
        // this means a stricter server-side policy (e.g. Supabase project
        // configured to require more than 6, or additional complexity).
        setError(t('auth.errors.weakPassword'));
      } else {
        // Surface the real reason rather than defaulting to "weak
        // password" for errors that have nothing to do with the password
        // (rate limiting, disabled email signups, network issues, etc.) —
        // that mismatch was the bug: every non-"already registered" error
        // was shown as a password complaint regardless of the actual cause.
        setError(signUpError.message);
      }
      return;
    }

    if (!data.session) {
      // Email confirmation required — there's no authenticated session yet,
      // so a profiles insert here would just fail RLS. AuthContext creates
      // the profile from user_metadata on the user's first authenticated
      // load after they confirm.
      setLoading(false);
      showToast(t('auth.register.confirmEmailSent'));
      router.replace('/(auth)/login');
      return;
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.session.user.id,
      role: 'customer',
      full_name: fullName,
      phone: mobile || null,
    });

    setLoading(false);

    if (profileError) {
      setError(t('auth.errors.generic'));
      return;
    }

    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.bgCanvas }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <AuthHeader height={210} glyphWidth={170} onBack={() => router.back()}>
        <Image
          source={require('@/assets/images/brand/logo-primary-light.png')}
          contentFit="contain"
          style={{ width: 71, height: 72 }}
        />
      </AuthHeader>

      <ScrollView
        style={{ flex: 1, backgroundColor: theme.bgCanvas, borderTopLeftRadius: 26, borderTopRightRadius: 26, marginTop: -26 }}
        contentContainerStyle={{ padding: 24, paddingTop: 26, paddingBottom: 30 }}
        keyboardShouldPersistTaps="handled">
        <Text variant="h3" style={{ textAlign: 'center' }}>
          {t('auth.register.title')}
        </Text>
        <Text variant="small" color={theme.fg2} style={{ textAlign: 'center', marginTop: 6, marginBottom: 22 }}>
          {t('auth.register.subtitle')}
        </Text>

        <Input label={t('fields.fullName')} placeholder={t('fields.fullNamePlaceholder')} icon={User} value={fullName} onChangeText={setFullName} />
        <View style={{ height: 13 }} />
        <Input
          label={t('fields.email')}
          placeholder={t('fields.emailPlaceholder')}
          icon={EnvelopeSimple}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <View style={{ height: 13 }} />
        <Input label={t('fields.mobile')} placeholder={t('fields.mobilePlaceholder')} icon={Phone} value={mobile} onChangeText={setMobile} keyboardType="phone-pad" />
        <View style={{ height: 13 }} />
        <Input
          label={t('fields.password')}
          placeholder={t('fields.passwordPlaceholder')}
          icon={LockSimple}
          trailingIcon={showPassword ? EyeSlash : Eye}
          onTrailingIconPress={() => setShowPassword((v) => !v)}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />

        <Pressable
          onPress={() => setAgree((a) => !a)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: agree }}
          style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 10, marginTop: 16 }}>
          <Checkbox checked={agree} onChange={setAgree} />
          <Trans
            i18nKey="auth.register.agreeToTerms"
            parent={Text}
            variant="caption"
            color={theme.fg2}
            style={{ flex: 1, lineHeight: 18 }}
            components={{
              terms: <Text style={linkStyle} />,
              privacy: <Text style={linkStyle} />,
            }}
          />
        </Pressable>

        {!!error && (
          <Text variant="small" color={theme.danger} style={{ textAlign: 'center', marginTop: 14 }}>
            {error}
          </Text>
        )}

        <View style={{ marginTop: 18 }}>
          <Button full icon={ArrowRight} onPress={handleCreateAccount} loading={loading} disabled={!agree}>
            {t('auth.register.createAccount')}
          </Button>
        </View>

        <Divider label={t('auth.register.orSignUpWith')} />

        <SocialRow onPressApple={() => {}} onPressGoogle={() => {}} />

        <Text variant="small" color={theme.fg2} style={{ textAlign: 'center', marginTop: 20 }}>
          {t('auth.register.alreadyHaveAccount')}
          <Text onPress={() => router.push('/(auth)/login')} style={linkStyle}>
            {t('auth.register.signIn')}
          </Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
