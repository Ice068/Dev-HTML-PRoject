function checkCode() {
  const code = document.getElementById("codeInput").value.toLowerCase();
  const result = document.getElementById("result");
  const userId = localStorage.getItem("userId");

  if (!userId) { alert("❌ กรุณา login ก่อน"); window.location.href = "login.html"; return; }

  if (localStorage.getItem(`lesson11_done_${userId}`) === "done") {
    result.style.color = "#facc15";
    result.textContent = "⚠️ เคยผ่านแล้ว ได้ EXP ไปแล้ว";
    return;
  }

  if (code.includes("<table>") && code.includes("<tr>") && code.includes("<td>html") && code.includes("<td>css")) {
    result.style.color = "#22c55e";
    result.textContent = "🎉 ถูกต้อง! คุณสร้าง Table ได้แล้ว +30 EXP";

    authFetch("/users/me/exp", { method: "PATCH", body: JSON.stringify({ exp: 30 }) })
    .then(res => res.json())
    .then(() => {
      localStorage.setItem(`lesson11_done_${userId}`, "done");
      setTimeout(() => window.location.href = "dashboard.html", 1200);
    })
    .catch(() => { result.style.color = "red"; result.textContent = "❌ เพิ่ม EXP ไม่สำเร็จ"; });

  } else {
    result.style.color = "red";
    result.textContent = "❌ ยังไม่ถูก ลองใช้ <table> <tr> <td>";
  }
}

function goBack() { window.location.href = "dashboard.html"; }