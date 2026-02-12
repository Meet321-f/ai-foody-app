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

const AdminFeedbackScreen = () => {
  const router = useRouter();
  const { getToken } = useAuth();
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const token = (await getToken()) || "";
      const data = await MealAPI.getAdminFeedback(token);
      setFeedbacks(data);
    } catch (error) {
      console.error("Error fetching admin feedback:", error);
      Alert.alert("Error", "Could not load feedback.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const getTypeStyle = (type: string) => {
    switch (type) {
      case "bug":
        return { color: "#EE5253", bg: "rgba(238, 82, 83, 0.15)" };
      case "feature":
        return { color: "#FECA57", bg: "rgba(254, 202, 87, 0.15)" };
      default:
        return { color: "#48DBFB", bg: "rgba(72, 219, 251, 0.15)" };
    }
  };

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
          <Text style={styles.title}>User Feedback</Text>
          <TouchableOpacity onPress={fetchFeedback} style={styles.backBtn}>
            <Ionicons name="refresh" size={20} color={COLORS.gold} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.gold} />
          </View>
        ) : feedbacks.length === 0 ? (
          <View style={styles.center}>
            <Ionicons
              name="chatbox-ellipses-outline"
              size={60}
              color="rgba(255,255,255,0.1)"
            />
            <Text style={styles.emptyText}>No feedback yet!</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scroll}>
            {feedbacks.map((item) => {
              const typeStyle = getTypeStyle(item.type);
              return (
                <View key={item.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>
                        {item.userName || "User"}
                      </Text>
                      <View style={styles.ratingRow}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Ionicons
                            key={s}
                            name={s <= item.rating ? "star" : "star-outline"}
                            size={12}
                            color={
                              s <= item.rating
                                ? COLORS.gold
                                : "rgba(255,255,255,0.2)"
                            }
                          />
                        ))}
                      </View>
                    </View>
                    <View
                      style={[
                        styles.typeBadge,
                        { backgroundColor: typeStyle.bg },
                      ]}
                    >
                      <Text
                        style={[styles.typeText, { color: typeStyle.color }]}
                      >
                        {item.type.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.messageText}>{item.message}</Text>

                  <View style={styles.footer}>
                    <Text style={styles.dateText}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                    <Text style={styles.idText}>
                      ID: {item.userId.substring(0, 8)}
                    </Text>
                  </View>
                </View>
              );
            })}
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
  card: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.1)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: "row",
    gap: 2,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 10,
    fontWeight: "900",
  },
  messageText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
    paddingTop: 12,
  },
  dateText: { color: "rgba(255,255,255,0.3)", fontSize: 12 },
  idText: { color: "rgba(212,175,55,0.3)", fontSize: 10, fontWeight: "600" },
});

export default AdminFeedbackScreen;
