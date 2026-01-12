import { StyleSheet, Dimensions, Platform } from "react-native";
import { COLORS } from "../../constants/colors";

const { height } = Dimensions.get("window");

export const authStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  bgImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
    opacity: 0.6,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "flex-end",
    paddingBottom: 40,
  },
  logoContainer: {
    position: "absolute",
    top: 60,
    left: 24,
  },
  logoTitle: {
    fontFamily: Platform.OS === "ios" ? "Playfair Display" : "serif",
    fontSize: 42,
    color: COLORS.primary,
    fontStyle: "italic",
    fontWeight: "900",
  },
  logoSub: {
    fontSize: 10,
    fontWeight: "900",
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 4,
    marginTop: -5,
  },
  headerSection: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FFF",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
    lineHeight: 20,
  },
  formContainer: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 16,
    position: "relative",
  },
  textInput: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
    color: "#FFF",
    fontSize: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  eyeButton: {
    position: "absolute",
    right: 18,
    top: 18,
  },
  forgotPass: {
    alignSelf: "flex-end",
    marginBottom: 30,
  },
  forgotPassText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "700",
  },
  authButton: {
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 24,
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  socialRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 30,
  },
  socialBtn: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: "center",
  },
  socialBtnText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  footerText: {
    textAlign: "center",
    fontSize: 14,
    color: "rgba(255,255,255,0.4)",
  },
  footerLinkText: {
    color: COLORS.primary,
    fontWeight: "800",
  },
  navBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
});
