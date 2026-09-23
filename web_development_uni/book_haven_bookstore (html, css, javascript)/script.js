document.addEventListener("DOMContentLoaded", () => {

  // ===== ADD TO CART =====
  const addToCartButtons = document.querySelectorAll(".book-card button", ".gallery-card button");
  addToCartButtons.forEach(button => {
    button.addEventListener("click", () => {

      // Find the closest .book-card container
      let bookCard = button.closest(".book-card", ".gallery-card");

      // Fallback: if not found, try parentElement loop
      if (!bookCard) {
        let el = button.parentElement;
        while (el && !el.classList.contains("book-card")) {
          el = el.parentElement;
        }
        bookCard = el;
      }

      if (!bookCard) {
        console.error("Could not find .book-card for this button");
        return;
      }

      // Use the h3 text as the item title
      const titleElem = bookCard.querySelector("h3");
      const itemTitle = titleElem ? titleElem.textContent : "Unknown Item";

      // Save to sessionStorage
      let cartItems = JSON.parse(sessionStorage.getItem("cartItems")) || [];
      cartItems.push(itemTitle);
      sessionStorage.setItem("cartItems", JSON.stringify(cartItems));

      alert(`${itemTitle} added.`);

      // If modal exists and is visible, update it immediately
      const cartItemsDiv = document.querySelector("#cartItems");
      if (cartItemsDiv) {
        cartItemsDiv.innerHTML = JSON.parse(sessionStorage.getItem("cartItems"))
          .map(title => `<p>${title}</p>`).join("");
      }

    });
  });

  // ===== VIEW CART MODAL =====
  const viewCartButton = document.querySelector(".view-cart");
  if (viewCartButton) {
    const cartModal = document.createElement("div");
    cartModal.id = "cartModal";
    cartModal.style.position = "fixed";
    cartModal.style.top = "50%";
    cartModal.style.left = "50%";
    cartModal.style.transform = "translate(-50%, -50%)";
    cartModal.style.backgroundColor = "white";
    cartModal.style.border = "2px solid #000";
    cartModal.style.padding = "20px";
    cartModal.style.zIndex = "1000";
    cartModal.style.display = "none";
    cartModal.style.width = "300px";
    cartModal.style.textAlign = "center";
    cartModal.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)";
    cartModal.innerHTML = `
      <h2>Your Cart</h2>
      <div id="cartItems"><p>No items yet</p></div>
      <button id="clearCart">Clear Cart</button>
      <button id="processOrder">Process Order</button>
      <button id="closeModal" style="margin-top:10px;">Close</button>
    `;
    document.body.appendChild(cartModal);

    const cartItemsDiv = cartModal.querySelector("#cartItems");
    const clearButton = cartModal.querySelector("#clearCart");
    const processButton = cartModal.querySelector("#processOrder");
    const closeButton = cartModal.querySelector("#closeModal");

    function updateCartModal() {
      let cartItems = JSON.parse(sessionStorage.getItem("cartItems")) || [];
      if (cartItems.length === 0) {
        cartItemsDiv.innerHTML = "<p>No items yet</p>";
      } else {
        cartItemsDiv.innerHTML = cartItems.map(title => `<p>${title}</p>`).join("");
      }
    }

    clearButton.addEventListener("click", () => {
      sessionStorage.removeItem("cartItems");
      updateCartModal();
      alert("Cart cleared.");
    });

    processButton.addEventListener("click", () => {
      sessionStorage.removeItem("cartItems");
      updateCartModal();
      alert("Thank you for your order.");
    });

    closeButton.addEventListener("click", (e) => {
      e.stopPropagation();
      cartModal.style.display = "none";
    });

    viewCartButton.addEventListener("click", () => {
      updateCartModal();
      cartModal.style.display = "block";
    });
  }

  // ===== CONTACT / CUSTOM ORDER FORM =====
  const contactForm = document.querySelector(".contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", e => {
      e.preventDefault();

      const formData = {};
      contactForm.querySelectorAll("input, textarea").forEach(input => {
        formData[input.name] = input.value;
      });

      // Save to localStorage
      let previousOrders = JSON.parse(localStorage.getItem("customOrders")) || [];
      previousOrders.push(formData);
      localStorage.setItem("customOrders", JSON.stringify(previousOrders));

      alert("Thank you for your message.");
      contactForm.reset();
    });
  }

});

  // ===== SUBSCRIBE FROM IN THE FOOTER =====

document.addEventListener("DOMContentLoaded", () => {
  // Select the newsletter form
  const newsletterForm = document.querySelector("footer .newsletter form");

  if (newsletterForm) {
    newsletterForm.addEventListener("submit", e => {
      e.preventDefault();                // Prevent the page from reloading
      alert("Thank you for subscribing!");  // Show alert
      newsletterForm.reset();            // Clear the input
    });
  }
});