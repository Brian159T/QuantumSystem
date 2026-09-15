import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "rgba(255,255,255,0.12)",

    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.28)",

    borderRadius: 10,

    paddingHorizontal: 16,
    paddingVertical: 9,

    gap: 7,
  },

  logoutText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
});