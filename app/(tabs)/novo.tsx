// app/(tabs)/novo.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Resolver } from 'react-hook-form';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuthStore } from '@/store/authStore';
import { useAgendamentos } from '@/hooks/useAgendamentos';
import { FormInput } from '@/components/FormInput';
import { TipoAgendamento } from '@/types';
import { LABELS_TIPO } from '@/constants';
import { formatarDataHora } from '@/utils/formatters';
import { OfflineBanner } from '@/components/OfflineBanner';
import { useRouter } from 'expo-router';

// ── Schema de validação ────────────────────────────────────────────────────
const schema = z.object({
    titulo: z.string().min(3, 'Título deve ter ao menos 3 caracteres'),
    descricao: z.string().default(''),
});

// TOutput é o tipo que o Zod entrega após validar e aplicar defaults
// É o tipo que useForm, onSubmit e criar() irão usar
type TOutput = z.infer<typeof schema>; // { titulo: string; descricao: string }

// ── Constante de tipos de agendamento ─────────────────────────────────────
const TIPOS: TipoAgendamento[] = ['orientacao', 'laboratorio', 'atendimento', 'reuniao'];

// ── Componente ─────────────────────────────────────────────────────────────
export default function NovoAgendamentoScreen() {
    const usuario = useAuthStore(s => s.usuario);
    const { criar } = useAgendamentos();

    const router = useRouter();

    const [dataHora, setDataHora] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);
    const [tipo, setTipo] = useState<TipoAgendamento>('atendimento');

    // useForm com TOutput em todos os generics garante que o TypeScript
    // trata o formulário inteiro como { titulo: string; descricao: string }.
    // O cast "as unknown as Resolver<TOutput>" é necessário porque versões
    // recentes de @hookform/resolvers têm uma incompatibilidade de tipos
    // com schemas Zod que usam .default() — o comportamento em runtime
    // é correto, apenas a assinatura de tipos diverge entre as libs.
    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<TOutput, unknown, TOutput>({
        resolver: zodResolver(schema) as unknown as Resolver<TOutput>,
        defaultValues: { titulo: '', descricao: '' },
    });

    async function onSubmit(data: TOutput) {
        if (!usuario) return;
        const sucesso = await criar({
            titulo: data.titulo,
            descricao: data.descricao,
            dataHora: dataHora.toISOString(),
            tipo,
            usuarioId: usuario.id,
        });
        if (sucesso) {
            Alert.alert('✅ Sucesso', 'Agendamento criado!', [
                {
                    text: 'OK',
                    onPress: () => router.replace('/(tabs)/agendamentos'),
                },
            ]);
            reset();
            setDataHora(new Date());
            setTipo('atendimento');
        }
    }

    return (
        <SafeAreaView style={styles.safe}>
            <OfflineBanner />
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.titulo}>Novo Agendamento</Text>

                {/* Campo Título */}
                <Controller
                    control={control}
                    name="titulo"
                    render={({ field: { onChange, value } }) => (
                        <FormInput
                            label="Título *"
                            placeholder="Ex: Orientação de TCC"
                            value={value}
                            onChangeText={onChange}
                            erro={errors.titulo?.message}
                        />
                    )}
                />

                {/* Campo Descrição */}
                <Controller
                    control={control}
                    name="descricao"
                    render={({ field: { onChange, value } }) => (
                        <FormInput
                            label="Descrição"
                            placeholder="Detalhes do agendamento..."
                            multiline
                            numberOfLines={3}
                            value={value}
                            onChangeText={onChange}
                        />
                    )}
                />

                {/* Seletor de Tipo */}
                <Text style={styles.label}>Tipo *</Text>
                <View style={styles.chips}>
                    {TIPOS.map(t => (
                        <TouchableOpacity
                            key={t}
                            style={[styles.chip, tipo === t && styles.chipAtivo]}
                            onPress={() => setTipo(t)}
                        >
                            <Text style={[styles.chipTxt, tipo === t && styles.chipTxtAtivo]}>
                                {LABELS_TIPO[t]}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Seletor de Data e Hora */}
                <Text style={styles.label}>Data e Hora *</Text>
                <TouchableOpacity
                    style={styles.datePicker}
                    onPress={() => setShowPicker(true)}
                >
                    <Text style={styles.dateTexto}>
                        {formatarDataHora(dataHora.toISOString())}
                    </Text>
                    <Text>📅</Text>
                </TouchableOpacity>

                {showPicker && (
                    <DateTimePicker
                        value={dataHora}
                        mode="datetime"
                        display={Platform.OS === 'ios' ? 'compact' : 'default'}
                        minimumDate={new Date()}
                        onChange={(event, date) => {
                            setShowPicker(Platform.OS === 'ios');
                            if (date) setDataHora(date);
                        }}
                    />
                )}

                {/* Botão de Submit */}
                <TouchableOpacity
                    style={styles.btn}
                    onPress={handleSubmit(onSubmit)}
                >
                    <Text style={styles.btnTxt}>Criar Agendamento</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

// ── Estilos ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#F9FAFB' },
    container: { padding: 24 },
    titulo: { fontSize: 24, fontWeight: '800', color: '#1F3864', marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
    chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
    chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#E5E7EB' },
    chipAtivo: { backgroundColor: '#2E5FA3' },
    chipTxt: { color: '#374151', fontWeight: '600', fontSize: 13 },
    chipTxtAtivo: { color: '#FFFFFF' },
    datePicker: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, backgroundColor: '#F9FAFB', marginBottom: 24 },
    dateTexto: { fontSize: 15, color: '#111' },
    btn: { backgroundColor: '#2E5FA3', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 25 },
    btnTxt: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});