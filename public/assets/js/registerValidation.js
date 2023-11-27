document.addEventListener("DOMContentLoaded", function () {
  const registrationForm = document.getElementById("form");
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const cpasswordInput = document.getElementById("cpassword");

  const nameerr = document.getElementById("nameerr");
  const emailerr = document.getElementById("emailerr");
  const passworderr = document.getElementById("passworderr");
  const cpassworderr = document.getElementById("cpassworderr");
  const formerr = document.getElementById("formerr");

  const nameRegex = /^[A-Z][A-Za-z\s]*$/; // name validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // General email validation regex

  function validateUsername() {
    const name = nameInput.value.trim();

    if (name === "") {
      nameerr.textContent = "Field is required";
    } else if (name.length < 4) {
      nameerr.textContent = "Name must be at least 4 characters";
    } else if (!nameRegex.test(name)) {
      nameerr.textContent =
        "Name should start with a capital letter and only contain alphabetic characters";
    } else {
      nameerr.textContent = ""; // Clear the error message when the input is valid
    }
  }

  // Add a blur event listener to the nameInput
  nameInput.addEventListener("blur", validateUsername);

  function validateEmail() {
    const email = emailInput.value.trim();
    if (email === "") {
      emailerr.textContent = "Field is required";
    } else if (!emailRegex.test(email)) {
      emailerr.textContent = "Invalid email format.";
    } else {
      emailerr.textContent = "";
      //email availabiliity checking

      try {
        fetch("/checkEmail", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        })
          .then((response) => {
            if (response.ok) {
              return response.json();
            } else {
              throw new Error("Network response was not ok");
            }
          })
          .then((data) => {
            emailerr.textContent = data;
          })
          .catch((error) => {
            console.error("An error occurred:", error);
          });
      } catch (error) {
        throw new Error(error);
      }
    }
  }
  emailInput.addEventListener("blur", validateEmail);

  function validatePassword() {
    const password = passwordInput.value.trim();

    if (password === "") {
      passworderr.textContent = "Field is required";
    } else if (password.length < 4) {
      passworderr.textContent = "Password must be at least 4 characters long";
    } else if (!/[A-Z]/.test(password)) {
      passworderr.textContent =
        "Password must contain at least one uppercase letter";
    } else if (!/[a-z]/.test(password)) {
      passworderr.textContent =
        "Password must contain at least one lowercase letter";
    } else if (!/[0-9]/.test(password)) {
      passworderr.textContent = "Password must contain at least one number";
    } else {
      passworderr.textContent = "";
    }
  }
  passwordInput.addEventListener("blur", validatePassword);

  function validateCpassword() {
    const cpassword = cpasswordInput.value.trim();
    if (cpassword.trim() === "") {
      cpassworderr.textContent = "Field is required";
    } else if (passwordInput.value.trim() !== cpassword) {
      cpassworderr.textContent = "Passwords do not match.";
    } else {
      cpassworderr.textContent = "";
    }
  }
  cpasswordInput.addEventListener("blur", validateCpassword);
  function handleSubmit(event) {
    event.preventDefault();
  
    validateUsername();
    validateEmail();
    validatePassword();
    validateCpassword();
  
    const allErrors = [
     nameerr,
     emailerr,
     passworderr,cpassworderr

    ];
  
    const hasErrors = allErrors.some((error) => error.textContent !== "");
  
    if (allErrors.every((error) => error.textContent === "")) {
      formerr.textContent = "";
      registrationForm.submit();
    }  else {
      formerr.textContent = "Please correct the errors in the form.";
    }
  }
  
  registrationForm.addEventListener("submit", handleSubmit);
  

  
});
