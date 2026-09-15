import { StyleSheet } from 'react-native'
export const GREEN = '#2fb676'
export const BLUE = '#4D9FFF'
export const ORANGE = '#f39c12'
export const RED = '#e74c3c'
export const BG = '#0A0F1E'
export const WHITE = '#ffffff'
export const OFF_WHITE = '#527887'
export const SUBTLE = '#e8edf8'
export const TEXT_DARK = '#0d1b3e'
export const TEXT_MID = '#4a5578'
export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },
  scroll: {
    flex: 1,
    backgroundColor: OFF_WHITE,
  },
  scrollContent: {
    paddingBottom: 120,
  },

  header: {
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
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 2,
  },

  // SOS CARD
  sosCard: {
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 22,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: `${RED}33`,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#0d1b3e',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  sosIconRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: `${RED}14`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  sosTitle: {
    color: TEXT_DARK,
    fontSize: 15,
    fontWeight: 'bold',
  },
  sosSub: {
    color: TEXT_MID,
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  sosBtn: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: RED,
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  sosBtnText: {
    color: WHITE,
    fontSize: 13,
    fontWeight: 'bold',
  },

  // SECTIONS
  section: {
    marginTop: 26,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    color: TEXT_DARK,
    fontSize: 16,
    fontWeight: 'bold',
  },

  // HEALTH CARD
  healthCard: {
    marginTop: 14,
    backgroundColor: WHITE,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: SUBTLE,
    padding: 16,
    shadowColor: '#0d1b3e',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  healthTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  healthIconBox: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: `${GREEN}14`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  healthProvider: {
    color: TEXT_DARK,
    fontSize: 14,
    fontWeight: 'bold',
  },
  healthPlan: {
    color: TEXT_MID,
    fontSize: 11,
    marginTop: 2,
  },
  healthActivePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: `${GREEN}14`,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: `${GREEN}44`,
  },
  dotStatus: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: GREEN,
  },
  healthActiveText: {
    color: GREEN,
    fontSize: 9,
    fontWeight: 'bold',
  },

  healthDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: OFF_WHITE,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginTop: 14,
  },
  healthDetailItem: {
    flex: 1,
  },
  healthDetailLabel: {
    color: TEXT_MID,
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  healthDetailValue: {
    color: TEXT_DARK,
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 3,
  },
  healthDetailDivider: {
    width: 1,
    height: 28,
    backgroundColor: SUBTLE,
    marginHorizontal: 12,
  },

  healthBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  configureBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: OFF_WHITE,
    borderWidth: 1,
    borderColor: SUBTLE,
    borderRadius: 12,
    paddingVertical: 11,
  },
  configureBtnText: {
    color: TEXT_DARK,
    fontSize: 12,
    fontWeight: 'bold',
  },
  callHealthBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingVertical: 11,
  },
  callHealthBtnText: {
    color: WHITE,
    fontSize: 12,
    fontWeight: 'bold',
  },

  // HEALTH EMPTY STATE
  healthEmptyState: {
    alignItems: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  healthEmptyTitle: {
    color: TEXT_DARK,
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 6,
  },
  healthEmptySub: {
    color: TEXT_MID,
    fontSize: 11,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  configureEmptyBtn: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  configureEmptyBtnText: {
    color: WHITE,
    fontSize: 12,
    fontWeight: 'bold',
  },

  configuringNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: `${BLUE}10`,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${BLUE}33`,
    padding: 12,
    marginTop: 10,
  },
  configuringNoticeText: {
    flex: 1,
    color: TEXT_MID,
    fontSize: 11,
    lineHeight: 15,
  },

  // CONTACTS
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: SUBTLE,
    padding: 12,
    gap: 12,
  },
  contactIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactLabel: {
    color: TEXT_DARK,
    fontSize: 13,
    fontWeight: 'bold',
  },
  contactNumber: {
    color: TEXT_MID,
    fontSize: 11,
    marginTop: 2,
  },
  contactCallBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: BG,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // LOCATION BANNER
  locationBanner: {
    marginHorizontal: 16,
    marginTop: 26,
    borderRadius: 20,
    backgroundColor: BG,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 5,
  },
  locationBannerLeft: {
    flex: 1,
    paddingRight: 16,
  },
  locationBannerEyebrow: {
    color: GREEN,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  locationBannerTitle: {
    color: WHITE,
    fontSize: 17,
    fontWeight: 'bold',
    lineHeight: 23,
  },
  locationBannerSub: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    marginTop: 4,
  },
  locationBannerBtn: {
    marginTop: 14,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  locationBannerBtnText: {
    color: WHITE,
    fontSize: 12,
    fontWeight: '700',
  },
  locationBannerIconBox: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: `${GREEN}20`,
    borderWidth: 1,
    borderColor: `${GREEN}44`,
    alignItems: 'center',
    justifyContent: 'center',
  },
})