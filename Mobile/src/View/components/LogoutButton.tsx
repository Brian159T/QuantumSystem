import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../ViewModel/AuthViewModel";
import { styles } from "../../styles/LogoutButton.styles";

const LogoutButton = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <TouchableOpacity
      style={styles.logoutButton}
      onPress={handleLogout}
      activeOpacity={0.8}
    >
      <MaterialCommunityIcons
        name="logout"
        size={16}
        color="#ffffff"
      />

      <Text style={styles.logoutText}>
        Cerrar sesión
      </Text>
    </TouchableOpacity>
  );
};

export default LogoutButton;