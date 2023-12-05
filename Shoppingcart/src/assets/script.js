/* An array that assigns values and creates products on site */
const products = [
  {
    name: '500gb HDD',
    price: 100,
    quantity: 0,
    productId: 101,
    basePrice: 100,
    image: "images/500gbharddrive.jpg"
  },
  {
    name: "1 Tb Hard Drive",
    price: 120,
    quantity: 0,
    productId: 102,
    basePrice: 120,
    image: "src/images/1tbharddrive.jpg"
  },
  {
    name: "4 Tb Hard Drive",
    price: 175,
    quantity: 0,
    productId: 103,
    basePrice: 175,
    image: "src/images/4tbharddrive.jpg"
  },
  {
    name: "6 Tb Hard Drive",
    price: 200,
    quantity: 0,
    productId: 104,
    basePrice: 200,
    image: "src/images/6tbharddrive.jpg"
  },
  {
    name: "Razer Mouse",
    price: 80,
    quantity: 0,
    productId: 105,
    basePrice: 80,
    image: "src/images/Razermouse.jpg"
  },
  { 
    name: "Dragon Gaming Mouse",
    price: 150,
    quantity: 0,
    productId: 106,
    basePrice: 150,
    image: "src/images/reddragonmouse.jpg"
  },
  { 
    name: "Bengoo Mouse",
    price: 180,
    quantity: 0,
    productId: 107,
    basePrice: 180,
    image: "src/images/bengoomouse.jpg"
  },
  {
    name: "Logitech Mouse",
    price: 200,
    quantity: 0,
    productId: 108,
    basePrice: 200,
    image: "src/images/gamingmouse.jpg"
  },
  {
    name: "GIGABYTE GeForce RTX 4060",
    price: 540,
    quantity: 0,
    productId: 109,
    basePrice: 540,
    image: "src/images/graphicscard1.jpg"
  },
  {
    name: "ASUS NVIDIA GeForce RTX 4070 Ti",
    price: 700,
    quantity: 0,
    productId: 110,
    basePrice: 700,
    image: "src/images/graphicscard2.jpg"
  },
  {
    name: "MSI NVIDIA GeForce RTX 4070 Ti",
    price: 800,
    quantity: 0,
    productId: 111,
    basePrice: 800,
    image: "src/images/graphicscard3.jpg"
  },
  {
    name: "MSI LGA1700 ATX Motherboard",
    price: 300,
    quantity: 0,
    productId: 112,
    basePrice: 300,
    image: "src/images/motherboard1.jpg"
  },
  {
    name: "Gigabyte B760 1700 ATX Motherboard",
    price: 500,
    quantity: 0,
    productId: 113,
    basePrice: 500,
    image: "src/images/motherboard2.jpg"
  },
  {   
    name: "Segotep T1 Gaming PC Case",
    price: 1500,
    quantity: 0,
    productId: 96,
    basePrice: 1500,
    image: "src/images/pccase1.jpg"
  },
  {
    name: "AMANSON ATX Gaming Case",
    price: 2500,
    quantity: 0,
    productId: 95,
    basePrice: 2500,
    image: "src/images/pccase2.jpg"
  },
  {
    name: "KEDIERS PC ATX Tower",
    price: 3000,
    quantity: 0,
    productId: 94,
    basePrice: 3000,
    image: "src/images/pccase3.jpg"
  },
  {
    name: "DistroCase Water Cooled",
    price: 3150,
    quantity: 0,
    productId: 93,
    basePrice: 3150,
    image: "src/images/pccase4.jpg"
  }
]
// Function to get product by productId
function productById(productId) {
  for (let index = 0; index < products.length; ++index) {
    if (productId === products[index].productId) {
      return products[index]
    }
  }
}
/* Declares an empty array named cart to hold the items in the cart */
let cart = [];
/* Creates a function named addProductToCart that takes in the product productId as an argument
  - addProductToCart should get the correct product based on the productId
  - addProductToCart should then increase the product's quantity
  - if the product is not already in the cart, add it to the cart
*/
function addProductToCart(productId) {
  for (let index = 0; index < products.length; ++index) {
    if (productId === products[index].productId) {
      if (cart.includes(products[index]) === false) {
        cart.push(products[index]);
        ++productById(productId).quantity;
        soundAdd();
    } else if (cart.includes(products[index]) === true) {
      ++productById(productId).quantity;
      soundAdd();
    }
  }
}
}
/* Creates a function named increaseQuantity that takes in the productId as an argument
  - increaseQuantity should get the correct product based on the productId
  - increaseQuantity should then increase the product's quantity
*/
function increaseQuantity(productId) {
  ++productById(productId).quantity;
}
/* Creates a function named decreaseQuantity that takes in the productId as an argument
  - decreaseQuantity should get the correct product based on the productId
  - decreaseQuantity should decrease the quantity of the product
  - if the function decreases the quantity to 0, the product is removed from the cart
*/
function decreaseQuantity(productId) {
  if (productById(productId).quantity > 1) {
    --productById(productId).quantity;
  } else if (productById(productId).quantity === 1) {
    removeProductFromCart(productId);
  }
}
/* Creates a function named removeProductFromCart that takes in the productId as an argument
  - removeProductFromCart should get the correct product based on the productId
  - removeProductFromCart should update the product quantity to 0
  - removeProductFromCart should remove the product from the cart
*/
function removeProductFromCart(productId) {
  productById(productId).quantity = 0;
  (productById(productId).quantity < 1 ? cart.splice(cart.indexOf(productById(productId)), 1) : null);
}
/* Creates a function named cartTotal that has no parameters
  - cartTotal should iterate through the cart to get the total of all products
  - cartTotal should return the sum of the products in the cart
*/
function cartTotal() {
  let total = 0;
  cart.forEach((item) => {
    total += (item.price * item.quantity);
  }); return total;
}
/* Creates a function called emptyCart that empties the products from the cart */
function emptyCart() {
  for (let index = 0; index < cart.length; ++index) {
    cart[index].quantity = 0;
  }
  cart.splice(0, cart.length - 1);
  cart = [];
}
/* Creates a function named pay that takes in an amount as an argument*/
let total = 0

let pay = function pay(amount) {
  total += amount;
  let newTotal = (total - cartTotal());
  return newTotal;
}
/* Currency converter*/
function currency() {
  let USD = 1.000;
  let EUR = 0.9965;
  let YEN = 143.1875;
  for (let index = 0; index < products.length; ++index) {
    if (currencySymbol === '$') {
      products[index].price = (USD * products[index].basePrice).toFixed(2);
    } else if (currencySymbol === '€') {
      products[index].price = (EUR * products[index].basePrice).toFixed(2);
    } else if (currencySymbol === '¥') {
      products[index].price = (YEN * products[index].basePrice).toFixed(2);
    };
  }
}
/* The following is for running unit tests. 
   To fully complete this project, it is expected that all tests pass.
   Run the following command in terminal to run tests
   npm run test
*/
module.exports = {
  products,
  cart,
  addProductToCart,
  increaseQuantity,
  decreaseQuantity,
  removeProductFromCart,
  cartTotal,
  pay, 
  emptyCart,
  total,
  currency
}