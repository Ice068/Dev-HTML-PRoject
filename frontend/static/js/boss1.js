function checkCode() {
  const code = document.getElementById("codeInput").value.toLowerCase();
  const result = document.getElementById("result");
  const userId = localStorage.getItem("userId");

  if (!userId) { alert("❌ กรุณา login ก่อน"); window.location.href = "login.html"; return; }

  if (localStorage.getItem(`boss1_done_${userId}`) === "done") {
    result.style.color = "#facc15";
    result.textContent = "⚠️ ผ่าน Boss นี้ไปแล้ว!";
    return;
  }

  if (code.includes("<h1") && code.includes("<img") && code.includes("<ul") && code.includes("<li") && code.includes("<a") && code.includes("<button") && (code.includes("<div") || code.includes("<section"))) {
    result.style.color = "#22c55e";
    result.textContent = "👑 ผ่านด่าน BOSS! +200 EXP";

    authFetch("/users/me/exp", { method: "PATCH", body: JSON.stringify({ exp: 200 }) })
    .then(res => res.json())
    .then(() => {
      localStorage.setItem(`boss1_done_${userId}`, "done");
      setTimeout(() => window.location.href = "dashboard.html", 1500);
    })
    .catch(() => { result.style.color = "red"; result.textContent = "❌ เพิ่ม EXP ไม่สำเร็จ"; });

  } else {
    result.style.color = "red";
    result.textContent = "❌ ยังไม่ครบ ลองใส่ element ให้ครบทุกอย่าง";
  }
}

function goBack() { window.location.href = "dashboard.html"; }