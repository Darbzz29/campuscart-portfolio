const catalog = [
  {
    id: "milk",
    name: "Milk",
    category: "Essentials",
    price: 60,
    unit: "1 litre pack",
    label: "ML",
    description: "A quick breakfast staple for cereal, tea, and hostel coffee runs.",
    color: "linear-gradient(135deg, #21664b, #3f9470)"
  },
  {
    id: "bread",
    name: "Bread",
    category: "Essentials",
    price: 40,
    unit: "400 gram loaf",
    label: "BR",
    description: "Reliable sandwich filler that works for rushed mornings and late study sessions.",
    color: "linear-gradient(135deg, #9f3f1d, #d1642f)"
  },
  {
    id: "eggs",
    name: "Eggs",
    category: "Essentials",
    price: 45,
    unit: "6 pack",
    label: "EG",
    description: "Affordable protein that keeps the weekly meal plan practical.",
    color: "linear-gradient(135deg, #8d5d19, #d8a03d)"
  },
  {
    id: "rice",
    name: "Rice",
    category: "Essentials",
    price: 80,
    unit: "1 kilogram bag",
    label: "RC",
    description: "A filling base ingredient for simple student lunches and dinners.",
    color: "linear-gradient(135deg, #4b5c78, #6c8caf)"
  },
  {
    id: "dal",
    name: "Dal",
    category: "Essentials",
    price: 70,
    unit: "500 gram pack",
    label: "DL",
    description: "Budget friendly pantry ingredient that stretches across multiple meals.",
    color: "linear-gradient(135deg, #8a6534, #c99648)"
  },
  {
    id: "oil",
    name: "Cooking Oil",
    category: "Essentials",
    price: 140,
    unit: "1 litre bottle",
    label: "OL",
    description: "Essential for students cooking a few smart meals instead of ordering out.",
    color: "linear-gradient(135deg, #6b7f1c, #9ab533)"
  },
  {
    id: "tomato",
    name: "Tomatoes",
    category: "Produce",
    price: 28,
    unit: "4 pieces",
    label: "TM",
    description: "Fresh produce that adds some balance to instant, simple meals.",
    color: "linear-gradient(135deg, #923d31, #d15c51)"
  },
  {
    id: "onion",
    name: "Onions",
    category: "Produce",
    price: 24,
    unit: "4 pieces",
    label: "ON",
    description: "A cooking basic that makes budget meals feel more complete.",
    color: "linear-gradient(135deg, #785735, #a77d4a)"
  },
  {
    id: "banana",
    name: "Bananas",
    category: "Produce",
    price: 35,
    unit: "6 pieces",
    label: "BN",
    description: "Portable fruit that fits quick breakfasts or evening snacks.",
    color: "linear-gradient(135deg, #b37c18, #ddb13d)"
  },
  {
    id: "chips",
    name: "Chips",
    category: "Snacks",
    price: 20,
    unit: "2 small packs",
    label: "CP",
    description: "A familiar snack choice for movie nights and break time.",
    color: "linear-gradient(135deg, #aa5227, #de8657)"
  },
  {
    id: "biscuits",
    name: "Biscuits",
    category: "Snacks",
    price: 30,
    unit: "2 packs",
    label: "BS",
    description: "Easy to store, easy to carry, and useful when deadlines pile up.",
    color: "linear-gradient(135deg, #5c4a3b, #96765e)"
  },
  {
    id: "noodles",
    name: "Instant Noodles",
    category: "Snacks",
    price: 15,
    unit: "single pack",
    label: "ND",
    description: "The emergency fallback every student recognises immediately.",
    color: "linear-gradient(135deg, #ab4122, #ee7a4f)"
  }
];

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

const storageKey = "campuscart-state";

const state = {
  search: "",
  category: "all",
  budget: 1200,
  deliveryZone: "standard",
  cart: loadSavedState()
};

const productGrid = document.getElementById("productGrid");
const cartItems = document.getElementById("cartItems");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const budgetRange = document.getElementById("budgetRange");
const budgetValue = document.getElementById("budgetValue");
const heroBudgetValue = document.getElementById("heroBudgetValue");
const resultsCount = document.getElementById("resultsCount");
const subtotalValue = document.getElementById("subtotalValue");
const deliveryValue = document.getElementById("deliveryValue");
const totalValue = document.getElementById("totalValue");
const budgetStatus = document.getElementById("budgetStatus");
const clearCartButton = document.getElementById("clearCartButton");
const deliveryZoneSelect = document.getElementById("deliveryZone");
const checkoutSummary = document.getElementById("checkoutSummary");
const checkoutForm = document.getElementById("checkoutForm");
const confirmationMessage = document.getElementById("confirmationMessage");

searchInput.addEventListener("input", (event) => {
  state.search = event.target.value.trim().toLowerCase();
  renderProducts();
});

categoryFilter.addEventListener("change", (event) => {
  state.category = event.target.value;
  renderProducts();
});

budgetRange.addEventListener("input", (event) => {
  state.budget = Number(event.target.value);
  updateBudgetLabels();
  renderSummary();
});

deliveryZoneSelect.addEventListener("change", (event) => {
  state.deliveryZone = event.target.value;
  renderSummary();
});

clearCartButton.addEventListener("click", () => {
  state.cart = {};
  persistState();
  renderCart();
  renderSummary();
});

checkoutForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const totalItems = getCartCount();
  if (totalItems === 0) {
    confirmationMessage.textContent = "Add at least one product before placing a sample order.";
    return;
  }

  const name = document.getElementById("customerName").value.trim();
  const address = document.getElementById("customerAddress").value.trim();
  const notes = document.getElementById("customerNotes").value.trim();
  const totals = getTotals();
  const zoneLabel = state.deliveryZone === "remote" ? "Remote area" : "Standard area";

  confirmationMessage.textContent = `${name}, your sample order for ${totalItems} item(s) is ready. Delivery to ${address}. ${zoneLabel} fee applied. Final total: ${currency.format(totals.total)}.${notes ? ` Notes: ${notes}.` : ""}`;
});

function loadSavedState() {
  try {
    const saved = localStorage.getItem(storageKey);
    if (!saved) {
      return {};
    }

    const parsed = JSON.parse(saved);
    return parsed.cart ?? {};
  } catch (error) {
    return {};
  }
}

function persistState() {
  try {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        cart: state.cart
      })
    );
  } catch (error) {
    // Ignore storage failures so the app still works in restricted browsers.
  }
}

function getFilteredCatalog() {
  return catalog.filter((item) => {
    const matchesCategory = state.category === "all" || item.category === state.category;
    const matchesSearch =
      state.search.length === 0 ||
      item.name.toLowerCase().includes(state.search) ||
      item.description.toLowerCase().includes(state.search);

    return matchesCategory && matchesSearch;
  });
}

function renderProducts() {
  const filtered = getFilteredCatalog();
  resultsCount.textContent = `${filtered.length} item${filtered.length === 1 ? "" : "s"} available`;

  if (filtered.length === 0) {
    productGrid.innerHTML = `
      <article class="product-card">
        <h3>No products found</h3>
        <p>Try a different search term or switch back to all categories.</p>
      </article>
    `;
    return;
  }

  productGrid.innerHTML = filtered
    .map((item) => {
      const quantity = state.cart[item.id] ?? 0;
      return `
        <article class="product-card">
          <div class="product-top">
            <div>
              <div class="product-badge" style="background:${item.color};">${item.label}</div>
            </div>
            <div class="product-meta">
              <span class="pill">${item.category}</span>
              <span class="pill">${item.unit}</span>
            </div>
          </div>
          <div>
            <h3>${item.name}</h3>
            <p>${item.description}</p>
          </div>
          <div class="product-bottom">
            <div class="price-tag">
              <span class="muted">Price</span>
              <strong>${currency.format(item.price)}</strong>
            </div>
            <button class="add-button" type="button" data-product-id="${item.id}">
              ${quantity > 0 ? `Add more (${quantity})` : "Add to cart"}
            </button>
          </div>
        </article>
      `;
    })
    .join("");

  productGrid.querySelectorAll("[data-product-id]").forEach((button) => {
    button.addEventListener("click", () => addToCart(button.dataset.productId));
  });
}

function addToCart(productId) {
  state.cart[productId] = (state.cart[productId] ?? 0) + 1;
  persistState();
  renderProducts();
  renderCart();
  renderSummary();
}

function changeQuantity(productId, delta) {
  const currentQuantity = state.cart[productId] ?? 0;
  const nextQuantity = currentQuantity + delta;

  if (nextQuantity <= 0) {
    delete state.cart[productId];
  } else {
    state.cart[productId] = nextQuantity;
  }

  persistState();
  renderProducts();
  renderCart();
  renderSummary();
}

function renderCart() {
  const entries = Object.entries(state.cart);

  if (entries.length === 0) {
    cartItems.innerHTML = `<div class="cart-empty">Your basket is empty. Add products to start building an order.</div>`;
    return;
  }

  cartItems.innerHTML = entries
    .map(([productId, quantity]) => {
      const item = catalog.find((product) => product.id === productId);
      const lineTotal = item.price * quantity;

      return `
        <article class="cart-item">
          <div class="cart-item-head">
            <div>
              <strong>${item.name}</strong>
              <p>${item.unit}</p>
            </div>
            <strong>${currency.format(lineTotal)}</strong>
          </div>
          <div class="cart-actions">
            <div class="quantity-controls">
              <button class="quantity-button" type="button" data-action="decrease" data-product-id="${productId}">-</button>
              <span>${quantity}</span>
              <button class="quantity-button" type="button" data-action="increase" data-product-id="${productId}">+</button>
            </div>
            <button class="remove-button" type="button" data-action="remove" data-product-id="${productId}">Remove</button>
          </div>
        </article>
      `;
    })
    .join("");

  cartItems.querySelectorAll("[data-action]").forEach((button) => {
    const { action, productId } = button.dataset;

    button.addEventListener("click", () => {
      if (action === "increase") {
        changeQuantity(productId, 1);
      }

      if (action === "decrease") {
        changeQuantity(productId, -1);
      }

      if (action === "remove") {
        delete state.cart[productId];
        persistState();
        renderProducts();
        renderCart();
        renderSummary();
      }
    });
  });
}

function getTotals() {
  const subtotal = Object.entries(state.cart).reduce((sum, [productId, quantity]) => {
    const item = catalog.find((product) => product.id === productId);
    return sum + item.price * quantity;
  }, 0);

  const delivery = subtotal === 0 ? 0 : state.deliveryZone === "remote" ? 90 : 40;
  return {
    subtotal,
    delivery,
    total: subtotal + delivery
  };
}

function getCartCount() {
  return Object.values(state.cart).reduce((sum, quantity) => sum + quantity, 0);
}

function renderSummary() {
  const totals = getTotals();
  const difference = state.budget - totals.total;

  subtotalValue.textContent = currency.format(totals.subtotal);
  deliveryValue.textContent = currency.format(totals.delivery);
  totalValue.textContent = currency.format(totals.total);

  budgetStatus.classList.remove("is-good", "is-bad");

  if (getCartCount() === 0) {
    budgetStatus.textContent = "Add products to compare your cart against the weekly budget.";
  } else if (difference >= 0) {
    budgetStatus.textContent = `Good news: your cart is ${currency.format(difference)} under the weekly budget.`;
    budgetStatus.classList.add("is-good");
  } else {
    budgetStatus.textContent = `This cart is ${currency.format(Math.abs(difference))} over the weekly budget. Consider trimming a few items.`;
    budgetStatus.classList.add("is-bad");
  }

  renderCheckoutSummary(totals);
}

function renderCheckoutSummary(totals) {
  const cartEntries = Object.entries(state.cart);

  if (cartEntries.length === 0) {
    checkoutSummary.innerHTML = "Your summary will update as you build a cart.";
    return;
  }

  const lines = cartEntries
    .map(([productId, quantity]) => {
      const item = catalog.find((product) => product.id === productId);
      return `
        <div class="checkout-line">
          <span>${item.name} x ${quantity}</span>
          <strong>${currency.format(item.price * quantity)}</strong>
        </div>
      `;
    })
    .join("");

  const zoneLabel = state.deliveryZone === "remote" ? "Remote area" : "Standard area";

  checkoutSummary.innerHTML = `
    ${lines}
    <div class="checkout-line">
      <span>Delivery (${zoneLabel})</span>
      <strong>${currency.format(totals.delivery)}</strong>
    </div>
    <div class="checkout-line">
      <span>Total</span>
      <strong>${currency.format(totals.total)}</strong>
    </div>
  `;
}

function updateBudgetLabels() {
  const formatted = currency.format(state.budget);
  budgetValue.textContent = formatted;
  heroBudgetValue.textContent = formatted;
}

updateBudgetLabels();
renderProducts();
renderCart();
renderSummary();
