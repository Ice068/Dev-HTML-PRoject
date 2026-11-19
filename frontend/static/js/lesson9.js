SoloHint.init({
  hints: {
    pre: "ลองนึกถึงปุ่มกดบนเครื่องเกมอาร์เคด: มันมี 'ตัวปุ่ม' และ 'ข้อความบนหน้าปุ่ม' เพื่อบอกคนกดว่าจะเกิดอะไรขึ้น",
    uni: "เริ่มจากแท็กหลักที่ชื่อภาษาอังกฤษตรงตัวกับคำว่า 'ปุ่ม' (หัวข้อของบทเรียนนี้) แบบตัวพิมพ์เล็กทั้งหมด",
    multi: "เช็ก 3 องค์ประกอบแยกกัน: (1) แท็กเปิดของปุ่ม (2) ข้อความบนหน้าปุ่มตามโจทย์ (3) แท็กปิดของปุ่มที่มีเครื่องหมาย /",
    relational: {
      text: "ข้อความบนหน้าปุ่มต้องถูกประกบอยู่ 'ระหว่าง' แท็กเปิดและแท็กปิดของปุ่ม เพื่อให้เบราว์เซอร์วาดข้อความไว้บนตัวปุ่ม",
      pattern: "<______>ข้อความบนปุ่ม</______>",
    },
    extended: "ระหว่างการใช้ลิงก์ (<a>) กับปุ่ม (<button>) ในหน้าเว็บจริง คุณคิดว่าสถานการณ์แบบไหนควรเลือกใช้ลิงก์ และสถานการณ์แบบไหนควรเลือกใช้ปุ่ม?",
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

  if (localStorage.getItem(`lesson9_done_${userId}`) === "done") {
    result.style.color = "#facc15";
    result.textContent = "⚠️ เคยผ่านแล้ว ได้ EXP ไปแล้ว";
    return;
  }

  const hasOpen = code.includes("<button>");
  const hasClose = code.includes("</button>");
  const hasText = code.includes("เริ่มเกม");
  const count = [hasOpen, hasClose, hasText].filter(Boolean).length;

  if (hasOpen && hasText && hasClose) {
    SoloHint.renderSuccess(result, {
      message: "🎉 ถูกต้อง! คุณสร้างปุ่มได้แล้ว +20 EXP",
    });

    authFetch("/users/me/exp", { method: "PATCH", body: JSON.stringify({ exp: 20 }) })
      .then((res) => res.json())
      .then(() => {
        localStorage.setItem(`lesson9_done_${userId}`, "done");
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
      title: "ยังไม่พบปุ่มสั่งงาน",
      message: "ลองเริ่มต้นจากการคิดว่าแท็กภาษาอังกฤษของคำว่า 'ปุ่ม' เขียนอย่างไร และต้องครอบข้อความอะไรไว้ด้านใน",
      nudge: "เปิดคำใบ้ระดับ Pre-structural และ Uni-structural ด้านบนได้หากต้องการเบาะแสเพิ่ม",
    });
  } else if (count === 1) {
    SoloHint.renderFeedback(result, {
      level: "uni",
      title: "ได้แล้ว 1/3 องค์ประกอบ",
      message: "คุณเริ่มมีองค์ประกอบแรกแล้ว แต่อย่าลืมประกอบทั้งแท็กเปิด แท็กปิด และข้อความบนหน้าปุ่มให้ครบ",
      nudge: "ตรวจดูว่ายังขาดแท็กคู่เปิด-ปิด หรือข้อความตามภารกิจ",
    });
  } else {
    SoloHint.renderFeedback(result, {
      level: "multi",
      title: "เกือบครบแล้ว (2/3 องค์ประกอบ)",
      message: !hasText
        ? "โครงสร้างปุ่มพร้อมแล้ว แต่ยังขาดข้อความบนหน้าปุ่มตามที่ภารกิจกำหนด"
        : "คุณมีข้อความแล้ว อย่าลืมตรวจสอบทั้งแท็กเปิดและแท็กปิดให้ครบคู่กัน",
      nudge: "ดูคำใบ้ระดับ Relational ด้านบนเพื่อตรวจโครงสร้างการประกบข้อความ",
    });
  }
}

function goBack() {
  window.location.href = "dashboard.html";
}
