const productsData = [
  {
    id: 1,
    name: "Torta Triple Chocolate",
    price: 80,
    category: "chocolate",
    img: "https://images.unsplash.com/photo-1578985545062-69928b1d9587"
  },
  {
    id: 2,
    name: "Torta de Fresa",
    price: 70,
    category: "frutales",
    img: "images/cakeStrawberryGrid.webp"
  },
  {
    id: 3,
    name: "Torta Oreo",
    price: 75,
    category: "especiales",
    img: "images/cakeOreo.webp"
  }
];

let customerName = "";
let customerAddress = "";
let paymentTypeSelected = "";

const WHATSAPP_NUMBER = "51936950012";
const YAPE_NUMBER = "936950012";
const PLIN_NUMBER = "999888777";

const productsContainer = document.getElementById("products");
const cartCount = document.getElementById("cartCount");
const cartModal = document.getElementById("cartModal");
const cartIcon = document.getElementById("cartIcon");
const cartItemsContainer = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartClose = document.querySelector(".cart-close");

let cart = JSON.parse(localStorage.getItem("cart")) || [];

const mapPlaceholder = document.getElementById("mapPlaceholder");

if (mapPlaceholder) {
  mapPlaceholder.addEventListener("click", () => {
    mapPlaceholder.innerHTML = `
      <iframe
        src="https://www.google.com/maps?q=Av+Principal+123+Lima+Peru&output=embed"
        width="100%"
        height="100%"
        style="border:0;"
        loading="lazy"
        allowfullscreen>
      </iframe>
    `;
  });
}

document.addEventListener("DOMContentLoaded", () => {
    renderProducts(productsData);
    updateCartCount();
    updateCheckoutButtons()
});

function renderProducts(list) {
  productsContainer.innerHTML = "";

  list.slice(0, 9).forEach(product => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <img src="${product.img}" alt="${product.name}">
      <div class="card-content">
        <h3>${product.name}</h3>
        <p class="price">S/ ${product.price}</p>
        <button class="add-btn">＋</button>
      </div>
    `;

    card.querySelector(".add-btn")
      .addEventListener("click", () => addToCart(product));

    productsContainer.appendChild(card);
  });
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  updateCheckoutButtons()
}

function updateCartCount() {
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  cartCount.innerText = totalItems;
}

function addToCart(product) {
  const existingProduct = cart.find(item => item.id === product.id);

  if (existingProduct) {
    existingProduct.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  saveCart();
}

function filter(category) {
  if (category === "all") {
    renderProducts(productsData);
  } else {
    renderProducts(productsData.filter(p => p.category === category));
  }
}

/* Abrir / Cerrar modal */
cartIcon.addEventListener("click", () => {
  renderCart();
  cartModal.style.display = "flex";
});

cartClose.addEventListener("click", () => {
  cartModal.style.display = "none";
});

window.addEventListener("click", e => {
  if (e.target === cartModal) {
    cartModal.style.display = "none";
  }
});

/* Abrir Modal de pago */
function openPaymentModal(type) {
  paymentTypeSelected = type;

  document.getElementById("customerStep").style.display = "block";
  document.getElementById("paymentStep").style.display = "none";

  document.getElementById("customerName").value = "";
  document.getElementById("customerAddress").value = "";

  document.getElementById("paymentModal").style.display = "flex";
}

/* Mostrar datos de pago (yape / plin) */
function showPaymentData(type) {
  const title = document.getElementById("paymentTitle");
  const number = document.getElementById("paymentNumber");
  const total = document.getElementById("paymentTotal");
  const qrImg = document.getElementById("paymentQR");

  const cartTotalValue = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  total.innerText = cartTotalValue.toFixed(2);

  if (type === "yape") {
    title.innerText = "💜 Pago con Yape";
    number.innerText = YAPE_NUMBER;
    qrImg.src = "../images/QRYape.jpeg"; // 👈 usa el archivo descargado
  } else {
    title.innerText = "💚 Pago con Plin";
    number.innerText = PLIN_NUMBER;
    qrImg.src = "qr_plin.png"; // 👈 usa el archivo descargado
  }
}

/* Cerrar modal de pago */
function closePaymentModal() {
  document.getElementById("paymentModal").style.display = "none";
}

/* Enviar comprobante por WhatsApp */
function sendPaymentProof() {
  if (cart.length === 0) {
    alert("El carrito está vacío");
    return;
  }

  if (!customerName || !customerAddress) {
    alert("Faltan datos del cliente");
    return;
  }

  const paymentConfirmed =
    document.getElementById("paymentConfirmed").checked;

  if (!paymentConfirmed) {
    alert("Debes confirmar que ya realizaste el pago");
    return;
  }

  const total = document.getElementById("paymentTotal").innerText;
  const operationCode =
    document.getElementById("operationCode").value.trim();

  let message = `✅ *COMPROBANTE DE PAGO*%0A%0A`;
  message += `👤 Cliente: ${customerName}%0A`;
  message += `📍 Dirección: ${customerAddress}%0A%0A`;
  message += `💳 Método: ${paymentTypeSelected.toUpperCase()}%0A`;
  message += `💰 Monto: S/ ${total}%0A`;

  if (operationCode) {
    message += `🔢 Código de operación: ${operationCode}%0A`;
  }

  message += `%0A📸 Adjunto comprobante de pago%0A`;
  message += `⏳ En espera de validación%0A`;
  message += `🙏 Gracias`;

  window.open(
    `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`,
    "_blank"
  );

  // ✅ Limpieza segura
  alert("✅ Pedido enviado. Validaremos tu pago y te confirmaremos pronto 🙌");
  clearCart();
  closePaymentModal();
  document.getElementById("cartModal").style.display = "none";
}

/* Render Carrito */
function renderCart() {
  cartItemsContainer.innerHTML = "";
  let total = 0;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = "<p>Tu carrito está vacío 😢</p>";
    cartTotal.innerText = "0";
    return;
  }

  cart.forEach(item => {
    total += item.price * item.quantity;

    const div = document.createElement("div");
    div.className = "cart-item";

    div.innerHTML = `
      <img src="${item.img}">
      <div class="cart-item-info">
        <strong>${item.name}</strong>
        <p>S/ ${item.price}</p>
      </div>
      <div class="cart-item-actions">
        <button onclick="changeQty(${item.id}, -1)">−</button>
        <span>${item.quantity}</span>
        <button onclick="changeQty(${item.id}, 1)">+</button>
      </div>
    `;

    cartItemsContainer.appendChild(div);
  });

  cartTotal.innerText = total.toFixed(2);

  updateCheckoutButtons();
}

/* Cambiar cantidad / eliminar  */
function changeQty(id, amount) {
  const product = cart.find(item => item.id === id);
  if (!product) return;

  product.quantity += amount;

  if (product.quantity <= 0) {
    cart = cart.filter(item => item.id !== id);
  }

  saveCart();
  renderCart();
}

/**Función para enviar pedido a whatsapp */
function sendToWhatsApp() {
  if (cart.length === 0) return;

  let message = "🎂 *NUEVO PEDIDO - DULCE TENTACIÓN* 🎂%0A%0A";
  let total = 0;

  cart.forEach(item => {
    message += `🧁 ${item.name}%0A`;
    message += `   Cantidad: ${item.quantity}%0A`;
    message += `   Precio: S/ ${item.price}%0A%0A`;
    total += item.price * item.quantity;
  });

  message += `👤 Cliente: ${customerName || "No especificado"}%0A`;
  message += `📍 Dirección: ${customerAddress || "No especificada"}%0A%0A`;
  message += `💰 *TOTAL: S/ ${total.toFixed(2)}*%0A%0A`;
  message += "🙏 Gracias por su preferencia";

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
  window.open(url, "_blank");

  // ✅ LIMPIAR CARRITO
  clearCart();
  closePaymentModal();
  document.getElementById("cartModal").style.display = "none";
}

/* Validar datos antes de pagar */
function validateCustomerData() {
  const nameInput = document.getElementById("customerName").value.trim();
  const addressInput = document.getElementById("customerAddress").value.trim();

  if (!nameInput || !addressInput) {
    alert("Por favor completa tu nombre y dirección 🙏");
    return;
  }

  customerName = nameInput;
  customerAddress = addressInput;

  document.getElementById("customerStep").style.display = "none";
  document.getElementById("paymentStep").style.display = "block";

  showPaymentData(paymentTypeSelected);
}

/* Actualizar boton de pago */
function updateCheckoutButtons() {
  const checkoutBtn = document.getElementById("checkoutBtn");
  const yapeBtn = document.getElementById("yapeBtn");
  const plinBtn = document.getElementById("plinBtn");

  const isCartEmpty = cart.length === 0;

  checkoutBtn.disabled = isCartEmpty;
  yapeBtn.disabled = isCartEmpty;
  plinBtn.disabled = isCartEmpty;
}

// Clear cart || Limpiar carrito
function clearCart() {
  cart = [];
  localStorage.removeItem("cart");
  updateCartCount();
  updateCheckoutButtons();
  renderCart();
}

/* CARRUSEL */
const slides = document.querySelectorAll(".hero img");
let index = 0;

setInterval(() => {
    slides[index].style.opacity = 0;
    index = (index + 1) % slides.length;
    slides[index].style.opacity = 1;
}, 4000);

renderProducts(productsData)