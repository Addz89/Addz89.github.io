let currencySymbol = '$';

// Adds sounds to buttons
function soundAdd() {
    const audio = new Audio("src/images/ES_Duffle Bag Drop 1 - SFX Producer.mp3");
    audio.play()
}
function soundRemove() {
    const audio = new Audio("src/images/ES_Jar Remove Lid 2 - SFX Producer.mp3");
    audio.play()
}
function soundUp() {
    const audio = new Audio("src/images/ES_Gun Holster Remove 3 - SFX Producer.mp3");
    audio.play()
}
function soundDown() {
    const audio = new Audio("src/images/ES_Cigarette Remove - SFX Producer.mp3");
    audio.play()
}
function soundPay() {
    const audio = new Audio("src/images/ES_Coins Drop 1 - SFX Producer.mp3");
    audio.play()
}

// Draws product list
function drawProducts() {
    let productList = document.querySelector('.products');
    let productItems = '';
    products.forEach((element) => {
        if (element.productId > 100) {
        productItems += `
            <div class='Pc' data-productId='${element.productId}'>
                <img src='${element.image}' class='PartsImg'>
                <h3>${element.name}</h3>
                <p>price: ${currencySymbol}${element.price}</p>
                <button class='button'>Add to Cart</button>
            </div>
        `}})
    // use innerHTML so that products only drawn once
    productList.innerHTML = productItems;
}

function drawCards() {
    let productList = document.querySelector('.Container');
    let productItems = '';
    products.forEach((element) => {
        if (element.productId < 100) {
        productItems += `
            <div class='container' data-productId='${element.productId}'>
                <img src='${element.image}' class='PartsImg'>
                <h3>${element.name}</h3>
                <p>price: ${currencySymbol}${element.price}</p>
                <button class='button'>Add to Cart</button>
            </div>
        `}})
    // use innerHTML so that products only drawn once
    productList.innerHTML = productItems;
}

// Draws cart
function drawCart() {
    let cartList = document.querySelector('.cart');
    // clear cart before drawing
    let cartItems = '';
    cart.forEach((element) => {
        let itemTotal = element.price * element.quantity;

        cartItems += `
            <div data-productId='${element.productId}'>
                <h5>${element.name}</h5>
                <h6>price: ${currencySymbol}${element.price}</h6>
                <h6>quantity: ${element.quantity}</h6>
                <h6>total: ${currencySymbol}${itemTotal}</h6>
                <button onclick=soundUp() class="qup">+</button>
                <button onclick=soundDown() class="qdown">-</button>
                <button onclick=soundRemove() class="remove">remove</button>
            </div>
        `;
    });
    // use innerHTML so that cart products only drawn once
    cart.length
        ? (cartList.innerHTML = cartItems)
        : (cartList.innerHTML = 'No Items');
}

// Draws checkout
function drawCheckout() {
    let checkout = document.querySelector('.cart-total');
    checkout.innerHTML = '';

    // run cartTotal() from script.js
    let cartSum = cartTotal();
    let div = document.createElement('div');
    div.innerHTML = `<p>Cart Total: ${currencySymbol}${cartSum}`;
    checkout.append(div);
}

// Initialize store with products, cart, and checkout
drawCards();
drawProducts();
drawCart();
drawCheckout();

document.querySelector('.products').addEventListener('click', (e) => {
    let productId = e.target.parentNode.getAttribute('data-productId');
    productId *= 1;
    addProductToCart(productId);
    drawCart();
    drawCheckout();
});

document.querySelector('.Container').addEventListener('click', (e) => {
    let productId = e.target.parentNode.getAttribute('data-productId');
    productId *= 1;
    addProductToCart(productId);
    drawCart();
    drawCheckout();
});

// Event delegation used to support dynamically added cart items
document.querySelector('.cart').addEventListener('click', (e) => {
    // Helper nested higher order function to use below
    // Must be nested to have access to the event target
    // Takes in a cart function as an agrument
    function runCartFunction(fn) {
        let productId = e.target.parentNode.getAttribute('data-productId');
        productId *= 1;
        for (let i = cart.length - 1; i > -1; i--) {
            if (cart[i].productId === productId) {
                let productId = cart[i].productId;
                fn(productId);
            }
        }
        // force cart and checkout redraw after cart function completes
        drawCart();
        drawCheckout();
    }

    // check the target's class and run function based on class
    if (e.target.classList.contains('remove')) {
        // run removeProductFromCart() from script.js
        runCartFunction(removeProductFromCart);
    } else if (e.target.classList.contains('qup')) {
        // run increaseQuantity() from script.js
        runCartFunction(increaseQuantity);
    } else if (e.target.classList.contains('qdown')) {
        // run decreaseQuantity() from script.js
        runCartFunction(decreaseQuantity);
    }
});

document.querySelector('.pay').addEventListener('click', (e) => {
    e.preventDefault();

    // Get input cash received field value, set to number
    let amount = document.querySelector('.received').value;
    amount *= 1;

    // Set cashReturn to return value of pay()
    let cashReturn = pay(amount);

    let paymentSummary = document.querySelector('.pay-summary');
    let div = document.createElement('div');

    // If total cash received is greater than cart total thank customer
    // Else request additional funds
    if (cashReturn >= 0) {
        div.innerHTML = `
            <div class = 'receipt'>
            Cash Received: ${currencySymbol}${amount}<br>
            Cash Returned: ${currencySymbol}${cashReturn}<br>
            Thank you!<br>
            </div>
        `;
        emptyCart();
        drawCart();
        drawCheckout();
        total = 0;
    } else {
        // reset cash field for next entry
        document.querySelector('.received').value = '';
        div.innerHTML = `
            <div class = 'receipt'>
            <br>
            Cash Received: ${currencySymbol}${amount}<br>
            Remaining Balance: ${cashReturn}$<br>
            Please pay additional amount.<br>
            </div>
        `;
    }

    paymentSummary.append(div);
});

/* Removes all items from cart */
 function dropCart(){
     let shoppingCart = document.querySelector('.empty-btn');
     let div = document.createElement("button");
     div.classList.add("empty");
     div.innerHTML =`Empty Your Cart`;
     shoppingCart.append(div);
 }
 dropCart();

 document.querySelector('.empty-btn').addEventListener('click', (e) => {
     soundRemove();
     if (e.target.classList.contains('empty')){
         emptyCart();
         drawCart();
         drawCheckout();
     }
 })

/*Initializes currencies for currency converter */
function currencyBuilder(){
     let currencyPicker = document.querySelector('.currency-selector');
     let select = document.createElement("select");
     select.classList.add("currency-select");
     select.innerHTML = `<option value="USD">USD</option>
                         <option value="EUR">EUR</option>
                         <option value="YEN">YEN</option>`;
     currencyPicker.append(select);
 }
 currencyBuilder();

 document.querySelector('.currency-select').addEventListener('change', function handleChange(event) {
     switch(event.target.value){
         case 'EUR':
             currencySymbol = '€';
             break;
         case 'YEN':
             currencySymbol = '¥';
             break;
         default:
             currencySymbol = '$';
             break;
      }

     currency(event.target.value);
     drawProducts();
     drawCards()
     drawCart();
     drawCheckout();
 });

