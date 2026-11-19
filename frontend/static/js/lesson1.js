SoloHint.init({
  hints: {
    pre: "ลองนึกภาพกล่องใหญ่ 1 ใบ (หน้าเว็บทั้งหน้า) ที่มีกล่องย่อยข้างในสำหรับใส่ข้อความที่อยากให้คนอ่านเห็น — คุณคิดว่าควรเริ่มจากกรอบนอกหรือข้อความก่อนดี?",
    uni: "เริ่มจากกรอบหลัก 1 อย่างก่อน: ภาษา HTML ใช้ชื่อภาษาตัวเองเป็นแท็กใหญ่สุดเพื่อครอบทั้งเอกสาร (และมีแท็กปิดด้วยเครื่องหมาย /)",
    multi: "เช็กองค์ประกอบ 3 ส่วนแยกกันดูก่อน: (1) กรอบใหญ่ของเอกสาร HTML (2) พื้นที่แสดงเนื้อหาหลักของหน้าเว็บ (3) ข้อความทักทายตามโจทย์",
    relational: {
      text: "ลองเชื่อมความสัมพันธ์แบบซ้อนกัน: กรอบใหญ่สุดครอบทุกอย่างไว้ด้านนอก และข้อความต้องวางอยู่ 'ข้างใน' ส่วนลำตัวของเอกสาร",
      pattern: "<____>\n  <____> ...ข้อความที่โจทย์ต้องการ... </____>\n</____>",
    },
    extended: "ถ้าหน้าเว็บจริงต้องบอกชื่อแท็บบนเบราว์เซอร์และรองรับภาษาไทยด้วย คุณคิดว่าส่วน 'สมอง' ของเอกสารควรวางอยู่ตำแหน่งไหนเมื่อเทียบกับส่วนลำตัว?",
  },
});

function checkCode() {
  const rawCode = document.getElementById("codeInput").value.trim();
  const code = rawCode.toLowerCase();
  const result = document.getElementById("result");
  const userId = localStorage.getItem("userId");

  if (!userId) {
    alert("❌ กรุณา login ก่อน");
    window.location.href = "login.html";
    return;
  }

  // 🔒 กันทำซ้ำ
  if (localStorage.getItem(`lesson1_done_${userId}`) === "done") {
    result.style.color = "#facc15";
    result.textContent = "⚠️ ทำภารกิจนี้ไปแล้ว!";
    return;
  }

  const hasHtml = code.includes("<html>");
  const hasBody = code.includes("<body>");
  const hasGreeting = code.includes("hello world");
  const partsCount = [hasHtml, hasBody, hasGreeting].filter(Boolean).length;

  if (hasHtml && hasBody && hasGreeting) {
    SoloHint.renderSuccess(result, {
      message: "🎉 ถูกต้อง! +50 EXP",
    });

    authFetch("/users/me/exp", { method: "PATCH", body: JSON.stringify({ exp: 50 }) })
      .then((res) => res.json())
      .then(() => {
        localStorage.setItem(`lesson1_done_${userId}`, "done");
        setTimeout(() => (window.location.href = "dashboard.html"), 2200);
      })
      .catch(() => {
        result.style.color = "red";
        result.textContent = "❌ เพิ่ม EXP ไม่สำเร็จ";
      });
    return;
  }

  if (partsCount === 0) {
    SoloHint.renderFeedback(result, {
      level: "pre",
      title: "ยังเริ่มจับโครงสร้างไม่ติด",
      message: "ตอนนี้ยังไม่พบโครงสร้างของเอกสารหรือข้อความตามภารกิจเลย ลองจินตนาการว่าหน้าเว็บต้องมีกรอบครอบเนื้อหาทั้งหมด",
      nudge: "ลองเปิดคำใบ้ขั้นที่ 1-2 ด้านบนเพื่อดูแนวคิดของกรอบหลักใน HTML",
    });
  } else if (partsCount === 1) {
    SoloHint.renderFeedback(result, {
      level: "uni",
      title: "จับได้แล้ว 1 ชิ้นส่วน!",
      message: "เยี่ยมเลย คุณมีองค์ประกอบสำคัญแล้ว 1 ส่วนจาก 3 ส่วน แต่หน้าเว็บยังต้องการทั้งกรอบเอกสาร พื้นที่แสดงผล และข้อความควบคู่กัน",
      nudge: "ลองคิดว่านอกจากสิ่งที่พิมพ์มาแล้ว ยังขาด 'บ้านทั้งหลัง' หรือ 'พื้นที่ที่คนมองเห็น' หรือไม่?",
    });
  } else {
    SoloHint.renderFeedback(result, {
      level: "multi",
      title: "ใกล้ครบทุกองค์ประกอบแล้ว (2/3 ส่วน)",
      message: "คุณเริ่มรวบรวมชิ้นส่วนได้เกือบครบแล้ว เหลืออีกเพียง 1 ส่วนเพื่อให้โครงสร้างกับข้อความสมบูรณ์",
      nudge: "ตรวจดูว่ามีครบทั้งกรอบนอกสุดของเอกสาร พื้นที่แสดงเนื้อหา และข้อความตามโจทย์หรือยัง (เปิดคำใบ้ระดับ Multi/Relational ช่วยเช็กได้)",
    });
  }
}

function goBack() {
  window.location.href = "dashboard.html";
}
