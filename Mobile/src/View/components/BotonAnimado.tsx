import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, TouchableOpacity } from 'react-native';
import type { TouchableOpacityProps } from 'react-native';

const TouchableAnimado = Animated.createAnimatedComponent(TouchableOpacity);

export default function BotonAnimado({
  style,
  onPressIn,
  onPressOut,
  ...props
}: TouchableOpacityProps) {
  const escala = useRef(new Animated.Value(1)).current;
  const reducirMovimiento = useRef(false);

  useEffect(() => {
    let activo = true;
    const actualizar = (valor: boolean) => {
      reducirMovimiento.current = valor;
      if (valor) {
        escala.stopAnimation();
        escala.setValue(1);
      }
    };
    void AccessibilityInfo.isReduceMotionEnabled().then((valor) => {
      if (activo) actualizar(valor);
    });
    const suscripcion = AccessibilityInfo.addEventListener('reduceMotionChanged', actualizar);
    return () => {
      activo = false;
      suscripcion.remove();
      escala.stopAnimation();
    };
  }, [escala]);

  const animar = (valor: number) => {
    if (reducirMovimiento.current) return;
    Animated.timing(escala, {
      toValue: valor,
      duration: valor === 1 ? 150 : 90,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableAnimado
      {...props}
      style={[style, { transform: [{ scale: escala }] }]}
      onPressIn={(evento) => {
        animar(0.96);
        onPressIn?.(evento);
      }}
      onPressOut={(evento) => {
        animar(1);
        onPressOut?.(evento);
      }}
    />
  );
}
