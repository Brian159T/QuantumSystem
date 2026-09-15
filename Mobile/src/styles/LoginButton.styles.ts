import { StyleSheet } from 'react-native'

 export const styles = StyleSheet.create({
  loginButton: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.28)',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  loginButtonText: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.3,
    color: '#fff',
  },

  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(10,15,30,0.88)',
  },
  kav: {
    width: '100%',
    maxWidth: 390,
  },
  modalCard: {
    overflow: 'hidden',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(47,182,118,0.16)',
    backgroundColor: '#0d1526',
    padding: 28,
    paddingTop: 0,
  },
  topBar: {
    marginHorizontal: -28,
    marginBottom: 28,
    height: 3,
    backgroundColor: '#2fb676',
  },
  closeButton: {
    position: 'absolute',
    right: 18,
    top: 18,
    zIndex: 10,
    height: 32,
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },

  field: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
  },
  fieldFocused: {
    borderColor: 'rgba(47,182,118,0.52)',
    backgroundColor: 'rgba(47,182,118,0.04)',
  },
  fieldBlurred: {
    borderColor: 'rgba(47,182,118,0.16)',
    backgroundColor: '#080d1a',
  },
  fieldIcon: {
    marginRight: 10,
  },
  fieldInput: {
    height: '100%',
    flex: 1,
    fontSize: 14,
    color: '#fff',
  },

  iconHeaderWrap: {
    marginBottom: 18,
    alignItems: 'center',
  },
  iconCircle: {
    height: 58,
    width: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 29,
    borderWidth: 1,
    borderColor: 'rgba(47,182,118,0.28)',
    backgroundColor: 'rgba(47,182,118,0.10)',
  },
  title: {
    marginBottom: 6,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 0.2,
    color: '#fff',
  },
  subtitle: {
    marginBottom: 26,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.50)',
  },

  fieldWrapper: {
    marginBottom: 16,
  },
  fieldLabel: {
    marginBottom: 8,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: 'rgba(255,255,255,0.70)',
  },
  fieldLabelRow: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldLabelInline: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: 'rgba(255,255,255,0.70)',
  },
  forgotText: {
    marginBottom: 8,
    fontSize: 11,
    fontWeight: '500',
    color: '#2fb676',
  },

  errorText: {
    marginBottom: 12,
    textAlign: 'center',
    fontSize: 12,
    color: '#f87171',
  },

  submitButton: {
    marginTop: 8,
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    backgroundColor: '#2fb676',
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 0.3,
    color: '#fff',
  },

  dividerRow: {
    marginVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dividerLine: {
    height: 1,
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  dividerText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.50)',
  },

  secondaryButton: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(47,182,118,0.30)',
    backgroundColor: 'rgba(47,182,118,0.06)',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2fb676',
  },

  backButton: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.50)',
  },
})
