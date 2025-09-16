// Hämta kundvagn från localStorage eller skapa tom
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Hämta produkter
fetch('/products')
  .then(response => response.json())
  .then(data => {
    const row = document.getElementById('snacks-row');

    data.forEach(snack => {
      const col = document.createElement('div');
      col.className = 'col-md-4 mb-4';

      col.innerHTML = `
        <div class="card h-100 border-warning shadow-sm text-center">
          <div class="card-body">
            <h5 class="card-title fw-bold mb-2">${snack.märke}</h5>
            <p class="card-text text-muted mb-2">
              Smak: <span class="fw-semibold">${snack.smak}</span><br>
              Kategori: <span class="fw-semibold">${snack.kategori}</span><br>
              Storlek: <span class="fw-semibold">${snack.storlek}</span>
            </p>
            <img src="${snack.bild}" class="card-img-top" alt="${snack.smak}">
            <p class="text-brown fw-bold h5 mt-4 mb-4">${snack.price} kr</p>
            <button class="btn btn-warning btn-sm px-4 add-to-cart">Lägg i kundvagn</button>
          </div>
        </div>
      `;

      // Lägg till click-event direkt här
      const addButton = col.querySelector('.add-to-cart');
      addButton.addEventListener('click', () => {
        cart.push(snack);
        localStorage.setItem('cart', JSON.stringify(cart));
        alert(`${snack.märke} har lagts till i kundvagnen!`);
        addProductToCartPreview(snack);
        updateCartTotal();
      });

      row.appendChild(col);
    });
  })
  .catch(error => console.error('Kunde inte ladda produkter:', error));

// Funktion för att visa produkter i kundvagnen
function addProductToCartPreview(snack) {
  const cartItems = document.getElementById('cart-items');

  const item = document.createElement('div');
  item.className = 'border p-2 mb-2 bg-light rounded d-flex justify-content-between align-items-center';
  item.innerHTML = `
    <div>
      <strong>${snack.märke}</strong> - ${snack.smak}, ${snack.storlek}<br>
      <span class="text-muted">${snack.kategori}</span><br>
      <img src="${snack.bild}" class="card-img-top" style="width:50px; height:auto;" alt="${snack.smak}">
      <span class="fw-bold">${snack.price} kr</span>
       
    </div>
    <div>
      <button class="btn btn-sm btn-success me-1">+</button>
      <button class="btn btn-sm btn-danger">-</button>
    </div>
  `;

  cartItems.appendChild(item);

  const addBtn = item.querySelector('.btn-success');
  const removeBtn = item.querySelector('.btn-danger');

  // Lägg till samma produkt
  addBtn.addEventListener('click', () => {
    cart.push(snack);
    localStorage.setItem('cart', JSON.stringify(cart));
    addProductToCartPreview(snack); // visa ny produkt
    updateCartTotal();
  });

  // Ta bort produkten
  removeBtn.addEventListener('click', () => {
    const index = cart.findIndex(p => 
      p.märke === snack.märke && 
      p.smak === snack.smak && 
      p.storlek === snack.storlek
    );
    if (index !== -1) {
      cart.splice(index, 1);
      localStorage.setItem('cart', JSON.stringify(cart));
      item.remove();
      updateCartTotal();
    }
  });
}

// Uppdatera totalen
function updateCartTotal() {
  const totalDiv = document.getElementById('cart-total');
  const total = cart.reduce((sum, snack) => sum + Number(snack.price), 0);
  totalDiv.innerHTML = `<h3>Total: ${total} kr</h3>`;
}

// Ladda befintlig kundvagn vid sidstart
window.addEventListener('DOMContentLoaded', () => {
  cart.forEach(snack => addProductToCartPreview(snack));
  updateCartTotal();
});

// Login form (behåller din befintliga kod)
document.getElementById('loginForm')?.addEventListener('submit', async function(e) {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const res = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (res.ok) {
    if (data.isAdmin) {
      localStorage.setItem('isAdmin', 'true');
      window.location.href = 'adminpanel.html';
    } else {
      localStorage.setItem('isAdmin', 'false');
      window.location.href = 'index.html';
    }
  } else {
    document.getElementById('loginError').textContent = data.error || 'Fel vid inloggning';
  }
});
