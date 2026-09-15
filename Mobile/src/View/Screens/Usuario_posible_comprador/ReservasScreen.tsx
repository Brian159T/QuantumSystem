import React, { Component } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  SafeAreaView,
  StatusBar,
  Dimensions,
  StyleSheet,
} from 'react-native'
import LoginButton from '../../components/LoginButton'
import { MaterialCommunityIcons } from '@expo/vector-icons'

const { width } = Dimensions.get('window')
import { styles, COLORS } from '../../../styles/ReservasScreen.styles'

const MODELOS = [
  { id: '1', nombre: 'Voltus Neo Compact', precio: '$27,920', descuento: '-$6,980', base: '$34,900' },
  { id: '2', nombre: 'Voltus Neo Sport', precio: '$39,500', descuento: '-$4,500', base: '$44,000' },
  { id: '3', nombre: 'Voltus Neo SUV', precio: '$52,800', descuento: '-$7,200', base: '$60,000' },
]

const COLORES = [
  { id: '1', nombre: 'Deep Blue', hex: '#1e4fd8' },
  { id: '2', nombre: 'Midnight Black', hex: '#0a1628' },
  { id: '3', nombre: 'Pearl White', hex: '#f0f4ff', border: true },
  { id: '4', nombre: 'Voltus Green', hex: '#2fb676' },
  { id: '5', nombre: 'Silver Mist', hex: '#9ca3af' },
]

const COLOR_ITEM_WIDTH = (width - 80) / 5

// sombras reutilizadas
const shadowForm = {
  shadowColor: COLORS.navy,
  shadowOpacity: 0.08,
  shadowRadius: 20,
  elevation: 4,
}
const shadowColorDot = {
  shadowColor: '#000',
  shadowOpacity: 0.15,
  shadowRadius: 6,
  elevation: 3,
}

interface FormData {
  nombre: string
  ci: string
  modelo: (typeof MODELOS)[0] | null
  color: (typeof COLORES)[0] | null
}

interface ReservaModalProps {
  visible: boolean
  form: FormData
  onClose: () => void
  onConfirm: () => void
}

function ReservaModal({ visible, form, onClose, onConfirm }: ReservaModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderBar} />
            <Text style={styles.modalTitle}>Confirmar Reserva</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <Text style={styles.modalCloseText}>{'✕'}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
            {/* Car placeholder */}
            <View style={styles.carPlaceholder}>
              <Text style={styles.carEmoji}>{'🚗'}</Text>
              <Text style={styles.carPlaceholderLabel}>{'Imagen del vehículo'}</Text>
            </View>

            {/* Datos del cliente */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionLabel}>
                {'DATOS DEL CLIENTE'}
              </Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{'Nombre Completo'}</Text>
                <Text style={styles.infoValue}>
                  {form.nombre || '—'}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{'Cédula de Identidad'}</Text>
                <Text style={styles.infoValue}>{form.ci || '—'}</Text>
              </View>
            </View>

            {/* Datos del vehículo */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionLabel}>
                {'VEHÍCULO SELECCIONADO'}
              </Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{'Modelo'}</Text>
                <Text style={styles.infoValue}>
                  {form.modelo?.nombre || '—'}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{'Color'}</Text>
                <View style={styles.colorValueRow}>
                  {form.color && (
                    <View
                      style={[styles.colorDot, { backgroundColor: form.color.hex }]}
                    />
                  )}
                  <Text style={styles.infoValue}>
                    {form.color?.nombre || '—'}
                  </Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{'Precio Base'}</Text>
                <Text style={styles.infoValue}>
                  {form.modelo?.base || '—'}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{'Descuento'}</Text>
                <Text style={styles.infoValueGreen}>
                  {form.modelo?.descuento || '—'}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.totalLabel}>{'Total'}</Text>
                <Text style={styles.totalValue}>
                  {form.modelo?.precio || '—'}
                </Text>
              </View>
            </View>

            {/* QR Section */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionLabel}>{'PAGO QR'}</Text>
              <View style={styles.qrCenter}>
                <View style={styles.qrBox}>
                  <View style={[styles.qrCornerBase, styles.qrCornerTL]} />
                  <View style={[styles.qrCornerBase, styles.qrCornerTR]} />
                  <View style={[styles.qrCornerBase, styles.qrCornerBL]} />
                  <View style={[styles.qrCornerBase, styles.qrCornerBR]} />
                  <Text style={styles.qrPlaceholderIcon}>{'⬛'}</Text>
                  <Text style={styles.qrText}>{'Código QR de Pago'}</Text>
                  <Text style={styles.qrSubtext}>{'Se añadirá próximamente'}</Text>
                </View>
              </View>
            </View>

            <Text style={styles.refundNote}>
              {'✓ El precio de reserva es reembolsable'}
            </Text>

            {/* Botones */}
            <TouchableOpacity style={styles.primaryButton} onPress={onConfirm}>
              <Text style={styles.primaryButtonText}>{'EFECTUAR PAGO Y CONFIRMAR'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>{'Cancelar'}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

interface State {
  form: FormData
  modalVisible: boolean
  exitoVisible: boolean
  confirmacion: string
}

export class ReservasScreen extends Component<{}, State> {
  state: State = {
    form: { nombre: '', ci: '', modelo: null, color: null },
    modalVisible: false,
    exitoVisible: false,
    confirmacion: '',
  }

  handleReservar = () => {
    const { form } = this.state
    if (!form.nombre || !form.ci || !form.modelo || !form.color) return
    this.setState({ modalVisible: true })
  }

  handleConfirmar = () => {
    const codigo = 'VT-' + Math.floor(1000 + Math.random() * 9000) + '-ABC'
    this.setState({ modalVisible: false, exitoVisible: true, confirmacion: codigo })
  }

  render() {
    const { form, modalVisible, exitoVisible, confirmacion } = this.state
    const isFormValid = form.nombre && form.ci && form.modelo && form.color

    return (
      <SafeAreaView style={styles.root}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.navy} />

        {/* Header */}
        <View style={styles.header}>
          <LoginButton onPress={() => {}} />
        </View>

        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {/* Banner */}
          <View style={styles.banner}>
            <View style={styles.bannerText}>
              <Text style={styles.bannerTitle}>
                {'Reserva ahora,\nmaneja el futuro'}
              </Text>
              <Text style={styles.bannerSubtitle}>
                {'Garantiza tu lugar con\nsolo $1,000 USD'}
              </Text>
            </View>
            <View style={styles.bannerIconWrap}>
              <MaterialCommunityIcons name="car-sports" size={70} color={COLORS.primary} />
            </View>
          </View>

          {/* Formulario */}
          <View style={[styles.formCard, shadowForm]}>
            <Text style={styles.formSectionTitle}>
              {'Datos Personales'}
            </Text>

            <Text style={styles.inputLabel}>{'Nombre Completo'}</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ej. Juan Pérez Mamani"
              placeholderTextColor={COLORS.grayMid}
              value={form.nombre}
              onChangeText={v => this.setState({ form: { ...form, nombre: v } })}
            />

            <Text style={styles.inputLabel}>{'Cédula de Identidad'}</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ej. 12345678"
              placeholderTextColor={COLORS.grayMid}
              keyboardType="number-pad"
              value={form.ci}
              onChangeText={v => this.setState({ form: { ...form, ci: v } })}
            />

            <Text style={[styles.formSectionTitle, styles.formSectionTitleMt]}>
              {'Selecciona tu Modelo'}
            </Text>
            {MODELOS.map(m => {
              const selected = form.modelo?.id === m.id
              return (
                <TouchableOpacity
                  key={m.id}
                  style={[
                    styles.modelOption,
                    selected ? styles.modelOptionSelected : styles.modelOptionUnselected,
                  ]}
                  onPress={() => this.setState({ form: { ...form, modelo: m } })}
                >
                  <View style={styles.modelEmojiWrap}>
                    <Text style={styles.modelEmoji}>{'🚙'}</Text>
                  </View>
                  <View style={styles.modelOptionInfo}>
                    <Text
                      style={[
                        styles.modelOptionName,
                        selected ? styles.modelOptionNameSelected : styles.modelOptionNameUnselected,
                      ]}
                    >
                      {m.nombre}
                    </Text>
                    <Text style={styles.modelBasePrice}>
                      {m.base}
                      <Text style={styles.modelDiscount}>{' ' + m.descuento}</Text>
                    </Text>
                    <Text style={styles.modelTotalPrice}>{'Total: ' + m.precio}</Text>
                  </View>
                  <View
                    style={[
                      styles.radioCircle,
                      selected ? styles.radioCircleSelected : styles.radioCircleUnselected,
                    ]}
                  >
                    {selected && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>
              )
            })}

            <Text style={[styles.formSectionTitle, styles.formSectionTitleMt]}>
              {'Elige tu Color'}
            </Text>
            <View style={styles.colorsWrap}>
              {COLORES.map(c => {
                const selected = form.color?.id === c.id
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.colorOption, { width: COLOR_ITEM_WIDTH }]}
                    onPress={() => this.setState({ form: { ...form, color: c } })}
                  >
                    <View
                      style={[
                        styles.colorDotCircle,
                        shadowColorDot,
                        { backgroundColor: c.hex },
                        c.border && styles.colorDotBorder,
                        selected && styles.colorDotSelected,
                      ]}
                    >
                      {selected && (
                        <Text
                          style={styles.colorCheckmark}
                          
                        >
                          {'✓'}
                        </Text>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.colorLabel,
                        selected ? styles.colorLabelSelected : styles.colorLabelUnselected,
                      ]}
                    >
                      {c.nombre}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </View>

            {/* Precio reserva */}
            <View style={styles.reservePriceRow}>
              <Text style={styles.reservePriceLabel}>{'💳  Precio de Reserva'}</Text>
              <Text style={styles.reservePriceValue}>{'$1,000 USD'}</Text>
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                isFormValid ? styles.submitButtonActive : styles.submitButtonDisabled,
              ]}
              onPress={this.handleReservar}
              disabled={!isFormValid}
            >
              <Text style={styles.primaryButtonText}>{'CONFIRMAR Y PAGAR RESERVA'}</Text>
            </TouchableOpacity>

            {!isFormValid && (
              <Text style={styles.helperText}>
                {'Completa todos los campos para continuar'}
              </Text>
            )}
          </View>
        </ScrollView>

        {/* Modal de confirmación */}
        <ReservaModal
          visible={modalVisible}
          form={form}
          onClose={() => this.setState({ modalVisible: false })}
          onConfirm={this.handleConfirmar}
        />

        {/* Modal de éxito */}
        <Modal visible={exitoVisible} animationType="fade" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.successSheet}>
              <View style={styles.successIconWrap}>
                <Text style={styles.successIconText}>{'✓'}</Text>
              </View>
              <Text style={styles.successTitle}>
                {'¡RESERVA EXITOSA!'}
              </Text>

              <View style={styles.successCarPlaceholder}>
                <Text style={styles.successCarEmoji}>{'🚗'}</Text>
              </View>

              <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{'Vehículo'}</Text>
                  <Text style={styles.infoValue}>
                    {form.modelo?.nombre}
                  </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{'Color'}</Text>
                  <Text style={styles.infoValue}>
                    {form.color?.nombre}
                  </Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{'Costo Reserva'}</Text>
                  <Text style={styles.infoValue}>{'$1,000 USD'}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{'Nº Confirmación'}</Text>
                  <Text style={styles.confirmationValue}>{confirmacion}</Text>
                </View>
              </View>

              <View style={styles.nextStepsBox}>
                <Text style={styles.nextStepsTitle}>{'Próximos Pasos'}</Text>
                <Text style={styles.nextStepsItem}>{'• Revisa tu correo para más detalles'}</Text>
                <Text style={styles.nextStepsItem}>{'• Un asesor de Voltus se pondrá en contacto'}</Text>
              </View>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => this.setState({ exitoVisible: false, form: { nombre: '', ci: '', modelo: null, color: null } })}
              >
                <Text style={styles.primaryButtonText}>{'IR A INICIO'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    )
  }
}



export default ReservasScreen