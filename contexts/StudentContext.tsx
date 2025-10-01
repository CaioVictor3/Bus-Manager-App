import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export interface Address {
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  complement?: string;
}

export interface Student {
  id: string;
  name: string;
  phone: string;
  addressGo: Address;
  addressReturn?: Address;
  isPresent: boolean;
  createdAt: string;
}

export interface RouteSettings {
  startAddress: Address;
  endAddress: Address;
}

interface StudentContextType {
  students: Student[];
  routeSettings: RouteSettings | null;
  isLoading: boolean;
  addStudent: (student: Omit<Student, 'id' | 'createdAt' | 'isPresent'>) => Promise<boolean>;
  updateStudent: (id: string, student: Partial<Student>) => Promise<boolean>;
  deleteStudent: (id: string) => Promise<boolean>;
  toggleStudentPresence: (id: string) => Promise<boolean>;
  setRouteSettings: (settings: RouteSettings) => Promise<boolean>;
  getPresentStudents: () => Student[];
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

interface StudentProviderProps {
  children: ReactNode;
}

export function StudentProvider({ children }: StudentProviderProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [routeSettings, setRouteSettings] = useState<RouteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [studentsData, settingsData] = await Promise.all([
        AsyncStorage.getItem('students'),
        AsyncStorage.getItem('routeSettings'),
      ]);

      if (studentsData) {
        setStudents(JSON.parse(studentsData));
      }

      if (settingsData) {
        setRouteSettings(JSON.parse(settingsData));
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveStudents = async (newStudents: Student[]) => {
    try {
      await AsyncStorage.setItem('students', JSON.stringify(newStudents));
      setStudents(newStudents);
      return true;
    } catch (error) {
      console.error('Erro ao salvar alunos:', error);
      return false;
    }
  };

  const addStudent = async (studentData: Omit<Student, 'id' | 'createdAt' | 'isPresent'>): Promise<boolean> => {
    const newStudent: Student = {
      ...studentData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      isPresent: true,
    };

    const updatedStudents = [...students, newStudent];
    return await saveStudents(updatedStudents);
  };

  const updateStudent = async (id: string, studentData: Partial<Student>): Promise<boolean> => {
    const updatedStudents = students.map(student =>
      student.id === id ? { ...student, ...studentData } : student
    );
    return await saveStudents(updatedStudents);
  };

  const deleteStudent = async (id: string): Promise<boolean> => {
    const updatedStudents = students.filter(student => student.id !== id);
    return await saveStudents(updatedStudents);
  };

  const toggleStudentPresence = async (id: string): Promise<boolean> => {
    const updatedStudents = students.map(student =>
      student.id === id ? { ...student, isPresent: !student.isPresent } : student
    );
    return await saveStudents(updatedStudents);
  };

  const setRouteSettings = async (settings: RouteSettings): Promise<boolean> => {
    try {
      await AsyncStorage.setItem('routeSettings', JSON.stringify(settings));
      setRouteSettings(settings);
      return true;
    } catch (error) {
      console.error('Erro ao salvar configurações da rota:', error);
      return false;
    }
  };

  const getPresentStudents = (): Student[] => {
    return students.filter(student => student.isPresent);
  };

  return (
    <StudentContext.Provider
      value={{
        students,
        routeSettings,
        isLoading,
        addStudent,
        updateStudent,
        deleteStudent,
        toggleStudentPresence,
        setRouteSettings,
        getPresentStudents,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
}

export function useStudents() {
  const context = useContext(StudentContext);
  if (context === undefined) {
    throw new Error('useStudents deve ser usado dentro de um StudentProvider');
  }
  return context;
}
