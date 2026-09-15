import { StyleSheet } from 'react-native';

const GREEN = '#2fb676';
const BG_PANEL = '#0d1526';
const BG_INPUT = '#080d1a';
const TEXTO_PRINCIPAL = '#ffffff';
const TEXTO_SECUNDARIO = 'rgba(255,255,255,0.50)';

export const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 28,
    height: 58,
    width: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 29,
    backgroundColor: GREEN,
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 10,
  },
  fabPunto: {
    position: 'absolute',
    right: 4,
    top: 4,
    height: 12,
    width: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: BG_PANEL,
    backgroundColor: '#f87171',
  },

  modalFondo: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(10,15,30,0.55)',
  },
  zonaFuera: {
    flex: 1,
  },
  panel: {
    height: '92%',
    backgroundColor: BG_PANEL,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(47,182,118,0.16)',
  },
  panelBarra: {
    alignSelf: 'center',
    marginTop: 10,
    height: 4,
    width: 40,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  headerAvatar: {
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(47,182,118,0.30)',
    backgroundColor: 'rgba(47,182,118,0.10)',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitulo: {
    fontSize: 15,
    fontWeight: 'bold',
    color: TEXTO_PRINCIPAL,
  },
  headerEstado: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  headerEstadoPunto: {
    height: 7,
    width: 7,
    borderRadius: 4,
    backgroundColor: GREEN,
  },
  headerEstadoTexto: {
    fontSize: 11,
    color: TEXTO_SECUNDARIO,
  },
  botonCerrar: {
    height: 32,
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },

  lista: {
    flex: 1,
  },
  listaContenido: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
  },
  burbuja: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  burbujaAsistente: {
    alignSelf: 'flex-start',
    borderTopLeftRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  burbujaUsuario: {
    alignSelf: 'flex-end',
    borderTopRightRadius: 4,
    backgroundColor: GREEN,
  },
  burbujaTexto: {
    fontSize: 14,
    lineHeight: 20,
    color: TEXTO_PRINCIPAL,
  },
  burbujaTextoUsuario: {
    color: '#ffffff',
  },
  burbujaHora: {
    marginTop: 4,
    alignSelf: 'flex-end',
    fontSize: 10,
    color: 'rgba(255,255,255,0.50)',
  },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  inputContenedor: {
    flex: 1,
    minHeight: 46,
    maxHeight: 110,
    justifyContent: 'center',
    borderRadius: 23,
    borderWidth: 1,
    borderColor: 'rgba(47,182,118,0.16)',
    backgroundColor: BG_INPUT,
    paddingHorizontal: 16,
  },
  input: {
    fontSize: 14,
    color: TEXTO_PRINCIPAL,
    paddingVertical: 0,
  },
  botonEnviar: {
    height: 46,
    width: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 23,
    backgroundColor: GREEN,
  },
  botonEnviarInactivo: {
    opacity: 0.4,
  },
});
