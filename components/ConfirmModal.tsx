// components/ConfirmModal.tsx
import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  visivel: boolean;
  titulo: string;
  mensagem: string;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export const ConfirmModal: React.FC<Props> = ({
  visivel, titulo, mensagem, onConfirmar, onCancelar
}) => (
  <Modal transparent visible={visivel} animationType='fade'>
    <View style={styles.overlay}>
      <View style={styles.box}>
        <Text style={styles.titulo}>{titulo}</Text>
        <Text style={styles.msg}>{mensagem}</Text>
        <View style={styles.botoes}>
          <TouchableOpacity style={styles.btnCancel} onPress={onCancelar}>
            <Text style={styles.txtCancel}>Não</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnConfirm} onPress={onConfirmar}>
            <Text style={styles.txtConfirm}>Sim, confirmar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  box:        { backgroundColor: '#FFF', borderRadius: 16, padding: 24, width: '85%' },
  titulo:     { fontSize: 18, fontWeight: '700', color: '#1F3864', marginBottom: 10 },
  msg:        { fontSize: 15, color: '#555', marginBottom: 24 },
  botoes:     { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  btnCancel:  { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: '#F3F4F6' },
  btnConfirm: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: '#2E5FA3' },
  txtCancel:  { color: '#374151', fontWeight: '600' },
  txtConfirm: { color: '#FFF', fontWeight: '600' },
});
