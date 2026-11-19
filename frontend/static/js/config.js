// ===== ตั้งค่ากลางและฟังก์ชันความปลอดภัยของ frontend =====
// เปลี่ยนเป็น URL จริงตอน deploy (เช่น https://api.yourdomain.com)
const API_BASE_URL = "http://localhost:8000";

const ALL_LESSON_KEYS = [
  "lesson1_done",
  "lesson2_done",
  "lesson3_done",
  "lesson4_done",
  "lesson5_done",
  "lesson6_done",
  "lesson7_done",
  "lesson8_done",
  "lesson9_done",
  "lesson10_done",
  "lesson11_done",
  "lesson12_done",
];

const ALL_BOSS_KEYS = ["boss1_done", "boss2_done"];

function clearSession() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("userId");
}

function requireLogin() {
  const token = localStorage.getItem("accessToken");
  const userId = localStorage.getItem("userId");
  if (!token || !userId) {
    clearSession();
    window.location.href = "login.html";
    return false;
  }
  return true;
}

function logout() {
  const token = localStorage.getItem("accessToken");
  clearSession();

  if (token) {
    // เพิกถอน JWT ฝั่งเซิร์ฟเวอร์ทันที (best-effort)
    fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      keepalive: true,
    }).catch(() => {});
  }

  window.location.href = "login.html";
}

function extractErrorMessage(data, fallback) {
  if (!data) return fallback;
  if (typeof data.detail === "string" && data.detail.trim()) {
    return data.detail;
  }
  if (Array.isArray(data.detail) && data.detail.length > 0) {
    return data.detail
      .map((item) => (item && item.message ? item.message : String(item)))
      .join(" / ");
  }
  if (typeof data.message === "string" && data.message.trim()) {
    return data.message;
  }
  return fallback;
}

// authFetch = fetch ที่แนบ JWT ให้อัตโนมัติ และเด้งไป login ถ้า token หมดอายุ/ไม่ถูกต้อง
function authFetch(path, options = {}) {
  const token = localStorage.getItem("accessToken");
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  return fetch(`${API_BASE_URL}${path}`, { ...options, headers }).then((res) => {
    if (res.status === 401) {
      clearSession();
      window.location.href = "login.html";
      throw new Error("Unauthorized - redirecting to login");
    }
    return res;
  });
}

// ส่ง EXP ไปยัง Backend และตรวจสอบ res.ok จริงก่อนถือว่าสำเร็จ
async function awardExp(expAmount) {
  const res = await authFetch("/users/me/exp", {
    method: "PATCH",
    body: JSON.stringify({ exp: expAmount }),
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw new Error(extractErrorMessage(data, "เพิ่ม EXP ไม่สำเร็จ"));
  }
  return data;
}

// แสดงตัวอย่าง HTML อย่างปลอดภัย (กัน XSS / sandbox escape ใน SimCode และ Final Boss)
const DANGEROUS_HTML_PATTERNS = [
  /<\s*script\b/i,
  /<\s*iframe\b/i,
  /<\s*object\b/i,
  /<\s*embed\b/i,
  /<\s*applet\b/i,
  /<\s*base\b/i,
  /<\s*meta\b/i,
  /<\s*form\b/i,
  /\bon[a-z]+\s*=/i,
  /\bjavascript\s*:/i,
  /\bvbscript\s*:/i,
  /\bdata\s*:\s*text\/html/i,
  /\bsrcdoc\s*=/i,
  /\bdocument\.cookie\b/i,
  /\bfetch\s*\(/i,
];

function renderSafePreview(iframeEl, rawCode) {
  if (!iframeEl) return { ok: false, reason: "ไม่พบพื้นที่แสดงผล" };
  const code = String(rawCode || "");

  for (const pattern of DANGEROUS_HTML_PATTERNS) {
    if (pattern.test(code)) {
      return {
        ok: false,
        reason: "❌ ตรวจพบโค้ดที่ไม่อนุญาต (ห้ามใช้ JavaScript, event handler หรือแท็กฝังภายนอก)",
      };
    }
  }

  // sandbox ว่าง = ปิดทุกสิทธิ์ (ไม่ให้รัน script, ไม่ให้เข้า same-origin/localStorage, ไม่ให้ส่ง form/popup)
  iframeEl.setAttribute("sandbox", "");
  const cspMeta =
    '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'; img-src https: data:; media-src https: data:;">';
  iframeEl.srcdoc = `${cspMeta}\n${code}`;
  return { ok: true };
}
