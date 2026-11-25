import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

interface GrafanaPanelProps {
  url: string;
  titulo: string;
}

export default function GrafanaPanel({ url, titulo }: GrafanaPanelProps) {
  return (
    <View style={styles.contenedor}>
      <WebView
        source={{ uri: url }}
        style={styles.webview}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        renderLoading={() => (
          <View style={styles.cargando}>
            <ActivityIndicator color="#2fb676" />
            <Text style={styles.textoCargando}>Cargando {titulo}...</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { height: 360, overflow: 'hidden', borderRadius: 12, backgroundColor: '#101c2e' },
  webview: { flex: 1, backgroundColor: '#101c2e' },
  cargando: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#101c2e',
  },
  textoCargando: { color: '#b2bfd4', fontSize: 12 },
});
