function checkCode() {
  const code = document.getElementById("codeInput").value.toLowerCase();
  const result = document.getElementById("result");
  const userId = localStorage.getItem("userId");

  if (!userId) {
    alert("❌ กรุณา login ก่อน");
    window.location.href = "login.html";
    return;
  }

  // 🔒 กันทำซ้ำ
  if (localStorage.getItem(`lesson2_done_${userId}`) === "done") {
    result.style.color = "#facc15";
    result.textContent = "⚠️ ทำภารกิจนี้ไปแล้ว!";
    return;
  }

  if (
    code.includes("<a") &&
    code.includes("href") &&
    code.includes("dashboard.html") &&
    code.includes("ไป dashboard")
  ) {
    result.style.color = "#22c55e";
    result.textContent = "🎉 ถูกต้อง! +50 EXP";

    authFetch("/users/me/exp", { method: "PATCH", body: JSON.stringify({ exp: 50 }) })
    .then(res => res.json())
    .then(() => {
      // ✅ lock + ปลดล็อค lesson3
      localStorage.setItem(`lesson2_done_${userId}`, "done");

      setTimeout(() => window.location.href = "dashboard.html", 1200);
    })
    .catch(() => {
      result.style.color = "red";
      result.textContent = "❌ เพิ่ม EXP ไม่สำเร็จ";
    });

  } else {
    result.style.color = "red";
    result.textContent = "❌ ยังไม่ถูก ลองคิดว่าเป็น 'ประตูวาร์ป'";
  }
}

function goBack() {
  window.location.href = "dashboard.html";
}