import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { Address, useStudents } from '@/contexts/StudentContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatCep, validateCep } from '@/services/cepService';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddStudentScreen() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    cepGo: '',
    streetGo: '',
    numberGo: '',
    neighborhoodGo: '',
    cityGo: '',
    stateGo: '',
    complementGo: '',
    hasReturnAddress: false,
    cepReturn: '',
    streetReturn: '',
    numberReturn: '',
    neighborhoodReturn: '',
    cityReturn: '',
    stateReturn: '',
    complementReturn: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const { addStudent } = useStudents();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

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
    } else if (field === 'cepGo' || field === 'cepReturn') {
      value = formatCep(value);
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCepValidation = async (cep: string, type: 'go' | 'return') => {
    if (cep.replace(/\D/g, '').length !== 8) return;

    setIsLoadingCep(true);
    try {
      const address = await validateCep(cep);
      if (address) {
        const prefix = type === 'go' ? 'Go' : 'Return';
        setFormData(prev => ({
          ...prev,
          [`street${prefix}`]: address.street,
          [`neighborhood${prefix}`]: address.neighborhood,
          [`city${prefix}`]: address.city,
          [`state${prefix}`]: address.state,
          [`complement${prefix}`]: address.complement || '',
        }));
      }
    } catch (error) {
      Alert.alert('Erro', 'CEP não encontrado ou inválido');
    } finally {
      setIsLoadingCep(false);
    }
  };

  const handleSubmit = async () => {
    // Validações
    if (!formData.name.trim()) {
      Alert.alert('Erro', 'Por favor, preencha o nome do aluno');
      return;
    }

    if (!validatePhone(formData.phone)) {
      Alert.alert('Erro', 'Por favor, insira um telefone válido');
      return;
    }

    if (!formData.streetGo.trim() || !formData.numberGo.trim()) {
      Alert.alert('Erro', 'Por favor, preencha o endereço de ida completo');
      return;
    }

    if (formData.hasReturnAddress) {
      if (!formData.streetReturn.trim() || !formData.numberReturn.trim()) {
        Alert.alert('Erro', 'Por favor, preencha o endereço de volta completo');
        return;
      }
    }

    setIsLoading(true);
    try {
      const addressGo: Address = {
        cep: formData.cepGo,
        street: formData.streetGo,
        number: formData.numberGo,
        neighborhood: formData.neighborhoodGo,
        city: formData.cityGo,
        state: formData.stateGo,
        complement: formData.complementGo,
      };

      const addressReturn: Address | undefined = formData.hasReturnAddress ? {
        cep: formData.cepReturn,
        street: formData.streetReturn,
        number: formData.numberReturn,
        neighborhood: formData.neighborhoodReturn,
        city: formData.cityReturn,
        state: formData.stateReturn,
        complement: formData.complementReturn,
      } : undefined;

      const success = await addStudent({
        name: formData.name,
        phone: formData.phone,
        addressGo,
        addressReturn,
      });

      if (success) {
        Alert.alert('Sucesso', 'Aluno cadastrado com sucesso!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('Erro', 'Ocorreu um erro ao cadastrar o aluno');
      }
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao cadastrar o aluno');
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
                <IconSymbol name="person.badge.plus" size={60} color={colors.tint} />
              </View>
              <Text style={[styles.title, { color: colors.text }]}>Cadastrar Aluno</Text>
              <Text style={[styles.subtitle, { color: colors.icon }]}>
                Preencha os dados do aluno
              </Text>
            </View>

            <View style={styles.form}>
              {/* Dados Pessoais */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Dados Pessoais</Text>
                
                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: colors.text }]}>Nome do Aluno</Text>
                  <View style={[styles.inputWrapper, { borderColor: colors.icon }]}>
                    <IconSymbol name="person" size={20} color={colors.icon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="Digite o nome completo"
                      placeholderTextColor={colors.icon}
                      value={formData.name}
                      onChangeText={(value) => handleInputChange('name', value)}
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
              </View>

              {/* Endereço de Ida */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Endereço de Ida</Text>
                
                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: colors.text }]}>CEP</Text>
                  <View style={[styles.inputWrapper, { borderColor: colors.icon }]}>
                    <IconSymbol name="location" size={20} color={colors.icon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="00000-000"
                      placeholderTextColor={colors.icon}
                      value={formData.cepGo}
                      onChangeText={(value) => {
                        handleInputChange('cepGo', value);
                        if (value.replace(/\D/g, '').length === 8) {
                          handleCepValidation(value, 'go');
                        }
                      }}
                      keyboardType="numeric"
                      maxLength={9}
                    />
                    {isLoadingCep && <ActivityIndicator size="small" color={colors.tint} />}
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: colors.text }]}>Rua</Text>
                  <View style={[styles.inputWrapper, { borderColor: colors.icon }]}>
                    <IconSymbol name="road.lanes" size={20} color={colors.icon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="Nome da rua"
                      placeholderTextColor={colors.icon}
                      value={formData.streetGo}
                      onChangeText={(value) => handleInputChange('streetGo', value)}
                    />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                    <Text style={[styles.label, { color: colors.text }]}>Número</Text>
                    <View style={[styles.inputWrapper, { borderColor: colors.icon }]}>
                      <IconSymbol name="number" size={20} color={colors.icon} />
                      <TextInput
                        style={[styles.input, { color: colors.text }]}
                        placeholder="123"
                        placeholderTextColor={colors.icon}
                        value={formData.numberGo}
                        onChangeText={(value) => handleInputChange('numberGo', value)}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  <View style={[styles.inputContainer, { flex: 2, marginLeft: 8 }]}>
                    <Text style={[styles.label, { color: colors.text }]}>Bairro</Text>
                    <View style={[styles.inputWrapper, { borderColor: colors.icon }]}>
                      <IconSymbol name="building.2" size={20} color={colors.icon} />
                      <TextInput
                        style={[styles.input, { color: colors.text }]}
                        placeholder="Nome do bairro"
                        placeholderTextColor={colors.icon}
                        value={formData.neighborhoodGo}
                        onChangeText={(value) => handleInputChange('neighborhoodGo', value)}
                      />
                    </View>
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputContainer, { flex: 2, marginRight: 8 }]}>
                    <Text style={[styles.label, { color: colors.text }]}>Cidade</Text>
                    <View style={[styles.inputWrapper, { borderColor: colors.icon }]}>
                      <IconSymbol name="building" size={20} color={colors.icon} />
                      <TextInput
                        style={[styles.input, { color: colors.text }]}
                        placeholder="Nome da cidade"
                        placeholderTextColor={colors.icon}
                        value={formData.cityGo}
                        onChangeText={(value) => handleInputChange('cityGo', value)}
                      />
                    </View>
                  </View>

                  <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                    <Text style={[styles.label, { color: colors.text }]}>Estado</Text>
                    <View style={[styles.inputWrapper, { borderColor: colors.icon }]}>
                      <IconSymbol name="flag" size={20} color={colors.icon} />
                      <TextInput
                        style={[styles.input, { color: colors.text }]}
                        placeholder="SP"
                        placeholderTextColor={colors.icon}
                        value={formData.stateGo}
                        onChangeText={(value) => handleInputChange('stateGo', value.toUpperCase())}
                        maxLength={2}
                        autoCapitalize="characters"
                      />
                    </View>
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: colors.text }]}>Complemento (opcional)</Text>
                  <View style={[styles.inputWrapper, { borderColor: colors.icon }]}>
                    <IconSymbol name="plus" size={20} color={colors.icon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="Apartamento, bloco, etc."
                      placeholderTextColor={colors.icon}
                      value={formData.complementGo}
                      onChangeText={(value) => handleInputChange('complementGo', value)}
                    />
                  </View>
                </View>
              </View>

              {/* Endereço de Volta */}
              <View style={styles.section}>
                <View style={styles.switchContainer}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Endereço de Volta</Text>
                  <Switch
                    value={formData.hasReturnAddress}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, hasReturnAddress: value }))}
                    trackColor={{ false: colors.icon, true: colors.tint }}
                    thumbColor={formData.hasReturnAddress ? 'white' : colors.background}
                  />
                </View>
                
                {formData.hasReturnAddress && (
                  <>
                    <View style={styles.inputContainer}>
                      <Text style={[styles.label, { color: colors.text }]}>CEP</Text>
                      <View style={[styles.inputWrapper, { borderColor: colors.icon }]}>
                        <IconSymbol name="location" size={20} color={colors.icon} />
                        <TextInput
                          style={[styles.input, { color: colors.text }]}
                          placeholder="00000-000"
                          placeholderTextColor={colors.icon}
                          value={formData.cepReturn}
                          onChangeText={(value) => {
                            handleInputChange('cepReturn', value);
                            if (value.replace(/\D/g, '').length === 8) {
                              handleCepValidation(value, 'return');
                            }
                          }}
                          keyboardType="numeric"
                          maxLength={9}
                        />
                        {isLoadingCep && <ActivityIndicator size="small" color={colors.tint} />}
                      </View>
                    </View>

                    <View style={styles.inputContainer}>
                      <Text style={[styles.label, { color: colors.text }]}>Rua</Text>
                      <View style={[styles.inputWrapper, { borderColor: colors.icon }]}>
                        <IconSymbol name="road.lanes" size={20} color={colors.icon} />
                        <TextInput
                          style={[styles.input, { color: colors.text }]}
                          placeholder="Nome da rua"
                          placeholderTextColor={colors.icon}
                          value={formData.streetReturn}
                          onChangeText={(value) => handleInputChange('streetReturn', value)}
                        />
                      </View>
                    </View>

                    <View style={styles.row}>
                      <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                        <Text style={[styles.label, { color: colors.text }]}>Número</Text>
                        <View style={[styles.inputWrapper, { borderColor: colors.icon }]}>
                          <IconSymbol name="number" size={20} color={colors.icon} />
                          <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder="123"
                            placeholderTextColor={colors.icon}
                            value={formData.numberReturn}
                            onChangeText={(value) => handleInputChange('numberReturn', value)}
                            keyboardType="numeric"
                          />
                        </View>
                      </View>

                      <View style={[styles.inputContainer, { flex: 2, marginLeft: 8 }]}>
                        <Text style={[styles.label, { color: colors.text }]}>Bairro</Text>
                        <View style={[styles.inputWrapper, { borderColor: colors.icon }]}>
                          <IconSymbol name="building.2" size={20} color={colors.icon} />
                          <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder="Nome do bairro"
                            placeholderTextColor={colors.icon}
                            value={formData.neighborhoodReturn}
                            onChangeText={(value) => handleInputChange('neighborhoodReturn', value)}
                          />
                        </View>
                      </View>
                    </View>

                    <View style={styles.row}>
                      <View style={[styles.inputContainer, { flex: 2, marginRight: 8 }]}>
                        <Text style={[styles.label, { color: colors.text }]}>Cidade</Text>
                        <View style={[styles.inputWrapper, { borderColor: colors.icon }]}>
                          <IconSymbol name="building" size={20} color={colors.icon} />
                          <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder="Nome da cidade"
                            placeholderTextColor={colors.icon}
                            value={formData.cityReturn}
                            onChangeText={(value) => handleInputChange('cityReturn', value)}
                          />
                        </View>
                      </View>

                      <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                        <Text style={[styles.label, { color: colors.text }]}>Estado</Text>
                        <View style={[styles.inputWrapper, { borderColor: colors.icon }]}>
                          <IconSymbol name="flag" size={20} color={colors.icon} />
                          <TextInput
                            style={[styles.input, { color: colors.text }]}
                            placeholder="SP"
                            placeholderTextColor={colors.icon}
                            value={formData.stateReturn}
                            onChangeText={(value) => handleInputChange('stateReturn', value.toUpperCase())}
                            maxLength={2}
                            autoCapitalize="characters"
                          />
                        </View>
                      </View>
                    </View>

                    <View style={styles.inputContainer}>
                      <Text style={[styles.label, { color: colors.text }]}>Complemento (opcional)</Text>
                      <View style={[styles.inputWrapper, { borderColor: colors.icon }]}>
                        <IconSymbol name="plus" size={20} color={colors.icon} />
                        <TextInput
                          style={[styles.input, { color: colors.text }]}
                          placeholder="Apartamento, bloco, etc."
                          placeholderTextColor={colors.icon}
                          value={formData.complementReturn}
                          onChangeText={(value) => handleInputChange('complementReturn', value)}
                        />
                      </View>
                    </View>
                  </>
                )}
              </View>

              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: colors.tint }]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>Cadastrar Aluno</Text>
                )}
              </TouchableOpacity>
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
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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
  row: {
    flexDirection: 'row',
  },
  submitButton: {
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
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
