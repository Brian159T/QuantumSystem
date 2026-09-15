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

  // SEARCH
  searchSection: {
    paddingHorizontal: 16,
    marginTop: 14,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 4,
    gap: 8,
    shadowColor: '#0d1b3e',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    color: TEXT_DARK,
    fontSize: 13,
    paddingVertical: 12,
  },
  locationBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // EMERGENCY BANNER
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: WHITE,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: `${RED}33`,
    padding: 14,
    shadowColor: '#0d1b3e',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emergencyIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: `${RED}14`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyTitle: {
    color: TEXT_DARK,
    fontSize: 12,
    fontWeight: 'bold',
  },
  emergencySub: {
    color: TEXT_MID,
    fontSize: 10,
    marginTop: 2,
  },
  emergencyBtn: {
    backgroundColor: RED,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  emergencyBtnText: {
    color: WHITE,
    fontSize: 11,
    fontWeight: 'bold',
  },

  // STATS
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    shadowColor: '#0d1b3e',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    color: TEXT_DARK,
    fontSize: 14,
    fontWeight: 'bold',
  },
  statLabel: {
    color: TEXT_MID,
    fontSize: 9,
    textAlign: 'center',
    fontWeight: '500',
  },

  // SERVICES
  servicesSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    color: TEXT_DARK,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  servicesRow: {
    flexDirection: 'row',
    gap: 10,
  },
  serviceItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  serviceIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceLabel: {
    color: TEXT_MID,
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 12,
  },

  // FILTERS
  filterSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: SUBTLE,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  filterChipActive: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  filterChipText: {
    color: TEXT_MID,
    fontSize: 11,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: WHITE,
  },
  openToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: SUBTLE,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WHITE,
  },
  checkboxActive: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  openToggleText: {
    color: TEXT_MID,
    fontSize: 12,
    fontWeight: '500',
  },

  // LIST
  listSection: {
    marginTop: 26,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  resultsCount: {
    color: TEXT_MID,
    fontSize: 11,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyStateText: {
    color: TEXT_MID,
    fontSize: 12,
    textAlign: 'center',
  },

  // WORKSHOP CARD
  workshopCard: {
    backgroundColor: WHITE,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: SUBTLE,
    padding: 14,
    marginTop: 12,
    shadowColor: '#0d1b3e',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  workshopTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  workshopIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: `${GREEN}14`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workshopNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  workshopName: {
    color: TEXT_DARK,
    fontSize: 14,
    fontWeight: 'bold',
    flexShrink: 1,
  },
  workshopAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  workshopAddress: {
    color: TEXT_MID,
    fontSize: 10,
    flexShrink: 1,
  },
  workshopDistanceBox: {
    alignItems: 'center',
  },
  workshopDistanceValue: {
    color: TEXT_DARK,
    fontSize: 15,
    fontWeight: 'bold',
  },
  workshopDistanceUnit: {
    color: TEXT_MID,
    fontSize: 9,
  },

  workshopInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
  },
  statusPillGreen: {
    backgroundColor: `${GREEN}14`,
    borderColor: `${GREEN}44`,
  },
  statusPillRed: {
    backgroundColor: `${RED}14`,
    borderColor: `${RED}44`,
  },
  dotStatus: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  waitPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: OFF_WHITE,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  waitPillText: {
    color: ORANGE,
    fontSize: 10,
    fontWeight: '600',
  },

  specialtiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  specialtyTag: {
    backgroundColor: OFF_WHITE,
    borderWidth: 1,
    borderColor: SUBTLE,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  specialtyTagText: {
    color: TEXT_MID,
    fontSize: 9,
    fontWeight: '600',
  },

  workshopFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: SUBTLE,
  },
  workshopFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  workshopRating: {
    color: TEXT_DARK,
    fontSize: 12,
    fontWeight: 'bold',
  },
  workshopDivider: {
    color: TEXT_MID,
    fontSize: 12,
  },
  workshopReviews: {
    color: TEXT_MID,
    fontSize: 11,
    fontWeight: '500',
  },
  appointmentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BG,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 5,
  },
  appointmentBtnText: {
    color: WHITE,
    fontSize: 11,
    fontWeight: 'bold',
  },
  mapContainer: {
  height: 260,
  borderRadius: 16,
  overflow: 'hidden',
  marginTop: 16,
  backgroundColor: BG,
},

map: {
  width: '100%',
  height: '100%',
},

marker: {
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: GREEN,
  justifyContent: 'center',
  alignItems: 'center',
  borderWidth: 2,
  borderColor: WHITE,
},
})