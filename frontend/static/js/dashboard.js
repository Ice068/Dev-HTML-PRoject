const userId = localStorage.getItem("userId");

requireLogin();

authFetch("/users/me")
  .then(res => res.json())
  .then(data => {
    document.getElementById("userName").textContent = data.username;
    document.getElementById("profileName").textContent = data.username;

    // EXP
    document.querySelector(".cards .card:nth-child(1) .big").textContent = data.exp;

    // Level
    const level = Math.floor(data.exp / 100) + 1;
    document.querySelector(".level").textContent = `Lv.${level}`;

    // Rank
    let rank = "🥉 Bronze";
    if (data.exp >= 800)      rank = "👑 Legend";
    else if (data.exp >= 600) rank = "💎 Diamond";
    else if (data.exp >= 400) rank = "🥇 Gold";
    else if (data.exp >= 200) rank = "🥈 Silver";

    document.querySelector(".cards .card:nth-child(4) .big").textContent = rank;

    // ✅ นับ quest ที่เสร็จแล้ว
    const questKeys = ["quest_lesson1", "quest_lesson2", "quest_lesson3"];
    const done = questKeys.filter(k => localStorage.getItem(`${k}_${userId}`) === "done").length;
    document.querySelector(".cards .card:nth-child(2) .big").textContent = `${done}/3`;

    // ✅ EXP Progress bar ไปเลเวลถัดไป
    const expInCurrentLevel = data.exp % 100;       // EXP ที่สะสมในเลเวลนี้
    const expNeeded = 100;                          // EXP ต่อเลเวล
    const percent = (expInCurrentLevel / expNeeded) * 100;

    const expBarFill = document.getElementById("expBarFill");
    const expText = document.getElementById("expText");

    if (expBarFill && expText) {
      expBarFill.style.width = `${percent}%`;
      expText.textContent = `${expInCurrentLevel} / ${expNeeded} EXP`;
    }
  })
  .catch(err => {
    console.error("โหลดข้อมูล user ไม่สำเร็จ:", err);
  });

function logout() {
  localStorage.removeItem("userId");
  window.location.href = "login.html";
}

// ===== Mobile menu toggle =====
const sidebar = document.querySelector('.sidebar');
const overlay = document.querySelector('.overlay');
const toggleBtn = document.querySelector('.menu-toggle');

if (toggleBtn && sidebar && overlay) {
  toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('show');
  });

  overlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
  });
}