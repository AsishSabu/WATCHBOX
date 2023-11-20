const form = document.getElementById("form");
console.log(form);
form.addEventListener("submit",async (event) => {
  if (!(await validate())) {
    event.preventDefault();
  }
});

async function validate() {
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const cpassword = document.getElementById("cpassword").value;

  const nameerr = document.getElementById("nameerr");
  const emailerr = document.getElementById("emailerr");
  const passworderr = document.getElementById("passworderr");
  const cpassworderr = document.getElementById("cpassworderr");

  const nameRegex = /^[A-Za-z\s]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // General email validation

  let isValid = true;

  // Name field
  if (name.trim() === "") {
    nameerr.textContent = "Field is required";
    isValid = false;
  } else if (name.trim().length < 4) {
    nameerr.textContent = "Name must be at least 4 characters";
    isValid = false;
  } else if (!nameRegex.test(name.trim())) {
    nameerr.textContent = "Name should start with a capital letter and only contain alphabetic characters";
    isValid = false;
  }

  // Email field
  if (email.trim() === "") {
    emailerr.textContent = "Field is required";
    isValid = false;
  } else if (!emailRegex.test(email.trim())) {
    emailerr.textContent = "Invalid email format.";
    isValid = false;
  }else{   try {
    const response = await fetch("/checkEmail", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();

    if (data.message === "email already registered") {
      emailerr.textContent = "Email is already registered.";
      return false;
    }
  } catch (error) {
    console.error("An error occurred:", error);
    return false;
  }}
  

  

  // Password field
  if (password.trim() === "") {
    passworderr.textContent = "Field is required";
    isValid = false;
  } else if (password.length < 4) {
    passworderr.textContent = "Password must be at least 4 characters long";
    isValid = false;
  } else if (!/[A-Z]/.test(password)) {
    passworderr.textContent = "Password must contain at least one uppercase letter";
    isValid = false;
  } else if (!/[a-z]/.test(password)) {
    passworderr.textContent = "Password must contain at least one lowercase letter";
    isValid = false;
  }else if (!/[0-9]/.test(password)) {
    passworderr.textContent = "Password must contain at least one number";
    isValid = false;
  }

  // Confirm Password field
  if (cpassword.trim() === "") {
    cpassworderr.textContent = "Field is required";
    isValid = false;
  } else if (password !== cpassword) {
    cpassworderr.textContent = "Passwords do not match.";
    isValid = false;
  }

  setTimeout(function () {
    nameerr.textContent = "";
    emailerr.textContent = "";
    passworderr.textContent = "";
    cpassworderr.textContent = "";
  }, 3000);

  return isValid;
}
