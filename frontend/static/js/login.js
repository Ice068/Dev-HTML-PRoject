// ===== Elements =====
const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");
const confirmGroup = document.getElementById("confirmGroup");

const form = document.getElementById("form");
const message = document.getElementById("message");

const username = document.getElementById("username");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");
const submitBtn = document.getElementById("submitBtn");

let mode = "login";
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/;

function setMessage(text, isSuccess = false) {
  message.style.color = isSuccess ? "#22c55e" : "#f87171";
  message.textContent = text;
}

function switchToLogin(preserveMessage = false) {
  mode = "login";
  loginTab.classList.add("active");
  signupTab.classList.remove("active");
  confirmGroup.style.display = "none";
  password.setAttribute("autocomplete", "current-password");
  submitBtn.textContent = "ลุยเลย! (Login)";
  if (!preserveMessage) message.textContent = "";
}

function switchToSignup() {
  mode = "signup";
  signupTab.classList.add("active");
  loginTab.classList.remove("active");
  confirmGroup.style.display = "block";
  password.setAttribute("autocomplete", "new-password");
  submitBtn.textContent = "สมัครเลย!";
  message.textContent = "";
}

loginTab.onclick = () => switchToLogin(false);
signupTab.onclick = () => switchToSignup();

// ===== Submit =====
form.onsubmit = async (e) => {
  e.preventDefault();

  const rawUser = username.value.trim();
  const rawPass = password.value;

  if (!rawUser || !rawPass) {
    setMessage("❌ กรุณากรอกชื่อผู้ใช้และรหัสผ่าน");
    return;
  }

  // ===== SIGNUP =====
  if (mode === "signup") {
    if (!USERNAME_REGEX.test(rawUser)) {
      setMessage("❌ ชื่อผู้ใช้ต้องยาว 3-30 ตัวอักษร ใช้ได้เฉพาะ a-z, A-Z, 0-9 และ _");
      return;
    }

    if (rawPass.length < 8 || rawPass.length > 128) {
      setMessage("❌ รหัสผ่านต้องยาว 8-128 ตัวอักษร");
      return;
    }

    if (rawPass !== confirmPassword.value) {
      setMessage("❌ รหัสผ่านไม่ตรงกัน");
      return;
    }

    submitBtn.disabled = true;
    try {
      const res = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: rawUser, password: rawPass }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setMessage("❌ " + extractErrorMessage(data, "สมัครไม่สำเร็จ"));
        return;
      }

      password.value = "";
      confirmPassword.value = "";
      switchToLogin(true);
      setMessage("🎉 สมัครสมาชิกสำเร็จ! เข้าสู่ระบบได้เลย", true);
    } catch {
      setMessage("❌ เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ");
    } finally {
      submitBtn.disabled = false;
    }
    return;
  }

  // ===== LOGIN =====
  submitBtn.disabled = true;
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: rawUser, password: rawPass }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      setMessage("❌ " + extractErrorMessage(data, "เข้าสู่ระบบไม่สำเร็จ"));
      return;
    }

    if (!data || !data.access_token || !data.user || !data.user.id) {
      setMessage("❌ ข้อมูลการเข้าสู่ระบบไม่สมบูรณ์");
      return;
    }

    setMessage("✅ เข้าสู่ระบบสำเร็จ!", true);

    // เก็บเฉพาะ JWT และ userId (ไม่เก็บ password)
    localStorage.setItem("accessToken", data.access_token);
    localStorage.setItem("userId", data.user.id);

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 800);
  } catch {
    setMessage("❌ เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ");
  } finally {
    submitBtn.disabled = false;
  }
};

// ===== Auto redirect ถ้ามี session สมบูรณ์แล้ว =====
if (localStorage.getItem("accessToken") && localStorage.getItem("userId")) {
  window.location.href = "dashboard.html";
}
