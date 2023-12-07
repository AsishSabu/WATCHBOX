// addTowishlist ajax function
function toggleWishlist(productId) {
  const wishlistMessage = document.getElementById("wishlist-message");
  const fixedDiv = document.getElementById("fixed-div");
 const wishlist = document.querySelector(".wishlist");
//   const wishlistAnimate = document.querySelector(".icon-wishlist");
  function hide() {
    fixedDiv.style.display = "none";
  }

  $.ajax({
    type: "GET",
    url: `/addTo-wishlist/${productId}`,
    success: function (response) {
      if (response.success) {
        fixedDiv.style.display = "block";
        fixedDiv.style.color = "red";
        fixedDiv.style.backgroundColor = "green";
        wishlistMessage.innerText = response.message;
        wishlist.style.backgroundColor = "red";
        // wishlistAnimate.classList.toggle("added");
        // setTimeout(function () {
        //   hide();
        //   wishlistAnimate.classList.remove("added");
        // }, 3000);
      } else {
        fixedDiv.style.color = "";
        fixedDiv.style.display = "block";
        fixedDiv.style.backgroundColor = "red";
        wishlistMessage.innerText = response.message;
         wishlist.style.backgroundColor = "white";;
        setTimeout(hide, 3000);
      }
    },
    error: function (textStatus, errorThrown) {
      console.log(
        "Error in sending addtowishlist request",
        textStatus,
        errorThrown
      );
    },
  });
}
