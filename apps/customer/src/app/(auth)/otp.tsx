import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChatCircleDots, CheckCircle } from 'phosphor-react-native';
import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import { AuthHeader, OTPInput } from '@/components/auth';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { useIsRTL } from '@/i18n/useIsRTL';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/theme/ThemeContext';
import { fonts } from '@/theme/fonts';

const RESEND_SECONDS = 42;

/** 6-digit email verification — matches `OTPVerificationScreen` in screens3.jsx. */
export default function OTPScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const isRTL = useIsRTL();
  const { email = '' } = useLocalSearchParams<{ email?: string }>();
  const [code, setCode] = useState('');
  const [secs, setSecs] = useState(RESEND_SECONDS);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const emphasisFont = isRTL ? fonts.arSans.bold : fonts.sans.bold;
  const linkFontFamily = isRTL ? fonts.arSans.bold : fonts.sans.bold;

  useEffect(() => {
    if (secs <= 0) return;
    const timer = setTimeout(() => setSecs((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secs]);

  const handleVerify = async () => {
    setError('');
    setLoading(true);
    const { error: verifyError } = await supabase.auth.verifyOtp({ email, token: code, type: 'recovery' });
    setLoading(false);
    if (verifyError) {
      setError(t('auth.errors.invalidCode'));
      return;
    }
    router.replace('/(auth)/reset-password');
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bgCanvas }}>
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
          <ChatCircleDots size={38} color="#fff" />
        </View>
      </AuthHeader>

      <ScrollView
        style={{ flex: 1, backgroundColor: theme.bgCanvas, borderTopLeftRadius: 26, borderTopRightRadius: 26, marginTop: -26 }}
        contentContainerStyle={{ padding: 24, paddingTop: 28, paddingBottom: 34 }}
        keyboardShouldPersistTaps="handled">
        <Text variant="h3" style={{ textAlign: 'center' }}>
          {t('auth.otp.title')}
        </Text>
        <Trans
          i18nKey="auth.otp.subtitleWithEmail"
          parent={Text}
          variant="small"
          color={theme.fg2}
          style={{ textAlign: 'center', lineHeight: 21, marginTop: 8, marginBottom: 24 }}
          values={{ email }}
          components={{ email: <Text style={{ fontFamily: emphasisFont, color: theme.fg1 }} /> }}
        />

        <OTPInput value={code} onChange={setCode} />

        <View style={{ marginTop: 20, alignItems: 'center' }}>
          {secs > 0 ? (
            <Trans
              i18nKey="auth.otp.resendIn"
              parent={Text}
              variant="small"
              color={theme.fg2}
              values={{ seconds: String(secs).padStart(2, '0') }}
              components={{ time: <Text style={{ fontFamily: emphasisFont, color: theme.fg1 }} /> }}
            />
          ) : (
            <Text onPress={() => setSecs(RESEND_SECONDS)} style={{ fontFamily: linkFontFamily, fontSize: 13, color: theme.brand }}>
              {t('auth.otp.resendCode')}
            </Text>
          )}
        </View>

        {!!error && (
          <Text variant="small" color={theme.danger} style={{ textAlign: 'center', marginTop: 12 }}>
            {error}
          </Text>
        )}

        <View style={{ marginTop: 20 }}>
          <Button full icon={CheckCircle} onPress={handleVerify} loading={loading}>
            {t('auth.otp.verifyAndContinue')}
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}
