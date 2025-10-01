import { Address } from '@/contexts/StudentContext';

export interface CepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

export const validateCep = async (cep: string): Promise<Address | null> => {
  try {
    // Remove caracteres não numéricos
    const cleanCep = cep.replace(/\D/g, '');
    
    // Valida formato do CEP
    if (cleanCep.length !== 8) {
      throw new Error('CEP deve ter 8 dígitos');
    }

    // Consulta a API ViaCEP
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    const data: CepResponse = await response.json();

    if (data.erro) {
      throw new Error('CEP não encontrado');
    }

    return {
      cep: data.cep,
      street: data.logradouro,
      number: '',
      neighborhood: data.bairro,
      city: data.localidade,
      state: data.uf,
      complement: data.complemento || '',
    };
  } catch (error) {
    console.error('Erro ao validar CEP:', error);
    throw error;
  }
};

export const formatCep = (cep: string): string => {
  const numbers = cep.replace(/\D/g, '');
  if (numbers.length <= 5) {
    return numbers;
  }
  return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
};
