import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

export type Region = {
  latitude: number
  longitude: number
  latitudeDelta: number
  longitudeDelta: number
}

type Coordenada = {
  latitude: number
  longitude: number
}

function MapView({
  style,
  children,
}: {
  style?: object | object[]
  children?: React.ReactNode
}) {
  return (
    <View
      style={[
        {
          backgroundColor: '#0f172a',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Text style={{ color: '#64748b', textAlign: 'center', padding: 12 }}>
        Mapa no disponible en la versión web
      </Text>
      {children}
    </View>
  )
}

function Marker({
  children,
  onPress,
  coordinate,
  title,
  description,
}: {
  children?: React.ReactNode
  onPress?: () => void
  coordinate?: Coordenada
  title?: string
  description?: string
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ alignItems: 'center', justifyContent: 'center' }}
    >
      {children ?? (
        <View
          style={{
            backgroundColor: '#2fb676',
            borderRadius: 8,
            paddingHorizontal: 6,
            paddingVertical: 4,
          }}
        >
          <Text style={{ color: '#ffffff', fontSize: 12 }}>
            {title ?? '●'}
          </Text>
        </View>
      )}
      {description ? (
        <Text style={{ color: '#94a3b8', fontSize: 10 }}>{description}</Text>
      ) : null}
    </TouchableOpacity>
  )
}

function Polyline() {
  return null
}

export { Marker, Polyline }
export default MapView