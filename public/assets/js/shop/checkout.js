let selectedAddressId = null;
const wallet = document.getElementById("wallet");
const couponBtn = document.getElementById("couponBtn");
const rmCoupon = document.getElementById("rmCoupon");

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const rzpBtn = document.getElementById("rzp-button");
  const wltBtn = document.getElementById("wlt-button");
  const codBtn = document.getElementById("cod-button");
  const addressRadios = document.querySelectorAll('input[name="addressId"]');
  const firstRadio = document.querySelector('input[name="addressId"]:checked');
  if (firstRadio) {
    selectedAddressId = firstRadio.value;
  }
  addressRadios.forEach((radio) => {
    radio.addEventListener("change", (event) => {
      selectedAddressId = event.target.value;
    });
  });
  handleWalletPayment();
  codBtn.addEventListener("click", handleCodButtonClick);
  rzpBtn.addEventListener("click", handleRzpButtonClick);
  wltBtn.addEventListener("click", handleWltButtonClick);
  couponBtn.addEventListener("click", handleCouponBtnClick);
  rmCoupon.addEventListener("click", handleRemoveCouponBtnClick);

  const couponElement = document.querySelector("#coupon_code");
  handleCouponBtnClick("onLoad");
});

//------------------------------handle wallet button clciks-------------------------------------

async function handleWltButtonClick(event) {
  event.preventDefault();
  const isStockAvailable = await checkStock();
  if (isStockAvailable && (await checkCartData()) && (await checkCoupon())) {
    const data = {
      addressId: selectedAddressId,
      payment_method: "wallet_payment",
      isWallet: wallet.checked,
    };
    console.log(data);
    await placeOrder("/place-order", data);
  } else {
    showStockAlert();
  }
}


async function handleCodButtonClick(event) {
  event.preventDefault();
    const isStockAvailable = await checkStock();
console.log(isStockAvailable);
  if (isStockAvailable && (await checkCartData()) && (await checkCoupon())) {
    const data = {
      addressId: selectedAddressId,
      payment_method: "cash_on_delivery",
      isWallet: wallet.checked,
    };
    await placeOrder("/place-order", data);
  } else {
    showStockAlert();
  }
}

//----------------------razorpay payament --------------------
async function handleRzpButtonClick() {
  const isStockAvailable = await checkStock();
  if (isStockAvailable && (await checkCartData()) && (await checkCoupon())) {
    console.log("in razorpay payment");
    const data = {
      addressId: selectedAddressId,
      payment_method: "online_payment",
      isWallet: wallet.checked,
    };
    console.log(data);
    await placeOrder("/place-order", data);
  } else {
    showStockAlert();
  }
}
//-------------------place order------------------------

async function placeOrder(url, data) {
  try {
    console.log("Before fetch request");
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    console.log("After fetch request", response);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const responseData = await response.json();
    console.log(responseData);
    if (data.payment_method === "cash_on_delivery") {
      handleCodPayment(responseData);
    } else if (data.payment_method === "online_payment") {
      handleRzpPayment(responseData);
    } else if (data.payment_method === "wallet_payment") {
      console.log(responseData);
      handleWltPayment(responseData);
    }
  } catch (error) {
    handleError(error);
  }
}

//------------------------check cart data----------------------------

async function checkCartData() {
  try {
    const originalCartData = JSON.parse(
      document.getElementById("originalCartData").value
    );
    const response = await fetch("/checkout/get");

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const currentCartData = await response.json();

    if (
      currentCartData !== null &&
      compareJSONStrings(originalCartData, currentCartData)
    ) {
      showCartConfirmation();
      return false;
    }

    return true;
  } catch (error) {
    throw new Error(error);
  }
}

//---------------------------------handle cod payment-------------------------------------------------------

async function handleCodPayment(responseData) {
  window.location.href = `/order-placed/${responseData.orderId}`;
}

//--------------------------------handle wallet payment----------------------------------------------------------------

function handleWltPayment(responseData) {
  window.location.href = `/order-placed/${responseData.orderId}`;
}
//--------------------------handle razorpay------------------------------------------------------------------

function handleRzpPayment(responseData) {
  const options = {
    key: "rzp_test_VpPTWSenv9Hzha",
    amount: responseData.order.totalPrice * 100,
    currency: "INR",
    name: "WATCHBOX",
    description: "Test Transaction",
    image:
      "https://img.freepik.com/free-vector/illustration-new-year-decoration_53876-37431.jpg?w=1060&t=st=1703126106~exp=1703126706~hmac=238a43367aba999f0272042de7206fea648f6ed3124bcdbe74c6e9b0630efa8a",
    order_id: responseData.order.id,
    handler: function (response) {
      handleSuccessPayment(response, responseData);
    },
    prefill: {
      name: responseData.user.userName,
      email: responseData.user.email,
      contact: responseData.user.mobile,
    },
    notes: {
      address: "Razorpay Corporate Office",
    },
    theme: {
      color: "#000000",
    },
    modal: {
      ondismiss: function () {
        handlePaymentFailure(responseData.orderId);
      },
    },
  };

  const rzp1 = new Razorpay(options);

  rzp1.on("payment.failed", function (response) {
    handlePaymentFailure(responseData.orderId);
  });

  rzp1.open();
}

//------------------------------------------------------------

function handleSuccessPayment(response, responseData) {
  const postData = {
    razorpay_payment_id: response.razorpay_payment_id,
    razorpay_order_id: response.razorpay_order_id,
    razorpay_signature: response.razorpay_signature,
    orderId: responseData.orderId,
    userId: responseData.user._id,
    walletAmount: response.walletamount,
  };
  console.log(postData);

  fetch(`/verify-payment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postData),
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Error fetching data");
      }
    })
    .then((data) => {
      window.location.href = `/order-placed/${data.orderId}`;
    })
    .catch((error) => {
      handleError(error);
    });
}

//------------------------------handle razorpay payment  failure--------------------------------------------------------------

async function handlePaymentFailure(orderId) {
  try {
    const cancelOrderUrl = `/orders/${orderId}`;
    const requestOptions = {
      method: "PUT",
    };
    const response = await fetch(cancelOrderUrl, requestOptions);

    if (response.ok) {
      console.log("Order cancellation request succeeded.");
      return response.json();
    } else {
      console.error("Order cancellation request failed.");
    }
  } catch (error) {
    handleError(error);
  }
}

//-------------------------------------------------------------------------------------------------------------

function handleWalletPayment() {
  console.log(" handle wallet payment");
  const totalAmount = document.getElementById("totalAmount");
  const wallet = document.getElementById("wallet");
  const wltBtn = document.getElementById("wlt-button");
  const availableBalance = document.getElementById("available-balance");
  console.log(availableBalance.innerText);
  console.log(totalAmount.innerText, "///////////////////////");

     if (wallet) {
       if (availableBalance && availableBalance.innerText <= 0) {
         wallet.disabled = true;
         wltBtn.style.display = "none";
        
       }


       wallet.removeEventListener("change", handlePaymentChange);
       wallet.addEventListener("change", handlePaymentChange);
       handleCouponBtnClick("onUpdate");
     }
}

function handlePaymentChange() {
  const wallet = document.getElementById("wallet");
  const totalAmount = document.getElementById("total");
  const walletAmount = document.getElementById("wallet-amount");
  const availableBalance = document.getElementById("available-balance");
  const codBtn = document.getElementById("cod-button");
  const rzpBtn = document.getElementById("rzp-button");
  const wltBtn = document.getElementById("wlt-button");
  const payWithWallet = wallet.checked;
  const code = document.getElementById("coupon_code");

  if (payWithWallet) {
    codBtn.classList.add("d-none");
  } else {
    codBtn.classList.remove("d-none");
  }

  fetch("/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ payWithWallet, code: code.value }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("..........................");
      console.log(data, "data");

      totalAmount.innerText = data.total.toFixed(2);
      walletAmount.innerText = data.usedFromWallet.toFixed(2);
      if (data.total === 0) {
        wltBtn.style.display = "grid";
        rzpBtn.style.display = "none";
      } else {
        wltBtn.style.display = "none";
        rzpBtn.style.display = "grid";
      }
    })
    .catch((error) => {
      console.error("Error updating checkout page:", error);
    });
}

//--------------------------compare JSON strings----------------------------------------------------------------

function compareJSONStrings(jsonString1, jsonString2) {
  return JSON.stringify(jsonString1) !== JSON.stringify(jsonString2);
}

//---------------------show cart confirmation using sweet alert--------------------------------

function showCartConfirmation() {
  Swal.fire({
    title: "Cart Confirmation",
    text: "Your cart has changed. Do you want to reload the page?",
    icon: "info",
    showCancelButton: true,
    confirmButtonText: "Reload",
    cancelButtonText: "Close",
  }).then((result) => {
    if (result.isConfirmed) {
      proceedToCheckout();
    }
  });
}

async function checkCoupon() {
  const code = document.getElementById("coupon_code");
  if (code.value) {
    try {
      const response = await fetch("/coupon/", {
        method: "POST",
        body: JSON.stringify({ code: code.value }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === "success") {
          return true;
        } else if (data.status === "danger") {
          showCouponAlert(data);
        }
      }
    } catch (error) {
      console.error("Fetch error:", error);
      handleError(error);
    }
  } else {
    return true;
  }
}

function showCouponAlert(data) {
  Swal.fire({
    title: "Coupon Alert",
    text: data.message,
    icon: "info",
    showCancelButton: true,
    confirmButtonText: "Remove Coupon",
    cancelButtonText: "Close",
  }).then((result) => {
    if (result.isConfirmed) {
      handleRemoveCouponBtnClick();
    }
  });
}

function handleCouponBtnClick(data) {
  
  const couponCode = document.getElementById("coupon_code");
  const sanitizedValue = couponCode.value
    .replace(/[^A-Z0-9]/g, "")
    .toUpperCase();
  const couponError = document.getElementById("couponError");
  const total = document.getElementById("total");
  const discount = document.getElementById("discount");
  const rzpBtn = document.getElementById("rzp-button");
  const codBtn = document.getElementById("cod-button");
  const wltBtn = document.getElementById("wlt-button");

  fetch("/coupon/", {
    method: "POST",
    body: JSON.stringify({ code: sanitizedValue, data }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
    })
    .then((data) => {
      console.log(data);
      if (data.status === "danger") {
        couponError.classList.remove("text-success");
        couponError.classList.add("text-danger");
        couponError.textContent = data.message;
        discount.textContent = 0;
        rzpBtn.classList.add("disabled");
        rzpBtn.style.textDecoration = "line-through";
        codBtn.classList.add("disabled");
        codBtn.style.textDecoration = "line-through";
        wltBtn.classList.add("disabled");
        wltBtn.style.textDecoration = "line-through";

        // couponList.classList.remove("d-block");
        // couponList.classList.add("d-none");
        // checkoutBtn.disabled = true;
        // checkoutBtn.style.textDecoration = "line-through";
      } else if (data.status === "success") {
        couponError.textContent = data.message + " " + data.coupon.description;
        couponError.classList.remove("text-danger");
        couponError.classList.add("text-success");
        total.textContent = data.total;
        discount.textContent = data.discount;
      }
    })
    .catch((error) => {
      console.error("Fetch error:", error);
    });
}

function handleRemoveCouponBtnClick() {
  fetch("/coupon/remove", {
    method: "GET",
  }).then((response) => {
    if (response.ok) {
      window.location.reload();
    }
  });
}

async function checkStock() {

 try {
   const response = await fetch("/checkProductAvailability");
   if (!response.ok) {
     throw new Error("Network response was not ok");
   }
     const data = await response.json();
     console.log(data.status);
        if (data.status == "success") {
          return true;
        } else {
          showStockAlert();
          return false;
        }

 } catch (error) {
   console.error("Error checking stock:", error);
   return false; // Return false in case of an error
 }

}

function checkProductAvailability(callback) {
  $.ajax({
    type: "GET",
    url: "/checkProductAvailability",
    success: function (response) {
      console.log(response.status, "response in cart");
      if (response.status == "success") {
        console.log("Product is available");
        callback(true); // Call the callback with true if product is available
      } else {
        console.log("Product is not available");
        callback(false); // Call the callback with false if product is not available
      }
    },
    error: function (textStatus, errorThrown) {
      console.error(
        "Error checking product availability:",
        textStatus,
        errorThrown
      );
      callback(false); // Call the callback with false in case of an error
    },
  });
}

// document
//   .getElementById("checkoutBtn")
//   .addEventListener("click", function (event) {
//     event.preventDefault(); // Prevent the default form submission

//     // Call checkProductAvailability and pass a callback function
//     checkProductAvailability(function (isAvailable) {
//       if (isAvailable) {
//         // Product is available, submit the form
//         document.querySelector("form").submit();
//       } else {
//         // Product is not available, show an alert or take appropriate action
//         showStockAlert();
//       }
//     });
//   });
async function showStockAlert() {
  await new Promise((resolve) => {
    Swal.fire({
      position: "center",
      icon: "error",
      title: "Out of stock",
      showConfirmButton: false,
      timer: 1500,
      didClose: resolve, // Resolve the promise when the alert is closed
    });
  });
  // Redirect after the alert has been dismissed
  window.location.href = "/cart"; // Replace with your desired redirect URL
}