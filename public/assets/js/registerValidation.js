const form = document.getElementById("form");
form.addEventListener("submit", (event) => {
  if (!validate()) {
    event.preventDefault();
  }
});

function validate() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const cpassword = document.getElementById("cpassword").value;

  const nameerr = document.getElementById("nameerr");
  const emailerr = document.getElementById("emailerr");
  const passworderr = document.getElementById("passworderr");
  const cpassworderr = document.getElementById("cpassworderr");

  const nameRegex = /^[A-Z]/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // General email validation

  let isValid = true;

  // Name field
  if (name.trim() === "") {
    nameerr.textContent = "Field is required";
    isValid = false;
    setTimeout(function () {
      nameerr.textContent = "";
    }, 3000);
  } else if (name.trim().length < 4) {
    nameerr.textContent = "Name must be at least 4 characters";
    isValid = false;
    setTimeout(function () {
      nameerr.textContent = "";
    }, 3000);
  } else if (!nameRegex.test(name.trim())) {
    nameerr.textContent = "First letter should be capital";
    isValid = false;
    setTimeout(function () {
      nameerr.textContent = "";
    }, 3000);
  }

  // Email field
  if (email.trim() === "") {
    emailerr.textContent = "Field is required";
    isValid = false;
    setTimeout(function () {
      emailerr.textContent = "";
    }, 3000);
  } else if (!emailRegex.test(email.trim())) {
    emailerr.textContent = "Invalid email format.";
    isValid = false;
    setTimeout(function () {
      emailerr.textContent = "";
    }, 3000);
  }

  // Password field
  if (password.trim() === "") {
    passworderr.textContent = "Field is required";
    setTimeout(function () {
      passworderr.textContent = "";
    }, 3000);
    isValid = false;
  } else if (password.length < 4) {
    passworderr.textContent = "Password must be at least 4 characters long";
    setTimeout(function () {
      passworderr.textContent = "";
    }, 3000);
    isValid = false;
  }

  // Confirm Password field

  if (cpassword.trim() === "") {
    cpassworderr.textContent = "Field is required";
    isValid = false;
    setTimeout(function () {
      cpassworderr.textContent = "";
    }, 3000);}
 else if (password !== cpassword) {
    cpassworderr.textContent = "Passwords do not match.";
    setTimeout(function () {
      cpassworderr.textContent = "";
    }, 3000);
    isValid = false;
  }

  return isValid;
}
