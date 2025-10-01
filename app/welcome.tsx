import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    Dimensions,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const { user, logout } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      
      <LinearGradient
        colors={[colors.tint, colors.background]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          {/* Header com ícone */}
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
              <IconSymbol name="checkmark.circle.fill" size={80} color={colors.tint} />
            </View>
          </View>

          {/* Mensagem de boas-vindas */}
          <View style={styles.welcomeSection}>
            <Text style={[styles.welcomeTitle, { color: colors.text }]}>
              Bem-vindo!
            </Text>
            <Text style={[styles.welcomeSubtitle, { color: colors.icon }]}>
              Login realizado com sucesso
            </Text>
            
            {user && (
              <View style={[styles.userInfo, { backgroundColor: colors.background }]}>
                <View style={styles.userIcon}>
                  <IconSymbol name="person.fill" size={24} color={colors.tint} />
                </View>
                <View style={styles.userDetails}>
                  <Text style={[styles.userName, { color: colors.text }]}>
                    {user.name || 'Usuário'}
                  </Text>
                  <Text style={[styles.userEmail, { color: colors.icon }]}>
                    {user.email}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Cards de informações */}
          <View style={styles.cardsContainer}>
            <View style={[styles.card, { backgroundColor: colors.background }]}>
              <IconSymbol name="star.fill" size={32} color="#FFD700" />
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Experiência Premium
              </Text>
              <Text style={[styles.cardDescription, { color: colors.icon }]}>
                Aproveite todos os recursos disponíveis
              </Text>
            </View>

            <View style={[styles.card, { backgroundColor: colors.background }]}>
              <IconSymbol name="shield.fill" size={32} color="#4CAF50" />
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Segurança Total
              </Text>
              <Text style={[styles.cardDescription, { color: colors.icon }]}>
                Seus dados estão protegidos
              </Text>
            </View>
          </View>

          {/* Botão de logout */}
          <TouchableOpacity
            style={[styles.logoutButton, { borderColor: colors.tint }]}
            onPress={handleLogout}
          >
            <IconSymbol name="arrow.right.square" size={20} color={colors.tint} />
            <Text style={[styles.logoutButtonText, { color: colors.tint }]}>
              Sair
            </Text>
          </TouchableOpacity>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  welcomeSection: {
    alignItems: 'center',
    marginVertical: 32,
  },
  welcomeTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  welcomeSubtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 32,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  userIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 32,
  },
  card: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 2,
    marginTop: 20,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
