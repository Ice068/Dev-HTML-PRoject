function runCode() {
  const code = document.getElementById("codeArea").value;
  const output = document.getElementById("output");
  const forbidden = ["<script", "javascript:", "onerror", "onload"];

  for (let word of forbidden) {
    if (code.toLowerCase().includes(word)) { alert("❌ ห้ามใช้ JavaScript"); return; }
  }

  output.setAttribute("sandbox", "allow-same-origin");
  output.srcdoc = code;
}

function checkCode() {
  const code = document.getElementById("codeArea").value.toLowerCase();
  const result = document.getElementById("result");
  const userId = localStorage.getItem("userId");

  if (!userId) { alert("❌ กรุณา login ก่อน"); return; }

  if (localStorage.getItem(`boss2_done_${userId}`) === "done") {
    result.style.color = "#facc15";
    result.textContent = "⚠️ ผ่าน Final Boss นี้ไปแล้ว!";
    return;
  }

  if (code.includes("<html") && code.includes("<head") && code.includes("<body") && (code.includes("<h1") || code.includes("<p") || code.includes("<img") || code.includes("<ul"))) {
    result.style.color = "#22c55e";
    result.textContent = "👑 FINAL BOSS ผ่าน! +300 EXP";

    authFetch("/users/me/exp", { method: "PATCH", body: JSON.stringify({ exp: 300 }) })
    .then(res => res.json())
    .then(() => {
      localStorage.setItem(`boss2_done_${userId}`, "done");
      setTimeout(() => window.location.href = "dashboard.html", 1500);
    })
    .catch(() => { result.style.color = "red"; result.textContent = "❌ เพิ่ม EXP ไม่สำเร็จ"; });

  } else {
    result.style.color = "red";
    result.textContent = "❌ โครงสร้างยังไม่ครบ (html / head / body)";
  }
}

function goBack() { window.location.href = "dashboard.html"; }