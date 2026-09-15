import { Dimensions, StyleSheet } from 'react-native'
export const { width: SCREEN_WIDTH } = Dimensions.get('window')
export const CARD_WIDTH = SCREEN_WIDTH * 0.62
export const CARD_GAP = 12
export const CARD_SIDE_PADDING = 20

export const GREEN = '#2fb676'
export const BLUE = '#4D9FFF'
export const BG = '#0A0F1E'
export const WHITE = '#ffffff'
export const SUBTLE = '#e8edf8'
export const TEXT_DARK = '#0d1b3e'
export const TEXT_MID = '#4a5578'

export const PLACEHOLDER_HERO = 'https://placehold.co/700x320/0f3460/FFFFFF?text=+'
export const styles = StyleSheet.create({
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
    backgroundColor: '#f4f7ff',
  },

  // Card
  card: {
    overflow: 'hidden',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e8edf8',
    backgroundColor: '#fff',
  },
  cardImage: {
    height: 148,
    width: '100%',
  },
  badge: {
    position: 'absolute',
    left: 12,
    top: 12,
    borderRadius: 9999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardContent: {
    padding: 14,
  },
  cardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0d1b3e',
  },
  cardType: {
    marginBottom: 10,
    marginTop: 2,
    fontSize: 11,
    color: '#4a5578',
  },
  infoRow: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    backgroundColor: '#f4f7ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    flexShrink: 1,
    fontSize: 10,
    color: '#4a5578',
  },
  divider: {
    height: 16,
    width: 1,
    backgroundColor: '#e8edf8',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0d1b3e',
  },
  priceUsd: {
    fontSize: 11,
    fontWeight: 'normal',
    color: '#4a5578',
  },
  verButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 10,
    backgroundColor: '#0A0F1E',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  verButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },

  // Hero
  hero: {
    marginHorizontal: 16,
    marginTop: 12,
    overflow: 'hidden',
    borderRadius: 24,
    backgroundColor: '#1A2744',
  },
  heroImage: {
    height: 130,
    width: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    padding: 14,
  },
  offerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 9999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  offerBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#2fb676',
  },
  heroBottom: {
    alignSelf: 'flex-start',
  },
  heroTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    lineHeight: 20,
    color: '#fff',
  },
  heroTitleAccent: {
    color: '#2fb676',
  },
  heroButton: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    borderRadius: 10,
    backgroundColor: '#0A0F1E',
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  heroButtonText: {
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    color: '#fff',
  },

  // Stats
  statsRow: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    borderRadius: 16,
    backgroundColor: '#fff',
    padding: 14,
  },
  statIconWrap: {
    height: 36,
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0d1b3e',
  },
  statLabel: {
    textAlign: 'center',
    fontSize: 9,
    fontWeight: '500',
    color: '#4a5578',
  },

  // Modelos
  modelsSection: {
    marginTop: 24,
  },
  modelsHeader: {
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0d1b3e',
  },
  verTodosButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verTodosText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2fb676',
  },
  dotsRow: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 20,
  },
  dot: {
    marginVertical: 2,
    height: 5,
    borderRadius: 3,
  },
  dotActive: {
    width: 16,
    backgroundColor: '#2fb676',
  },
  dotInactive: {
    width: 5,
    backgroundColor: '#c8d0e0',
  },

  // Planes
  plansSection: {
    marginTop: 28,
    paddingHorizontal: 16,
  },
  plansRow: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 12,
  },
  planCardBlue: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    backgroundColor: '#fff',
    padding: 16,
  },
  planCardGreen: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#a7f3d0',
    backgroundColor: '#fff',
    padding: 16,
  },
  planIconBlue: {
    marginBottom: 12,
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#dbeafe',
  },
  planIconGreen: {
    marginBottom: 12,
    height: 40,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#d1fae5',
  },
  planLabel: {
    marginBottom: 4,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#4a5578',
  },
  planPrice: {
    marginBottom: 12,
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 22,
    color: '#0d1b3e',
  },
  planPriceUnit: {
    fontSize: 11,
    fontWeight: 'normal',
    color: '#4a5578',
  },
  planFeatures: {
    marginBottom: 16,
    gap: 6,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    fontSize: 10,
    color: '#4a5578',
  },
  creditButton: {
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#4D9FFF',
    paddingVertical: 10,
  },
  creditButtonText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
  },
  leasingButton: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 10,
  },
  leasingButtonText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#2fb676',
  },

  // Test drive
  testDriveBanner: {
    marginHorizontal: 16,
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 20,
    backgroundColor: '#0A0F1E',
    padding: 20,
  },
  testDriveLeft: {
    flex: 1,
    paddingRight: 16,
  },
  testDriveEyebrow: {
    marginBottom: 4,
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: '#2fb676',
  },
  testDriveTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 24,
    color: '#fff',
  },
  testDriveSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
  },
  testDriveButton: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 12,
    backgroundColor: '#2fb676',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  testDriveButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  testDriveIconWrap: {
    height: 80,
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
  },
})