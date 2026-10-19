function checkCode() {
  const code = document.getElementById("codeInput").value.toLowerCase();
  const result = document.getElementById("result");
  const userId = localStorage.getItem("userId");

  if (!userId) { alert("❌ กรุณา login ก่อน"); window.location.href = "login.html"; return; }

  if (localStorage.getItem(`lesson6_done_${userId}`) === "done") {
    result.style.color = "#facc15";
    result.textContent = "⚠️ เคยผ่านแล้ว ได้ EXP ไปแล้ว";
    return;
  }

  if (code.includes("<nav>") && code.includes("<a") && code.includes("home") && code.includes("about") && code.includes("contact")) {
    result.style.color = "#22c55e";
    result.textContent = "🎉 ถูกต้อง! คุณสร้าง Navbar ได้แล้ว +40 EXP";

    authFetch("/users/me/exp", { method: "PATCH", body: JSON.stringify({ exp: 40 }) })
    .then(res => res.json())
    .then(() => {
      localStorage.setItem(`lesson6_done_${userId}`, "done");
      setTimeout(() => window.location.href = "dashboard.html", 1200);
    })
    .catch(() => { result.style.color = "red"; result.textContent = "❌ เพิ่ม EXP ไม่สำเร็จ"; });

  } else {
    result.style.color = "red";
    result.textContent = "❌ ยังไม่ถูก ลองคิดว่า Navbar คือเมนูด้านบน";
  }
}

function goBack() { window.location.href = "dashboard.html"; }