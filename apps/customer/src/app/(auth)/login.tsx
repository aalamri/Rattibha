import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ArrowRight, EnvelopeSimple, Eye, EyeSlash, LockSimple } from 'phosphor-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { AuthHeader } from '@/components/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/Text';
import { useIsRTL } from '@/i18n/useIsRTL';
import { supabase } from '@/lib/supabase';
import { fonts } from '@/theme/fonts';
import { useTheme } from '@/theme/ThemeContext';
/** Sign-in screen — matches `LoginScreen` in screens3.jsx. */
export default function LoginScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const isRTL = useIsRTL();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const linkFontFamily = isRTL ? fonts.arSans.bold : fonts.sans.bold;

  const handleSignIn = async () => {
    setError('');
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      setError(t('auth.errors.invalidCredentials'));
      return;
    }
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.bgCanvas }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <AuthHeader height={260} glyphWidth={190}>
        <Image
          source={require('@/assets/images/brand/logo-primary-light.png')}
          contentFit="contain"
          style={{ width: 95, height: 96 }}
        />
      </AuthHeader>

      <ScrollView
        style={{ flex: 1, backgroundColor: theme.bgCanvas, borderTopLeftRadius: 26, borderTopRightRadius: 26, marginTop: -26 }}
        contentContainerStyle={{ padding: 24, paddingTop: 28, paddingBottom: 34 }}
        keyboardShouldPersistTaps="handled">
        <Text variant="h3" style={{ textAlign: 'center' }}>
          {t('auth.login.title')}
        </Text>
        <Text variant="small" color={theme.fg2} style={{ textAlign: 'center', marginTop: 6, marginBottom: 22 }}>
          {t('auth.login.subtitle')}
        </Text>

        <Input
          label={t('fields.email')}
          placeholder={t('fields.emailPlaceholder')}
          icon={EnvelopeSimple}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <View style={{ height: 14 }} />
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

        <Text
          onPress={() => router.push('/(auth)/forgot-password')}
          style={{
            fontFamily: linkFontFamily,
            fontSize: 12.5,
            color: theme.brand,
            marginTop: 10,
            alignSelf: isRTL ? 'flex-start' : 'flex-end',
          }}>
          {t('auth.login.forgotPassword')}
        </Text>

        {!!error && (
          <Text variant="small" color={theme.danger} style={{ textAlign: 'center', marginTop: 12 }}>
            {error}
          </Text>
        )}

        <View style={{ marginTop: 16 }}>
          <Button full icon={ArrowRight} onPress={handleSignIn} loading={loading}>
            {t('auth.login.signIn')}
          </Button>
        </View>

        <Text variant="small" color={theme.fg2} style={{ textAlign: 'center', marginTop: 20 }}>
          {t('auth.login.newHere')}
          <Text onPress={() => router.push('/(auth)/register')} style={{ fontFamily: linkFontFamily, color: theme.brand }}>
            {t('auth.login.createAccount')}
          </Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
