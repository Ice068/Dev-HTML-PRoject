SoloHint.init({
  theme: "boss",
  hints: {
    pre: "ด่านบอสนี้คือการรวมร่างความรู้จากบทที่ 2, 3, 7, 8, 9 และ 10 เข้าด้วยกัน — ลองจินตนาการว่าหน้าโปรไฟล์ของคุณควรเริ่มเล่าอะไรจากบนลงล่าง",
    uni: "เริ่มจากการวาง 'กล่องจัดส่วน' (กล่องทั่วไปหรือส่วนเนื้อหา) 1 กล่องเป็นโครงหลัก แล้วค่อยเติมองค์ประกอบทีละอย่างเข้าไปด้านใน",
    multi: "เช็กทีละกลุ่มว่ามีครบหรือยัง: (1) หัวข้อใหญ่สุด (2) รูปภาพ (3) กล่องรายการ + ข้อย่อยด้านใน (4) ลิงก์วาร์ป (5) ปุ่มกด (6) กล่อง/ส่วนเนื้อหาที่ครอบองค์ประกอบ",
    relational: {
      text: "สังเกตความสัมพันธ์ของแต่ละคู่: ข้อย่อยต้องอยู่ในกล่องรายการ และองค์ประกอบทั้งหมดควรจัดรวมอยู่ในกล่องแบ่งส่วนเนื้อหาอย่างเป็นระเบียบ",
      pattern: "<_______>\n  <__>ชื่อเว็บหรือชื่อคุณ</__>\n  <___ ___=\"...\" ___=\"...\">\n  <__>\n    <__>ความถนัดของคุณ</__>\n  </__>\n  <_ ____=\"...\">ลิงก์</_>\n  <______>ปุ่มกด</______>\n</_______>",
    },
    extended: "ถ้าต้องพัฒนาหน้าแนะนำตัวนี้ให้พร้อมใช้งานจริง คุณจะเพิ่มแถบนำทาง (<nav>) ด้านบน และส่วนท้าย (<footer>) ด้านล่างเข้าไปเชื่อมโยงกับโครงสร้างนี้อย่างไร?",
  },
});

function checkCode() {
  const code = document.getElementById("codeInput").value.toLowerCase();
  const result = document.getElementById("result");
  if (!requireLogin()) return;
  const userId = localStorage.getItem("userId");

  if (localStorage.getItem(`boss1_done_${userId}`) === "done") {
    result.style.color = "#facc15";
    result.textContent = "⚠️ ผ่าน Boss นี้ไปแล้ว!";
    return;
  }

  const checks = [
    { ok: code.includes("<h1"), group: "หัวข้อหลักขนาดใหญ่สุด" },
    { ok: code.includes("<img"), group: "รูปภาพ" },
    { ok: code.includes("<ul"), group: "กล่องรายการ" },
    { ok: code.includes("<li"), group: "ข้อย่อยในรายการ" },
    { ok: code.includes("<a"), group: "ลิงก์เชื่อมหน้า" },
    { ok: code.includes("<button"), group: "ปุ่มโต้ตอบ" },
    { ok: code.includes("<div") || code.includes("<section"), group: "กล่องหรือส่วนแบ่งเนื้อหา" },
  ];

  const passedCount = checks.filter((c) => c.ok).length;
  const missingGroups = checks.filter((c) => !c.ok).map((c) => c.group);

  if (passedCount === checks.length) {
    awardExp(200)
      .then(() => {
        SoloHint.renderSuccess(result, {
          message: "👑 ผ่านด่าน BOSS! +200 EXP",
        });
        localStorage.setItem(`boss1_done_${userId}`, "done");
        setTimeout(() => (window.location.href = "dashboard.html"), 2400);
      })
      .catch((err) => {
        result.style.color = "#f87171";
        result.textContent = `❌ ${err.message || "เพิ่ม EXP ไม่สำเร็จ"}`;
      });
    return;
  }

  if (passedCount === 0) {
    SoloHint.renderFeedback(result, {
      level: "pre",
      title: "ยังไม่ได้เริ่มประกอบหน้าเว็บ",
      message: "ด่านบอสต้องรวมองค์ประกอบหลายบทเข้าด้วยกัน ลองค่อย ๆ เริ่มจากกล่องจัดส่วนและหัวข้อหลักก่อน",
      nudge: "เปิดคำใบ้ระดับ Pre-structural และ Uni-structural ด้านบนเพื่อวางแผนทีละขั้น",
    });
  } else if (passedCount <= 2) {
    SoloHint.renderFeedback(result, {
      level: "uni",
      title: `เริ่มวางโครงสร้างได้แล้ว (${passedCount}/${checks.length} ส่วน)`,
      message: "จุดเริ่มต้นมาดีแล้ว! ลองทบทวนบทเรียนที่ผ่านมาแล้วค่อย ๆ เพิ่มองค์ประกอบที่เหลือทีละกลุ่ม",
      nudge: `ตอนนี้ยังขาดอีก ${missingGroups.length} กลุ่ม เช่น ${missingGroups.slice(0, 2).join(" และ ")}`,
    });
  } else if (passedCount <= 5) {
    SoloHint.renderFeedback(result, {
      level: "multi",
      title: `รวบรวมองค์ประกอบได้มากแล้ว (${passedCount}/${checks.length} ส่วน)`,
      message: `คุณประกอบหน้าเว็บได้เกินครึ่งทางแล้ว! ลองเช็กกลุ่มที่ยังขาดอยู่: ${missingGroups.join(", ")}`,
      nudge: "เปิดคำใบ้ขั้นที่ 3-4 ด้านบนเพื่อดูวิธีเชื่อมแต่ละกลุ่มเข้าด้วยกัน",
    });
  } else {
    SoloHint.renderFeedback(result, {
      level: "relational",
      title: `อีกนิดเดียวจะพิชิต BOSS แล้ว! (${passedCount}/${checks.length} ส่วน)`,
      message: `องค์ประกอบเกือบสมบูรณ์ทั้งหน้าแล้ว เหลือเชื่อมเพิ่มอีกแค่ 1 ส่วนคือ: ${missingGroups[0]}`,
      nudge: "ตรวจดูว่าส่วนสุดท้ายนี้ควรวางเชื่อมกับองค์ประกอบอื่นตรงไหนของหน้าเว็บ",
    });
  }
}

function goBack() {
  window.location.href = "dashboard.html";
}
