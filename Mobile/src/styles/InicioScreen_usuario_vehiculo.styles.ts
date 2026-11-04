import { Dimensions, StyleSheet } from 'react-native';

export const { width: SCREEN_WIDTH } = Dimensions.get('window');
export const CARD_WIDTH = SCREEN_WIDTH * 0.72;
export const CARD_GAP = 12;
export const CARD_SIDE_PADDING = 20;

export const GREEN = '#2fb676';
export const BLUE = '#4D9FFF';
export const ORANGE = '#f39c12';
export const RED = '#e74c3c';
export const BG = '#000000';
export const WHITE = '#ffffff';
export const OFF_WHITE = '#000000';
export const SUBTLE = '#e8edf8';
export const TEXT_DARK = '#ffffff';
export const TEXT_MID = '#e5e7eb';

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },
  map: {
    width: '100%',
    height: 300,
    borderRadius: 16,
  },
  scroll: {
    flex: 1,
    backgroundColor: OFF_WHITE,
  },
  scrollContent: {
    paddingBottom: 120,
  },

  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 15,
    backgroundColor: BG,
  },
  headerSub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  headerTitle: {
    color: WHITE,
    fontSize: 30,
    fontWeight: '300',
    letterSpacing: -0.8,
    marginTop: 2,
  },

  // VEHICLE CARD
  vehicleCard: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: BG,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0,
    shadowRadius: 16,
    elevation: 0,
    borderWidth: 1,
    borderColor: WHITE,
  },
  vehicleTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  vehicleName: {
    color: WHITE,
    fontSize: 17,
    fontWeight: '400',
  },
  vehiclePlate: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    marginTop: 2,
    letterSpacing: 1,
  },
  vehicleStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  vehicleStatusText: {
    fontSize: 10,
    fontWeight: '400',
  },

  batteryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 16,
  },
  batteryRingBox: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: `${GREEN}55`,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(47,182,118,0.08)',
  },
  batteryRingOuter: {
    alignItems: 'center',
  },
  batteryPct: {
    color: WHITE,
    fontSize: 17,
    fontWeight: '400',
  },
  batteryPctLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 8,
  },
  batteryDetails: {
    flex: 1,
  },
  batteryBarTrack: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  batteryBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  batteryStatsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 10,
  },
  batteryStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  batteryStatText: {
    color: WHITE,
    fontSize: 11,
    fontWeight: '600',
  },
  lastCharged: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    marginTop: 8,
  },

  // QUICK ACTIONS
  quickActionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 18,
    gap: 10,
  },
  quickActionItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  quickActionIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    color: TEXT_MID,
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 12,
  },

  // CAROUSEL / SECTION HEADERS
  carouselSection: {
    marginTop: 26,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingHorizontal: CARD_SIDE_PADDING,
  },
  sectionTitle: {
    color: TEXT_DARK,
    fontSize: 22,
    fontWeight: '300',
  },
  sectionLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionLink: {
    color: GREEN,
    fontSize: 12,
    fontWeight: '600',
  },
  carouselList: {
    paddingLeft: CARD_SIDE_PADDING,
    paddingRight: CARD_SIDE_PADDING - CARD_GAP,
    gap: CARD_GAP,
  },

  // STATION CARD (carrusel)
  stationCard: {
    width: CARD_WIDTH,
    backgroundColor: BG,
    borderWidth: 1,
    borderColor: WHITE,
    borderRadius: 12,
    padding: 14,
    shadowColor: '#0d1b3e',
    shadowOpacity: 0,
    shadowRadius: 10,
    elevation: 0,
    minHeight: 250,
  },
  stationCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stationIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: `${GREEN}14`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stationDistanceBox: {
    alignItems: 'flex-end',
  },
  stationDistanceValue: {
    color: TEXT_DARK,
    fontSize: 13,
    fontWeight: '400',
  },
  stationDistanceUnit: {
    color: TEXT_MID,
    fontSize: 9,
  },
  stationName: {
    color: TEXT_DARK,
    fontSize: 13,
    fontWeight: '400',
    marginTop: 10,
    minHeight: 38,
  },
  stationInfoRow: {
    marginTop: 8,
  },
  availabilityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderWidth: 1,
  },
  availabilityPillGreen: {
    backgroundColor: `${GREEN}14`,
    borderColor: `${GREEN}44`,
  },
  availabilityPillRed: {
    backgroundColor: `${RED}14`,
    borderColor: `${RED}44`,
  },
  dotStatus: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  availabilityText: {
    fontSize: 9,
    fontWeight: '400',
  },
  stationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  speedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  speedText: {
    fontSize: 10,
    fontWeight: '600',
  },
  stationPrice: {
    color: TEXT_MID,
    fontSize: 10,
    fontWeight: '500',
  },
  routeBtn: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BG,
    borderRadius: 999,
    paddingVertical: 9,
    gap: 5,
    borderWidth: 1,
    borderColor: SUBTLE,
  },
  routeBtnText: {
    color: WHITE,
    fontSize: 11,
    fontWeight: '400',
  },

  // DOTS
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 14,
    gap: 5,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#c8d0e0',
  },
  dotActive: {
    width: 16,
    backgroundColor: GREEN,
  },

  // TRIP BANNER
  tripBanner: {
    marginHorizontal: 16,
    marginTop: 26,
    borderRadius: 12,
    backgroundColor: BG,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0,
    shadowRadius: 14,
    elevation: 0,
    borderWidth: 1,
    borderColor: WHITE,
  },
  tripBannerLeft: {
    flex: 1,
    paddingRight: 16,
  },
  tripBannerEyebrow: {
    color: GREEN,
    fontSize: 10,
    fontWeight: '400',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  tripBannerTitle: {
    color: WHITE,
    fontSize: 18,
    fontWeight: '400',
    lineHeight: 24,
  },
  tripBannerSub: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    marginTop: 4,
  },
  tripBannerBtn: {
    marginTop: 14,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GREEN,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: SUBTLE,
  },
  tripBannerBtnText: {
    color: WHITE,
    fontSize: 12,
    fontWeight: '700',
  },
  tripBannerIconBox: {
    width: 76,
    height: 76,
    borderRadius: 16,
    backgroundColor: `${GREEN}20`,
    borderWidth: 1,
    borderColor: `${GREEN}44`,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // SECTIONS / HISTORY
  section: {
    marginTop: 28,
    paddingHorizontal: 16,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: WHITE,
    padding: 12,
    gap: 10,
  },
  historyIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: `${GREEN}14`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyStation: {
    color: TEXT_DARK,
    fontSize: 12,
    fontWeight: '700',
  },
  historyDate: {
    color: TEXT_MID,
    fontSize: 10,
    marginTop: 2,
  },
  historyKwh: {
    color: TEXT_DARK,
    fontSize: 12,
    fontWeight: '400',
  },
  historyCost: {
    color: TEXT_MID,
    fontSize: 10,
    marginTop: 2,
  },
});
