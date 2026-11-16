import BotonAnimado from './BotonAnimado'
import React from "react";
import { Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../ViewModel/AuthViewModel";
import { styles } from "../../styles/LogoutButton.styles";

const LogoutButton = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <BotonAnimado
      style={styles.logoutButton}
      onPress={handleLogout}
      activeOpacity={0.8}
    >
      <MaterialCommunityIcons
        name="logout"
        size={16}
        color="#EDE6D8"
      />

      <Text style={styles.logoutText}>
        Cerrar sesión
      </Text>
    </BotonAnimado>
  );
};

export default LogoutButton;