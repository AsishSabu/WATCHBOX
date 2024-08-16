let data;
async function currentCartData() {
  try {
    const response = await fetch('/getCartCount', { method: 'GET' });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

   
    const count = data.count;

   
    const countSpan = document.getElementById('countSpan');
    if (countSpan) {
      countSpan.textContent = count;
    }
  } catch (error) {
   
    console.error('Error fetching cart count:', error);
  }
}

// Call currentCartData to initiate the process

currentCartData();


const checkoutBtn = document.getElementById("checkoutBtn");

function updateCartMessage(data) {
  const cartMessage = document.getElementById("cart-message");
            
currentCartData();

  // Update the cart message
  cartMessage.innerHTML = data.message;
  cartMessage.className = `position-fixed bg-${data.status} text-white p-2 rounded`;
  cartMessage.style.display = "block";

  // Hide the cart message after 3 seconds
  setTimeout(function () {
    cartMessage.style.display = "none";
  }, 3000);
}

function updateCartCount(data) {
 
  const cartCount = document.getElementById("cartCount");


  if (data.count !== undefined) {
    cartCount.innerText = data.count;
  
  }
}

function updateQuantityDisplay(id, data) {
  const quantitySpan = document.getElementById(`quantity_${id}`);
  const totalProductPrice = document.getElementById(`totalProductPrice_${id}`);

  // Update the quantity displayed in the <span> element
  if (quantitySpan) {
    quantitySpan.innerText = data.quantity;
    totalProductPrice.innerText = data.productTotal.toFixed(2);
    
  }
}

function updateCartTotal(data) {
            
currentCartData();
  const subTotal = document.getElementById("subtotal");
  const cartTotal = document.getElementById("cart-total");
  subTotal.innerText = data.subtotal;
  cartTotal.innerText = data.total;
}

function managePlusButton(data) {
  const plusBtnDisabled = document.getElementById("plusBtnDisabled");
  const plusBtn = document.getElementById("plusBtn");

  if (data.status === "warning") {
    plusBtnDisabled.style.pointerEvents = "all";
  }
}

function updateQuantity(id, isIncrement) {
  const action = isIncrement ? "inc" : "dec";
  const url = `/cart/${action}/${id}`;

  fetch(url, {
    method: "GET",
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        console.error("Failed");
      }
    })
    .then((responseData) => {
      if (responseData) {
        data = responseData;

        if (data.quantity <= 0) {
          location.reload();
        }
        currentCartData();
        updateCartMessage(data);

        updateCartCount(data);

        updateQuantityDisplay(id, data);

        updateCartTotal(data);
        
      }
    })
    .catch((error) => {
      console.error("An error occurred:", error);
    });
}

const plusButtons = document.querySelectorAll(".plusBtn");
const minusButtons = document.querySelectorAll(".minusBtn");

plusButtons.forEach((button) => {
  button.addEventListener("click", function () {
    const productId = this.getAttribute("data-product-id");
    updateQuantity(productId, true);
  });
});

minusButtons.forEach((button) => {
  button.addEventListener("click", function () {
    
    const productId = this.getAttribute("data-product-id");
    updateQuantity(productId, false);
  });
});

function addToCart(id) {
  currentCartData();
  console.log("in the add to cart ...............................................................................................");
  const productId = id;
  const url = `/cart/add/${productId}`;
  const cartCount = document.getElementById("cartCount");
  const cartMessage = document.getElementById("cart-message");
  const cartQuantity= document.getElementById("cart-quantity");

  fetch(url, {
    method: "GET",
  })
    .then((response) => {
      if (response.ok) {;
        return response.json();
      } else {
        console.log("json response is sending failed");
        console.error("Failed");
      }
    })
    .then((data) => {
      if (data) {
        if (data.count && data.message) {
          
currentCartData();
          // cartCount.innerText = data.count;
          cartMessage.innerText = data.message;

          cartMessage.className = `position-fixed bg-${data.status} text-white p-2 rounded`;
          cartMessage.style.display = "block";

          setTimeout(function () {
            cartMessage.style.display = "none";
          }, 3000);
        } else {
          console.error("Unexpected data format",data);
        }
      }
    })
    .catch((error) => {
      console.error("An error occurred:", error);
    });
}

