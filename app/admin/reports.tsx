import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { MealAPI } from "../../services/mealAPI";
import { COLORS } from "../../constants/colors";
import SafeScreen from "../../components/SafeScreen";

const AdminReportsScreen = () => {
  const router = useRouter();
  const { getToken } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const token = (await getToken()) || "";
      const data = await MealAPI.getAdminReports(token);
      setReports(data);
    } catch (error) {
      console.error("Error fetching admin reports:", error);
      Alert.alert("Error", "Could not load reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <SafeScreen>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.title}>AI Content Reports</Text>
          <TouchableOpacity onPress={fetchReports} style={styles.backBtn}>
            <Ionicons name="refresh" size={20} color={COLORS.gold} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.gold} />
          </View>
        ) : reports.length === 0 ? (
          <View style={styles.center}>
            <Ionicons
              name="checkmark-done-circle-outline"
              size={60}
              color="rgba(255,255,255,0.1)"
            />
            <Text style={styles.emptyText}>No reports found!</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scroll}>
            {reports.map((report) => (
              <View key={report.id} style={styles.reportCard}>
                <View style={styles.reportHeader}>
                  <Text style={styles.recipeTitle}>
                    {report.recipeTitle || "Untitled Recipe"}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          report.status === "pending"
                            ? "rgba(212,175,55,0.2)"
                            : "rgba(46,204,113,0.2)",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color:
                            report.status === "pending"
                              ? COLORS.gold
                              : "#2ECC71",
                        },
                      ]}
                    >
                      {report.status?.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Ionicons
                    name="chatbubble-outline"
                    size={14}
                    color="rgba(255,255,255,0.4)"
                  />
                  <Text style={styles.reasonText}>{report.reason}</Text>
                </View>

                <View style={styles.footer}>
                  <Text style={styles.metaText}>
                    By: {report.userId?.substring(0, 10)}...
                  </Text>
                  <Text style={styles.metaText}>
                    {new Date(report.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </SafeScreen>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  title: { fontSize: 20, fontWeight: "900", color: "#FFF" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { color: "rgba(255,255,255,0.3)", marginTop: 12, fontSize: 16 },
  scroll: { padding: 20 },
  reportCard: {
    backgroundColor: "#111",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.1)",
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  recipeTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "800",
    flex: 1,
    marginRight: 10,
  },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: "900" },
  infoRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  reasonText: { color: "rgba(255,255,255,0.7)", fontSize: 14, flex: 1 },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
    paddingTop: 12,
  },
  metaText: { color: "rgba(255,255,255,0.3)", fontSize: 12 },
});

export default AdminReportsScreen;
