SoloHint.init({
  hints: {
    pre: "ลองนึกถึงการเก็บของลงกล่อง 2 แบบ: กล่องเอนกประสงค์สำหรับจัดวาง กับกล่องติดป้ายหมวดหมู่สำหรับแบ่งหัวข้อเนื้อหา",
    uni: "เริ่มสร้างทีละกล่องก่อนก็ได้: กล่องเอนกประสงค์ย่อจาก Division เหลือ 3 ตัวอักษรแรก ส่วนกล่องแบ่งเนื้อหาใช้คำภาษาอังกฤษเต็มว่า section",
    multi: "เช็กองค์ประกอบทั้ง 2 บล็อก: บล็อกแรกคือแท็กกล่องทั่วไปเปิด-ปิดครอบคำว่า 'กล่อง' และบล็อกที่สองคือแท็กส่วนเนื้อหาเปิด-ปิดครอบคำว่า 'เนื้อหา'",
    relational: {
      text: "ทั้งสองบล็อกเป็นโครงสร้างคู่เปิด-ปิดแยกจากกัน แต่ละข้อความต้องวางอยู่ 'ข้างใน' แท็กที่ตรงกับหน้าที่ของตัวเอง",
      pattern: "<___>ข้อความของกล่อง</___>\n<_______>ข้อความของส่วนเนื้อหา</_______>",
    },
    extended: "ถ้าต้องออกแบบหน้าเว็บแนะนำตัวที่มี 3 ส่วน (ประวัติ, ผลงาน, ช่องทางติดต่อ) คุณจะเลือกใช้ div หรือ section ครอบแต่ละหัวข้อ และเพราะเหตุใด?",
  },
});

function checkCode() {
  const code = document.getElementById("codeInput").value.toLowerCase();
  const result = document.getElementById("result");
  if (!requireLogin()) return;
  const userId = localStorage.getItem("userId");

  if (localStorage.getItem(`lesson10_done_${userId}`) === "done") {
    result.style.color = "#facc15";
    result.textContent = "⚠️ เคยผ่านแล้ว ได้ EXP ไปแล้ว";
    return;
  }

  const hasDivPair = code.includes("<div>") && code.includes("</div>");
  const hasBoxText = code.includes("กล่อง");
  const hasSecPair = code.includes("<section>") && code.includes("</section>");
  const hasSecText = code.includes("เนื้อหา");
  const count = [hasDivPair, hasBoxText, hasSecPair, hasSecText].filter(Boolean).length;

  if (hasDivPair && hasBoxText && hasSecPair && hasSecText) {
    awardExp(20)
      .then(() => {
        SoloHint.renderSuccess(result, {
          message: "🎉 ถูกต้อง! คุณจัด Layout ได้แล้ว +20 EXP",
        });
        localStorage.setItem(`lesson10_done_${userId}`, "done");
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
      title: "ยังไม่มีบล็อกจัดส่วนเลย",
      message: "ภารกิจนี้ให้สร้างโครงสร้างแบ่งพื้นที่ 2 แบบควบคู่กัน คือกล่องทั่วไปและส่วนเนื้อหา",
      nudge: "เปิดคำใบ้ระดับ Pre-structural และ Uni-structural ด้านบนเพื่อเริ่มสร้างทีละบล็อก",
    });
  } else if (count <= 2) {
    SoloHint.renderFeedback(result, {
      level: "uni",
      title: `เริ่มสร้างได้บางส่วนแล้ว (${count}/4 องค์ประกอบ)`,
      message: hasDivPair && !hasSecPair
        ? "คุณสร้างกล่องทั่วไปเสร็จไปหนึ่งแบบแล้ว ลองเพิ่มส่วนเนื้อหาอีกหนึ่งแบบให้ครบทั้งคู่"
        : hasSecPair && !hasDivPair
        ? "คุณสร้างส่วนเนื้อหาได้แล้ว ลองเพิ่มกล่องทั่วไปอีกหนึ่งแบบให้ครบทั้งคู่"
        : "คุณมีชิ้นส่วนเริ่มต้นแล้ว อย่าลืมตรวจสอบคู่แท็กเปิด-ปิดและข้อความของทั้งสองบล็อก",
      nudge: "เช็กว่าครบทั้ง 2 คู่แท็กและ 2 ข้อความตามภารกิจหรือไม่",
    });
  } else {
    SoloHint.renderFeedback(result, {
      level: "multi",
      title: "เกือบครบสมบูรณ์แล้ว (3/4 องค์ประกอบ)",
      message: "เหลือเพียงอีก 1 จุดเล็ก ๆ (แท็กเปิด-ปิด หรือข้อความในบล็อกใดบล็อกหนึ่ง)",
      nudge: "ลองเช็กคำใบ้ระดับ Relational ด้านบนเพื่อตรวจความครบถ้วนของทั้งสองบล็อก",
    });
  }
}

function goBack() {
  window.location.href = "dashboard.html";
}
