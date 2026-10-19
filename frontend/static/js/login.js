// ===== Elements =====
const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");

const emailGroup = document.getElementById("emailGroup");
const confirmGroup = document.getElementById("confirmGroup");

const form = document.getElementById("form");
const message = document.getElementById("message");

const username = document.getElementById("username");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");

const submitBtn = document.getElementById("submitBtn");

let mode = "login";


// ===== สลับไป Login =====
loginTab.onclick = () => {
  mode = "login";
  loginTab.classList.add("active");
  signupTab.classList.remove("active");

  emailGroup.style.display = "none";
  confirmGroup.style.display = "none";

  submitBtn.textContent = "ลุยเลย! (Login)";
  message.textContent = "";
};


// ===== สลับไป Signup =====
signupTab.onclick = () => {
  mode = "signup";
  signupTab.classList.add("active");
  loginTab.classList.remove("active");

  emailGroup.style.display = "block";
  confirmGroup.style.display = "block";

  submitBtn.textContent = "สมัครเลย!";
  message.textContent = "";
};


// ===== Submit =====
form.onsubmit = (e) => {
  e.preventDefault();

  // ===== SIGNUP =====
  if (mode === "signup") {

    if (password.value !== confirmPassword.value) {
      message.style.color = "red";
      message.textContent = "❌ รหัสผ่านไม่ตรงกัน";
      return;
    }

    fetch(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: username.value,
        password: password.value
      })
    })
    .then(async res => {
      const data = await res.json();
      if (!res.ok) {
        message.style.color = "red";
        message.textContent = "❌ " + (data.detail || "สมัครไม่สำเร็จ");
        return;
      }

      message.style.color = "#22c55e";
      message.textContent = "🎉 สมัครสมาชิกสำเร็จ!";
    })
    .catch(() => {
      message.style.color = "red";
      message.textContent = "❌ เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ";
    });

    return;
  }


  // ===== LOGIN =====
  fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username: username.value,
      password: password.value
    })
  })
  .then(async res => {
    const data = await res.json();

    if (!res.ok) {
      message.style.color = "red";
      message.textContent = "❌ " + (data.detail || "เข้าสู่ระบบไม่สำเร็จ");
      return;
    }

    message.style.color = "#22c55e";
    message.textContent = "✅ เข้าสู่ระบบสำเร็จ!";

    // ✅ เก็บ JWT และ userId (ไม่เก็บ password ใดๆ)
    localStorage.setItem("accessToken", data.access_token);
    localStorage.setItem("userId", data.user.id);

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1000);
  })
  .catch(() => {
    message.style.color = "red";
    message.textContent = "❌ เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ";
  });
};


// ===== Auto redirect ถ้า login แล้ว =====
if (localStorage.getItem("accessToken")) {
  window.location.href = "dashboard.html";
}