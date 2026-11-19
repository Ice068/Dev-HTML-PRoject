SoloHint.init({
  hints: {
    pre: "ลองนึกถึงลิสต์ซื้อของในสมุดจด: มันมี 'หัวกลุ่มรายการใหญ่' กับ 'ข้อย่อยแต่ละบรรทัด' — ใน HTML เราแยกหน้าที่ 2 ชั้นนี้ด้วยแท็กคนละตัว",
    uni: "เริ่มจากกล่องคลุมรายการใหญ่ก่อน: คำว่า Unordered List (รายการไม่เรียงตัวเลข) ย่อเอาตัวอักษรแรกของสองคำมาต่อกันเป็นแท็ก 2 ตัวอักษร",
    multi: "เช็กส่วนประกอบที่ต้องมี: (1) แท็กแม่สำหรับกล่องรายการ (2) แท็กลูกที่ย่อจาก List Item สำหรับแต่ละบรรทัด (3) ข้อความทั้ง 3 รายการคือ HTML, CSS และ JavaScript",
    relational: {
      text: "ความสัมพันธ์แบบแม่-ลูกสำคัญมาก: ทุกข้อย่อยต้องมีแท็กลูกเปิด-ปิดของตัวเอง และทุกอันต้องซ้อนอยู่ 'ข้างใน' แท็กแม่ทั้งหมด",
      pattern: "<__>\n  <__>รายการที่ 1</__>\n  <__>รายการที่ 2</__>\n  <__>รายการที่ 3</__>\n</__>",
    },
    extended: "ถ้าเปลี่ยนจากรายการทักษะเป็น 'ขั้นตอนการทำอาหาร 1, 2, 3' ที่ลำดับก่อนหลังมีความสำคัญ คุณคิดว่าจะเปลี่ยนแท็กแม่จาก Unordered เป็นอะไร? (ใบ้: Ordered List)",
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

  if (localStorage.getItem(`lesson8_done_${userId}`) === "done") {
    result.style.color = "#facc15";
    result.textContent = "⚠️ เคยผ่านแล้ว ได้ EXP ไปแล้ว";
    return;
  }

  const hasUl = code.includes("<ul>");
  const hasLiHtml = code.includes("<li>html");
  const hasLiCss = code.includes("<li>css");
  const hasJs = code.includes("javascript");
  const hasAnyLi = code.includes("<li>");
  const count = [hasUl, hasLiHtml, hasLiCss, hasJs].filter(Boolean).length;

  if (hasUl && hasLiHtml && hasLiCss && hasJs) {
    SoloHint.renderSuccess(result, {
      message: "🎉 ถูกต้อง! คุณสร้าง List ได้แล้ว +20 EXP",
    });

    authFetch("/users/me/exp", { method: "PATCH", body: JSON.stringify({ exp: 20 }) })
      .then((res) => res.json())
      .then(() => {
        localStorage.setItem(`lesson8_done_${userId}`, "done");
        setTimeout(() => (window.location.href = "dashboard.html"), 2200);
      })
      .catch(() => {
        result.style.color = "red";
        result.textContent = "❌ เพิ่ม EXP ไม่สำเร็จ";
      });
    return;
  }

  if (count === 0 && !hasAnyLi) {
    SoloHint.renderFeedback(result, {
      level: "pre",
      title: "ยังไม่มีโครงสร้างรายการ",
      message: "ลองเริ่มคิดว่าการสร้างรายการใน HTML ต้องใช้แท็กแม่คลุมข้างนอก และแท็กลูกสำหรับแต่ละข้อข้างใน",
      nudge: "เปิดคำใบ้ระดับ Pre-structural และ Uni-structural ด้านบนเพื่อจับชื่อแท็กแม่ก่อน",
    });
  } else if (count === 1) {
    SoloHint.renderFeedback(result, {
      level: "uni",
      title: "เริ่มได้ 1 ส่วนแล้ว!",
      message: "คุณเริ่มสร้างชิ้นส่วนแรกได้แล้ว แต่รายการที่สมบูรณ์ต้องเชื่อมแท็กแม่เข้ากับข้อย่อยครบทั้ง 3 ข้อ",
      nudge: "เช็กว่ามีครบทั้งกล่องคลุมรายการใหญ่และแท็กข้อย่อยสำหรับ HTML, CSS, JavaScript หรือยัง",
    });
  } else {
    SoloHint.renderFeedback(result, {
      level: "relational",
      title: `เกือบครบแล้ว (${count}/4 องค์ประกอบ)`,
      message: !hasUl
        ? "มีรายการย่อยแล้ว แต่ยังขาดกล่องแม่สำหรับรายการแบบไม่เรียงตัวเลขมาครอบทั้งหมด"
        : "คุณมีแท็กแม่แล้ว ลองตรวจว่าแต่ละคำ (HTML, CSS, JavaScript) ถูกวางไว้ในแท็กข้อย่อยของตัวเองครบทั้ง 3 อันหรือยัง",
      nudge: "ตรวจความสัมพันธ์แม่-ลูกและเช็กตัวสะกดของทั้ง 3 รายการ (เปิดคำใบ้ขั้นที่ 4 ช่วยเช็กโครงสร้างได้)",
    });
  }
}

function goBack() {
  window.location.href = "dashboard.html";
}
