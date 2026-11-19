SoloHint.init({
  hints: {
    pre: "ลองมองแถบเมนูด้านข้างของแอปที่คุณใช้ประจำ มันไม่ได้ลอยแยกกันทีละปุ่ม แต่มักถูกจัดรวมไว้ใน 'กล่องใหญ่ 1 กล่อง'",
    uni: "เริ่มจากสร้างกล่องครอบหลัก 1 กล่องก่อน แล้วตั้งชื่อกลุ่ม (class) ให้สื่อว่าเป็นแถบข้างตามโจทย์",
    multi: "เช็กองค์ประกอบที่ต้องมีให้ครบ: (1) กล่องครอบที่มีชื่อกลุ่ม sidebar (2) เมนูลิงก์ 3 รายการตามชื่อที่โจทย์กำหนด (ใช้ความรู้เรื่องลิงก์จากบทที่ 2 มาช่วยได้!)",
    relational: {
      text: "เชื่อมโยงโครงสร้างแบบแม่-ลูก: กล่องแถบข้างอยู่ด้านนอก ส่วนลิงก์เมนูทั้ง 3 รายการต้องซ้อนอยู่ 'ข้างใน' กล่องนั้น",
      pattern: '<___ class="_______">\n  <_ href="#">เมนู 1</_>\n  <_ href="#">เมนู 2</_>\n  <_ href="#">เมนู 3</_>\n</___>',
    },
    extended: "ใน HTML5 นอกจากกล่องทั่วไปแล้ว ยังมีแท็กเชิงความหมายอย่าง <aside> สำหรับแถบข้างด้วย — ลองคิดว่าการใช้แท็กที่สื่อความหมายช่วยให้โค้ดอ่านง่ายขึ้นอย่างไร?",
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
  if (localStorage.getItem(`lesson4_done_${userId}`) === "done") {
    result.style.color = "#facc15";
    result.textContent = "⚠️ เคยผ่านแล้ว ได้ EXP ไปแล้ว";
    return;
  }

  const hasSidebar = code.includes("sidebar");
  const hasMenu1 = code.includes("หน้าแรก");
  const hasMenu2 = code.includes("ภารกิจ") || code.includes("เกี่ยวกับเรา");
  const hasMenu3 = code.includes("ข้อมูล") || code.includes("ติดต่อเรา");
  const hasContainer = code.includes("<div") || code.includes("<aside") || code.includes("<nav");
  const count = [hasSidebar, hasMenu1, hasMenu2, hasMenu3].filter(Boolean).length;

  if (hasSidebar && hasMenu1 && hasMenu2 && hasMenu3) {
    SoloHint.renderSuccess(result, {
      message: "🎉 ถูกต้อง! +30 EXP",
    });

    authFetch("/users/me/exp", { method: "PATCH", body: JSON.stringify({ exp: 30 }) })
      .then((res) => res.json())
      .then(() => {
        localStorage.setItem(`lesson4_done_${userId}`, "done");
        setTimeout(() => (window.location.href = "dashboard.html"), 2200);
      })
      .catch(() => {
        result.style.color = "red";
        result.textContent = "❌ เพิ่ม EXP ไม่สำเร็จ";
      });
    return;
  }

  if (count === 0 && !hasContainer) {
    SoloHint.renderFeedback(result, {
      level: "pre",
      title: "ยังไม่พบโครงสร้างแถบข้าง",
      message: "ลองเริ่มต้นจากการนึกภาพกล่องใหญ่ด้านซ้ายของหน้าเว็บ ที่ภายในบรรจุเมนูหลายรายการเรียงต่อกัน",
      nudge: "เปิดคำใบ้ระดับ Pre-structural และ Uni-structural ด้านบนเพื่อเริ่มร่างกล่องหลัก",
    });
  } else if (count <= 1) {
    SoloHint.renderFeedback(result, {
      level: "uni",
      title: "เริ่มต้นได้แล้ว 1 ส่วน!",
      message: "คุณเริ่มมีเค้าโครงแล้ว แต่ Sidebar ที่สมบูรณ์ต้องมีทั้งกล่องที่ระบุชื่อกลุ่มและเมนูครบทั้ง 3 รายการ",
      nudge: "ลองเติมชื่อกลุ่มของแถบข้างและทยอยเพิ่มชื่อเมนูให้ครบ",
    });
  } else {
    SoloHint.renderFeedback(result, {
      level: "multi",
      title: `ใกล้ครบแล้ว (${count}/4 องค์ประกอบ)`,
      message: hasSidebar
        ? "มีชื่อกลุ่มแถบข้างแล้ว แต่ชื่อเมนูด้านในยังไม่ครบทั้ง 3 รายการตามภารกิจ"
        : "มีรายการเมนูแล้ว แต่ยังไม่ได้ระบุชื่อกลุ่มของกล่องแถบข้างให้ชัดเจน",
      nudge: "ตรวจสอบทั้งชื่อกลุ่ม sidebar และชื่อเมนูครบทั้ง 3 อัน (หน้าแรก, ภารกิจ, ข้อมูล) รวมถึงการวางเมนูให้อยู่ในกล่องครอบ",
    });
  }
}

function goBack() {
  window.location.href = "dashboard.html";
}
