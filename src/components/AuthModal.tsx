import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { X, Mail, Lock, User, Eye, EyeOff, ShieldCheck } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { COLORS } from '../constants/theme';

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ visible, onClose }) => {
  const { signIn, signUp } = useAuth();
  const [isRegister, setIsRegister] = useState<boolean>(false);

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setErrorMessage(null);
    setSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    setErrorMessage(null);
    setSubmitting(true);

    try {
      if (isRegister) {
        const res = await signUp(name, email, password);
        if (res.error) {
          setErrorMessage(res.error);
          setSubmitting(false);
          return;
        }
      } else {
        const res = await signIn(email, password);
        if (res.error) {
          setErrorMessage(res.error);
          setSubmitting(false);
          return;
        }
      }

      handleClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan sistem.');
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.backdrop}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardView}
          >
            <TouchableWithoutFeedback>
              <View style={styles.sheet}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {/* Header */}
                  <View style={styles.header}>
                    <View>
                      <Text style={styles.title}>
                        {isRegister ? 'Daftar Akun Baru' : 'Masuk ke TukangSekitar'}
                      </Text>
                      <Text style={styles.subtitle}>
                        {isRegister
                          ? 'Bergabung untuk simpan riwayat & hubungi tukang'
                          : 'Akses akun Anda untuk mencari jasa terdekat'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.closeBtn}
                      onPress={handleClose}
                      activeOpacity={0.7}
                    >
                      <X size={18} color={COLORS.textPrimary} strokeWidth={2.2} />
                    </TouchableOpacity>
                  </View>

                  {/* Tab Selector */}
                  <View style={styles.tabContainer}>
                    <TouchableOpacity
                      style={[styles.tabButton, !isRegister && styles.tabButtonActive]}
                      onPress={() => {
                        setIsRegister(false);
                        setErrorMessage(null);
                      }}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[styles.tabButtonText, !isRegister && styles.tabButtonTextActive]}
                      >
                        Masuk
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.tabButton, isRegister && styles.tabButtonActive]}
                      onPress={() => {
                        setIsRegister(true);
                        setErrorMessage(null);
                      }}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[styles.tabButtonText, isRegister && styles.tabButtonTextActive]}
                      >
                        Daftar
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Error Notification */}
                  {errorMessage && (
                    <View style={styles.errorBox}>
                      <Text style={styles.errorText}>{errorMessage}</Text>
                    </View>
                  )}

                  {/* Input Form */}
                  <View style={styles.form}>
                    {isRegister && (
                      <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>NAMA LENGKAP</Text>
                        <View style={styles.inputWrapper}>
                          <User size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
                          <TextInput
                            style={styles.input}
                            placeholder="Contoh: Andi Pratama"
                            placeholderTextColor="#94A3B8"
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="words"
                          />
                        </View>
                      </View>
                    )}

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>ALAMAT EMAIL</Text>
                      <View style={styles.inputWrapper}>
                        <Mail size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="nama@email.com"
                          placeholderTextColor="#94A3B8"
                          value={email}
                          onChangeText={setEmail}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                      </View>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>KATA SANDI</Text>
                      <View style={styles.inputWrapper}>
                        <Lock size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
                        <TextInput
                          style={[styles.input, { paddingRight: 40 }]}
                          placeholder="Minimal 6 karakter"
                          placeholderTextColor="#94A3B8"
                          value={password}
                          onChangeText={setPassword}
                          secureTextEntry={!showPassword}
                          autoCapitalize="none"
                        />
                        <TouchableOpacity
                          style={styles.eyeBtn}
                          onPress={() => setShowPassword((prev) => !prev)}
                        >
                          {showPassword ? (
                            <EyeOff size={18} color={COLORS.textSecondary} />
                          ) : (
                            <Eye size={18} color={COLORS.textSecondary} />
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>

                    {!isSupabaseConfigured && (
                      <View style={styles.offlineNote}>
                        <ShieldCheck size={14} color="#0284C7" style={{ marginRight: 6 }} />
                        <Text style={styles.offlineNoteText}>
                          Mode demo aktif: Anda dapat masuk/daftar langsung untuk mencoba fitur.
                        </Text>
                      </View>
                    )}

                    {/* Submit Button */}
                    <TouchableOpacity
                      style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                      onPress={handleSubmit}
                      disabled={submitting}
                      activeOpacity={0.85}
                    >
                      {submitting ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.submitButtonText}>
                          {isRegister ? 'Buat Akun Sekarang' : 'Masuk Sekarang'}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  keyboardView: {
    width: '100%',
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 3,
    maxWidth: 260,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 3,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: COLORS.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabButtonTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    lineHeight: 16,
  },
  form: {
    gap: 12,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: COLORS.textSecondary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  eyeBtn: {
    padding: 6,
  },
  offlineNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    padding: 9,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  offlineNoteText: {
    flex: 1,
    fontSize: 11,
    color: '#0369A1',
    lineHeight: 15,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
