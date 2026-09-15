import { StyleSheet } from 'react-native'
export const COLORS = {
  primary: '#2fb676',
  primaryDark: '#239a61',
  primaryLight: '#e8f8f0',
  navy: '#0A0F1E',
  navyMid: '#1a2f5e',
  blue: '#1e4fd8',
  blueLight: '#2563eb',
  white: '#ffffff',
  gray: '#f4f6fb',
  grayMid: '#c8d0e0',
  grayText: '#6b7a99',
  dark: '#0a1628',
  cardBg: '#f0f4ff',
}

export const styles = StyleSheet.create({
  // Root / header / scroll
  root: {
    flex: 1,
    backgroundColor: '#0A0F1E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: '#0A0F1E',
    paddingHorizontal: 20,
    paddingBottom: 15,
    paddingTop: 30,
  },
  scroll: {
    flex: 1,
    backgroundColor: '#f4f6fb',
  },

  // Banner
  banner: {
    marginHorizontal: 16,
    marginBottom: 4,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: 20,
    backgroundColor: '#1a2f5e',
    padding: 20,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
    color: '#fff',
  },
  bannerSubtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    color: '#2fb676',
  },
  bannerIconWrap: {
    height: 70,
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Formulario
  formCard: {
    margin: 16,
    borderRadius: 24,
    backgroundColor: '#fff',
    padding: 20,
  },
  formSectionTitle: {
    marginBottom: 14,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: '#0A0F1E',
  },
  formSectionTitleMt: {
    marginTop: 24,
  },
  inputLabel: {
    marginBottom: 6,
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7a99',
  },
  textInput: {
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#c8d0e0',
    backgroundColor: '#f4f6fb',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0a1628',
  },

  // Modelo
  modelOption: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 12,
  },
  modelOptionSelected: {
    borderColor: '#2fb676',
    backgroundColor: '#e8f8f0',
  },
  modelOptionUnselected: {
    borderColor: '#c8d0e0',
    backgroundColor: '#f0f4ff',
  },
  modelEmojiWrap: {
    height: 50,
    width: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modelEmoji: {
    fontSize: 36,
  },
  modelOptionInfo: {
    flex: 1,
  },
  modelOptionName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  modelOptionNameSelected: {
    color: '#2fb676',
  },
  modelOptionNameUnselected: {
    color: '#0A0F1E',
  },
  modelBasePrice: {
    marginTop: 2,
    fontSize: 12,
    color: '#6b7a99',
  },
  modelDiscount: {
    fontWeight: 'bold',
    color: '#2fb676',
  },
  modelTotalPrice: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: '800',
    color: '#1e4fd8',
  },
  radioCircle: {
    height: 22,
    width: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    borderWidth: 2,
  },
  radioCircleSelected: {
    borderColor: '#2fb676',
  },
  radioCircleUnselected: {
    borderColor: '#c8d0e0',
  },
  radioDot: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: '#2fb676',
  },

  // Colores
  colorsWrap: {
    marginBottom: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    alignItems: 'center',
  },
  colorDotCircle: {
    height: 44,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  colorDotBorder: {
    borderWidth: 1.5,
    borderColor: '#c8d0e0',
  },
  colorDotSelected: {
    borderWidth: 3,
    borderColor: '#2fb676',
  },
  colorCheckmark: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowRadius: 4,
    textShadowOffset: { width: 0, height: 0 },
  },
  colorLabel: {
    marginTop: 4,
    textAlign: 'center',
    fontSize: 9,
    fontWeight: '500',
  },
  colorLabelSelected: {
    fontWeight: 'bold',
    color: '#2fb676',
  },
  colorLabelUnselected: {
    color: '#6b7a99',
  },

  // Precio reserva
  reservePriceRow: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    backgroundColor: '#e8f8f0',
    padding: 14,
  },
  reservePriceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A0F1E',
  },
  reservePriceValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#2fb676',
  },

  submitButton: {
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 16,
  },
  submitButtonActive: {
    backgroundColor: '#2fb676',
  },
  submitButtonDisabled: {
    backgroundColor: '#c8d0e0',
  },
  helperText: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 12,
    color: '#6b7a99',
  },

  // Modal compartido
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalSheet: {
    maxHeight: '90%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: '#fff',
    padding: 20,
  },
  modalHeader: {
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalHeaderBar: {
    height: 24,
    width: 4,
    borderRadius: 2,
    backgroundColor: '#2fb676',
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: '#0A0F1E',
  },
  modalCloseButton: {
    height: 32,
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#f4f6fb',
  },
  modalCloseText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6b7a99',
  },

  carPlaceholder: {
    marginBottom: 16,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#f0f4ff',
  },
  carEmoji: {
    fontSize: 48,
  },
  carPlaceholderLabel: {
    marginTop: 4,
    fontSize: 12,
    color: '#6b7a99',
  },

  infoSection: {
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: '#f4f6fb',
    padding: 16,
  },
  sectionLabel: {
    marginBottom: 12,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: '#2fb676',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6b7a99',
  },
  infoValue: {
    maxWidth: '55%',
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '600',
    color: '#0A0F1E',
  },
  infoValueGreen: {
    maxWidth: '55%',
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '600',
    color: '#2fb676',
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0A0F1E',
  },
  totalValue: {
    maxWidth: '55%',
    textAlign: 'right',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0A0F1E',
  },
  divider: {
    height: 1,
    backgroundColor: '#c8d0e0',
    opacity: 0.5,
  },
  colorValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  colorDot: {
    height: 14,
    width: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#c8d0e0',
  },

  qrCenter: {
    alignItems: 'center',
  },
  qrBox: {
    height: 160,
    width: 160,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#c8d0e0',
    backgroundColor: '#fff',
  },
  qrCornerBase: {
    position: 'absolute',
    height: 20,
    width: 20,
    borderTopLeftRadius: 4,
    borderLeftWidth: 3,
    borderTopWidth: 3,
    borderColor: '#2fb676',
  },
  qrCornerTL: {
    left: 8,
    top: 8,
  },
  qrCornerTR: {
    right: 8,
    top: 8,
  },
  qrCornerBL: {
    bottom: 8,
    left: 8,
  },
  qrCornerBR: {
    bottom: 8,
    right: 8,
  },
  qrPlaceholderIcon: {
    fontSize: 36,
    opacity: 0.2,
  },
  qrText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7a99',
  },
  qrSubtext: {
    marginTop: 2,
    fontSize: 11,
    color: '#c8d0e0',
  },

  refundNote: {
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#2fb676',
  },

  primaryButton: {
    marginBottom: 10,
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: '#2fb676',
    paddingVertical: 16,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#fff',
  },
  cancelButton: {
    marginBottom: 10,
    alignItems: 'center',
    paddingVertical: 10,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7a99',
  },

  // Modal de éxito
  successSheet: {
    maxHeight: '92%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: '#fff',
    padding: 24,
  },
  successIconWrap: {
    marginBottom: 12,
    height: 64,
    width: 64,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 32,
    backgroundColor: '#2fb676',
  },
  successIconText: {
    fontSize: 30,
    fontWeight: '900',
    color: '#fff',
  },
  successTitle: {
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#0A0F1E',
  },
  successCarPlaceholder: {
    marginBottom: 16,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#f0f4ff',
  },
  successCarEmoji: {
    fontSize: 56,
  },
  confirmationValue: {
    maxWidth: '55%',
    textAlign: 'right',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2fb676',
  },
  nextStepsBox: {
    marginBottom: 20,
    borderRadius: 16,
    backgroundColor: '#e8f8f0',
    padding: 16,
  },
  nextStepsTitle: {
    marginBottom: 8,
    fontSize: 13,
    fontWeight: '800',
    color: '#2fb676',
  },
  nextStepsItem: {
    marginBottom: 4,
    fontSize: 13,
    color: '#0A0F1E',
  },
})