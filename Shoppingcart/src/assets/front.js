"use strict";

const store = window.StoreModel;

const ui = {
  featured: document.querySelector("[data-featured-products]"),
  parts: document.querySelector("[data-parts-products]"),
  cartItems: document.querySelector("[data-cart-items]"),
  cartCount: document.querySelector("[data-cart-count]"),
  summaryCount: document.querySelector("[data-summary-count]"),
  total: document.querySelector("[data-cart-total]"),
  productTotal: document.querySelector("[data-product-total]"),
  currency: document.querySelector("[data-currency]"),
  currencySymbol: document.querySelector("[data-currency-symbol]"),
  emptyButton: document.querySelector("[data-empty-cart]"),
  cartJump: document.querySelector("[data-cart-jump]"),
  checkoutForm: document.querySelector("[data-checkout-form]"),
  cashReceived: document.querySelector("[data-cash-received]"),
  receipt: document.querySelector("[data-receipt]"),
  toast: document.querySelector("[data-toast]"),
  year: document.querySelector("[data-store-year]"),
  header: document.querySelector("[data-store-header]")
};

let toastTimer;

function safeSound(filename) {
  try {
    const audio = new Audio(`src/images/${filename}`);
    audio.volume = 0.28;
    audio.play().catch(() => {});
  } catch {
    // Sound is an optional enhancement.
  }
}

function showToast(message) {
  if (!ui.toast) return;
  ui.toast.textContent = message;
  ui.toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => ui.toast.classList.remove("is-visible"), 1800);
}

function productCard(product) {
  return `
    <article class="product-card">
      <div class="product-card__image">
        <span>${product.category}</span>
        <img src="${product.image}" alt="${product.name}" loading="lazy">
      </div>
      <div class="product-card__body">
        <h3>${product.name}</h3>
        <div class="product-card__price">${store.formatMoney(product.basePrice)}</div>
        <button class="add-button" type="button" data-add-product="${product.id}">
          <i class="bx bx-cart-add" aria-hidden="true"></i> Add to cart
        </button>
      </div>
    </article>`;
}

function renderProducts() {
  const featured = store.PRODUCTS.filter((product) => product.featured);
  const parts = store.PRODUCTS.filter((product) => !product.featured);
  ui.featured.innerHTML = featured.map(productCard).join("");
  ui.parts.innerHTML = parts.map(productCard).join("");
  ui.productTotal.textContent = `${store.PRODUCTS.length} products`;
}

function cartItemMarkup({ product, quantity }) {
  return `
    <article class="cart-item" data-cart-item="${product.id}">
      <img src="${product.image}" alt="" loading="lazy">
      <div class="cart-item__copy">
        <h3 title="${product.name}">${product.name}</h3>
        <span>${store.formatMoney(product.basePrice * quantity)}</span>
        <div class="quantity-control" aria-label="Quantity controls for ${product.name}">
          <button type="button" data-quantity-change="-1" aria-label="Decrease quantity"><i class="bx bx-minus"></i></button>
          <span>${quantity}</span>
          <button type="button" data-quantity-change="1" aria-label="Increase quantity"><i class="bx bx-plus"></i></button>
        </div>
      </div>
      <button class="remove-item" type="button" data-remove-product aria-label="Remove ${product.name}"><i class="bx bx-x"></i></button>
    </article>`;
}

function clearReceipt() {
  if (!ui.receipt) return;
  ui.receipt.hidden = true;
  ui.receipt.classList.remove("is-error");
  ui.receipt.textContent = "";
}

function renderCart() {
  const items = store.cartItems();
  const count = store.itemCount();
  const total = store.formatMoney(store.totalAUD());

  ui.cartCount.textContent = count;
  ui.summaryCount.textContent = count;
  ui.total.textContent = total;
  ui.emptyButton.disabled = count === 0;
  ui.checkoutForm.querySelector("button").disabled = count === 0;

  ui.cartItems.innerHTML = items.length
    ? items.map(cartItemMarkup).join("")
    : `<div class="empty-cart"><i class="bx bx-cart"></i><strong>Your cart is empty</strong><span>Add a product to start the demo.</span></div>`;
}

function renderAll() {
  renderProducts();
  renderCart();
  const config = store.CURRENCIES[store.state.currency];
  ui.currencySymbol.textContent = config.symbol;
  clearReceipt();
}

function handleProductClick(event) {
  const button = event.target.closest("[data-add-product]");
  if (!button) return;
  const product = store.getProduct(button.dataset.addProduct);
  if (!product) return;
  store.add(product.id);
  safeSound("ES_Duffle Bag Drop 1 - SFX Producer.mp3");
  renderCart();
  clearReceipt();
  showToast(`${product.name} added to cart`);
}

ui.featured.addEventListener("click", handleProductClick);
ui.parts.addEventListener("click", handleProductClick);

ui.cartItems.addEventListener("click", (event) => {
  const item = event.target.closest("[data-cart-item]");
  if (!item) return;
  const id = Number(item.dataset.cartItem);

  const quantityButton = event.target.closest("[data-quantity-change]");
  if (quantityButton) {
    const change = Number(quantityButton.dataset.quantityChange);
    store.changeQuantity(id, change);
    safeSound(change > 0 ? "ES_Gun Holster Remove 3 - SFX Producer.mp3" : "ES_Cigarette Remove - SFX Producer.mp3");
    renderCart();
    clearReceipt();
    return;
  }

  if (event.target.closest("[data-remove-product]")) {
    const product = store.getProduct(id);
    store.remove(id);
    safeSound("ES_Jar Remove Lid 2 - SFX Producer.mp3");
    renderCart();
    clearReceipt();
    showToast(`${product?.name || "Item"} removed`);
  }
});

ui.emptyButton.addEventListener("click", () => {
  if (!store.itemCount()) return;
  store.empty();
  safeSound("ES_Jar Remove Lid 2 - SFX Producer.mp3");
  renderCart();
  clearReceipt();
  showToast("Cart emptied");
});

ui.currency.addEventListener("change", (event) => {
  store.state.currency = event.target.value;
  renderAll();
  showToast(`Display changed to ${event.target.value}`);
});

ui.cartJump.addEventListener("click", () => {
  document.querySelector("#cart")?.scrollIntoView({ behavior: "smooth", block: "start" });
});

ui.checkoutForm.addEventListener("submit", (event) => {
  event.preventDefault();
  clearReceipt();

  const total = store.convertedValue(store.totalAUD());
  const received = Number(ui.cashReceived.value);
  const formatter = new Intl.NumberFormat(store.CURRENCIES[store.state.currency].locale, {
    style: "currency",
    currency: store.CURRENCIES[store.state.currency].currency,
    maximumFractionDigits: store.state.currency === "JPY" ? 0 : 2
  });

  ui.receipt.hidden = false;

  if (!Number.isFinite(received) || received <= 0) {
    ui.receipt.classList.add("is-error");
    ui.receipt.textContent = "Enter a valid cash amount to continue.";
    return;
  }

  if (received < total) {
    ui.receipt.classList.add("is-error");
    ui.receipt.innerHTML = `<strong>More payment needed.</strong><br>Remaining balance: ${formatter.format(total - received)}`;
    return;
  }

  ui.receipt.innerHTML = `<strong>Demo sale complete.</strong><br>Received: ${formatter.format(received)}<br>Change: ${formatter.format(received - total)}`;
  safeSound("ES_Coins Drop 1 - SFX Producer.mp3");
  store.empty();
  ui.cashReceived.value = "";
  renderCart();
  showToast("Demo checkout completed");
});

window.addEventListener("scroll", () => {
  ui.header?.classList.toggle("is-scrolled", window.scrollY > 12);
}, { passive: true });

ui.year.textContent = new Date().getFullYear();
renderAll();
