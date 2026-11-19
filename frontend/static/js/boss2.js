SoloHint.init({
  theme: "boss",
  hints: {
    pre: "ย้อนกลับไปนึกถึงภาพ 'บ้าน 1 หลัง' จากบทเรียนแรกสุด: บ้านที่สมบูรณ์ต้องมีทั้งโครงบ้าน สมองของบ้าน และตัวบ้านที่ใส่เฟอร์นิเจอร์ (เนื้อหา) ลงไป",
    uni: "เริ่มวางกรอบชั้นนอกสุดของเอกสาร HTML ให้เรียบร้อยก่อน แล้วค่อยแบ่งพื้นที่ด้านในออกเป็น 2 โซนหลัก (ส่วนข้อมูลเบื้องหลัง กับส่วนแสดงผล)",
    multi: "เช็ก 4 ส่วนสำคัญ: (1) กรอบเอกสารทั้งหน้า (2) ส่วนหัวข้อมูลเบื้องหลัง (3) ส่วนลำตัวแสดงผล (4) เนื้อหาอย่างน้อย 1 ชนิด เช่น หัวข้อ ย่อหน้า รูปภาพ หรือรายการ",
    relational: {
      text: "ความสัมพันธ์สำคัญที่สุดในเอกสาร HTML: ส่วนสมองและส่วนลำตัวอยู่คู่กัน 'ภายใน' กรอบเอกสาร แต่เนื้อหาที่ผู้ชมเห็นต้องวางอยู่ในส่วนลำตัวเท่านั้น",
      pattern: "<____>\n  <____>\n    <!-- ข้อมูลเบื้องหลังของหน้า -->\n  </____>\n  <____>\n    <!-- ใส่หัวข้อ / ย่อหน้า / รูปภาพ / รายการ ตามไอเดียของคุณ -->\n  </____>\n</____>",
    },
    extended: "ยินดีด้วยที่พร้อมสร้างเว็บด้วยตัวเอง! ลองกด ▶ Run แล้วท้าทายตัวเองด้วยการผสมโครงสร้าง Semantic HTML (nav, section, footer) เข้าไปใน Sandbox นี้ดูสิ",
  },
});

function runCode() {
  const code = document.getElementById("codeArea").value;
  const output = document.getElementById("output");
  const previewResult = renderSafePreview(output, code);
  if (!previewResult.ok) {
    alert(previewResult.reason);
  }
}

function checkCode() {
  const code = document.getElementById("codeArea").value.toLowerCase();
  const result = document.getElementById("result");
  if (!requireLogin()) return;
  const userId = localStorage.getItem("userId");

  if (localStorage.getItem(`boss2_done_${userId}`) === "done") {
    result.style.color = "#facc15";
    result.textContent = "⚠️ ผ่าน Final Boss นี้ไปแล้ว!";
    return;
  }

  const hasHtml = code.includes("<html");
  const hasHead = code.includes("<head");
  const hasBody = code.includes("<body");
  const hasContent =
    code.includes("<h1") ||
    code.includes("<p") ||
    code.includes("<img") ||
    code.includes("<ul");

  const structureCount = [hasHtml, hasHead, hasBody].filter(Boolean).length;
  const totalCount = structureCount + (hasContent ? 1 : 0);

  if (hasHtml && hasHead && hasBody && hasContent) {
    awardExp(300)
      .then(() => {
        SoloHint.renderSuccess(result, {
          message: "👑 FINAL BOSS ผ่าน! +300 EXP",
        });
        localStorage.setItem(`boss2_done_${userId}`, "done");
        setTimeout(() => (window.location.href = "dashboard.html"), 2400);
      })
      .catch((err) => {
        result.style.color = "#f87171";
        result.textContent = `❌ ${err.message || "เพิ่ม EXP ไม่สำเร็จ"}`;
      });
    return;
  }

  if (totalCount === 0) {
    SoloHint.renderFeedback(result, {
      level: "pre",
      title: "พื้นที่ Sandbox ยังว่างอยู่",
      message: "ลองเริ่มจากโครงสร้างเอกสาร HTML 3 ชั้นหลัก (กรอบเอกสาร, ส่วนสมอง, ส่วนแสดงผล) แล้วใส่เนื้อหาที่คุณอยากสร้างลงไป",
      nudge: "เปิดคำใบ้ระดับ Pre-structural และ Uni-structural ด้านบนเพื่อเริ่มต้นได้เลย",
    });
  } else if (totalCount === 1) {
    SoloHint.renderFeedback(result, {
      level: "uni",
      title: "เริ่มต้นได้ 1/4 ส่วนแล้ว!",
      message: "คุณเริ่มสร้างชิ้นส่วนแรกแล้ว แต่เอกสาร HTML ฉบับสมบูรณ์ต้องมีทั้งโครงสร้างหลัก 3 ชั้นและเนื้อหาภายในส่วนแสดงผล",
      nudge: "นึกถึงโครงสร้างบ้านทั้งหลัง + สมอง + ตัวบ้าน + เฟอร์นิเจอร์เนื้อหา",
    });
  } else if (structureCount < 3) {
    const missing = [];
    if (!hasHtml) missing.push("กรอบเอกสารชั้นนอกสุด");
    if (!hasHead) missing.push("ส่วนหัวข้อมูลเบื้องหลัง (สมอง)");
    if (!hasBody) missing.push("ส่วนลำตัวแสดงผล");

    SoloHint.renderFeedback(result, {
      level: "multi",
      title: `โครงสร้างเอกสารยังไม่ครบ (${totalCount}/4 ส่วน)`,
      message: `ตอนนี้ยังขาดองค์ประกอบโครงสร้างหลัก: ${missing.join(", ")}`,
      nudge: "ลองเปิดคำใบ้ขั้นที่ 4 (Relational) เพื่อดูความสัมพันธ์ของการซ้อน 3 ชั้นหลัก",
    });
  } else {
    SoloHint.renderFeedback(result, {
      level: "relational",
      title: "โครงสร้างเอกสารครบทั้ง 3 ชั้นแล้ว! (3/4 ส่วน)",
      message: "โครงบ้านสมบูรณ์แล้ว เหลือแค่เติมเนื้อหาอย่างน้อย 1 อย่างลงในส่วนแสดงผล (เช่น หัวข้อ ย่อหน้า รูปภาพ หรือรายการ)",
      nudge: "ลองเติมเนื้อหาแล้วกด ▶ Run เพื่อชมหน้าเว็บของคุณก่อนกดตรวจอีกครั้ง!",
    });
  }
}

function goBack() {
  window.location.href = "dashboard.html";
}
