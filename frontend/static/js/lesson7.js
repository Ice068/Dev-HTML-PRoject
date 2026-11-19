SoloHint.init({
  hints: {
    pre: "ถ้าจะแขวนรูปบนผนังเว็บ แค่บอกว่า 'นี่คือรูป' อย่างเดียวยังไม่พอ — เบราว์เซอร์ต้องรู้ด้วยว่าจะไปหยิบไฟล์จากไหน และถ้าหารูปไม่เจอจะอธิบายว่าอะไร",
    uni: "เริ่มจากชื่อแท็กรูปภาพ: ย่อมาจากคำว่า Image เหลือเพียง 3 ตัวอักษร และพิเศษตรงที่เป็น 'แท็กเดี่ยว' ไม่ต้องเขียนแท็กปิด",
    multi: "เช็ก 2 คุณสมบัติสำคัญที่ต้องใส่ไว้ในแท็กนี้: (1) คุณสมบัติย่อจาก Source ที่มีคำว่า cat (เช่น ชื่อไฟล์รูป) (2) คุณสมบัติย่อจาก Alternative ที่ใส่คำอธิบายว่า แมว",
    relational: {
      text: "ทั้งสองคุณสมบัติต้องเขียนเรียงต่อกัน 'ภายในเครื่องหมาย < ... > เดียวกัน' โดยคั่นด้วยช่องว่าง และครอบค่าด้วยเครื่องหมายคำพูด",
      pattern: '<___ ___="...cat..." ___="คำอธิบายรูป">',
    },
    extended: "หากรูปภาพนี้ใช้เพื่อตกแต่งเฉย ๆ กับใช้แสดงข้อมูลสำคัญในบทความ คุณคิดว่าข้อความ alt ควรเขียนแตกต่างกันอย่างไรเพื่อให้เหมาะกับโปรแกรมอ่านหน้าจอ?",
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

  if (localStorage.getItem(`lesson7_done_${userId}`) === "done") {
    result.style.color = "#facc15";
    result.textContent = "⚠️ เคยผ่านแล้ว ได้ EXP ไปแล้ว";
    return;
  }

  const hasImg = code.includes("<img");
  const hasSrc = code.includes("src");
  const hasCat = code.includes("cat");
  const hasAlt = code.includes("alt");
  const hasAltText = code.includes("แมว");
  const count = [hasImg, hasSrc, hasCat, hasAlt, hasAltText].filter(Boolean).length;

  if (hasImg && hasSrc && hasCat && hasAlt && hasAltText) {
    SoloHint.renderSuccess(result, {
      message: "🎉 ถูกต้อง! คุณแสดงรูปภาพได้แล้ว +30 EXP",
    });

    authFetch("/users/me/exp", { method: "PATCH", body: JSON.stringify({ exp: 30 }) })
      .then((res) => res.json())
      .then(() => {
        localStorage.setItem(`lesson7_done_${userId}`, "done");
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
      title: "ยังไม่มีแท็กรูปภาพ",
      message: "ลองเริ่มคิดว่าแท็กรูปภาพใน HTML ย่อมาจากคำว่า Image ว่าอย่างไร และต้องระบุข้อมูลอะไรบ้างข้างในแท็ก",
      nudge: "เปิดคำใบ้ขั้นที่ 1-2 ด้านบนเพื่อดูจุดเริ่มต้นของแท็กรูปภาพ",
    });
  } else if (count <= 2) {
    SoloHint.renderFeedback(result, {
      level: "uni",
      title: `เริ่มได้แล้ว (${count}/5 ส่วนประกอบ)`,
      message: "คุณจับแนวทางเริ่มต้นได้แล้ว แต่อย่าลืมว่ารูปภาพที่ดีต้องมีทั้ง 'แหล่งที่มาของไฟล์' และ 'คำอธิบายสำรอง' ควบคู่กัน",
      nudge: "ตรวจสอบว่าได้กำหนดครบทั้งที่อยู่รูปและข้อความอธิบายหรือยัง",
    });
  } else {
    SoloHint.renderFeedback(result, {
      level: "multi",
      title: `เกือบครบทุกส่วนแล้ว (${count}/5 ส่วนประกอบ)`,
      message: !hasAlt || !hasAltText
        ? "คุณระบุแหล่งที่มาของรูปได้ดีแล้ว แต่ยังขาดส่วนคำอธิบายสำรอง (กรณีรูปโหลดไม่ได้) ตามภารกิจ"
        : !hasSrc || !hasCat
        ? "มีคำอธิบายสำรองแล้ว แต่ยังขาดส่วนที่ชี้ไปยังไฟล์รูปที่มีคำว่า cat"
        : "มีคุณสมบัติและค่าครบแล้ว อย่าลืมตรวจสอบชื่อแท็กรูปภาพให้ถูกต้อง",
      nudge: "ลองดูคำใบ้ระดับ Relational ด้านบนเพื่อเช็กการวางคุณสมบัติทั้งสองให้อยู่ในแท็กเดียวกัน",
    });
  }
}

function goBack() {
  window.location.href = "dashboard.html";
}
