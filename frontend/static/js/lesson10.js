function checkCode() {
  const code = document.getElementById("codeInput").value.toLowerCase();
  const result = document.getElementById("result");
  const userId = localStorage.getItem("userId");

  if (!userId) { alert("❌ กรุณา login ก่อน"); window.location.href = "login.html"; return; }

  if (localStorage.getItem(`lesson10_done_${userId}`) === "done") {
    result.style.color = "#facc15";
    result.textContent = "⚠️ เคยผ่านแล้ว ได้ EXP ไปแล้ว";
    return;
  }

  if (code.includes("<div>") && code.includes("กล่อง") && code.includes("</div>") && code.includes("<section>") && code.includes("เนื้อหา") && code.includes("</section>")) {
    result.style.color = "#22c55e";
    result.textContent = "🎉 ถูกต้อง! คุณจัด Layout ได้แล้ว +20 EXP";

    authFetch("/users/me/exp", { method: "PATCH", body: JSON.stringify({ exp: 20 }) })
    .then(res => res.json())
    .then(() => {
      localStorage.setItem(`lesson10_done_${userId}`, "done");
      setTimeout(() => window.location.href = "dashboard.html", 1200);
    })
    .catch(() => { result.style.color = "red"; result.textContent = "❌ เพิ่ม EXP ไม่สำเร็จ"; });

  } else {
    result.style.color = "red";
    result.textContent = "❌ ยังไม่ถูก ลองใช้ <div> และ <section>";
  }
}

function goBack() { window.location.href = "dashboard.html"; }