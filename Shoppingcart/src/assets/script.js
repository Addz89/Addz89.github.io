"use strict";

const PRODUCTS = [
  { id: 96, name: "Segotep T1 Gaming PC Case", category: "Gaming case", basePrice: 1500, image: "src/images/pccase1.png", featured: true },
  { id: 95, name: "AMANSON ATX Gaming Case", category: "Gaming case", basePrice: 2500, image: "src/images/pccase2.png", featured: true },
  { id: 94, name: "KEDIERS PC ATX Tower", category: "Gaming case", basePrice: 3000, image: "src/images/pccase3.png", featured: true },
  { id: 93, name: "DistroCase Water Cooled", category: "Gaming build", basePrice: 3150, image: "src/images/pccase4.png", featured: true },
  { id: 101, name: "500GB Hard Drive", category: "Storage", basePrice: 100, image: "src/images/500gbharddrive.png" },
  { id: 102, name: "1TB Hard Drive", category: "Storage", basePrice: 120, image: "src/images/1tbharddrive.png" },
  { id: 103, name: "4TB Hard Drive", category: "Storage", basePrice: 175, image: "src/images/4tbharddrive.png" },
  { id: 104, name: "6TB Hard Drive", category: "Storage", basePrice: 200, image: "src/images/6tbharddrive.png" },
  { id: 105, name: "Razer Gaming Mouse", category: "Mouse", basePrice: 80, image: "src/images/Razermouse.png" },
  { id: 106, name: "Redragon Gaming Mouse", category: "Mouse", basePrice: 150, image: "src/images/reddragonmouse.jpg" },
  { id: 107, name: "Bengoo Gaming Mouse", category: "Mouse", basePrice: 180, image: "src/images/bengoomouse.jpg" },
  { id: 108, name: "Logitech Gaming Mouse", category: "Mouse", basePrice: 200, image: "src/images/gamingmouse.jpg" },
  { id: 109, name: "Gigabyte GeForce RTX 4060", category: "Graphics card", basePrice: 540, image: "src/images/graphicscard1.png" },
  { id: 110, name: "ASUS GeForce RTX 4070 Ti", category: "Graphics card", basePrice: 700, image: "src/images/graphicscard2.png" },
  { id: 111, name: "MSI GeForce RTX 4070 Ti", category: "Graphics card", basePrice: 800, image: "src/images/graphicscard3.png" },
  { id: 112, name: "MSI LGA1700 ATX Motherboard", category: "Motherboard", basePrice: 300, image: "src/images/motherboard1.jpg" },
  { id: 113, name: "Gigabyte B760 ATX Motherboard", category: "Motherboard", basePrice: 500, image: "src/images/motherboard2.jpg" }
];

const CURRENCIES = {
  AUD: { locale: "en-AU", currency: "AUD", symbol: "A$", rate: 1 },
  USD: { locale: "en-US", currency: "USD", symbol: "US$", rate: 0.66 },
  EUR: { locale: "en-IE", currency: "EUR", symbol: "€", rate: 0.61 },
  JPY: { locale: "ja-JP", currency: "JPY", symbol: "¥", rate: 101 }
};

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem("gaming-store-cart") || "{}");
    return saved && typeof saved === "object" ? saved : {};
  } catch {
    return {};
  }
}

const state = {
  currency: "AUD",
  cart: loadCart()
};

function saveCart() {
  try {
    localStorage.setItem("gaming-store-cart", JSON.stringify(state.cart));
  } catch {
    // The demo still works when storage is blocked.
  }
}

function getProduct(id) {
  return PRODUCTS.find((product) => product.id === Number(id));
}

function add(id) {
  if (!getProduct(id)) return;
  state.cart[id] = (Number(state.cart[id]) || 0) + 1;
  saveCart();
}

function changeQuantity(id, change) {
  if (!getProduct(id)) return;
  const next = (Number(state.cart[id]) || 0) + change;
  if (next <= 0) delete state.cart[id];
  else state.cart[id] = next;
  saveCart();
}

function remove(id) {
  delete state.cart[id];
  saveCart();
}

function empty() {
  state.cart = {};
  saveCart();
}

function cartItems() {
  return Object.entries(state.cart)
    .map(([id, quantity]) => ({ product: getProduct(id), quantity: Number(quantity) }))
    .filter((item) => item.product && item.quantity > 0);
}

function itemCount() {
  return cartItems().reduce((sum, item) => sum + item.quantity, 0);
}

function totalAUD() {
  return cartItems().reduce((sum, item) => sum + item.product.basePrice * item.quantity, 0);
}

function convertedValue(audValue) {
  return audValue * CURRENCIES[state.currency].rate;
}

function formatMoney(audValue) {
  const config = CURRENCIES[state.currency];
  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: config.currency,
    maximumFractionDigits: state.currency === "JPY" ? 0 : 2
  }).format(convertedValue(audValue));
}

window.StoreModel = {
  PRODUCTS,
  CURRENCIES,
  state,
  getProduct,
  add,
  changeQuantity,
  remove,
  empty,
  cartItems,
  itemCount,
  totalAUD,
  convertedValue,
  formatMoney
};
