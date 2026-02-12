import https from "https";

const URL = "https://ai-foody-app-4.onrender.com/api/health";

const start = () => {
  console.log("---------------------------------------------------------");
  console.log("🚀 Keep-Alive System: Active");
  console.log(`📡 Pinging: ${URL}`);
  console.log("⏰ Interval: Every 14 seconds");
  console.log("---------------------------------------------------------");

  setInterval(() => {
    https
      .get(URL, (res) => {
        if (res.statusCode === 200) {
          console.log("✅ Keep-alive ping successful");
        } else {
          console.log("⚠️ Keep-alive ping failed. Status:", res.statusCode);
        }
      })
      .on("error", (e) => {
        console.error("❌ Keep-alive ping error:", e.message);
      });
  }, 300000); // 5 minutes (300,000 ms)
};

export default { start };