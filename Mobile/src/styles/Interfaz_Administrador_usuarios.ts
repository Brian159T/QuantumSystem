import { StyleSheet } from 'react-native'
export const GREEN = '#2fb676'
export const BLUE = '#4D9FFF'
export const ORANGE = '#f39c12'
export const RED = '#e74c3c'
export const PURPLE = '#a78bfa'
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

  // STATS
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 14,
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

  // SEARCH + ADD
  searchSection: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 18,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    borderRadius: 16,
    paddingHorizontal: 14,
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
  addBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ADD FORM
  addForm: {
    marginHorizontal: 16,
    marginTop: 12,
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
  addFormTitle: {
    color: TEXT_DARK,
    fontSize: 14,
    fontWeight: 'bold',
  },
  addFormBtn: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingVertical: 12,
  },
  addFormBtnText: {
    color: WHITE,
    fontSize: 12,
    fontWeight: 'bold',
  },

  fieldLabel: {
    color: TEXT_MID,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  fieldInput: {
    backgroundColor: OFF_WHITE,
    borderWidth: 1,
    borderColor: SUBTLE,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: TEXT_DARK,
    fontSize: 13,
  },

  roleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  roleChip: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: OFF_WHITE,
    borderWidth: 1,
    borderColor: SUBTLE,
    borderRadius: 10,
    paddingVertical: 10,
  },
  roleChipActive: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  roleChipText: {
    color: TEXT_MID,
    fontSize: 11,
    fontWeight: '600',
  },
  roleChipTextActive: {
    color: WHITE,
  },

  // FILTERS
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 18,
  },
  filterChip: {
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: SUBTLE,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterChipActive: {
    backgroundColor: BG,
    borderColor: BG,
  },
  filterChipText: {
    color: TEXT_MID,
    fontSize: 11,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: WHITE,
  },

  // LIST
  listSection: {
    marginTop: 22,
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

  // USER CARD
  userCard: {
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
  userTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: `${BLUE}18`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: BLUE,
    fontSize: 13,
    fontWeight: 'bold',
  },
  userName: {
    color: TEXT_DARK,
    fontSize: 13,
    fontWeight: 'bold',
  },
  userEmail: {
    color: TEXT_MID,
    fontSize: 10,
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
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
  statusPillText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  roleBadge: {
    backgroundColor: `${PURPLE}14`,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  roleBadgeText: {
    color: PURPLE,
    fontSize: 9,
    fontWeight: 'bold',
  },

  // EXPANDED AREA
  expandedArea: {
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: SUBTLE,
    marginVertical: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  detailText: {
    color: TEXT_MID,
    fontSize: 11,
    fontWeight: '500',
  },

  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  statusToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: OFF_WHITE,
    borderWidth: 1,
    borderColor: SUBTLE,
    borderRadius: 10,
    paddingVertical: 10,
  },
  statusToggleBtnText: {
    color: TEXT_DARK,
    fontSize: 11,
    fontWeight: 'bold',
  },
  editBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: BG,
    borderRadius: 10,
    paddingVertical: 10,
  },
  deleteBtn: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${RED}14`,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: `${RED}33`,
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: OFF_WHITE,
    borderWidth: 1,
    borderColor: SUBTLE,
    borderRadius: 10,
    paddingVertical: 10,
  },
  cancelBtnText: {
    color: TEXT_MID,
    fontSize: 11,
    fontWeight: 'bold',
  },
  saveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: GREEN,
    borderRadius: 10,
    paddingVertical: 10,
  },
  saveBtnText: {
    color: WHITE,
    fontSize: 11,
    fontWeight: 'bold',
  },
  deleteConfirmBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: RED,
    borderRadius: 10,
    paddingVertical: 10,
  },

  confirmDeleteBox: {
    backgroundColor: `${RED}0d`,
    borderWidth: 1,
    borderColor: `${RED}33`,
    borderRadius: 12,
    padding: 12,
    marginTop: 6,
  },
  confirmDeleteText: {
    color: TEXT_MID,
    fontSize: 11,
    marginTop: 6,
    lineHeight: 15,
  },
})