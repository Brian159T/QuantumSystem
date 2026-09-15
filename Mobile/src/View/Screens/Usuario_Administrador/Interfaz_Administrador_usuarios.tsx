import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  TextInput,
  FlatList,
} from 'react-native'
import React, { useMemo, useState } from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import LogoutButton from '../../components/LogoutButton'
import { styles, GREEN, BLUE, ORANGE, RED, PURPLE, BG, WHITE, OFF_WHITE, SUBTLE, TEXT_DARK, TEXT_MID } from '../../../styles/Interfaz_Administrador_usuarios'


type Role = 'Usuario' | 'Administrador'
type Status = 'Activo' | 'Suspendido'

type UserItem = {
  id: string
  name: string
  email: string
  role: Role
  status: Status
  vehicles: number
  joinedAt: string
}

const INITIAL_USERS: UserItem[] = [
  {
    id: '1',
    name: 'Camila Rojas',
    email: 'camila.rojas@mail.com',
    role: 'Usuario',
    status: 'Activo',
    vehicles: 1,
    joinedAt: '12 Mar 2025',
  },
  {
    id: '2',
    name: 'Daniel Quispe',
    email: 'daniel.quispe@mail.com',
    role: 'Administrador',
    status: 'Activo',
    vehicles: 0,
    joinedAt: '02 Ene 2024',
  },
  {
    id: '3',
    name: 'Fernanda Vargas',
    email: 'fernanda.vargas@mail.com',
    role: 'Usuario',
    status: 'Suspendido',
    vehicles: 2,
    joinedAt: '28 Jun 2025',
  },
  {
    id: '4',
    name: 'Jorge Mamani',
    email: 'jorge.mamani@mail.com',
    role: 'Usuario',
    status: 'Activo',
    vehicles: 1,
    joinedAt: '15 Nov 2024',
  },
  {
    id: '5',
    name: 'Lucía Fernández',
    email: 'lucia.fernandez@mail.com',
    role: 'Usuario',
    status: 'Activo',
    vehicles: 1,
    joinedAt: '30 Abr 2025',
  },
]

const STATUS_FILTERS: (Status | 'Todos')[] = ['Todos', 'Activo', 'Suspendido']

const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase())
    .join('')

const emptyForm = { name: '', email: '', role: 'Usuario' as Role }

const Interfaz_Administrador_usuarios = () => {
  const [users, setUsers] = useState<UserItem[]>(INITIAL_USERS)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<Status | 'Todos'>('Todos')

  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', email: '' })

  const [showAddForm, setShowAddForm] = useState(false)
  const [newUser, setNewUser] = useState(emptyForm)

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch =
        search.trim().length === 0 ||
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === 'Todos' || u.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [users, search, statusFilter])

  const activeCount = users.filter(u => u.status === 'Activo').length
  const adminCount = users.filter(u => u.role === 'Administrador').length

  // ── CREATE ──
  const handleAddUser = () => {
    if (newUser.name.trim().length === 0 || newUser.email.trim().length === 0) return
    const created: UserItem = {
      id: Date.now().toString(),
      name: newUser.name.trim(),
      email: newUser.email.trim(),
      role: newUser.role,
      status: 'Activo',
      vehicles: 0,
      joinedAt: 'Hoy',
    }
    setUsers(prev => [created, ...prev])
    setNewUser(emptyForm)
    setShowAddForm(false)
  }

  // ── UPDATE (estado) ──
  const handleToggleStatus = (id: string) => {
    setUsers(prev =>
      prev.map(u =>
        u.id === id ? { ...u, status: u.status === 'Activo' ? 'Suspendido' : 'Activo' } : u
      )
    )
  }

  // ── UPDATE (edición de datos) ──
  const startEditing = (u: UserItem) => {
    setEditingId(u.id)
    setEditForm({ name: u.name, email: u.email })
    setExpandedId(u.id)
  }

  const saveEditing = (id: string) => {
    if (editForm.name.trim().length === 0 || editForm.email.trim().length === 0) return
    setUsers(prev =>
      prev.map(u =>
        u.id === id ? { ...u, name: editForm.name.trim(), email: editForm.email.trim() } : u
      )
    )
    setEditingId(null)
  }

  // ── DELETE ──
  const handleDelete = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id))
    setConfirmDeleteId(null)
    if (expandedId === id) setExpandedId(null)
  }

  const renderUser = ({ item }: { item: UserItem }) => {
    const isExpanded = expandedId === item.id
    const isEditing = editingId === item.id
    const isConfirmingDelete = confirmDeleteId === item.id

    return (
      <View style={styles.userCard}>
        <TouchableOpacity
          style={styles.userTopRow}
          activeOpacity={0.85}
          onPress={() => setExpandedId(isExpanded ? null : item.id)}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials(item.name)}</Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.userName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.userEmail} numberOfLines={1}>{item.email}</Text>
          </View>

          <View style={{ alignItems: 'flex-end', gap: 6 }}>
            <View style={[styles.statusPill, item.status === 'Activo' ? styles.statusPillGreen : styles.statusPillRed]}>
              <View style={[styles.dotStatus, { backgroundColor: item.status === 'Activo' ? GREEN : RED }]} />
              <Text style={[styles.statusPillText, { color: item.status === 'Activo' ? GREEN : RED }]}>
                {item.status}
              </Text>
            </View>
            {item.role === 'Administrador' && (
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>{'Admin'}</Text>
              </View>
            )}
          </View>

          <MaterialCommunityIcons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={TEXT_MID}
            style={{ marginLeft: 6 }}
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandedArea}>
            <View style={styles.divider} />

            {isEditing ? (
              <View style={{ gap: 10 }}>
                <View>
                  <Text style={styles.fieldLabel}>{'Nombre'}</Text>
                  <TextInput
                    value={editForm.name}
                    onChangeText={t => setEditForm(prev => ({ ...prev, name: t }))}
                    style={styles.fieldInput}
                    placeholder="Nombre completo"
                    placeholderTextColor={TEXT_MID}
                  />
                </View>
                <View>
                  <Text style={styles.fieldLabel}>{'Correo'}</Text>
                  <TextInput
                    value={editForm.email}
                    onChangeText={t => setEditForm(prev => ({ ...prev, email: t }))}
                    style={styles.fieldInput}
                    placeholder="correo@ejemplo.com"
                    placeholderTextColor={TEXT_MID}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    activeOpacity={0.85}
                    onPress={() => setEditingId(null)}
                  >
                    <Text style={styles.cancelBtnText}>{'Cancelar'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.saveBtn}
                    activeOpacity={0.85}
                    onPress={() => saveEditing(item.id)}
                  >
                    <MaterialCommunityIcons name="check" size={14} color={WHITE} />
                    <Text style={styles.saveBtnText}>{'Guardar'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                <View style={styles.detailsRow}>
                  <View style={styles.detailItem}>
                    <MaterialCommunityIcons name="car-outline" size={14} color={TEXT_MID} />
                    <Text style={styles.detailText}>{`${item.vehicles} vehículo(s)`}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <MaterialCommunityIcons name="calendar-outline" size={14} color={TEXT_MID} />
                    <Text style={styles.detailText}>{`Desde ${item.joinedAt}`}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <MaterialCommunityIcons name="shield-account-outline" size={14} color={TEXT_MID} />
                    <Text style={styles.detailText}>{item.role}</Text>
                  </View>
                </View>

                {isConfirmingDelete ? (
                  <View style={styles.confirmDeleteBox}>
                    <MaterialCommunityIcons name="alert-outline" size={16} color={RED} />
                    <Text style={styles.confirmDeleteText}>{'¿Eliminar este usuario? Esta acción no se puede deshacer.'}</Text>
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={styles.cancelBtn}
                        activeOpacity={0.85}
                        onPress={() => setConfirmDeleteId(null)}
                      >
                        <Text style={styles.cancelBtnText}>{'Cancelar'}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteConfirmBtn}
                        activeOpacity={0.85}
                        onPress={() => handleDelete(item.id)}
                      >
                        <MaterialCommunityIcons name="trash-can-outline" size={14} color={WHITE} />
                        <Text style={styles.saveBtnText}>{'Eliminar'}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.statusToggleBtn}
                      activeOpacity={0.85}
                      onPress={() => handleToggleStatus(item.id)}
                    >
                      <MaterialCommunityIcons
                        name={item.status === 'Activo' ? 'account-lock-outline' : 'lock-open-outline'}
                        size={14}
                        color={TEXT_DARK}
                      />
                      <Text style={styles.statusToggleBtnText}>
                        {item.status === 'Activo' ? 'Suspender' : 'Reactivar'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.editBtn}
                      activeOpacity={0.85}
                      onPress={() => startEditing(item)}
                    >
                      <MaterialCommunityIcons name="pencil-outline" size={14} color={WHITE} />
                      <Text style={styles.saveBtnText}>{'Editar'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteBtn}
                      activeOpacity={0.85}
                      onPress={() => setConfirmDeleteId(item.id)}
                    >
                      <MaterialCommunityIcons name="trash-can-outline" size={16} color={RED} />
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}
          </View>
        )}
      </View>
    )
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={BG} />

      {/* ── HEADER FIJO ── */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerSub}>{'PANEL DE CONTROL'}</Text>
          <Text style={styles.headerTitle}>{'Usuarios'}</Text>
        </View>
        <LogoutButton />
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── STATS ── */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: `${BLUE}18` }]}>
              <MaterialCommunityIcons name="account-multiple-outline" size={18} color={BLUE} />
            </View>
            <Text style={styles.statValue}>{users.length}</Text>
            <Text style={styles.statLabel}>{'Total usuarios'}</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: `${GREEN}18` }]}>
              <MaterialCommunityIcons name="account-check-outline" size={18} color={GREEN} />
            </View>
            <Text style={styles.statValue}>{activeCount}</Text>
            <Text style={styles.statLabel}>{'Activos'}</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: `${PURPLE}18` }]}>
              <MaterialCommunityIcons name="shield-account-outline" size={18} color={PURPLE} />
            </View>
            <Text style={styles.statValue}>{adminCount}</Text>
            <Text style={styles.statLabel}>{'Administradores'}</Text>
          </View>
        </View>

        {/* ── BUSCADOR ── */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <MaterialCommunityIcons name="magnify" size={18} color={TEXT_MID} />
            <TextInput
              placeholder="Buscar por nombre o correo..."
              placeholderTextColor={TEXT_MID}
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
            />
          </View>

          <TouchableOpacity
            style={styles.addBtn}
            activeOpacity={0.85}
            onPress={() => setShowAddForm(!showAddForm)}
          >
            <MaterialCommunityIcons name={showAddForm ? 'close' : 'account-plus-outline'} size={18} color={WHITE} />
          </TouchableOpacity>
        </View>

        {/* ── FORMULARIO AGREGAR USUARIO ── */}
        {showAddForm && (
          <View style={styles.addForm}>
            <Text style={styles.addFormTitle}>{'Nuevo usuario'}</Text>

            <View style={{ marginTop: 10 }}>
              <Text style={styles.fieldLabel}>{'Nombre'}</Text>
              <TextInput
                value={newUser.name}
                onChangeText={t => setNewUser(prev => ({ ...prev, name: t }))}
                style={styles.fieldInput}
                placeholder="Nombre completo"
                placeholderTextColor={TEXT_MID}
              />
            </View>

            <View style={{ marginTop: 10 }}>
              <Text style={styles.fieldLabel}>{'Correo'}</Text>
              <TextInput
                value={newUser.email}
                onChangeText={t => setNewUser(prev => ({ ...prev, email: t }))}
                style={styles.fieldInput}
                placeholder="correo@ejemplo.com"
                placeholderTextColor={TEXT_MID}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={{ marginTop: 10 }}>
              <Text style={styles.fieldLabel}>{'Rol'}</Text>
              <View style={styles.roleRow}>
                {(['Usuario', 'Administrador'] as Role[]).map(r => (
                  <TouchableOpacity
                    key={r}
                    onPress={() => setNewUser(prev => ({ ...prev, role: r }))}
                    style={[styles.roleChip, newUser.role === r && styles.roleChipActive]}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.roleChipText, newUser.role === r && styles.roleChipTextActive]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.addFormBtn} activeOpacity={0.85} onPress={handleAddUser}>
              <MaterialCommunityIcons name="check" size={15} color={WHITE} />
              <Text style={styles.addFormBtnText}>{'Crear usuario'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── FILTROS DE ESTADO ── */}
        <View style={styles.filterRow}>
          {STATUS_FILTERS.map(f => {
            const active = statusFilter === f
            return (
              <TouchableOpacity
                key={f}
                onPress={() => setStatusFilter(f)}
                style={[styles.filterChip, active && styles.filterChipActive]}
                activeOpacity={0.85}
              >
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{f}</Text>
              </TouchableOpacity>
            )
          })}
        </View>

        {/* ── LISTA DE USUARIOS ── */}
        <View style={styles.listSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{'Lista de usuarios'}</Text>
            <Text style={styles.resultsCount}>{`${filteredUsers.length} resultados`}</Text>
          </View>

          {filteredUsers.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="account-search-outline" size={32} color={SUBTLE} />
              <Text style={styles.emptyStateText}>{'No encontramos usuarios con estos filtros'}</Text>
            </View>
          ) : (
            <FlatList
              data={filteredUsers}
              keyExtractor={item => item.id}
              renderItem={renderUser}
              scrollEnabled={false}
              contentContainerStyle={{ gap: 12 }}
            />
          )}
        </View>
      </ScrollView>
    </View>
  )
}

export default Interfaz_Administrador_usuarios

