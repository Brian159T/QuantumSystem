import React from 'react'
import { Text, View } from 'react-native'
import { useAuth } from '../../ViewModel/AuthViewModel'

const Saludo = () => {
  const { usuario } = useAuth()

  return (
    <View>
      <Text
        style={{
          color: 'rgba(237,230,216,0.6)',
          fontSize: 12,
          fontWeight: '600',
        }}
      >
        BIENVENIDO
      </Text>

      <Text
        style={{
          color: '#EDE6D8',
          fontSize: 22,
          fontWeight: '700',
        }}
      >
        Hola {usuario?.nombre_usuario || 'Usuario'}
      </Text>
    </View>
  )
}

export default Saludo