import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    vehicleModel: '',
    vehiclePlate: '',
    vehicleCapacity: '',
    vehicleColor: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    return phoneRegex.test(phone);
  };

  const formatPhone = (text: string) => {
    const numbers = text.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'phone') {
      value = formatPhone(value);
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    // Validações
    if (!formData.name.trim()) {
      Alert.alert('Erro', 'Por favor, preencha o nome');
      return;
    }

    if (!validateEmail(formData.email)) {
      Alert.alert('Erro', 'Por favor, insira um email válido');
      return;
    }

    if (!validatePhone(formData.phone)) {
      Alert.alert('Erro', 'Por favor, insira um telefone válido');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    if (!formData.vehicleModel.trim()) {
      Alert.alert('Erro', 'Por favor, preencha o modelo do veículo');
      return;
    }

    if (!formData.vehiclePlate.trim()) {
      Alert.alert('Erro', 'Por favor, preencha a placa do veículo');
      return;
    }

    if (!formData.vehicleCapacity || parseInt(formData.vehicleCapacity) < 1) {
      Alert.alert('Erro', 'Por favor, insira uma capacidade válida');
      return;
    }

    if (!formData.vehicleColor.trim()) {
      Alert.alert('Erro', 'Por favor, preencha a cor do veículo');
      return;
    }

    setIsLoading(true);
    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        vehicle: {
          model: formData.vehicleModel,
          plate: formData.vehiclePlate.toUpperCase(),
          capacity: parseInt(formData.vehicleCapacity),
          color: formData.vehicleColor,
        },
      };

      const success = await register(userData, formData.password);
      if (!success) {
        Alert.alert('Erro', 'Ocorreu um erro durante o cadastro');
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro durante o cadastro');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.tint, colors.background]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <View style={[styles.logoContainer, { backgroundColor: colors.background }]}>
                <IconSymbol name="car.fill" size={60} color={colors.tint} />
              </View>
              <Text style={[styles.title, { color: colors.text }]}>Cadastro de Topiqueiro</Text>
              <Text style={[styles.subtitle, { color: colors.icon }]}>
                Preencha os dados para começar
              </Text>
            </View>

            <View style={styles.form}>
              {/* Dados Pessoais */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Dados Pessoais</Text>
                
                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: colors.text }]}>Nome Completo</Text>
                  <View style={[styles.inputWrapper, { borderColor: colors.icon }]}>
                    <IconSymbol name="person" size={20} color={colors.icon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="Digite seu nome completo"
                      placeholderTextColor={colors.icon}
                      value={formData.name}
                      onChangeText={(value) => handleInputChange('name', value)}
                    />
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: colors.text }]}>Email</Text>
                  <View style={[styles.inputWrapper, { borderColor: colors.icon }]}>
                    <IconSymbol name="envelope" size={20} color={colors.icon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="Digite seu email"
                      placeholderTextColor={colors.icon}
                      value={formData.email}
                      onChangeText={(value) => handleInputChange('email', value)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: colors.text }]}>Telefone</Text>
                  <View style={[styles.inputWrapper, { borderColor: colors.icon }]}>
                    <IconSymbol name="phone" size={20} color={colors.icon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="(11) 99999-9999"
                      placeholderTextColor={colors.icon}
                      value={formData.phone}
                      onChangeText={(value) => handleInputChange('phone', value)}
                      keyboardType="phone-pad"
                      maxLength={15}
                    />
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: colors.text }]}>Senha</Text>
                  <View style={[styles.inputWrapper, { borderColor: colors.icon }]}>
                    <IconSymbol name="lock" size={20} color={colors.icon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="Digite sua senha"
                      placeholderTextColor={colors.icon}
                      value={formData.password}
                      onChangeText={(value) => handleInputChange('password', value)}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeButton}
                    >
                      <IconSymbol
                        name={showPassword ? 'eye.slash' : 'eye'}
                        size={20}
                        color={colors.icon}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: colors.text }]}>Confirmar Senha</Text>
                  <View style={[styles.inputWrapper, { borderColor: colors.icon }]}>
                    <IconSymbol name="lock" size={20} color={colors.icon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="Confirme sua senha"
                      placeholderTextColor={colors.icon}
                      value={formData.confirmPassword}
                      onChangeText={(value) => handleInputChange('confirmPassword', value)}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={styles.eyeButton}
                    >
                      <IconSymbol
                        name={showConfirmPassword ? 'eye.slash' : 'eye'}
                        size={20}
                        color={colors.icon}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Dados do Veículo */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Dados do Veículo</Text>
                
                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: colors.text }]}>Modelo do Veículo</Text>
                  <View style={[styles.inputWrapper, { borderColor: colors.icon }]}>
                    <IconSymbol name="car" size={20} color={colors.icon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="Ex: Ford Transit"
                      placeholderTextColor={colors.icon}
                      value={formData.vehicleModel}
                      onChangeText={(value) => handleInputChange('vehicleModel', value)}
                    />
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: colors.text }]}>Placa</Text>
                  <View style={[styles.inputWrapper, { borderColor: colors.icon }]}>
                    <IconSymbol name="number" size={20} color={colors.icon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="ABC-1234"
                      placeholderTextColor={colors.icon}
                      value={formData.vehiclePlate}
                      onChangeText={(value) => handleInputChange('vehiclePlate', value.toUpperCase())}
                      autoCapitalize="characters"
                      maxLength={8}
                    />
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: colors.text }]}>Capacidade (passageiros)</Text>
                  <View style={[styles.inputWrapper, { borderColor: colors.icon }]}>
                    <IconSymbol name="person.3" size={20} color={colors.icon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="Ex: 15"
                      placeholderTextColor={colors.icon}
                      value={formData.vehicleCapacity}
                      onChangeText={(value) => handleInputChange('vehicleCapacity', value)}
                      keyboardType="numeric"
                      maxLength={2}
                    />
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: colors.text }]}>Cor do Veículo</Text>
                  <View style={[styles.inputWrapper, { borderColor: colors.icon }]}>
                    <IconSymbol name="paintbrush" size={20} color={colors.icon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="Ex: Branco"
                      placeholderTextColor={colors.icon}
                      value={formData.vehicleColor}
                      onChangeText={(value) => handleInputChange('vehicleColor', value)}
                    />
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.registerButton, { backgroundColor: colors.tint }]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.registerButtonText}>Cadastrar</Text>
                )}
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={[styles.footerText, { color: colors.icon }]}>
                  Já tem uma conta?{' '}
                  <Text style={[styles.linkText, { color: colors.tint }]}>
                    Faça login
                  </Text>
                </Text>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#0a7ea4',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  eyeButton: {
    padding: 4,
  },
  registerButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 14,
  },
  linkText: {
    fontWeight: '600',
  },
});
