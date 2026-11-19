SoloHint.init({
  hints: {
    pre: "ลองนึกถึงแถบเมนูด้านบนของเว็บที่คุณเข้าบ่อย ๆ มันคือ 'เข็มทิศนำทาง' ที่รวมประตูวาร์ปหลายบานไว้ในกล่องเดียวกัน",
    uni: "เริ่มจากกล่องนำทางหลัก 1 กล่อง: คำว่า Navigation (การนำทาง) ใน HTML5 ย่อเหลือเพียง 3 ตัวอักษรแรก",
    multi: "เช็กชิ้นส่วนที่ต้องมี: (1) แท็กครอบพื้นที่นำทาง (2) แท็กลิงก์จากบทที่ 2 สำหรับแต่ละเมนู (3) ข้อความลิงก์ทั้ง 3 คำตามโจทย์",
    relational: {
      text: "เชื่อมโยงโครงสร้างจากบทที่ 2 เข้ากับบทนี้: แท็กลิงก์ทั้ง 3 อันต้องซ้อนอยู่ 'ภายใน' แท็กครอบพื้นที่นำทาง",
      pattern: '<___>\n  <_ href="#">เมนู 1</_>\n  <_ href="#">เมนู 2</_>\n  <_ href="#">เมนู 3</_>\n</___>',
    },
    extended: "ระหว่างการใช้ <div> ธรรมดากับแท็กเชิงความหมายสำหรับการนำทาง (Semantic HTML) คุณคิดว่าอย่างไหนช่วยให้ผู้ใช้ที่มีความบกพร่องทางการมองเห็นนำทางได้สะดวกกว่า เพราะเหตุใด?",
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

  if (localStorage.getItem(`lesson6_done_${userId}`) === "done") {
    result.style.color = "#facc15";
    result.textContent = "⚠️ เคยผ่านแล้ว ได้ EXP ไปแล้ว";
    return;
  }

  const hasNav = code.includes("<nav>");
  const hasLink = code.includes("<a");
  const hasHome = code.includes("home");
  const hasAbout = code.includes("about");
  const hasContact = code.includes("contact");
  const count = [hasNav, hasLink, hasHome, hasAbout, hasContact].filter(Boolean).length;

  if (hasNav && hasLink && hasHome && hasAbout && hasContact) {
    SoloHint.renderSuccess(result, {
      message: "🎉 ถูกต้อง! คุณสร้าง Navbar ได้แล้ว +40 EXP",
    });

    authFetch("/users/me/exp", { method: "PATCH", body: JSON.stringify({ exp: 40 }) })
      .then((res) => res.json())
      .then(() => {
        localStorage.setItem(`lesson6_done_${userId}`, "done");
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
      title: "ยังไม่เห็นแถบนำทางเลย",
      message: "ลองนึกถึงการรวมลิงก์หลาย ๆ อันไว้ในกล่องนำทางหลัก 1 กล่องที่อยู่ด้านบนของหน้าเว็บ",
      nudge: "เปิดคำใบ้ระดับ Pre-structural และ Uni-structural ด้านบนเพื่อดูจุดเริ่มต้น",
    });
  } else if (count <= 2) {
    SoloHint.renderFeedback(result, {
      level: "uni",
      title: `เริ่มจับโครงได้บางส่วนแล้ว (${count}/5 องค์ประกอบ)`,
      message: "คุณเริ่มสร้างองค์ประกอบหลักแล้ว แต่อย่าลืมเชื่อมความรู้เรื่อง 'ลิงก์' จากบทที่ 2 เข้ามาใช้ร่วมกับกล่องนำทางด้วย",
      nudge: "เช็กว่ามีทั้งกล่องครอบพื้นที่นำทางและแท็กลิงก์สำหรับแต่ละเมนูหรือยัง",
    });
  } else {
    SoloHint.renderFeedback(result, {
      level: "multi",
      title: `ใกล้สมบูรณ์แล้ว (${count}/5 องค์ประกอบ)`,
      message: !hasNav
        ? "คุณมีลิงก์เมนูแล้ว แต่ยังขาดกล่องนำทางหลักมาครอบลิงก์ทั้งหมดไว้ด้วยกัน"
        : !hasLink
        ? "คุณมีกล่องนำทางและชื่อเมนูแล้ว แต่ชื่อเมนูยังไม่ได้ถูกทำให้คลิกเป็นลิงก์ได้"
        : "โครงสร้างหลักมาดีแล้ว ลองตรวจว่ามีชื่อเมนูครบทั้ง 3 คำตามโจทย์หรือยัง",
      nudge: "เปิดคำใบ้ระดับ Relational ด้านบนเพื่อดูภาพรวมการซ้อนแท็กลิงก์ภายในพื้นที่นำทาง",
    });
  }
}

function goBack() {
  window.location.href = "dashboard.html";
}
