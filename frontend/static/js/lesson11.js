SoloHint.init({
  hints: {
    pre: "ลองนึกถึงตารางเรียน: ก่อนจะใส่ชื่อวิชาลงในช่องได้ คุณต้องมี 'กรอบตารางใหญ่' แล้วแบ่งเป็น 'แถว' ก่อนจึงจะมี 'ช่องข้อมูล' ข้างในแถว",
    uni: "เริ่มจากชั้นนอกสุดก่อน: แท็กกรอบตารางใช้คำว่า table ตรงตัว (เปิดและปิด)",
    multi: "เช็กแท็กย่อของชั้นกลางและชั้นใน: แถว (Table Row) ย่อเอาตัวแรกของสองคำ และช่องข้อมูล (Table Data) ก็ย่อเอาตัวแรกของสองคำเช่นกัน — แล้วใส่คำว่า HTML กับ CSS ลงไปคนละช่อง",
    relational: {
      text: "ลำดับการซ้อน 3 ชั้นต้องเรียงจากนอกเข้าในเสมอ: ช่องข้อมูลอยู่ในแถว และแถวอยู่ในกรอบตาราง",
      pattern: "<_____>\n  <__>\n    <__>ข้อมูลช่องที่ 1</__>\n    <__>ข้อมูลช่องที่ 2</__>\n  </__>\n</_____>",
    },
    extended: "ถ้าตารางของคุณมีแถว 'หัวตาราง' (Table Header) เพื่อบอกชื่อคอลัมน์ เช่น ภาษา / ระดับความยาก คุณคิดว่าจะเปลี่ยนแท็กช่องข้อมูลชั้นในจาก Table Data เป็นแท็กย่ออะไร?",
  },
});

function checkCode() {
  const code = document.getElementById("codeInput").value.toLowerCase();
  const result = document.getElementById("result");
  if (!requireLogin()) return;
  const userId = localStorage.getItem("userId");

  if (localStorage.getItem(`lesson11_done_${userId}`) === "done") {
    result.style.color = "#facc15";
    result.textContent = "⚠️ เคยผ่านแล้ว ได้ EXP ไปแล้ว";
    return;
  }

  const hasTable = code.includes("<table>");
  const hasTr = code.includes("<tr>");
  const hasTdHtml = code.includes("<td>html");
  const hasTdCss = code.includes("<td>css");
  const hasAnyTd = code.includes("<td>");
  const count = [hasTable, hasTr, hasTdHtml, hasTdCss].filter(Boolean).length;

  if (hasTable && hasTr && hasTdHtml && hasTdCss) {
    awardExp(30)
      .then(() => {
        SoloHint.renderSuccess(result, {
          message: "🎉 ถูกต้อง! คุณสร้าง Table ได้แล้ว +30 EXP",
        });
        localStorage.setItem(`lesson11_done_${userId}`, "done");
        setTimeout(() => (window.location.href = "dashboard.html"), 2200);
      })
      .catch((err) => {
        result.style.color = "#f87171";
        result.textContent = `❌ ${err.message || "เพิ่ม EXP ไม่สำเร็จ"}`;
      });
    return;
  }

  if (count === 0 && !hasAnyTd) {
    SoloHint.renderFeedback(result, {
      level: "pre",
      title: "ยังไม่มีโครงสร้างตาราง",
      message: "ตารางใน HTML มีโครงสร้างซ้อนกัน 3 ชั้น ได้แก่ กรอบตาราง แถวแนวนอน และช่องข้อมูล",
      nudge: "เปิดคำใบ้ระดับ Pre-structural และ Uni-structural ด้านบนเพื่อเริ่มจากกรอบตารางชั้นนอกสุด",
    });
  } else if (count === 1) {
    SoloHint.renderFeedback(result, {
      level: "uni",
      title: "เริ่มได้ 1 ชั้นแล้ว!",
      message: "คุณเริ่มสร้างโครงตารางบางชั้นได้แล้ว แต่ยังขาดอีก 2 ชั้นหรือข้อมูลในเซลล์ให้ครบทั้ง 2 ช่อง",
      nudge: "นึกถึงคำย่อของ Table Row (แถว) และ Table Data (ช่องข้อมูล)",
    });
  } else {
    SoloHint.renderFeedback(result, {
      level: "relational",
      title: `ใกล้สมบูรณ์แล้ว (${count}/4 องค์ประกอบ)`,
      message: !hasTable
        ? "มีแถวหรือช่องข้อมูลแล้ว แต่อย่าลืมสร้างกรอบตารางชั้นนอกสุดมาครอบไว้"
        : !hasTr
        ? "มีกรอบตารางและช่องข้อมูลแล้ว แต่ยังขาดชั้นกลางสำหรับกำหนด 'แถวแนวนอน'"
        : "โครงสร้างหลักครบดีแล้ว ลองตรวจว่าได้ใส่ทั้ง HTML และ CSS ลงในช่องข้อมูลแยกกันเรียบร้อยหรือยัง",
      nudge: "เช็กความสัมพันธ์ 3 ชั้น (ตาราง → แถว → ช่องข้อมูล) จากคำใบ้ขั้นที่ 4 ได้",
    });
  }
}

function goBack() {
  window.location.href = "dashboard.html";
}
