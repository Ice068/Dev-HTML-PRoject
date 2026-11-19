SoloHint.init({
  hints: {
    pre: "ลองนึกถึงท้ายหน้ากระดาษหรือช่วงเครดิตจบหนัง — ใน HTML5 มีแท็กเฉพาะที่ชื่อตรงตัวกับคำว่า 'ส่วนท้าย' เพื่อบอกความหมายของพื้นที่นี้",
    uni: "เริ่มจากแท็กหลักที่ชื่อตรงกับหัวข้อบทเรียนนี้แบบตัวพิมพ์เล็กทั้งหมด โดยต้องมีทั้งแท็กเปิดและแท็กปิดคู่กัน",
    multi: "เช็ก 3 ส่วนแยกกัน: (1) แท็กเปิดส่วนท้าย (2) ข้อความลิขสิทธิ์ตามโจทย์ (ระวังสัญลักษณ์ © และช่องว่าง) (3) แท็กปิดที่มีเครื่องหมาย /",
    relational: {
      text: "ข้อความลิขสิทธิ์ต้องวาง 'ซ้อนอยู่ด้านใน' ระหว่างแท็กเปิดและแท็กปิดของส่วนท้าย",
      pattern: "<______>\n  ...ข้อความลิขสิทธิ์ตามโจทย์...\n</______>",
    },
    extended: "ถ้าเว็บไซต์ของคุณมีหลายหน้า (เช่น หน้าแรก, เกี่ยวกับเรา, ติดต่อ) คุณคิดว่าข้อมูลแบบไหนควรนำไปรวมไว้ในส่วนท้ายเพื่อให้ผู้ใช้เข้าถึงได้จากทุกหน้า?",
  },
});

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
  if (localStorage.getItem(`lesson5_done_${userId}`) === "done") {
    result.style.color = "#facc15";
    result.textContent = "⚠️ เคยผ่านแล้ว ได้ EXP ไปแล้ว";
    return;
  }

  const hasOpen = code.includes("<footer>");
  const hasClose = code.includes("</footer>");
  const hasText = code.includes("© 2026 my website");
  const count = [hasOpen, hasClose, hasText].filter(Boolean).length;

  if (hasOpen && hasText && hasClose) {
    SoloHint.renderSuccess(result, {
      message: "🎉 ถูกต้อง! คุณเข้าใจ Footer แล้ว +20 EXP",
    });

    authFetch("/users/me/exp", { method: "PATCH", body: JSON.stringify({ exp: 20 }) })
      .then((res) => res.json())
      .then(() => {
        localStorage.setItem(`lesson5_done_${userId}`, "done");
        setTimeout(() => (window.location.href = "dashboard.html"), 2200);
      })
      .catch(() => {
        result.style.color = "red";
        result.textContent = "❌ เพิ่ม EXP ไม่สำเร็จ";
      });
    return;
  }

  if (count === 0) {
    SoloHint.renderFeedback(result, {
      level: "pre",
      title: "ยังไม่มีโครงสร้างส่วนท้ายหน้าเว็บ",
      message: "ลองเริ่มต้นจากการคิดว่าแท็ก HTML ที่สื่อถึง 'ส่วนท้าย' ชื่อว่าอะไร และต้องครอบข้อความอะไรไว้ข้างใน",
      nudge: "เปิดคำใบ้ระดับ Pre-structural หรือ Uni-structural ด้านบนได้หากยังไม่แน่ใจ",
    });
  } else if (count === 1) {
    SoloHint.renderFeedback(result, {
      level: "uni",
      title: "เริ่มจับหลักได้แล้ว 1/3 ส่วน",
      message: "คุณเริ่มเขียนได้บางส่วนแล้ว แต่ส่วนท้ายที่สมบูรณ์ต้องมีทั้งแท็กเปิด แท็กปิด และข้อความลิขสิทธิ์ครบถ้วน",
      nudge: "ตรวจสอบว่าลืมคู่แท็กเปิด-ปิด หรือยังไม่ได้ใส่ข้อความตามภารกิจ",
    });
  } else {
    SoloHint.renderFeedback(result, {
      level: "multi",
      title: "เกือบครบแล้ว (2/3 ส่วน)",
      message: !hasText
        ? "โครงสร้างแท็กพร้อมแล้ว แต่ข้อความลิขสิทธิ์ด้านในยังไม่ตรงกับภารกิจ"
        : "ข้อความหรือแท็กเปิดมาแล้ว แต่อย่าลืมตรวจคู่แท็กเปิด-ปิดให้ครบสมบูรณ์",
      nudge: "ตรวจเครื่องหมาย © ตัวเลขปี ช่องว่าง และการปิดแท็กให้เรียบร้อย",
    });
  }
}

function goBack() {
  window.location.href = "dashboard.html";
}
