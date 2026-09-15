import React, { Component } from 'react';
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
  ActivityIndicator,
  Alert,
} from 'react-native';
import LoginButton from '../../components/LoginButton';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ColoresService from '../../../Model/ColoresService';
import ReservasService from '../../../Model/ReservasService';
import VehiculosService from '../../../Model/VehiculosService';
import { styles, COLORS } from '../../../styles/ReservasScreen.styles';

const { width } = Dimensions.get('window');

interface Modelo {
  id: string;
  nombre: string;
  precio: string;
}

interface ColorDisponible {
  id_color: number;
  Color: string;
  hex: string;
}

function formatearPrecio(precio: number | null | undefined): string {
  const valor = Number(precio);
  return Number.isNaN(valor) ? '—' : `$${valor.toLocaleString('en-US')}`;
}

const HEX_POR_NOMBRE: Record<string, string> = {
  Blanco: '#f0f4ff',
  Negro: '#0a1628',
  Gris: '#9ca3af',
  Rojo: '#dc2626',
  Azul: '#1e4fd8',
  Verde: '#2fb676',
  Amarillo: '#facc15',
};

const COLOR_ITEM_WIDTH = (width - 80) / 5;

// sombras reutilizadas
const shadowForm = {
  shadowColor: COLORS.navy,
  shadowOpacity: 0.08,
  shadowRadius: 20,
  elevation: 4,
};
const shadowColorDot = {
  shadowColor: '#000',
  shadowOpacity: 0.15,
  shadowRadius: 6,
  elevation: 3,
};

interface FormData {
  nombres: string;
  apellidos: string;
  cedula: string;
  modelo: Modelo | null;
  color: ColorDisponible | null;
}

interface ErroresForm {
  nombres?: string;
  apellidos?: string;
  cedula?: string;
  modelo?: string;
  color?: string;
}

function validarCampos(form: FormData): ErroresForm {
  const errores: ErroresForm = {};

  if (!form.nombres.trim()) {
    errores.nombres = 'Los nombres son obligatorios';
  } else if (form.nombres.trim().length < 2) {
    errores.nombres = 'Mínimo 2 caracteres';
  }

  if (!form.apellidos.trim()) {
    errores.apellidos = 'Los apellidos son obligatorios';
  } else if (form.apellidos.trim().length < 2) {
    errores.apellidos = 'Mínimo 2 caracteres';
  }

  if (!form.cedula.trim()) {
    errores.cedula = 'La cédula de identidad es obligatoria';
  } else if (!/^\d{6,10}$/.test(form.cedula.trim())) {
    errores.cedula = 'Cédula inválida (6-10 dígitos)';
  }

  if (!form.modelo) {
    errores.modelo = 'Selecciona un modelo';
  }

  if (!form.color) {
    errores.color = 'Selecciona un color';
  }

  return errores;
}

interface ReservaModalProps {
  visible: boolean;
  form: FormData;
  guardando: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function ReservaModal({ visible, form, guardando, onClose, onConfirm }: ReservaModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderBar} />
            <Text style={styles.modalTitle}>Confirmar Reserva</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <MaterialCommunityIcons name="close" size={14} color={COLORS.grayText} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}>
            {/* Car placeholder */}
            <View style={styles.carPlaceholder}>
              <MaterialCommunityIcons name="car" size={48} color={COLORS.blue} />
              <Text style={styles.carPlaceholderLabel}>{'Imagen del vehículo'}</Text>
            </View>

            {/* Datos del cliente */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionLabel}>{'DATOS DEL CLIENTE'}</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{'Nombres'}</Text>
                <Text style={styles.infoValue}>{form.nombres || '—'}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{'Apellidos'}</Text>
                <Text style={styles.infoValue}>{form.apellidos || '—'}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{'Cédula de Identidad'}</Text>
                <Text style={styles.infoValue}>{form.cedula || '—'}</Text>
              </View>
            </View>

            {/* Datos del vehículo */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionLabel}>{'VEHÍCULO SELECCIONADO'}</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{'Modelo'}</Text>
                <Text style={styles.infoValue}>{form.modelo?.nombre || '—'}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{'Color'}</Text>
                <View style={styles.colorValueRow}>
                  {form.color && (
                    <View style={[styles.colorDot, { backgroundColor: form.color.hex }]} />
                  )}
                  <Text style={styles.infoValue}>{form.color?.Color || '—'}</Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.totalLabel}>{'Precio'}</Text>
                <Text style={styles.totalValue}>{form.modelo?.precio || '—'}</Text>
              </View>
            </View>

            <View style={styles.refundNoteRow}>
              <MaterialCommunityIcons
                name="check-circle-outline"
                size={18}
                color={COLORS.primary}
              />
              <Text style={[styles.refundNote, { marginBottom: 0, marginLeft: 6 }]}>
                {'El precio de reserva es reembolsable'}
              </Text>
            </View>

            {/* Botones */}
            <TouchableOpacity style={styles.primaryButton} onPress={onConfirm} disabled={guardando}>
              {guardando ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.primaryButtonText}>{'EFECTUAR PAGO Y CONFIRMAR'}</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose} disabled={guardando}>
              <Text style={styles.cancelButtonText}>{'Cancelar'}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

interface State {
  form: FormData;
  modalVisible: boolean;
  exitoVisible: boolean;
  confirmacion: string;
  colores: ColorDisponible[];
  cargandoColores: boolean;
  errorColores: string | null;
  modelos: Modelo[];
  cargandoModelos: boolean;
  errorModelos: string | null;
  errores: ErroresForm;
  intentado: boolean;
  guardandoReserva: boolean;
}

export class ReservasScreen extends Component<object, State> {
  state: State = {
    form: { nombres: '', apellidos: '', cedula: '', modelo: null, color: null },
    modalVisible: false,
    exitoVisible: false,
    confirmacion: '',
    colores: [],
    cargandoColores: true,
    errorColores: null,
    modelos: [],
    cargandoModelos: true,
    errorModelos: null,
    errores: {},
    intentado: false,
    guardandoReserva: false,
  };

  componentDidMount() {
    this.cargarColores();
    this.cargarModelos();
  }

  cargarColores = async () => {
    try {
      this.setState({ cargandoColores: true, errorColores: null });
      const data = await ColoresService.obtenerColores();
      const colores: ColorDisponible[] = data.map((c) => ({
        id_color: c.id_color,
        Color: c.Color,
        hex: HEX_POR_NOMBRE[c.Color] || '#94a3b8',
      }));
      this.setState({ colores, cargandoColores: false });
    } catch {
      this.setState({ cargandoColores: false, errorColores: 'No se pudieron cargar los colores' });
    }
  };

  cargarModelos = async () => {
    try {
      this.setState({ cargandoModelos: true, errorModelos: null });
      const data = await VehiculosService.obtenerVehiculos();
      const modelos: Modelo[] = data.map((v) => ({
        id: String(v.id_vehiculo),
        nombre: v.Nombre_Modelo,
        precio: formatearPrecio(v.Precio_USD),
      }));
      this.setState({ modelos, cargandoModelos: false });
    } catch {
      this.setState({ cargandoModelos: false, errorModelos: 'No se pudieron cargar los modelos' });
    }
  };

  handleChange = (campo: 'nombres' | 'apellidos' | 'cedula', valor: string) => {
    this.setState((prev) => {
      const form = { ...prev.form, [campo]: valor };
      const errores = prev.intentado ? validarCampos(form) : prev.errores;
      return { form, errores };
    });
  };

  handleSeleccionarModelo = (modelo: Modelo) => {
    this.setState((prev) => {
      const form = { ...prev.form, modelo };
      const errores = prev.intentado ? validarCampos(form) : prev.errores;
      return { form, errores };
    });
  };

  handleSeleccionarColor = (color: ColorDisponible) => {
    this.setState((prev) => {
      const form = { ...prev.form, color };
      const errores = prev.intentado ? validarCampos(form) : prev.errores;
      return { form, errores };
    });
  };

  handleReservar = () => {
    const errores = validarCampos(this.state.form);
    if (Object.keys(errores).length > 0) {
      this.setState({ errores, intentado: true });
      return;
    }
    this.setState({ modalVisible: true, errores: {} });
  };

  handleConfirmar = async () => {
    const { form } = this.state;
    this.setState({ guardandoReserva: true });
    try {
      await ReservasService.crearReserva({
        nombres: form.nombres.trim(),
        apellidos: form.apellidos.trim(),
        cedula_identidad: form.cedula.trim(),
        modelo: form.modelo!.nombre,
        color: form.color!.id_color,
      });
      const codigo = 'VT-' + Math.floor(1000 + Math.random() * 9000) + '-ABC';
      this.setState({
        modalVisible: false,
        guardandoReserva: false,
        exitoVisible: true,
        confirmacion: codigo,
      });
    } catch {
      this.setState({ guardandoReserva: false });
      Alert.alert('Error', 'No se pudo guardar la reserva. Intenta de nuevo.');
    }
  };

  render() {
    const {
      form,
      modalVisible,
      exitoVisible,
      confirmacion,
      colores,
      cargandoColores,
      errorColores,
      modelos,
      cargandoModelos,
      errorModelos,
      errores,
      guardandoReserva,
    } = this.state;
    const hayErrorres = Object.keys(errores).length > 0;
    const isFormValid =
      form.nombres.trim() &&
      form.apellidos.trim() &&
      /^\d{6,10}$/.test(form.cedula.trim()) &&
      form.modelo &&
      form.color;

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
          contentContainerStyle={{ paddingBottom: 120 }}>
          {/* Banner */}
          <View style={styles.banner}>
            <View style={styles.bannerText}>
              <Text style={styles.bannerTitle}>{'Reserva ahora,\nmaneja el futuro'}</Text>
              <Text style={styles.bannerSubtitle}>{'Garantiza tu lugar con\nsolo $1,000 USD'}</Text>
            </View>
            <View style={styles.bannerIconWrap}>
              <MaterialCommunityIcons name="car-sports" size={70} color={COLORS.primary} />
            </View>
          </View>

          {/* Formulario */}
          <View style={[styles.formCard, shadowForm]}>
            <Text style={styles.formSectionTitle}>{'Datos Personales'}</Text>

            <Text style={styles.inputLabel}>{'Nombres'}</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ej. Juan"
              placeholderTextColor={COLORS.grayMid}
              value={form.nombres}
              onChangeText={(v) => this.handleChange('nombres', v)}
            />
            {errores.nombres && <Text style={styles.fieldError}>{errores.nombres}</Text>}

            <Text style={styles.inputLabel}>{'Apellidos'}</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ej. Pérez Mamani"
              placeholderTextColor={COLORS.grayMid}
              value={form.apellidos}
              onChangeText={(v) => this.handleChange('apellidos', v)}
            />
            {errores.apellidos && <Text style={styles.fieldError}>{errores.apellidos}</Text>}

            <Text style={styles.inputLabel}>{'Cédula de Identidad'}</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ej. 12345678"
              placeholderTextColor={COLORS.grayMid}
              keyboardType="number-pad"
              value={form.cedula}
              onChangeText={(v) => this.handleChange('cedula', v)}
            />
            {errores.cedula && <Text style={styles.fieldError}>{errores.cedula}</Text>}

            <Text style={[styles.formSectionTitle, styles.formSectionTitleMt]}>
              {'Selecciona tu Modelo'}
            </Text>
            {cargandoModelos ? (
              <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 16 }} />
            ) : errorModelos ? (
              <Text style={styles.fieldError}>{errorModelos}</Text>
            ) : (
              modelos.map((m) => {
                const selected = form.modelo?.id === m.id;
                return (
                  <TouchableOpacity
                    key={m.id}
                    style={[
                      styles.modelOption,
                      selected ? styles.modelOptionSelected : styles.modelOptionUnselected,
                    ]}
                    onPress={() => this.handleSeleccionarModelo(m)}>
                    <View style={styles.modelEmojiWrap}>
                      <MaterialCommunityIcons name="car" size={36} color={COLORS.blue} />
                    </View>
                    <View style={styles.modelOptionInfo}>
                      <Text
                        style={[
                          styles.modelOptionName,
                          selected
                            ? styles.modelOptionNameSelected
                            : styles.modelOptionNameUnselected,
                        ]}>
                        {m.nombre}
                      </Text>
                      <Text style={styles.modelTotalPrice}>{m.precio}</Text>
                    </View>
                    <View
                      style={[
                        styles.radioCircle,
                        selected ? styles.radioCircleSelected : styles.radioCircleUnselected,
                      ]}>
                      {selected && <View style={styles.radioDot} />}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
            {errores.modelo && <Text style={styles.fieldError}>{errores.modelo}</Text>}

            <Text style={[styles.formSectionTitle, styles.formSectionTitleMt]}>
              {'Elige tu Color'}
            </Text>
            {cargandoColores ? (
              <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 16 }} />
            ) : errorColores ? (
              <Text style={styles.fieldError}>{errorColores}</Text>
            ) : (
              <View style={styles.colorsWrap}>
                {colores.map((c) => {
                  const selected = form.color?.id_color === c.id_color;
                  return (
                    <TouchableOpacity
                      key={c.id_color}
                      style={[styles.colorOption, { width: COLOR_ITEM_WIDTH }]}
                      onPress={() => this.handleSeleccionarColor(c)}>
                      <View
                        style={[
                          styles.colorDotCircle,
                          shadowColorDot,
                          { backgroundColor: c.hex },
                          styles.colorDotBorder,
                          selected && styles.colorDotSelected,
                        ]}>
                        {selected && <MaterialCommunityIcons name="check" size={18} color="#fff" />}
                      </View>
                      <Text
                        style={[
                          styles.colorLabel,
                          selected ? styles.colorLabelSelected : styles.colorLabelUnselected,
                        ]}>
                        {c.Color}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
            {errores.color && <Text style={styles.fieldError}>{errores.color}</Text>}

            {/* Precio reserva */}
            <View style={styles.reservePriceRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <MaterialCommunityIcons
                  name="credit-card-outline"
                  size={20}
                  color={COLORS.primary}
                />
                <Text style={styles.reservePriceLabel}>{'Precio de Reserva'}</Text>
              </View>
              <Text style={styles.reservePriceValue}>{'$1,000 USD'}</Text>
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                isFormValid ? styles.submitButtonActive : styles.submitButtonDisabled,
              ]}
              onPress={this.handleReservar}
              disabled={!isFormValid}>
              <Text style={styles.primaryButtonText}>{'CONFIRMAR Y PAGAR RESERVA'}</Text>
            </TouchableOpacity>

            {!isFormValid && !hayErrorres && (
              <Text style={styles.helperText}>{'Completa todos los campos para continuar'}</Text>
            )}
          </View>
        </ScrollView>

        {/* Modal de confirmación */}
        <ReservaModal
          visible={modalVisible}
          form={form}
          guardando={guardandoReserva}
          onClose={() => this.setState({ modalVisible: false })}
          onConfirm={this.handleConfirmar}
        />

        {/* Modal de éxito */}
        <Modal visible={exitoVisible} animationType="fade" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.successSheet}>
              <View style={styles.successIconWrap}>
                <MaterialCommunityIcons name="check" size={30} color={COLORS.white} />
              </View>
              <Text style={styles.successTitle}>{'¡RESERVA EXITOSA!'}</Text>

              <View style={styles.successCarPlaceholder}>
                <MaterialCommunityIcons name="car" size={56} color={COLORS.blue} />
              </View>

              <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{'Vehículo'}</Text>
                  <Text style={styles.infoValue}>{form.modelo?.nombre}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{'Color'}</Text>
                  <Text style={styles.infoValue}>{form.color?.Color}</Text>
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
                <Text style={styles.nextStepsItem}>
                  {'• Un asesor de Voltus se pondrá en contacto'}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() =>
                  this.setState({
                    exitoVisible: false,
                    form: { nombres: '', apellidos: '', cedula: '', modelo: null, color: null },
                    errores: {},
                    intentado: false,
                  })
                }>
                <Text style={styles.primaryButtonText}>{'IR A INICIO'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }
}

export default ReservasScreen;
