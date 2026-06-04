// app/(auth)/login.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FormInput } from '@/components/FormInput';
import { useAuth } from '@/hooks/useAuth';

// Schema de validação com Zod
const schema = z.object({
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

type FormData = z.infer<typeof schema>;  // TypeScript infere o tipo do schema

export default function LoginScreen() {
  const { login, carregando, erro } = useAuth();

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),  // integra validação zod com react-hook-form
  });

  async function onSubmit(data: FormData) {
    const sucesso = await login(data);
    if (!sucesso && erro) Alert.alert('Erro', erro);
    // Se sucesso: o AuthGuard em _layout.tsx detecta token e redireciona
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.logo}>📅</Text>
        <Text style={styles.titulo}>Agendamentos</Text>
        <Text style={styles.subtitulo}>Acesse sua conta</Text>

        {/* Controller integra qualquer input com react-hook-form */}
        <Controller
          control={control}
          name='email'
          render={({ field: { onChange, value } }) => (
            <FormInput
              label='E-mail'
              placeholder='seu@email.com'
              keyboardType='email-address'
              autoCapitalize='none'
              value={value}
              onChangeText={onChange}
              erro={errors.email?.message}
            />
          )}
        />

        <Controller
          control={control}
          name='senha'
          render={({ field: { onChange, value } }) => (
            <FormInput
              label='Senha'
              placeholder='••••••••'
              secureTextEntry
              value={value}
              onChangeText={onChange}
              erro={errors.senha?.message}
            />
          )}
        />

        <TouchableOpacity
          style={[styles.btn, carregando && styles.btnDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={carregando}
        >
          <Text style={styles.btnTxt}>{carregando ? 'Entrando...' : 'Entrar'}</Text>
        </TouchableOpacity>

        <Link href='/(auth)/register' asChild>
          <TouchableOpacity style={styles.linkCadastro}>
            <Text style={styles.linkTxt}>Não tem conta? Cadastre-se</Text>
          </TouchableOpacity>
        </Link>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: '#F9FAFB' },
  container:   { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logo:        { fontSize: 64, textAlign: 'center', marginBottom: 8 },
  titulo:      { fontSize: 28, fontWeight: '800', color: '#1F3864', textAlign: 'center' },
  subtitulo:   { fontSize: 16, color: '#6B7280', textAlign: 'center', marginBottom: 32 },
  btn:         { backgroundColor: '#2E5FA3', padding: 16, borderRadius: 12, alignItems: 'center' },
  btnDisabled: { opacity: 0.6 },
  btnTxt:      { color: '#FFF', fontSize: 16, fontWeight: '700' },
  linkCadastro:{ marginTop: 20, alignItems: 'center' },
  linkTxt:     { color: '#2E5FA3', fontSize: 15 },
});
