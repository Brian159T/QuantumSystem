import React from 'react'
import { Text, View } from 'react-native'
import { useAuth } from '../../ViewModel/AuthViewModel'

const Saludo = () => {
  const { usuario } = useAuth()

  return (
    <View>
      <Text
        style={{
          color: 'rgba(255,255,255,0.6)',
          fontSize: 12,
          fontWeight: '600',
        }}
      >
        BIENVENIDO
      </Text>

      <Text
        style={{
          color: '#FFFFFF',
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