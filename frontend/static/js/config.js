// ===== ตั้งค่ากลางของ frontend =====
// เปลี่ยนเป็น URL จริงตอน deploy (เช่น https://api.yourdomain.com)
const API_BASE_URL = "http://localhost:8000";

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
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userId");
      window.location.href = "login.html";
      throw new Error("Unauthorized - redirecting to login");
    }
    return res;
  });
}

function requireLogin() {
  if (!localStorage.getItem("accessToken")) {
    window.location.href = "login.html";
    return false;
  }
  return true;
}
