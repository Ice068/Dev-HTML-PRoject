SoloHint.init({
  hints: {
    pre: "ลองนึกถึงปกหนังสือที่มีชื่อเรื่องตัวใหญ่สุดอยู่ด้านบน — ใน HTML เราใช้แท็กกลุ่ม Heading เพื่อบอกลำดับความสำคัญของหัวข้อ",
    uni: "หัวข้อใน HTML ใช้ตัวอักษรแรกของคำว่า Heading ตามด้วยตัวเลขลำดับความสำคัญ (1 ถึง 6) โดยเลขที่น้อยที่สุดคือใหญ่ที่สุด",
    multi: "องค์ประกอบของหัวข้อที่สมบูรณ์มี 3 ชิ้น: (1) แท็กเปิดหัวข้อระดับใหญ่สุด (2) ข้อความตามที่โจทย์กำหนด (3) แท็กปิดที่มีเครื่องหมาย / นำหน้าชื่อแท็ก",
    relational: {
      text: "ข้อความหัวข้อต้องถูก 'ประกบ' อยู่ตรงกลางระหว่างแท็กเปิดกับแท็กปิดของระดับเดียวกัน",
      pattern: "<__>ข้อความหัวข้อตามโจทย์</__>",
    },
    extended: "ในหน้าเว็บจริง ทำไมนักพัฒนามักแนะนำให้มีหัวข้อระดับ 1 เพียงอันเดียวต่อหนึ่งหน้า และใช้ระดับรองไล่ลำดับลงไป? (ลองเชื่อมโยงกับ SEO และผู้ใช้ Screen Reader)",
  },
});

function checkCode() {
  const code = document.getElementById("codeInput").value.toLowerCase();
  const result = document.getElementById("result");
  if (!requireLogin()) return;
  const userId = localStorage.getItem("userId");

  // 🔒 กันทำซ้ำ
  if (localStorage.getItem(`lesson3_done_${userId}`) === "done") {
    result.style.color = "#facc15";
    result.textContent = "⚠️ เคยผ่านแล้ว ได้ EXP ไปแล้ว";
    return;
  }

  const correct = /<h1>\s*my website\s*<\/h1>/i;

  if (correct.test(code)) {
    awardExp(20)
      .then(() => {
        SoloHint.renderSuccess(result, {
          message: "🎉 ถูกต้อง! +20 EXP",
        });
        localStorage.setItem(`lesson3_done_${userId}`, "done");
        setTimeout(() => (window.location.href = "dashboard.html"), 2200);
      })
      .catch((err) => {
        result.style.color = "#f87171";
        result.textContent = `❌ ${err.message || "เพิ่ม EXP ไม่สำเร็จ"}`;
      });
    return;
  }

  const hasOpen = code.includes("<h1>");
  const hasClose = code.includes("</h1>");
  const hasText = code.includes("my website");
  const hasAnyH = /<h[2-6]>/.test(code);
  const count = [hasOpen, hasClose, hasText].filter(Boolean).length;

  if (count === 0 && !hasAnyH) {
    SoloHint.renderFeedback(result, {
      level: "pre",
      title: "ยังไม่มีโครงสร้างหัวข้อ",
      message: "ลองนึกถึงรูปแบบแท็ก HTML ที่มีแท็กเปิด-ปิดครอบข้อความหัวข้อไว้ด้านใน",
      nudge: "เปิดคำใบ้ขั้นที่ 1-2 ด้านบนเพื่อดูแนวคิดของแท็กกลุ่ม Heading",
    });
  } else if (hasAnyH && !hasOpen) {
    SoloHint.renderFeedback(result, {
      level: "uni",
      title: "เลือกตระกูล Heading ถูกแล้ว แต่ระดับยังไม่ตรง!",
      message: "คุณรู้จักการใช้แท็กกลุ่มหัวข้อแล้ว แต่อย่าลืมว่าโจทย์ต้องการหัวข้อระดับที่สำคัญและใหญ่ที่สุด",
      nudge: "ทบทวนลำดับตัวเลข 1 ถึง 6 ว่าเลขใดหมายถึงหัวข้อหลักใหญ่สุด",
    });
  } else if (count === 1 || count === 2) {
    SoloHint.renderFeedback(result, {
      level: "multi",
      title: `ได้องค์ประกอบแล้ว ${count}/3 ส่วน`,
      message: "คุณมีชิ้นส่วนบางอย่างครบแล้ว แต่ยังขาดบางองค์ประกอบระหว่างแท็กเปิด แท็กปิด หรือข้อความตามโจทย์",
      nudge: "ลองเช็กว่ามีแท็กเปิดคู่กับแท็กปิดครบถ้วน และสะกดข้อความตรงตามภารกิจหรือไม่",
    });
  } else {
    SoloHint.renderFeedback(result, {
      level: "relational",
      title: "ชิ้นส่วนครบแล้ว แต่ตำแหน่งการครอบยังไม่สัมพันธ์กัน",
      message: "คุณมีทั้งแท็กเปิด แท็กปิด และข้อความครบ แต่ลำดับการวางข้อความข้างในแท็กยังไม่ลงตัว",
      nudge: "ตรวจสอบว่าข้อความอยู่ 'ระหว่าง' แท็กเปิดและแท็กปิดโดยไม่มีสิ่งอื่นคั่น",
    });
  }
}

function goBack() {
  window.location.href = "dashboard.html";
}
