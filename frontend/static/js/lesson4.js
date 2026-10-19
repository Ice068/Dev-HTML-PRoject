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
  if (localStorage.getItem(`lesson4_done_${userId}`) === "done") {
    result.style.color = "#facc15";
    result.textContent = "⚠️ เคยผ่านแล้ว ได้ EXP ไปแล้ว";
    return;
  }

  const hasSidebar = code.includes("sidebar");
  const hasMenu1 = code.includes("หน้าแรก");
  const hasMenu2 = code.includes("เกี่ยวกับเรา");
  const hasMenu3 = code.includes("ติดต่อเรา");

  if (hasSidebar && hasMenu1 && hasMenu2 && hasMenu3) {
    result.style.color = "#22c55e";
    result.textContent = "🎉 ถูกต้อง! +30 EXP";

    authFetch("/users/me/exp", { method: "PATCH", body: JSON.stringify({ exp: 30 }) })
    .then(res => res.json())
    .then(() => {
      // ✅ key ถูกต้องแล้ว
      localStorage.setItem(`lesson4_done_${userId}`, "done");

      setTimeout(() => window.location.href = "dashboard.html", 1200);
    })
    .catch(() => {
      result.style.color = "red";
      result.textContent = "❌ เพิ่ม EXP ไม่สำเร็จ";
    });

  } else {
    result.style.color = "red";
    result.textContent = "❌ ยังไม่ถูก ลองคิดว่า Sidebar คือเมนูด้านข้าง";
  }
}

function goBack() {
  window.location.href = "dashboard.html";
}