// ==================== DONNÉES ====================
let products = [];
let cart = []; // { id, quantity }

// Identifiants admin
const ADMIN_EMAIL = "admin@shop.com";
const ADMIN_PASSWORD = "1234";

// Éléments DOM
const homePage = document.getElementById("homePage");
const cartPage = document.getElementById("cartPage");
const adminPage = document.getElementById("adminPage");
const productGrid = document.getElementById("productGrid");
const cartCountSpan = document.getElementById("cartCount");
const cartItemsContainer = document.getElementById("cartItemsContainer");
const cartTotalSpan = document.getElementById("cartTotal");

// Navigation
document.getElementById("home-link").addEventListener("click", (e) => {
    e.preventDefault();
    showPage("home");
});
document.getElementById("cart-link").addEventListener("click", (e) => {
    e.preventDefault();
    showPage("cart");
    renderCartPage();
});
document.getElementById("admin-link").addEventListener("click", (e) => {
    e.preventDefault();
    showPage("admin");
    document.getElementById("adminLogin").style.display = "flex";
    document.getElementById("adminPanel").style.display = "none";
});

function showPage(page) {
    homePage.style.display = page === "home" ? "block" : "none";
    cartPage.style.display = page === "cart" ? "block" : "none";
    adminPage.style.display = page === "admin" ? "block" : "none";
}

// ==================== STOCKAGE LOCAL ====================
function loadData() {
    // Produits
    const storedProducts = localStorage.getItem("products");
    if (storedProducts) {
        products = JSON.parse(storedProducts);
    } else {
        // Produits par défaut avec images
        
        saveProducts();
    }

    // Panier
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
        cart = JSON.parse(storedCart);
    } else {
        cart = [];
    }
    updateCartCount();
}

function saveProducts() {
    localStorage.setItem("products", JSON.stringify(products));
}

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    cartCountSpan.textContent = totalItems;
}

// ==================== PAGE ACCUEIL ====================
function renderProducts(filterCategory = "all") {
    productGrid.innerHTML = "";
    const filtered = filterCategory === "all"
        ? products
        : products.filter(p => p.category === filterCategory);

    filtered.forEach(p => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
            <img src="${p.image}" alt="${p.name}" class="product-image">
            <h3>${p.name}</h3>
            <p>${p.price} €</p>
            <button data-id="${p.id}" class="add-to-cart-btn">Ajouter au panier</button>
        `;
        productGrid.appendChild(card);
    });
}

// Filtres
document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
        document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderProducts(btn.dataset.category);
    });
});

// Ajout au panier (délégation)
productGrid.addEventListener("click", (e) => {
    if (e.target.classList.contains("add-to-cart-btn")) {
        const productId = parseInt(e.target.dataset.id);
        addToCart(productId);
    }
});

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ id: productId, quantity: 1 });
    }
    saveCart();
    alert(`${product.name} ajouté au panier !`);
}

// ==================== PAGE PANIER ====================
function renderCartPage() {
    if (!cart.length) {
        cartItemsContainer.innerHTML = "<p style='text-align:center;'>Votre panier est vide.</p>";
        cartTotalSpan.textContent = "0 €";
        return;
    }

    let html = "";
    let total = 0;

    cart.forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (!product) return; // produit supprimé ?
        const subtotal = product.price * item.quantity;
        total += subtotal;

        html += `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-info">
                    <img src="${product.image}" alt="${product.name}" class="cart-item-image">
                    <div class="cart-item-details">
                        <h4>${product.name}</h4>
                        <span class="cart-item-price">${product.price} €</span>
                    </div>
                </div>
                <div class="cart-item-quantity">
                    <button class="decrease-qty">-</button>
                    <span>${item.quantity}</span>
                    <button class="increase-qty">+</button>
                    <button class="cart-item-remove">🗑️</button>
                </div>
            </div>
        `;
    });

    cartItemsContainer.innerHTML = html;
    cartTotalSpan.textContent = total.toFixed(2) + " €";
}

// Gestion des actions dans le panier (délégation)
cartItemsContainer.addEventListener("click", (e) => {
    const cartItem = e.target.closest(".cart-item");
    if (!cartItem) return;
    const productId = parseInt(cartItem.dataset.id);

    if (e.target.classList.contains("increase-qty")) {
        changeQuantity(productId, 1);
    } else if (e.target.classList.contains("decrease-qty")) {
        changeQuantity(productId, -1);
    } else if (e.target.classList.contains("cart-item-remove")) {
        removeFromCart(productId);
    }
});

function changeQuantity(productId, delta) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) {
        cart = cart.filter(i => i.id !== productId);
    }
    saveCart();
    renderCartPage();
}

function removeFromCart(productId) {
    cart = cart.filter(i => i.id !== productId);
    saveCart();
    renderCartPage();
}

// Vider le panier
document.getElementById("clearCartBtn").addEventListener("click", () => {
    if (confirm("Vider le panier ?")) {
        cart = [];
        saveCart();
        renderCartPage();
    }
});

// Validation de commande
document.getElementById("checkoutBtn").addEventListener("click", () => {
    if (!cart.length) {
        alert("Votre panier est vide.");
        return;
    }
    alert("Merci pour votre commande ! (simulation)");
    cart = [];
    saveCart();
    renderCartPage();
    showPage("home");
});

// ==================== ADMIN ====================
// Login
document.getElementById("adminLoginBtn").addEventListener("click", () => {
    const email = document.getElementById("adminEmail").value;
    const pass = document.getElementById("adminPassword").value;
    if (email === ADMIN_EMAIL && pass === ADMIN_PASSWORD) {
        document.getElementById("adminLogin").style.display = "none";
        document.getElementById("adminPanel").style.display = "flex";
        renderAdminProducts();
    } else {
        alert("Email ou mot de passe incorrect");
    }
});

// Afficher les produits dans l'admin
function renderAdminProducts() {
    const list = document.getElementById("adminProductList");
    list.innerHTML = "";
    products.forEach(p => {
        const div = document.createElement("div");
        div.innerHTML = `
            <p>
                <img src="${p.image}" alt="${p.name}">
                ${p.name} - ${p.price} € (${p.category})
                <span class="admin-product-actions">
                    <button class="edit-product" data-id="${p.id}">✏️</button>
                    <button class="delete-product" data-id="${p.id}">🗑️</button>
                </span>
            </p>
        `;
        list.appendChild(div);
    });

    // Attacher événements suppression/édition
    document.querySelectorAll(".delete-product").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = parseInt(e.target.dataset.id);
            deleteProduct(id);
        });
    });
    document.querySelectorAll(".edit-product").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = parseInt(e.target.dataset.id);
            editProduct(id);
        });
    });
}

// Ajouter produit
document.getElementById("addProductBtn").addEventListener("click", () => {
    const name = document.getElementById("productName").value.trim();
    const price = parseFloat(document.getElementById("productPrice").value);
    const category = document.getElementById("productCategory").value;
    const image = document.getElementById("productImage").value.trim() || "https://placehold.co/150x150/orange/white?text=Produit";

    if (!name || isNaN(price) || price <= 0) {
        alert("Veuillez remplir tous les champs correctement.");
        return;
    }

    const newId = products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
    products.push({ id: newId, name, price, category, image });
    saveProducts();
    renderProducts(document.querySelector(".filter-btn.active")?.dataset.category || "all");
    renderAdminProducts();
    clearAdminForm();
});

// Supprimer produit
function deleteProduct(id) {
    if (confirm("Supprimer ce produit ?")) {
        products = products.filter(p => p.id !== id);
        // Retirer aussi du panier
        cart = cart.filter(item => item.id !== id);
        saveProducts();
        saveCart();
        renderProducts(document.querySelector(".filter-btn.active")?.dataset.category || "all");
        renderAdminProducts();
        renderCartPage(); // mise à jour panier si affiché
    }
}

// Éditer produit
function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    document.getElementById("productId").value = product.id;
    document.getElementById("productName").value = product.name;
    document.getElementById("productPrice").value = product.price;
    document.getElementById("productCategory").value = product.category;
    document.getElementById("productImage").value = product.image;

    document.getElementById("addProductBtn").style.display = "none";
    document.getElementById("updateProductBtn").style.display = "inline-block";
    document.getElementById("cancelEditBtn").style.display = "inline-block";
}

// Mettre à jour produit
document.getElementById("updateProductBtn").addEventListener("click", () => {
    const id = parseInt(document.getElementById("productId").value);
    const name = document.getElementById("productName").value.trim();
    const price = parseFloat(document.getElementById("productPrice").value);
    const category = document.getElementById("productCategory").value;
    const image = document.getElementById("productImage").value.trim() || "https://placehold.co/150x150/orange/white?text=Produit";

    if (!name || isNaN(price) || price <= 0) {
        alert("Veuillez remplir tous les champs correctement.");
        return;
    }

    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
        products[index] = { ...products[index], name, price, category, image };
        saveProducts();
        renderProducts(document.querySelector(".filter-btn.active")?.dataset.category || "all");
        renderAdminProducts();
        renderCartPage(); // au cas où le panier est ouvert
    }
    cancelEdit();
});

// Annuler édition
document.getElementById("cancelEditBtn").addEventListener("click", cancelEdit);
function cancelEdit() {
    clearAdminForm();
    document.getElementById("addProductBtn").style.display = "inline-block";
    document.getElementById("updateProductBtn").style.display = "none";
    document.getElementById("cancelEditBtn").style.display = "none";
}

function clearAdminForm() {
    document.getElementById("productId").value = "";
    document.getElementById("productName").value = "";
    document.getElementById("productPrice").value = "";
    document.getElementById("productCategory").value = "vêtements";
    document.getElementById("productImage").value = "https://placehold.co/150x150/orange/white?text=Produit";
}

// ==================== INITIALISATION ====================
loadData();
renderProducts();