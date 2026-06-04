// app/(auth)/register.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FormInput } from '@/components/FormInput';
import { salvarUsuarioLocal } from '@/services/database';
import { useAuthStore } from '@/store/authStore';
import * as SecureStore from 'expo-secure-store';
import api from '@/services/api';

const schema = z.object({
  nome: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmaSenha: z.string(),
}).refine(d => d.senha === d.confirmaSenha, {
  message: 'As senhas não coincidem',
  path: ['confirmaSenha'],
});

type FormData = z.infer<typeof schema>;

export default function RegisterScreen() {
  const router = useRouter();
  const setAuth = useAuthStore(s => s.setAuth);
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    try {
      // Tenta registrar no backend (online)
      const { data: resposta } = await api.post('/auth/register', {
        nome: data.nome,
        email: data.email,
        senha: data.senha,
        tipo: 'aluno',
      });
      await SecureStore.setItemAsync('jwt_access_token', resposta.accessToken);
      await SecureStore.setItemAsync('jwt_refresh_token', resposta.refreshToken);
      await salvarUsuarioLocal(resposta.usuario);
      await AsyncStorage.setItem('usuario_logado', JSON.stringify(resposta.usuario));
      setAuth(resposta.usuario, resposta.accessToken);
    } catch (e: any) {
      // Offline: cria localmente com token temporário
      if (!e.response) {
        const novoUsuario = {
          id: Date.now(), nome: data.nome, email: data.email,
          tipo: 'aluno' as const, criadoEm: new Date().toISOString(),
        };
        await salvarUsuarioLocal(novoUsuario);
        await AsyncStorage.setItem('usuario_logado', JSON.stringify(novoUsuario));
        setAuth(novoUsuario, 'token-local-' + novoUsuario.id);
      } else if (e.response?.status === 409) {
        Alert.alert('Erro', 'E-mail já cadastrado. Tente fazer login.');
      } else {
        Alert.alert('Erro', e.response?.data?.erro ?? 'Erro ao cadastrar.');
      }
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.voltar}>
          <Text style={styles.voltarTxt}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.titulo}>Criar Conta</Text>

        <Controller control={control} name='nome'
          render={({ field: { onChange, value } }) => (
            <FormInput label='Nome completo' placeholder='João Silva'
              value={value} onChangeText={onChange} erro={errors.nome?.message} />
          )} />

        <Controller control={control} name='email'
          render={({ field: { onChange, value } }) => (
            <FormInput label='E-mail' placeholder='seu@email.com'
              keyboardType='email-address' autoCapitalize='none'
              value={value} onChangeText={onChange} erro={errors.email?.message} />
          )} />

        <Controller control={control} name='senha'
          render={({ field: { onChange, value } }) => (
            <FormInput label='Senha' placeholder='••••••••'
              secureTextEntry value={value} onChangeText={onChange}
              erro={errors.senha?.message} />
          )} />

        <Controller control={control} name='confirmaSenha'
          render={({ field: { onChange, value } }) => (
            <FormInput label='Confirmar senha' placeholder='••••••••'
              secureTextEntry value={value} onChangeText={onChange}
              erro={errors.confirmaSenha?.message} />
          )} />

        <TouchableOpacity style={styles.btn} onPress={handleSubmit(onSubmit)}>
          <Text style={styles.btnTxt}>Cadastrar</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { flexGrow: 1, padding: 24 },
  voltar: { marginBottom: 16 },
  voltarTxt: { color: '#2E5FA3', fontSize: 16 },
  titulo: { fontSize: 26, fontWeight: '800', color: '#1F3864', marginBottom: 24 },
  btn: { backgroundColor: '#2E5FA3', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  btnTxt: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
