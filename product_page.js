var cart = [];
var promo = {};
var pricing = {};
var Shoe = function (name, style, color, size, price, image, altImage, count, totalPrice) {
  this.name = name;
  this.style = style;
  this.image = image;
  this.alt = altImage;
  this.color = color;
  this.size = size;
  this.price = price;
  this.count = count;
  this.totalPrice = totalPrice;
};
var pricing = {};
var hasPromo;

var subtotal = document.getElementById('subtotal');

var cartLink = document.getElementById('cart-link');
var cartSection = document.getElementById('shopping-cart');
var footer = document.getElementById('footer');
var prodSection = document.getElementById('product-section');
var promotion = document.querySelector('.promo-input');
var invalid = document.getElementById('invalid');
var onePromo = document.getElementById('one-promo');
var original = document.getElementById('original-price');
var tax = document.getElementById('tax');
var total = document.getElementById('total');
var sections = [cartSection, prodSection, footer];

// Event Listeners
var shoes = document.querySelectorAll('.add-cart-button');
for (var i = 0; i < shoes.length; i++) {
  shoes[i].addEventListener('click', function (event) {
    var sizeSelected = document.querySelector('input:checked');
    var styleNode = sizeSelected.parentNode.parentNode.nextSibling.nextSibling;
    var imageNode = sizeSelected.parentNode.parentNode.previousSibling.previousSibling;
    var colorNode = styleNode.nextSibling.nextSibling;
    var priceNode = colorNode.nextSibling.nextSibling;

    var size = sizeSelected.value;
    var name = styleNode.innerHTML;
    var style = styleNode.getAttribute('data-style');
    var image = imageNode.src;
    var color = colorNode.innerHTML.split(':')[1];
    var price = priceNode.innerHTML.split('$')[1];
    var altImage = imageNode.alt;
    var totalPrice;
    event.preventDefault();

    addItemToCart(name, style, color, size, price, image, altImage, 1);
    totalCost();
    displayCart();
  });
}

document.querySelector('.clear-cart').addEventListener('click', function (event) {
  clearCart();
  displayCart();
  event.preventDefault();
});

cartLink.addEventListener('click', function (event) {
  var emptyCart = document.getElementById('emptyCart');
  if (cart.length === 0) {
    emptyCart.setAttribute('class', 'empty-cart');
    return;
  } else {
    for (var i = 0; i < sections.length; i++) {
      emptyCart.setAttribute('class', 'hide-element');
      if (sections[i].getAttribute('class').match('hide-section')) {
        sections[i].setAttribute('class', 'show-section, ' + sections[i].getAttribute('id'))
      } else {
        sections[i].setAttribute('class', 'hide-section');
      }
    }
  }

  event.preventDefault();
});

//Functions
function addItemToCart(name, style, color, size, price, image, altImage, count) {
  //check if item in cart already exist and if it does than just increase the count of the item
  for (var i in cart) {
    if (cart[i].name === name && cart[i].size === size) {
      cart[i].count++;
      saveCart();
      checkForPromoCode();
      return;
    }
  }

  //if the item does not exit then add a new item to the cart
  var item = new Shoe(name, style, color, size, price, image, altImage, count);
  cart.push(item);
  checkForPromoCode();
  saveCart();
}

function displayCart() {
  var cartArray = listCart();
  var output = '';
  var table = document.querySelector('table');
  var heading = '<tr class="table-heading" id="table-header">' +
      '<th class="product">Product</th>' +
      '<th class="description">Description</th>' +
      '<th class="quantity">Quantity</th>' +
      '<th class="unit-price">Price</th>' +
      '<th class="remove">Remove</th>' +
    '</tr>';

  for (var i in cart) {
    output += '<tr><td><img src =' + cart[i].image + ' alt=' + cart[i].altImage +
      ' class="product-image"></td><td class="description"><p>' +
      cart[i].name + '</p> <p>Color: ' + cart[i].color + '</p> <p>Size: ' +
      cart[i].size + '</p></td>';
    output += '<td class="units"><button class="subtract" onClick="subtractItem()" data-name="' + cart[i].name +
    '" data-size="' + cart[i].size + '">-</button>';
    output += '<input type="text" class="cart-count" value="' + cart[i].count + '">';
    output += '<button class="add" onClick="addItem()" data-name="' + cart[i].name +
    '" data-size="' + cart[i].size + '">+</button></td>';
    output += '<td><p class="hide-node" id="original-price">' + (cart[i].price * cart[i].count).toFixed(2) + '</p>';
    output += '<p class="unit-price">' + cart[i].totalPrice.toFixed(2) + '</p></td>';
    output += '<td class="remove">' +
     '<button id="delete-item" onClick="getInfo()" data-name="' + cart[i].name + '"' +
     'data-size="' + cart[i].size + '">Remove</button></td></tr>';
  }

  table.innerHTML = heading;
  table.innerHTML += output;
  subtotal.innerHTML = '$' + totalCost();
  tax.innerHTML = '$' + pricing.tax;
  total.innerHTML = '$' + pricing.total;

  var original = document.querySelectorAll('.hide-node');
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].promo === true) {
      original[i].setAttribute('class', 'original-price');
    } else {
      original[i].setAttribute('class', 'hide-node');
    }
  }
}

function getInfo() {
  var deleteItem = event.target;
  var name = deleteItem.getAttribute('data-name');
  var size = deleteItem.getAttribute('data-size');
  removeItemFromCartAll(name, size);
  displayCart();
}

function subtractItem() {
  var subtractItem = event.target;
  var name = subtractItem.getAttribute('data-name');
  var size = subtractItem.getAttribute('data-size');

  removeItemFromCart(name, size);
  checkForPromoCode();
}

function addItem() {
  var addItem = event.target;
  var name = addItem.getAttribute('data-name');
  var size = addItem.getAttribute('data-size');
  addItemToCart(name, '', '', size, 0, '', '', 1);
  checkForPromoCode();
}

function removeItemFromCart(name, size) {
  for (var i in cart) {
    if (cart[i].name === name && cart[i].size === size) {
      cart[i].count--;
      if (cart[i].count === 0) {
        cart.splice(i, 1);
        promo.hasPromo = false;
        break;
      }
    }
  }

  if (promo.hasPromo) {
    addPromo();
  }

  saveCart();
}

//Removes entire item from cart
function removeItemFromCartAll(name, size) {
  for (var i in cart) {
    if (cart[i].name === name && cart[i].size === size) {
      cart.splice(i, 1);
      promo.hasPromo = false;
      break;
    }
  }

  if (promo.hasPromo) {
    addPromo();
  }

  saveCart();
}

function clearCart() {
  cart = [];
  promo = {};
  removePromo();
  saveCart();
}

// Tell me how many items in total a user has in their cart and return total count
function countCart() {
  var totalCount = 0;
  for (var i in cart) {
    totalCount += cart[i].count;
  }

  return totalCount;
}

// This will return the total cost of the cart
function totalCost() {
  var totalCost = 0;
  for (var i in cart) {
    if (cart[i].promo) {
      totalCost += cart[i].totalPrice;
    } else {
      cart[i].totalPrice = (cart[i].count * cart[i].price);
      totalCost += cart[i].totalPrice;
    }
  }

  pricing.subtotal = totalCost.toFixed(2);
  pricing.tax = (totalCost * (6 / 100)).toFixed(2);
  pricing.shipping = (5).toFixed(2);
  pricing.total = (Number(pricing.subtotal) + Number(pricing.tax) +
    Number(pricing.shipping)).toFixed(2);
  saveCart();
  return totalCost.toFixed(2);
}

function removePromo() {
  promotion.value = '';
  invalid.setAttribute('class', 'hide-element');
  onePromo.setAttribute('class', 'hide-element');

}

function addPromo() {
  var invalid = document.getElementById('invalid');
  var onePromo = document.getElementById('one-promo');

  //promo for one items
  if (promo.hasPromo) {
    onePromo.setAttribute('class', 'one-code');
    return;
  }

  if (promotion.value === 'shopsale') {
    promo.hasPromo = true;
    promo.value = promotion.value;
  } else if (promotion.value === 'heelsale') {
    promo.hasPromo = true;
    promo.value = promotion.value;
  } else if (promotion.value === 'holiday') {
    promo.hasPromo = true;
    promo.value = promotion.value;
  } else {
    invalid.setAttribute('class', 'invalid-code');
  }

  onePromo.setAttribute('class', 'hide-element');
  saveCart();
  checkForPromoCode();
}

function checkForPromoCode() {
  var discount;
  for (var i in cart) {
    cart[i].promo = false;
  }

  if (promo.value === 'shopsale') {
    discount = 10 / 100;
    oneItemPromo(discount);
  } else if (promo.value === 'heelsale') {
    discount = 15 / 100;
    oneTypePromo(discount);
  } else if (promo.value === 'holiday') {
    discount = 5 / 100;
    totalOrderPromo(discount);
  }

  totalCost();
  displayCart();
  saveCart();
}

// Promotion Functions
function oneItemPromo(discount) {
  var cost;
  var maxPrice = Math.max.apply(Math, cart.map(function (obj) {
    return obj.price;
  }));

  var highestItem = cart.find(function (o) {
    return o.price == maxPrice;
  });

  cost = ((maxPrice * (1 - discount)) + ((highestItem.count - 1) * highestItem.price));
  highestItem.totalPrice = cost;
  highestItem.promo = true;
  pricing.promo = '.10';
  invalid.setAttribute('class', 'hide-element');
}

function oneTypePromo(discount) {
  var cost;
  for (var i = 0; i < cart.length; i++) {
    if (cart[i].style === 'heels') {
      cost = ((cart[i].price * (1 - discount)) * cart[i].count);
      cart[i].promo = true;
      cart[i].totalPrice = cost;
    }
  }

  invalid.setAttribute('class', 'hide-element');
}

function totalOrderPromo(discount) {
  var cost;
  for (var i = 0; i < cart.length; i++) {
    cost = ((cart[i].price * (1 - discount)) * cart[i].count);
    cart[i].promo = true;
    cart[i].totalPrice = cost;
  }

  invalid.setAttribute('class', 'hide-element');
}

//-> array of item
function listCart() {
  var cartCopy = [];
  for (var i in cart) {
    var item = cart[i];
    var itemCopy = {};
    for (var k in item) {
      itemCopy[k] = item[k];
    }
    itemCopy.totalPrice = (item.price * item.count).toFixed(2);
    cartCopy.push(itemCopy);
  }

  return cartCopy;
}

//Allow the items in the cart to persist even when you change pages.
//use local storage to save info in cart
function saveCart() {
  localStorage.setItem('shopping-cart', JSON.stringify(cart));
  localStorage.setItem('promo', JSON.stringify(promo));
}

//load cart info from local storage
function loadCart() {
  cart = JSON.parse(localStorage.getItem('shopping-cart')) || [];
  promo = JSON.parse(localStorage.getItem('promo')) || {};
}

loadCart();
checkForPromoCode();
displayCart();
