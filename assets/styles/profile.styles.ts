import { StyleSheet, Dimensions } from "react-native";
import { COLORS } from "../../constants/colors";

const { width } = Dimensions.get("window");
const COLUMN_WIDTH = (width - 48) / 2;

// Custom Dark Core Matches Mockup
export const PROFILE_COLORS = {
  background: "#000000",
  card: "rgba(255, 255, 255, 0.05)",
  primary: COLORS.primary,
  primaryGradient: [COLORS.primary, COLORS.amber],
  text: "#FFFFFF",
  textSecondary: "#94A3B8",
  badgeGold: "#FFD700",
  badgeGreen: "#4CAF50",
  badgeBlue: "#0082FF",
  tabIndicator: COLORS.primary,
};

export const profileStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PROFILE_COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: PROFILE_COLORS.background,
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: PROFILE_COLORS.text,
  },
  iconButton: {
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
  },
  // Bio Section
  bioSection: {
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  imageContainer: {
    marginBottom: 16,
    padding: 3,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: PROFILE_COLORS.primary,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#000",
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: PROFILE_COLORS.text,
    marginBottom: 4,
  },
  bio: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
  },
  email: {
    fontSize: 14,
    color: "rgba(255,255,255,0.4)",
    textAlign: "center",
    marginTop: 4,
  },
  editInput: {
    fontSize: 24,
    fontWeight: "700",
    color: PROFILE_COLORS.text,
    borderBottomWidth: 1,
    borderBottomColor: PROFILE_COLORS.primary,
    marginBottom: 4,
    textAlign: "center",
    minWidth: 150,
  },
  // Stats
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
    marginVertical: 24,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: PROFILE_COLORS.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  // Action Button
  editButton: {
    backgroundColor: PROFILE_COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 40,
    justifyContent: "center",
    marginBottom: 32,
    shadowColor: PROFILE_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  editButtonText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
  },
  // Tabs
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
    marginBottom: 20,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    position: "relative",
  },
  tabText: {
    fontSize: 15,
    fontWeight: "600",
    color: "rgba(255,255,255,0.6)",
  },
  activeTypeText: {
    color: PROFILE_COLORS.text,
  },
  activeTabIndicator: {
    position: "absolute",
    bottom: -1,
    width: 40,
    height: 3,
    backgroundColor: PROFILE_COLORS.primary,
    borderRadius: 3,
  },
  // Grid
  gridContainer: {
    paddingHorizontal: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  recipeCard: {
    width: COLUMN_WIDTH,
    height: 280,
    marginBottom: 20,
    borderRadius: 30,
    overflow: "hidden",
    backgroundColor: "transparent",
    position: "relative",
  },
  recipeImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  heartButton: {
    position: "absolute",
    top: 15,
    right: 15,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#FFF",
    marginBottom: 6,
  },
  recipeMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  metaText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: "700",
  },
});
