import { StyleSheet } from 'react-native'
export const GREEN = '#2fb676'
export const BLUE = '#4D9FFF'
export const BG_DARK = '#0A0F1E'
export const WHITE = '#ffffff'
export const TEXT_DARK = '#0d1b3e'
export const TEXT_SOFT = '#8a94b0'
export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f0f2f7',
  },

  // Header detalle
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0A0F1E',
    paddingHorizontal: 20,
    paddingBottom: 5,
    paddingTop: 30,
  },
  backButton: {
    width: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  headerTitleWrap: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    marginTop: 1,
    fontSize: 12,
    color: 'rgba(255,255,255,0.40)',
  },
  headerSpacer: {
    width: 72,
  },

  // Imagen
  imageWrap: {
    marginHorizontal: 20,
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: 16,
    padding: 16,
  },
  detailImage: {
    height: 200,
    width: '100%',
  },
  discountBadge: {
    position: 'absolute',
    right: 14,
    top: 14,
    borderRadius: 10,
    backgroundColor: '#2fb676',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  discountBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
  },

  // Colores
  colorsCard: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e6f0',
    backgroundColor: '#fff',
    padding: 16,
  },
  cardTitle: {
    marginBottom: 4,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0d1b3e',
  },
  activeColorRow: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activeColorText: {
    fontSize: 12,
    color: '#2fb676',
  },
  swatchRow: {
    marginBottom: 10,
    flexDirection: 'row',
    gap: 10,
  },
  swatch: {
    height: 44,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 2,
  },
  swatchActive: {
    borderColor: '#0d1b3e',
  },
  swatchInactive: {
    borderColor: 'transparent',
  },
  colorNamesRow: {
    flexDirection: 'row',
  },
  colorNameText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  colorNameActive: {
    fontWeight: 'bold',
    color: '#0d1b3e',
  },
  colorNameInactive: {
    color: '#8a94b0',
  },

  // Ficha técnica
  specsSection: {
    marginTop: 16,
  },
  specsTitle: {
    marginBottom: 12,
    paddingHorizontal: 20,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0d1b3e',
  },
  specCard: {
    alignItems: 'center',
    gap: 10,
    borderRadius: 18,
    borderWidth: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  specIconWrap: {
    height: 60,
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  specLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#8a94b0',
  },
  specValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  specDotsRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
  },
  specDot: {
    height: 5,
    borderRadius: 3,
  },
  specDotActive: {
    width: 16,
    backgroundColor: '#2fb676',
  },
  specDotInactive: {
    width: 5,
    backgroundColor: '#c8d0e0',
  },

  // Precio
  priceCard: {
    marginHorizontal: 20,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e6f0',
    backgroundColor: '#fff',
    padding: 16,
  },
  priceLabel: {
    marginBottom: 4,
    fontSize: 11,
    color: '#8a94b0',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0d1b3e',
  },
  originalPrice: {
    fontSize: 14,
    color: '#8a94b0',
    textDecorationLine: 'line-through',
  },
  driveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  driveBadgeText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2fb676',
  },

  // CTA
  ctaButton: {
    marginHorizontal: 20,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 16,
    backgroundColor: '#2fb676',
    paddingVertical: 16,
  },
  ctaButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 1,
    color: '#fff',
  },
  ctaNote: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 11,
    color: '#8a94b0',
  },

  // Header lista
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0A0F1E',
    paddingHorizontal: 20,
    paddingBottom: 15,
    paddingTop: 30,
  },

  // Tarjeta de modelo (lista)
  modelCard: {
    marginHorizontal: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e6f0',
    backgroundColor: '#fff',
    padding: 14,
  },
  modelIndex: {
    width: 20,
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2fb676',
  },
  modelInfo: {
    flex: 1,
  },
  modelNameRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  modelName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0d1b3e',
  },
  modelBadge: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  modelBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#2fb676',
  },
  modelSubtitle: {
    marginBottom: 6,
    marginTop: 1,
    fontSize: 11,
    color: '#8a94b0',
  },
  modelSpecRow: {
    marginBottom: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  modelSpecText: {
    fontSize: 10,
    color: '#4a5578',
  },
  modelColorsRow: {
    marginTop: 7,
    flexDirection: 'row',
    gap: 5,
  },
  miniSwatch: {
    height: 14,
    width: 14,
    borderRadius: 7,
  },
  miniSwatchActive: {
    borderWidth: 2,
    borderColor: '#0d1b3e',
  },
  miniSwatchInactive: {
    borderWidth: 1,
    borderColor: 'transparent',
  },
  modelColorName: {
    marginTop: 3,
    fontSize: 9,
    color: '#8a94b0',
  },
  modelRight: {
    width: 120,
    alignItems: 'flex-end',
    gap: 4,
  },
  modelImage: {
    height: 70,
    width: 120,
  },
  modelPriceBadge: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  modelPriceText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2fb676',
  },
})
