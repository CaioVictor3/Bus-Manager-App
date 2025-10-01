import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { Address, Student, useStudents } from '@/contexts/StudentContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatCep, validateCep } from '@/services/cepService';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const { students, routeSettings, setRouteSettings, toggleStudentPresence, getPresentStudents } = useStudents();
  const [isLoading, setIsLoading] = useState(false);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [routeForm, setRouteForm] = useState({
    cepStart: '',
    streetStart: '',
    numberStart: '',
    neighborhoodStart: '',
    cityStart: '',
    stateStart: '',
    cepEnd: '',
    streetEnd: '',
    numberEnd: '',
    neighborhoodEnd: '',
    cityEnd: '',
    stateEnd: '',
  });
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const presentStudents = getPresentStudents();
  const absentStudents = students.filter(student => !student.isPresent);

  const handleCepValidation = async (cep: string, type: 'start' | 'end') => {
    if (cep.replace(/\D/g, '').length !== 8) return;

    setIsLoading(true);
    try {
      const address = await validateCep(cep);
      if (address) {
        const prefix = type === 'start' ? 'Start' : 'End';
        setRouteForm(prev => ({
          ...prev,
          [`street${prefix}`]: address.street,
          [`neighborhood${prefix}`]: address.neighborhood,
          [`city${prefix}`]: address.city,
          [`state${prefix}`]: address.state,
        }));
      }
    } catch (error) {
      Alert.alert('Erro', 'CEP não encontrado ou inválido');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRoute = async () => {
    if (!routeForm.streetStart || !routeForm.numberStart || !routeForm.streetEnd || !routeForm.numberEnd) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const startAddress: Address = {
      cep: routeForm.cepStart,
      street: routeForm.streetStart,
      number: routeForm.numberStart,
      neighborhood: routeForm.neighborhoodStart,
      city: routeForm.cityStart,
      state: routeForm.stateStart,
    };

    const endAddress: Address = {
      cep: routeForm.cepEnd,
      street: routeForm.streetEnd,
      number: routeForm.numberEnd,
      neighborhood: routeForm.neighborhoodEnd,
      city: routeForm.cityEnd,
      state: routeForm.stateEnd,
    };

    const success = await setRouteSettings({ startAddress, endAddress });
    if (success) {
      setShowRouteModal(false);
      Alert.alert('Sucesso', 'Configurações da rota salvas!');
    } else {
      Alert.alert('Erro', 'Ocorreu um erro ao salvar as configurações');
    }
  };

  const handleStartRoute = () => {
    if (presentStudents.length === 0) {
      Alert.alert('Aviso', 'Nenhum aluno marcado para a aula hoje');
      return;
    }

    if (!routeSettings) {
      Alert.alert('Aviso', 'Configure os endereços da rota primeiro');
      setShowRouteModal(true);
      return;
    }

    Alert.alert(
      'Iniciar Rota',
      `Iniciar rota para ${presentStudents.length} aluno(s)?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Iniciar', onPress: () => router.push('/route') }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: logout }
      ]
    );
  };

  const StudentCard = ({ student }: { student: Student }) => (
    <View style={[styles.studentCard, { backgroundColor: colors.background }]}>
      <View style={styles.studentInfo}>
        <Text style={[styles.studentName, { color: colors.text }]}>{student.name}</Text>
        <Text style={[styles.studentPhone, { color: colors.icon }]}>{student.phone}</Text>
        <Text style={[styles.studentAddress, { color: colors.icon }]}>
          {student.addressGo.street}, {student.addressGo.number}
        </Text>
      </View>
      <TouchableOpacity
        style={[
          styles.presenceButton,
          { backgroundColor: student.isPresent ? '#4CAF50' : '#F44336' }
        ]}
        onPress={() => toggleStudentPresence(student.id)}
      >
        <IconSymbol
          name={student.isPresent ? 'checkmark' : 'xmark'}
          size={20}
          color="white"
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.tint, colors.background]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={[styles.welcomeText, { color: colors.text }]}>
                Olá, {user?.name}!
              </Text>
              <Text style={[styles.vehicleInfo, { color: colors.icon }]}>
                {user?.vehicle.model} - {user?.vehicle.plate}
              </Text>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <IconSymbol name="arrow.right.square" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.background }]}>
            <IconSymbol name="person.3.fill" size={32} color="#4CAF50" />
            <Text style={[styles.statNumber, { color: colors.text }]}>{presentStudents.length}</Text>
            <Text style={[styles.statLabel, { color: colors.icon }]}>Presentes</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.background }]}>
            <IconSymbol name="person.crop.circle.badge.xmark" size={32} color="#F44336" />
            <Text style={[styles.statNumber, { color: colors.text }]}>{absentStudents.length}</Text>
            <Text style={[styles.statLabel, { color: colors.icon }]}>Ausentes</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.background }]}>
            <IconSymbol name="person.3" size={32} color={colors.tint} />
            <Text style={[styles.statNumber, { color: colors.text }]}>{students.length}</Text>
            <Text style={[styles.statLabel, { color: colors.icon }]}>Total</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Link href="/add-student" asChild>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.tint }]}>
              <IconSymbol name="person.badge.plus" size={24} color="white" />
              <Text style={styles.actionButtonText}>Adicionar Aluno</Text>
            </TouchableOpacity>
          </Link>
          
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.icon }]}
            onPress={() => setShowRouteModal(true)}
          >
            <IconSymbol name="location" size={24} color="white" />
            <Text style={styles.actionButtonText}>Configurar Rota</Text>
          </TouchableOpacity>
        </View>

        {/* Students List */}
        <ScrollView
          style={styles.studentsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={() => {}}
              tintColor={colors.tint}
            />
          }
        >
          {students.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol name="person.3" size={64} color={colors.icon} />
              <Text style={[styles.emptyStateText, { color: colors.icon }]}>
                Nenhum aluno cadastrado
              </Text>
              <Text style={[styles.emptyStateSubtext, { color: colors.icon }]}>
                Adicione alunos para começar
              </Text>
            </View>
          ) : (
            <>
              {presentStudents.length > 0 && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Alunos Presentes ({presentStudents.length})
                  </Text>
                  {presentStudents.map(student => (
                    <StudentCard key={student.id} student={student} />
                  ))}
                </View>
              )}

              {absentStudents.length > 0 && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Alunos Ausentes ({absentStudents.length})
                  </Text>
                  {absentStudents.map(student => (
                    <StudentCard key={student.id} student={student} />
                  ))}
                </View>
              )}
            </>
          )}
        </ScrollView>

        {/* Start Route Button */}
        {presentStudents.length > 0 && (
          <View style={styles.startRouteContainer}>
            <TouchableOpacity
              style={[styles.startRouteButton, { backgroundColor: '#4CAF50' }]}
              onPress={handleStartRoute}
            >
              <IconSymbol name="play.fill" size={24} color="white" />
              <Text style={styles.startRouteButtonText}>
                Iniciar Rota ({presentStudents.length} aluno(s))
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Route Configuration Modal */}
        <Modal
          visible={showRouteModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={[styles.modalContainer, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Configurar Rota
              </Text>
              <TouchableOpacity onPress={() => setShowRouteModal(false)}>
                <IconSymbol name="xmark" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Ponto de Partida</Text>
                
                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: colors.text }]}>CEP</Text>
                  <View style={[styles.inputWrapper, { borderColor: colors.icon }]}>
                    <IconSymbol name="location" size={20} color={colors.icon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="00000-000"
                      placeholderTextColor={colors.icon}
                      value={routeForm.cepStart}
                      onChangeText={(value) => {
                        setRouteForm(prev => ({ ...prev, cepStart: formatCep(value) }));
                        if (value.replace(/\D/g, '').length === 8) {
                          handleCepValidation(value, 'start');
                        }
                      }}
                      keyboardType="numeric"
                      maxLength={9}
                    />
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
                      value={routeForm.streetStart}
                      onChangeText={(value) => setRouteForm(prev => ({ ...prev, streetStart: value }))}
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
                        value={routeForm.numberStart}
                        onChangeText={(value) => setRouteForm(prev => ({ ...prev, numberStart: value }))}
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
                        value={routeForm.neighborhoodStart}
                        onChangeText={(value) => setRouteForm(prev => ({ ...prev, neighborhoodStart: value }))}
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
                        value={routeForm.cityStart}
                        onChangeText={(value) => setRouteForm(prev => ({ ...prev, cityStart: value }))}
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
                        value={routeForm.stateStart}
                        onChangeText={(value) => setRouteForm(prev => ({ ...prev, stateStart: value.toUpperCase() }))}
                        maxLength={2}
                        autoCapitalize="characters"
                      />
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Ponto de Chegada</Text>
                
                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: colors.text }]}>CEP</Text>
                  <View style={[styles.inputWrapper, { borderColor: colors.icon }]}>
                    <IconSymbol name="location" size={20} color={colors.icon} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      placeholder="00000-000"
                      placeholderTextColor={colors.icon}
                      value={routeForm.cepEnd}
                      onChangeText={(value) => {
                        setRouteForm(prev => ({ ...prev, cepEnd: formatCep(value) }));
                        if (value.replace(/\D/g, '').length === 8) {
                          handleCepValidation(value, 'end');
                        }
                      }}
                      keyboardType="numeric"
                      maxLength={9}
                    />
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
                      value={routeForm.streetEnd}
                      onChangeText={(value) => setRouteForm(prev => ({ ...prev, streetEnd: value }))}
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
                        value={routeForm.numberEnd}
                        onChangeText={(value) => setRouteForm(prev => ({ ...prev, numberEnd: value }))}
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
                        value={routeForm.neighborhoodEnd}
                        onChangeText={(value) => setRouteForm(prev => ({ ...prev, neighborhoodEnd: value }))}
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
                        value={routeForm.cityEnd}
                        onChangeText={(value) => setRouteForm(prev => ({ ...prev, cityEnd: value }))}
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
                        value={routeForm.stateEnd}
                        onChangeText={(value) => setRouteForm(prev => ({ ...prev, stateEnd: value.toUpperCase() }))}
                        maxLength={2}
                        autoCapitalize="characters"
                      />
                    </View>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: colors.tint }]}
                onPress={handleSaveRoute}
              >
                <Text style={styles.saveButtonText}>Salvar Configurações</Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </Modal>
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
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  vehicleInfo: {
    fontSize: 14,
    marginTop: 4,
  },
  logoutButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  studentsList: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  studentPhone: {
    fontSize: 14,
    marginBottom: 2,
  },
  studentAddress: {
    fontSize: 12,
  },
  presenceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    marginTop: 8,
  },
  startRouteContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  startRouteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  startRouteButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
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
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  row: {
    flexDirection: 'row',
  },
  saveButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
