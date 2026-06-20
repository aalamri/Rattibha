import { useRouter } from 'expo-router';
import { EnvelopeSimple, LockKey, PaperPlaneRight } from 'phosphor-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { AuthHeader } from '@/components/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/Text';
import { useIsRTL } from '@/i18n/useIsRTL';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/theme/ThemeContext';
import { fonts } from '@/theme/fonts';

/** Email-based password reset — matches `ForgotPasswordScreen` in screens3.jsx. */
export default function ForgotPasswordScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const isRTL = useIsRTL();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const linkFontFamily = isRTL ? fonts.arSans.bold : fonts.sans.bold;

  const handleSendCode = async () => {
    setError('');
    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
    if (resetError) {
      setError(t('auth.errors.generic'));
      return;
    }
    router.push({ pathname: '/(auth)/otp', params: { email } });
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.bgCanvas }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <AuthHeader height={210} glyphWidth={170} onBack={() => router.back()}>
        <View
          style={{
            width: 76,
            height: 76,
            borderRadius: 22,
            backgroundColor: 'rgba(255,255,255,0.16)',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <LockKey size={38} color="#fff" />
        </View>
      </AuthHeader>

      <ScrollView
        style={{ flex: 1, backgroundColor: theme.bgCanvas, borderTopLeftRadius: 26, borderTopRightRadius: 26, marginTop: -26 }}
        contentContainerStyle={{ padding: 24, paddingTop: 28, paddingBottom: 34 }}
        keyboardShouldPersistTaps="handled">
        <Text variant="h3" style={{ textAlign: 'center' }}>
          {t('auth.forgotPassword.title')}
        </Text>
        <Text variant="small" color={theme.fg2} style={{ textAlign: 'center', lineHeight: 21, marginTop: 8, marginBottom: 22 }}>
          {t('auth.forgotPassword.subtitle')}
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

        {!!error && (
          <Text variant="small" color={theme.danger} style={{ textAlign: 'center', marginTop: 12 }}>
            {error}
          </Text>
        )}

        <View style={{ marginTop: 18 }}>
          <Button full icon={PaperPlaneRight} onPress={handleSendCode} loading={loading}>
            {t('auth.forgotPassword.sendCode')}
          </Button>
        </View>

        <Text variant="small" color={theme.fg2} style={{ textAlign: 'center', marginTop: 20 }}>
          {t('auth.forgotPassword.rememberedIt')}
          <Text onPress={() => router.push('/(auth)/login')} style={{ fontFamily: linkFontFamily, color: theme.brand }}>
            {t('auth.forgotPassword.backToSignIn')}
          </Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
