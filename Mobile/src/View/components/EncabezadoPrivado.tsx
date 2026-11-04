import { Text, View } from 'react-native';
import { styles } from '../../styles/EncabezadoPrivado.styles';

interface Props {
  titulo: string;
  descripcion: string;
  administrador?: boolean;
}

export default function EncabezadoPrivado({ titulo, descripcion, administrador = false }: Props) {
  return (
    <View style={styles.contenedor}>
      <Text style={styles.etiqueta}>
        QUANTUM / {administrador ? 'ADMINISTRACIÓN' : 'TU ESPACIO'}
      </Text>
      <Text accessibilityRole="header" style={styles.titulo}>
        {titulo}
      </Text>
      <Text style={styles.descripcion}>{descripcion}</Text>
    </View>
  );
}
