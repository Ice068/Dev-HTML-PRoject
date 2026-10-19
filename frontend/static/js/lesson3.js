function checkCode() {
  const code = document.getElementById("codeInput").value.toLowerCase();
  const result = document.getElementById("result");
  const userId = localStorage.getItem("userId");

  if (!userId) {
    alert("❌ กรุณา login ก่อน");
    window.location.href = "login.html";
    return;
  }

  // 🔒 กันทำซ้ำ (แก้ key ให้ถูกต้อง)
  if (localStorage.getItem(`lesson3_done_${userId}`) === "done") {
    result.style.color = "#facc15";
    result.textContent = "⚠️ เคยผ่านแล้ว ได้ EXP ไปแล้ว";
    return;
  }

  const correct = /<h1>\s*my website\s*<\/h1>/i;

  if (correct.test(code)) {
    result.style.color = "#22c55e";
    result.textContent = "🎉 ถูกต้อง! +20 EXP";

    authFetch("/users/me/exp", { method: "PATCH", body: JSON.stringify({ exp: 20 }) })
    .then(res => res.json())
    .then(() => {
      // ✅ แก้ key ให้ถูก (lesson3_done ไม่ใช่ lesson4_done)
      localStorage.setItem(`lesson3_done_${userId}`, "done");

      setTimeout(() => window.location.href = "dashboard.html", 1200);
    })
    .catch(() => {
      result.style.color = "red";
      result.textContent = "❌ เพิ่ม EXP ไม่สำเร็จ";
    });

  } else {
    result.style.color = "red";
    result.textContent = "❌ ยังไม่ถูก ลองใช้ <h1> ให้ถูกต้อง";
  }
}

function goBack() {
  window.location.href = "dashboard.html";
}