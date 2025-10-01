import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useStudents } from '@/contexts/StudentContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function RouteScreen() {
  const { user } = useAuth();
  const { routeSettings, getPresentStudents } = useStudents();
  const [currentStep, setCurrentStep] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const presentStudents = getPresentStudents();
  const routeSteps = [
    { type: 'start', title: 'Ponto de Partida', address: routeSettings?.startAddress },
    ...presentStudents.map(student => ({
      type: 'student',
      title: student.name,
      address: student.addressGo,
      student,
    })),
    { type: 'end', title: 'Ponto de Chegada', address: routeSettings?.endAddress },
  ];

  const currentLocation = routeSteps[currentStep];

  const handleNextStep = () => {
    if (currentStep < routeSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      Alert.alert(
        'Rota Concluída',
        'Você chegou ao destino final!',
        [
          { text: 'OK', onPress: () => router.back() }
        ]
      );
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStartNavigation = () => {
    setIsNavigating(true);
    Alert.alert(
      'Navegação Iniciada',
      'Siga as instruções para o próximo ponto da rota.',
      [{ text: 'OK' }]
    );
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'start':
        return 'play.circle.fill';
      case 'end':
        return 'flag.fill';
      case 'student':
        return 'person.circle.fill';
      default:
        return 'circle.fill';
    }
  };

  const getStepColor = (type: string) => {
    switch (type) {
      case 'start':
        return '#4CAF50';
      case 'end':
        return '#F44336';
      case 'student':
        return colors.tint;
      default:
        return colors.icon;
    }
  };

  const formatAddress = (address: any) => {
    if (!address) return 'Endereço não configurado';
    return `${address.street}, ${address.number} - ${address.neighborhood}`;
  };

  // Coordenadas simuladas para demonstração
  const getCoordinates = (address: any, index: number) => {
    if (!address) return { latitude: -23.5505, longitude: -46.6333 };
    
    // Simula coordenadas baseadas no índice para demonstração
    const baseLat = -23.5505;
    const baseLng = -46.6333;
    const offset = index * 0.01;
    
    return {
      latitude: baseLat + offset,
      longitude: baseLng + offset,
    };
  };

  const routeCoordinates = routeSteps.map((step, index) => 
    getCoordinates(step.address, index)
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
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="arrow.left" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Navegação da Rota</Text>
            <Text style={[styles.headerSubtitle, { color: colors.icon }]}>
              {user?.vehicle.model} - {user?.vehicle.plate}
            </Text>
          </View>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${((currentStep + 1) / routeSteps.length) * 100}%`,
                  backgroundColor: colors.tint 
                }
              ]} 
            />
          </View>
          <Text style={[styles.progressText, { color: colors.text }]}>
            {currentStep + 1} de {routeSteps.length} pontos
          </Text>
        </View>

        {/* Current Step Info */}
        <View style={[styles.currentStepCard, { backgroundColor: colors.background }]}>
          <View style={styles.currentStepHeader}>
            <View style={[styles.stepIcon, { backgroundColor: getStepColor(currentLocation?.type || '') }]}>
              <IconSymbol 
                name={getStepIcon(currentLocation?.type || '')} 
                size={24} 
                color="white" 
              />
            </View>
            <View style={styles.stepInfo}>
              <Text style={[styles.stepTitle, { color: colors.text }]}>
                {currentLocation?.title}
              </Text>
              <Text style={[styles.stepAddress, { color: colors.icon }]}>
                {formatAddress(currentLocation?.address)}
              </Text>
            </View>
          </View>
          
          {currentLocation?.type === 'student' && (
            <View style={styles.studentInfo}>
              <Text style={[styles.studentPhone, { color: colors.icon }]}>
                📞 {currentLocation.student.phone}
              </Text>
            </View>
          )}
        </View>

        {/* Map */}
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: routeCoordinates[0]?.latitude || -23.5505,
              longitude: routeCoordinates[0]?.longitude || -46.6333,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            showsUserLocation={true}
            showsMyLocationButton={true}
          >
            {/* Markers for all route points */}
            {routeSteps.map((step, index) => (
              <Marker
                key={index}
                coordinate={getCoordinates(step.address, index)}
                title={step.title}
                description={formatAddress(step.address)}
                pinColor={getStepColor(step.type)}
              />
            ))}
            
            {/* Route polyline */}
            {routeCoordinates.length > 1 && (
              <Polyline
                coordinates={routeCoordinates}
                strokeColor={colors.tint}
                strokeWidth={4}
                lineDashPattern={[5, 5]}
              />
            )}
          </MapView>
        </View>

        {/* Route Steps List */}
        <View style={styles.stepsContainer}>
          <Text style={[styles.stepsTitle, { color: colors.text }]}>Pontos da Rota</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.stepsScroll}
          >
            {routeSteps.map((step, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.stepCard,
                  { 
                    backgroundColor: colors.background,
                    borderColor: index === currentStep ? colors.tint : 'transparent',
                    borderWidth: index === currentStep ? 2 : 0,
                  }
                ]}
                onPress={() => setCurrentStep(index)}
              >
                <View style={[styles.stepCardIcon, { backgroundColor: getStepColor(step.type) }]}>
                  <IconSymbol 
                    name={getStepIcon(step.type)} 
                    size={16} 
                    color="white" 
                  />
                </View>
                <Text style={[styles.stepCardTitle, { color: colors.text }]}>
                  {step.title}
                </Text>
                <Text style={[styles.stepCardAddress, { color: colors.icon }]} numberOfLines={2}>
                  {formatAddress(step.address)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Navigation Controls */}
        <View style={styles.controlsContainer}>
          <View style={styles.controlButtons}>
            <TouchableOpacity
              style={[
                styles.controlButton,
                { backgroundColor: colors.icon },
                currentStep === 0 && styles.controlButtonDisabled
              ]}
              onPress={handlePreviousStep}
              disabled={currentStep === 0}
            >
              <IconSymbol name="chevron.left" size={20} color="white" />
              <Text style={styles.controlButtonText}>Anterior</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.controlButton,
                { backgroundColor: colors.tint }
              ]}
              onPress={handleNextStep}
            >
              <Text style={styles.controlButtonText}>
                {currentStep === routeSteps.length - 1 ? 'Finalizar' : 'Próximo'}
              </Text>
              <IconSymbol name="chevron.right" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {!isNavigating && (
            <TouchableOpacity
              style={[styles.navigationButton, { backgroundColor: '#4CAF50' }]}
              onPress={handleStartNavigation}
            >
              <IconSymbol name="location.fill" size={20} color="white" />
              <Text style={styles.navigationButtonText}>Iniciar Navegação</Text>
            </TouchableOpacity>
          )}
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  progressContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  currentStepCard: {
    marginHorizontal: 24,
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  currentStepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  stepAddress: {
    fontSize: 14,
    lineHeight: 20,
  },
  studentInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  studentPhone: {
    fontSize: 14,
  },
  mapContainer: {
    height: 200,
    marginHorizontal: 24,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  map: {
    flex: 1,
  },
  stepsContainer: {
    marginBottom: 16,
  },
  stepsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 24,
    marginBottom: 12,
  },
  stepsScroll: {
    paddingHorizontal: 24,
  },
  stepCard: {
    width: 120,
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
    alignItems: 'center',
  },
  stepCardIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stepCardTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  stepCardAddress: {
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 14,
  },
  controlsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  controlButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  controlButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  controlButtonDisabled: {
    opacity: 0.5,
  },
  controlButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  navigationButton: {
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
  navigationButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
