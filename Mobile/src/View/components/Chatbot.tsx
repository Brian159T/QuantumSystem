import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from '../../styles/Chatbot.styles';

interface Mensaje {
  id: string;
  remitente: 'usuario' | 'asistente';
  texto: string;
  hora: string;
}

const MENSAJE_INICIAL: Mensaje = {
  id: '0',
  remitente: 'asistente',
  texto: '¡Hola! Soy el asistente de Quantum. ¿En qué puedo ayudarte?',
  hora: '',
};

const horaActual = () =>
  new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' });

interface ChatbotProps {
  bottomOffset?: number;
}

const Chatbot = ({ bottomOffset = 28 }: ChatbotProps) => {
  const [visible, setVisible] = useState(false);
  const [mensajes, setMensajes] = useState<Mensaje[]>([MENSAJE_INICIAL]);
  const [texto, setTexto] = useState('');

  const abrir = () => setVisible(true);
  const cerrar = () => setVisible(false);

  const enviar = () => {
    const contenido = texto.trim();
    if (!contenido) return;

    setMensajes((prev) => [
      ...prev,
      { id: String(Date.now()), remitente: 'usuario', texto: contenido, hora: horaActual() },
    ]);
    setTexto('');
  };

  const renderMensaje = ({ item }: { item: Mensaje }) => {
    const esUsuario = item.remitente === 'usuario';
    return (
      <View style={[styles.burbuja, esUsuario ? styles.burbujaUsuario : styles.burbujaAsistente]}>
        <Text style={[styles.burbujaTexto, esUsuario && styles.burbujaTextoUsuario]}>
          {item.texto}
        </Text>
        {item.hora ? <Text style={styles.burbujaHora}>{item.hora}</Text> : null}
      </View>
    );
  };

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={abrir}
        style={[styles.fab, { bottom: bottomOffset }]}>
        <MaterialCommunityIcons name="chat" size={26} color="#ffffff" />
        <View style={styles.fabPunto} />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={cerrar}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalFondo}>
          <Pressable style={styles.zonaFuera} onPress={cerrar} />

          <View style={styles.panel}>
            <View style={styles.panelBarra} />

            <View style={styles.header}>
              <View style={styles.headerAvatar}>
                <MaterialCommunityIcons name="robot-happy-outline" size={18} color="#2fb676" />
              </View>
              <View style={styles.headerInfo}>
                <Text style={styles.headerTitulo}>Asistente Quantum</Text>
                <View style={styles.headerEstado}>
                  <View style={styles.headerEstadoPunto} />
                  <Text style={styles.headerEstadoTexto}>En línea</Text>
                </View>
              </View>
              <Pressable onPress={cerrar} hitSlop={12} style={styles.botonCerrar}>
                <MaterialCommunityIcons name="close" size={18} color="rgba(255,255,255,0.50)" />
              </Pressable>
            </View>

            <FlatList
              data={mensajes}
              keyExtractor={(item) => item.id}
              renderItem={renderMensaje}
              contentContainerStyle={styles.listaContenido}
              style={styles.lista}
            />

            <View style={styles.inputBar}>
              <View style={styles.inputContenedor}>
                <TextInput
                  style={styles.input}
                  placeholder="Escribe tu mensaje..."
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  value={texto}
                  onChangeText={setTexto}
                  multiline
                  onSubmitEditing={enviar}
                  returnKeyType="send"
                />
              </View>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={enviar}
                disabled={!texto.trim()}
                style={[styles.botonEnviar, !texto.trim() && styles.botonEnviarInactivo]}>
                <MaterialCommunityIcons name="send" size={18} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

export default Chatbot;
