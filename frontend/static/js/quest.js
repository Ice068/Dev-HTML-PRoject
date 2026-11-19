if (requireLogin()) {
  const userId = localStorage.getItem("userId");

  // ===== แสดงสถานะ quest =====
  const questConfig = [
    { doneKey: "lesson1_done", exp: 50 },
    { doneKey: "lesson2_done", exp: 50 },
    { doneKey: "lesson3_done", exp: 20 },
    { doneKey: "lesson4_done", exp: 30 },
    { doneKey: "lesson5_done", exp: 20 },
    { doneKey: "lesson6_done", exp: 40 },
    { doneKey: "lesson7_done", exp: 30 },
    { doneKey: "lesson8_done", exp: 20 },
    { doneKey: "lesson9_done", exp: 20 },
    { doneKey: "lesson10_done", exp: 20 },
    { doneKey: "lesson11_done", exp: 30 },
    { doneKey: "lesson12_done", exp: 30 },
    { doneKey: "boss1_done", exp: 200 },
    { doneKey: "boss2_done", exp: 300 },
  ];

  const cards = document.querySelectorAll(".quest-card");

  cards.forEach((card, i) => {
    if (!questConfig[i]) return;
    const key = `${questConfig[i].doneKey}_${userId}`;
    const isDone = localStorage.getItem(key) === "done";

    if (isDone) {
      card.classList.add("quest-done");
      const btn = card.querySelector("button");
      if (btn) {
        btn.textContent = "✅ เสร็จแล้ว";
        btn.disabled = true;
      }
    }
  });
}

// ===== ไปหน้า lesson =====
function go(page, lessonKey = null) {
  if (!requireLogin()) return;

  const userId = localStorage.getItem("userId");
  if (lessonKey) {
    const unlocked = localStorage.getItem(`${lessonKey}_${userId}`);
    if (!unlocked) {
      alert("🔒 ต้องทำด่านก่อนหน้าให้เสร็จก่อน!");
      return;
    }
  }

  window.location.href = page;
}
