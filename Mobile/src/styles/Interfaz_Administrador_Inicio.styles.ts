import { StyleSheet } from 'react-native'
export const GREEN = '#2fb676'
export const BLUE = '#4D9FFF'
export const ORANGE = '#f39c12'
export const PURPLE = '#a78bfa'
export const RED = '#e74c3c'
export const BG = '#0A0F1E'
export const WHITE = '#ffffff'
export const OFF_WHITE = '#9FC4D3'
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

  // ALERT BANNER
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: WHITE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: `${ORANGE}33`,
    padding: 13,
    shadowColor: '#0d1b3e',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  alertIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: `${ORANGE}14`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertTitle: {
    color: TEXT_DARK,
    fontSize: 12,
    fontWeight: 'bold',
  },
  alertSub: {
    color: TEXT_MID,
    fontSize: 10,
    marginTop: 2,
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

  // SECTIONS
  section: {
    marginTop: 26,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    color: TEXT_DARK,
    fontSize: 16,
    fontWeight: 'bold',
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

  // MANAGEMENT GRID
  managementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 14,
  },
  managementCard: {
    width: '47%',
    backgroundColor: WHITE,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: SUBTLE,
    padding: 14,
    shadowColor: '#0d1b3e',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  managementIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  managementTitle: {
    color: TEXT_DARK,
    fontSize: 13,
    fontWeight: 'bold',
    marginTop: 12,
  },
  managementSubtitle: {
    color: TEXT_MID,
    fontSize: 10,
    marginTop: 4,
  },
  managementFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: SUBTLE,
  },
  managementLink: {
    fontSize: 11,
    fontWeight: 'bold',
  },

  // QUICK ACTIONS
  quickActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  quickActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: BG,
    borderRadius: 12,
    paddingVertical: 12,
  },
  quickActionBtnOutline: {
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: SUBTLE,
  },
  quickActionBtnText: {
    color: WHITE,
    fontSize: 11,
    fontWeight: 'bold',
  },

  // ACTIVITY
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: SUBTLE,
    padding: 12,
    gap: 12,
  },
  activityIconBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityAction: {
    color: TEXT_DARK,
    fontSize: 12,
    fontWeight: 'bold',
  },
  activityDetail: {
    color: TEXT_MID,
    fontSize: 10,
    marginTop: 2,
  },
  activityTime: {
    color: TEXT_MID,
    fontSize: 9,
    fontWeight: '500',
  },
})