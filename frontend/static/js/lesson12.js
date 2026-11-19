SoloHint.init({
  hints: {
    pre: "ลองนึกถึงเครื่องเล่นคลิปบนหน้าเว็บ ถ้าไม่มี 'ปุ่ม Play/Pause' ผู้ใช้จะกดดูไม่ได้ และถ้าไม่บอก 'ที่อยู่ไฟล์' เครื่องเล่นก็จะไม่รู้ว่าจะเล่นคลิปไหน",
    uni: "เริ่มจากชื่อแท็กเครื่องเล่นหลัก: ใช้คำภาษาอังกฤษตรงตัวว่า video (มีทั้งแท็กเปิดและแท็กปิด)",
    multi: "เช็ก 3 ส่วนสำคัญที่ต้องใส่ไว้ในแท็กเปิด: (1) ชื่อแท็กเครื่องเล่นวิดีโอ (2) คุณสมบัติบอกแหล่งไฟล์เหมือนบทที่ 7 ที่มีค่าเป็น video.mp4 (3) คุณสมบัติเปิดแผงปุ่มควบคุม (ไม่ต้องใส่ = ค่า)",
    relational: {
      text: "ทั้งคุณสมบัติเปิดแผงควบคุมและคุณสมบัติบอกที่อยู่ไฟล์ต้องวางอยู่ 'ข้างในแท็กเปิด' คั่นด้วยช่องว่าง แล้วค่อยตามด้วยแท็กปิด",
      pattern: '<_____ ________ ___="ชื่อไฟล์.mp4"></_____>',
    },
    extended: "ในเว็บไซต์จริง หากบางเบราว์เซอร์ไม่รองรับนามสกุลไฟล์วิดีโอชนิดเดียว นักพัฒนาจะทำอย่างไรให้มีไฟล์สำรองหรือข้อความแจ้งเตือนด้านในแท็กเครื่องเล่น?",
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

  if (localStorage.getItem(`lesson12_done_${userId}`) === "done") {
    result.style.color = "#facc15";
    result.textContent = "⚠️ เคยผ่านแล้ว ได้ EXP ไปแล้ว";
    return;
  }

  const hasVideo = code.includes("<video");
  const hasSrc = code.includes("src");
  const hasFile = code.includes("video.mp4");
  const hasControls = code.includes("controls");
  const count = [hasVideo, hasSrc, hasFile, hasControls].filter(Boolean).length;

  if (hasVideo && hasSrc && hasFile && hasControls) {
    SoloHint.renderSuccess(result, {
      message: "🎉 ถูกต้อง! คุณใช้ Video ได้แล้ว +30 EXP",
    });

    authFetch("/users/me/exp", { method: "PATCH", body: JSON.stringify({ exp: 30 }) })
      .then((res) => res.json())
      .then(() => {
        localStorage.setItem(`lesson12_done_${userId}`, "done");
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
      title: "ยังไม่พบเครื่องเล่นวิดีโอ",
      message: "ลองเชื่อมโยงความรู้เรื่องคุณสมบัติแหล่งไฟล์จากบทรูปภาพ มาใช้ร่วมกับเครื่องเล่นวิดีโอและปุ่มควบคุม",
      nudge: "เปิดคำใบ้ขั้นที่ 1-2 ด้านบนเพื่อเริ่มร่างแท็กเครื่องเล่นหลัก",
    });
  } else if (count <= 2) {
    SoloHint.renderFeedback(result, {
      level: "uni",
      title: `เริ่มได้แล้ว (${count}/4 องค์ประกอบ)`,
      message: "คุณเริ่มมีโครงเครื่องเล่นแล้ว แต่อย่าลืมทั้งแหล่งไฟล์วิดีโอและแผงปุ่มควบคุมให้ผู้ใช้กดเล่นได้",
      nudge: "ตรวจว่าได้ระบุแหล่งไฟล์ (เหมือนบทที่ 7) และเปิดแผงควบคุมครบหรือยัง",
    });
  } else {
    SoloHint.renderFeedback(result, {
      level: "multi",
      title: "เกือบครบสมบูรณ์แล้ว (3/4 องค์ประกอบ)",
      message: !hasControls
        ? "ระบุแหล่งไฟล์วิดีโอได้แล้ว แต่อย่าลืมใส่คุณสมบัติเปิดปุ่มควบคุม Play/Pause ให้ผู้ใช้ด้วย"
        : !hasSrc || !hasFile
        ? "มีเครื่องเล่นและปุ่มควบคุมแล้ว แต่ยังขาดการระบุแหล่งที่มาของไฟล์ video.mp4"
        : "คุณสมบัติครบแล้ว อย่าลืมตรวจสอบชื่อแท็กเครื่องเล่นวิดีโอ",
      nudge: "ดูโครงสร้างความสัมพันธ์ในคำใบ้ขั้นที่ 4 เพื่อตรวจตำแหน่งของคุณสมบัติในแท็กเปิด",
    });
  }
}

function goBack() {
  window.location.href = "dashboard.html";
}
