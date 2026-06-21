import { useRouter } from 'expo-router';
import { CheckCircle, Eye, EyeSlash, LockSimple } from 'phosphor-react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { AuthHeader } from '@/components/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Text } from '@/components/ui/Text';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/theme/ThemeContext';

/** Set a new password after OTP recovery verification — final step of the forgot-password flow. */
export default function ResetPasswordScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setError('');

    if (password.length < 6) {
      setError(t('auth.errors.weakPassword'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('auth.errors.passwordMismatch'));
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError(t('auth.errors.generic'));
      return;
    }
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.bgCanvas }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <AuthHeader height={210} glyphWidth={170}>
        <View
          style={{
            width: 76,
            height: 76,
            borderRadius: 22,
            backgroundColor: 'rgba(255,255,255,0.16)',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <LockSimple size={38} color="#fff" />
        </View>
      </AuthHeader>

      <ScrollView
        style={{ flex: 1, backgroundColor: theme.bgCanvas, borderTopLeftRadius: 26, borderTopRightRadius: 26, marginTop: -26 }}
        contentContainerStyle={{ padding: 24, paddingTop: 28, paddingBottom: 34 }}
        keyboardShouldPersistTaps="handled">
        <Text variant="h3" style={{ textAlign: 'center' }}>
          {t('auth.resetPassword.title')}
        </Text>
        <Text variant="small" color={theme.fg2} style={{ textAlign: 'center', lineHeight: 21, marginTop: 8, marginBottom: 22 }}>
          {t('auth.resetPassword.subtitle')}
        </Text>

        <Input
          label={t('fields.newPassword')}
          placeholder={t('fields.passwordPlaceholder')}
          icon={LockSimple}
          trailingIcon={showPassword ? EyeSlash : Eye}
          onTrailingIconPress={() => setShowPassword((v) => !v)}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <View style={{ height: 14 }} />
        <Input
          label={t('fields.confirmPassword')}
          placeholder={t('fields.passwordPlaceholder')}
          icon={LockSimple}
          trailingIcon={showPassword ? EyeSlash : Eye}
          onTrailingIconPress={() => setShowPassword((v) => !v)}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showPassword}
        />

        {!!error && (
          <Text variant="small" color={theme.danger} style={{ textAlign: 'center', marginTop: 12 }}>
            {error}
          </Text>
        )}

        <View style={{ marginTop: 18 }}>
          <Button full icon={CheckCircle} onPress={handleReset} loading={loading}>
            {t('auth.resetPassword.resetButton')}
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
