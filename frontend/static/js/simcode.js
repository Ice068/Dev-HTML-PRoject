function runCode() {
  const code = document.getElementById("codeArea").value;
  const output = document.getElementById("output");

  // 🔒 กันโค้ดอันตราย
  const forbidden = [
    "<script",
    "javascript:",
    "onerror",
    "onload",
    "onclick",
    "fetch(",
    "document.cookie"
  ];

  for (let word of forbidden) {
    if (code.toLowerCase().includes(word)) {
      alert("❌ ห้ามใช้ JavaScript หรือโค้ดอันตราย");
      return;
    }
  }

  // 🔒 sandbox ปลอดภัย (ไม่ให้รัน JS)
  output.setAttribute("sandbox", "");

  // แสดง HTML อย่างเดียว
  output.srcdoc = code;
}


// ===== logout (แก้ใหม่) =====
function logout() {
  localStorage.removeItem("userId");
  window.location.href = "login.html";
}