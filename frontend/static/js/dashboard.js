if (requireLogin()) {
  const userId = localStorage.getItem("userId");

  authFetch("/users/me")
    .then(async (res) => {
      if (!res.ok) throw new Error("โหลดข้อมูล user ไม่สำเร็จ");
      return res.json();
    })
    .then((data) => {
      document.getElementById("userName").textContent = data.username;
      document.getElementById("profileName").textContent = data.username;

      // EXP
      const totalExpEl =
        document.getElementById("totalExp") ||
        document.querySelector(".cards .card:nth-child(1) .big");
      if (totalExpEl) totalExpEl.textContent = data.exp;

      // Level
      const level = Math.floor(data.exp / 100) + 1;
      const levelEl = document.querySelector(".level");
      if (levelEl) levelEl.textContent = `Lv.${level}`;

      // Rank
      let rank = "🥉 Bronze";
      if (data.exp >= 800) rank = "👑 Legend";
      else if (data.exp >= 600) rank = "💎 Diamond";
      else if (data.exp >= 400) rank = "🥇 Gold";
      else if (data.exp >= 200) rank = "🥈 Silver";

      const rankEl =
        document.getElementById("currentRank") ||
        document.querySelector(".cards .card:nth-child(4) .big");
      if (rankEl) rankEl.textContent = rank;

      // นับบทเรียนที่ผ่านจริง (lesson1_done - lesson12_done)
      const doneLessons = ALL_LESSON_KEYS.filter(
        (k) => localStorage.getItem(`${k}_${userId}`) === "done"
      ).length;
      const questsDoneEl =
        document.getElementById("questsDone") ||
        document.querySelector(".cards .card:nth-child(2) .big");
      if (questsDoneEl) questsDoneEl.textContent = `${doneLessons}/${ALL_LESSON_KEYS.length}`;

      // นับบอสที่ชนะจริง (boss1_done, boss2_done)
      const doneBosses = ALL_BOSS_KEYS.filter(
        (k) => localStorage.getItem(`${k}_${userId}`) === "done"
      ).length;
      const bossesDoneEl =
        document.getElementById("bossesDone") ||
        document.querySelector(".cards .card:nth-child(3) .big");
      if (bossesDoneEl) bossesDoneEl.textContent = `${doneBosses}/${ALL_BOSS_KEYS.length}`;

      // EXP Progress bar ไปเลเวลถัดไป
      const expInCurrentLevel = data.exp % 100;
      const expNeeded = 100;
      const percent = (expInCurrentLevel / expNeeded) * 100;

      const expBarFill = document.getElementById("expBarFill");
      const expText = document.getElementById("expText");

      if (expBarFill && expText) {
        expBarFill.style.width = `${percent}%`;
        expText.textContent = `${expInCurrentLevel} / ${expNeeded} EXP`;
      }
    })
    .catch((err) => {
      console.error("โหลดข้อมูล user ไม่สำเร็จ:", err);
    });
}

// ===== Mobile menu toggle =====
const sidebar = document.querySelector(".sidebar");
const overlay = document.querySelector(".overlay");
const toggleBtn = document.querySelector(".menu-toggle");

if (toggleBtn && sidebar && overlay) {
  toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    overlay.classList.toggle("show");
  });

  overlay.addEventListener("click", () => {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
  });
}
