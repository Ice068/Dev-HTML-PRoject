SoloHint.init({
  hints: {
    pre: "ถ้าหน้าเว็บมี 'ประตูวาร์ป' 1 บาน คุณคิดว่าประตูต้องรู้ข้อมูลอย่างน้อยกี่อย่าง? (ปลายทางที่จะไป กับข้อความที่คนจะกด)",
    uni: "เริ่มจากตัวแท็กหลักเพียง 1 ตัวอักษร: คำว่า Anchor (สมอเชื่อมโยง) ใน HTML ย่อเหลือแค่ตัวอักษรแรกตัวเดียว",
    multi: "ลองเช็ก 4 องค์ประกอบแยกกัน: (1) แท็กสร้างลิงก์ (2) คุณสมบัติบอกปลายทางที่ย่อจาก Hypertext Reference (3) ชื่อไฟล์เป้าหมายตามโจทย์ (4) ข้อความที่แสดงให้คนคลิก",
    relational: {
      text: "พิกัดปลายทางต้องวางเป็น attribute อยู่ 'ข้างในแท็กเปิด' (หลังชื่อแท็ก) ส่วนข้อความที่คนคลิกต้องวางอยู่ 'ระหว่างแท็กเปิดกับแท็กปิด'",
      pattern: '<_ ____="ปลายทาง.html">ข้อความที่คลิกได้</_>',
    },
    extended: "ถ้าอยากให้ลิงก์เปิดในแท็บใหม่โดยไม่ทิ้งหน้าปัจจุบัน คุณลองค้นคว้าเพิ่มเติมดูสิว่า attribute ตัวไหนที่ควบคุมพฤติกรรมนี้ได้?",
  },
});

function checkCode() {
  const code = document.getElementById("codeInput").value.toLowerCase();
  const result = document.getElementById("result");
  if (!requireLogin()) return;
  const userId = localStorage.getItem("userId");

  // 🔒 กันทำซ้ำ
  if (localStorage.getItem(`lesson2_done_${userId}`) === "done") {
    result.style.color = "#facc15";
    result.textContent = "⚠️ ทำภารกิจนี้ไปแล้ว!";
    return;
  }

  const hasTag = code.includes("<a");
  const hasHref = code.includes("href");
  const hasTarget = code.includes("dashboard.html");
  const hasLabel = code.includes("ไป dashboard");
  const count = [hasTag, hasHref, hasTarget, hasLabel].filter(Boolean).length;

  if (hasTag && hasHref && hasTarget && hasLabel) {
    awardExp(50)
      .then(() => {
        SoloHint.renderSuccess(result, {
          message: "🎉 ถูกต้อง! +50 EXP",
        });
        localStorage.setItem(`lesson2_done_${userId}`, "done");
        setTimeout(() => (window.location.href = "dashboard.html"), 2200);
      })
      .catch((err) => {
        result.style.color = "#f87171";
        result.textContent = `❌ ${err.message || "เพิ่ม EXP ไม่สำเร็จ"}`;
      });
    return;
  }

  if (count === 0) {
    SoloHint.renderFeedback(result, {
      level: "pre",
      title: "ยังไม่เห็นประตูวาร์ปเลย",
      message: "ลองเริ่มต้นจากการคิดว่าลิงก์ต้องมีทั้งตัวแท็กสำหรับคลิกและปลายทางที่ต้องการวาร์ปไป",
      nudge: "เปิดคำใบ้ระดับ Pre-structural หรือ Uni-structural ด้านบนเพื่อจับจุดเริ่มต้น",
    });
  } else if (count === 1) {
    SoloHint.renderFeedback(result, {
      level: "uni",
      title: "เริ่มได้แล้ว 1 ส่วนจาก 4 ส่วน",
      message: "คุณเริ่มจับองค์ประกอบแรกได้แล้ว แต่ประตูวาร์ปยังขาดพิกัดปลายทางและข้อความบนป้ายประตู",
      nudge: "นอกจากส่วนที่เขียนแล้ว ลองดูว่าต้องใส่คุณสมบัติกำหนดปลายทางและชื่อไฟล์เป้าหมายอย่างไร",
    });
  } else if (count < 4) {
    SoloHint.renderFeedback(result, {
      level: "multi",
      title: `มีองค์ประกอบแล้ว ${count}/4 ส่วน`,
      message: "คุณรวบรวมชิ้นส่วนมาได้หลายอย่างแล้ว แต่ยังมีบางส่วนของลิงก์ที่หล่นหายไป",
      nudge: "เช็กให้ครบ: แท็กเปิด-ปิดลิงก์ + คุณสมบัติกำหนดปลายทาง + ชื่อไฟล์ปลายทาง + ข้อความที่แสดงให้คลิก",
    });
  }
}

function goBack() {
  window.location.href = "dashboard.html";
}
