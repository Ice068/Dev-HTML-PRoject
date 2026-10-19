function checkCode() {
  const code = document.getElementById("codeInput").value.toLowerCase();
  const result = document.getElementById("result");
  const userId = localStorage.getItem("userId");

  if (!userId) { alert("❌ กรุณา login ก่อน"); window.location.href = "login.html"; return; }

  if (localStorage.getItem(`lesson7_done_${userId}`) === "done") {
    result.style.color = "#facc15";
    result.textContent = "⚠️ เคยผ่านแล้ว ได้ EXP ไปแล้ว";
    return;
  }

  if (code.includes("<img") && code.includes("src") && code.includes("cat") && code.includes("alt") && code.includes("แมว")) {
    result.style.color = "#22c55e";
    result.textContent = "🎉 ถูกต้อง! คุณแสดงรูปภาพได้แล้ว +30 EXP";

    authFetch("/users/me/exp", { method: "PATCH", body: JSON.stringify({ exp: 30 }) })
    .then(res => res.json())
    .then(() => {
      localStorage.setItem(`lesson7_done_${userId}`, "done");
      setTimeout(() => window.location.href = "dashboard.html", 1200);
    })
    .catch(() => { result.style.color = "red"; result.textContent = "❌ เพิ่ม EXP ไม่สำเร็จ"; });

  } else {
    result.style.color = "red";
    result.textContent = "❌ ยังไม่ถูก ลองใส่ src และ alt ให้ครบ";
  }
}

function goBack() { window.location.href = "dashboard.html"; }