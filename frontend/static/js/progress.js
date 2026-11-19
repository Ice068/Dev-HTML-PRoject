if (requireLogin()) {
  const userId = localStorage.getItem("userId");

  // ดึงข้อมูลจาก backend
  authFetch("/users/me")
    .then(async (res) => {
      if (!res.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ");
      return res.json();
    })
    .then((data) => {
      const exp = data.exp;
      const allStageKeys = [...ALL_LESSON_KEYS, ...ALL_BOSS_KEYS];
      const completedStages = allStageKeys.filter(
        (k) => localStorage.getItem(`${k}_${userId}`) === "done"
      ).length;

      /* คำนวณ */
      const level = Math.floor(exp / 100) + 1;
      const percent = Math.round((completedStages / allStageKeys.length) * 100);

      /* แสดงค่า */
      document.getElementById("exp").textContent = exp;
      document.getElementById("level").textContent = level;
      document.getElementById("quest").textContent = `${completedStages}/${allStageKeys.length}`;
      document.getElementById("percent").textContent = `${percent}%`;

      /* Chart */
      const ctx = document.getElementById("progressChart");
      if (ctx && typeof Chart !== "undefined") {
        new Chart(ctx, {
          type: "bar",
          data: {
            labels: ["EXP", "Level (x10)", "ภารกิจที่ผ่าน (x20)"],
            datasets: [
              {
                label: "ความคืบหน้า",
                data: [exp, level * 10, completedStages * 20],
                backgroundColor: ["#06b6d4", "#3b82f6", "#22c55e"],
              },
            ],
          },
          options: {
            plugins: {
              legend: { display: false },
            },
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          },
        });
      }
    })
    .catch((err) => {
      console.error("โหลดข้อมูลความคืบหน้าไม่สำเร็จ:", err);
      alert("❌ โหลดข้อมูลไม่สำเร็จ");
    });
}
