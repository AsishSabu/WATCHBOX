


function validateProductForm() {
  console.log("..............................");
  const productInput = document.getElementById("productName");
  const nameerr = document.getElementById("nameerr");
  const dec = document.getElementById("description");
  const decerr = document.getElementById("decerr");
  const productPriceInput = document.getElementById("productPrice");
  const productPriceErr = document.getElementById("productPriceErr");
  const salePrice = document.getElementById("salePrice");
  const saleerr = document.getElementById("saleerr");
  const Quantity = document.getElementById("quantity");
  const Qerr = document.getElementById("qerr");
  const brand = document.getElementById("brand");
  const branderr = document.getElementById("branderr");
  const image = document.getElementById("product-images");
  const imageerr = document.getElementById("imageerr");

  if (productInput.value.trim() === "") {
    nameerr.innerHTML = "Field is required";
    setTimeout(() => { nameerr.innerHTML = ""; }, 3000); // Remove error after 3 seconds
    return false;
  } else if (productInput.value.length < 4) {
    nameerr.innerHTML = "Name must be at least 4 characters";
    setTimeout(() => { nameerr.innerHTML = ""; }, 3000); // Remove error after 3 seconds
    return false;
  }
  if (dec.value.trim() === "") {
    decerr.textContent = "Field is required";
    setTimeout(() => { decerr.textContent = ""; }, 3000); // Remove error after 3 seconds
    return false;
  } else if (dec.value.length < 10) {
    decerr.textContent = "Description must be at least 10 characters";
    setTimeout(() => { decerr.textContent = ""; }, 3000); // Remove error after 3 seconds
    return false;
  }
  if (productPriceInput.value.trim() === "") {
    productPriceErr.innerHTML = "Field is required";
    setTimeout(() => { productPriceErr.innerHTML = ""; }, 3000); // Remove error after 3 seconds
    return false;
  } else if (productPriceInput.value <= 0) {
    productPriceErr.innerHTML = "The price must be positive";
    setTimeout(() => { productPriceErr.innerHTML = ""; }, 3000); // Remove error after 3 seconds
    return false;
  }
  if (salePrice.value.trim() === "") {
    saleerr.innerHTML = "Field is required";
    setTimeout(() => { saleerr.innerHTML = ""; }, 3000); // Remove error after 3 seconds
    return false;
  } else if (salePrice.value <= 0) {
    saleerr.innerHTML = "The price must be positive";
    setTimeout(() => { saleerr.innerHTML = ""; }, 3000); // Remove error after 3 seconds
    return false;
  }
  if (Quantity.value.trim() === "") {
    Qerr.innerHTML = "Field is required";
    setTimeout(() => { Qerr.innerHTML = ""; }, 3000); // Remove error after 3 seconds
    return false;
  } else if (Quantity.value <= 0) {
    Qerr.innerHTML = "The quantity must be positive";
    setTimeout(() => { Qerr.innerHTML = ""; }, 3000); // Remove error after 3 seconds
    return false;
  }
  if (brand.value.trim() === "") {
    branderr.innerHTML = "Field is required";
    setTimeout(() => { branderr.innerHTML = ""; }, 3000); // Remove error after 3 seconds
    return false;
  }
  const selectedFiles = image.files;
  const maxImageCount = 4;
  if (image.value.trim() === "") {
    imageerr.innerHTML = "Field is required";
    setTimeout(() => { imageerr.innerHTML = ""; }, 3000); // Remove error after 3 seconds
    return false;
  } else if (selectedFiles.length > maxImageCount) {
    imageerr.innerHTML = "You can only upload 4 images";
    setTimeout(() => { imageerr.innerHTML = ""; }, 3000); // Remove error after 3 seconds
    return false;
  }

  return true;
}

document.getElementById("product-images").addEventListener("change", function () {
  const previewContainer = document.getElementById("image-preview");
  const filesInput = this;
  const selectedFiles = [];

  if (filesInput.files.length === 0) {
    // If no files are selected, show an error message
    imageerr.textContent = "Please select at least one image";
  } else if (filesInput.files.length > 4) {
    // If more than 4 files are selected, show an error message
    imageerr.textContent = "Maximum of 4 images allowed";
  } else {
    // If the number of files is within the limit, clear the error message
    imageerr.textContent = "";
  }

  // Clear previous previews
  previewContainer.innerHTML = "";

  // Display previews for selected images
  for (let i = 0; i < filesInput.files.length; i++) {
    const file = filesInput.files[i];
    selectedFiles.push(file); // Add the file to the selectedFiles array

    const reader = new FileReader();

    reader.onload = function (e) {
      const img = document.createElement("img");
      img.src = e.target.result;
      img.classList.add("img-thumbnail");
      img.style.maxWidth = "150px";
      img.style.maxHeight = "150px"; // Limit image height for a consistent layout

      const closeButton = document.createElement("button");
      closeButton.innerHTML = "&times;"; // Unicode character for 'times' (close) symbol
      closeButton.classList.add("btn", "btn-sm", "btn-danger", "close-button");
      closeButton.addEventListener("click", function () {
        // Remove the corresponding image preview
        previewContainer.removeChild(imageDiv);
        // Remove the corresponding file from the selectedFiles array
        const index = selectedFiles.indexOf(file);
        if (index !== -1) {
          selectedFiles.splice(index, 1);
        }
      });

      const imageDiv = document.createElement("div");
      imageDiv.classList.add("image-container");
      imageDiv.appendChild(img);
      imageDiv.appendChild(closeButton);

      previewContainer.appendChild(imageDiv);
    };

    reader.readAsDataURL(file);
  }

  // Update the input element's files property with the remaining selected files
  filesInput.files = new FileList(selectedFiles);
});


function imageValidation() {
  const image = document.getElementById("newImages");
  const imageerr = document.getElementById("imageerr");

  const selectedFiles = image.files;
  const maxImageCount = 4;
  if (image.value.trim() === "") {
    imageerr.innerHTML = "Field is required";
    setTimeout(() => { imageerr.innerHTML = ""; }, 3000); // Remove error after 3 seconds
    return false;
  } else if (selectedFiles.length > maxImageCount) {
    imageerr.innerHTML = "You can only upload 4 images";
    setTimeout(() => { imageerr.innerHTML = ""; }, 3000); // Remove error after 3 seconds
    return false;
  } 
  return true;
}






