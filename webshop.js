// get cart from localStorage or initialize as empty array
let cart = JSON.parse(localStorage.getItem('cart')) || [];
const cartCountEl = document.getElementById('cart-count');

let cartCount = cart.length;

// get products and display them
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
            <img src="${snack.bild}" class="snack-img" alt="${snack.smak}">

            <p class="text-brown fw-bold h5 mt-4 mb-4">${snack.price} kr</p>
            <button class="btn btn-warning btn-sm px-4 add-to-cart">Lägg i kundvagn</button>
          </div>
        </div>
      `;

      //when add to cart button is clicked
      const addButton = col.querySelector('.add-to-cart');
      addButton.addEventListener('click', () => {
      cart.push(snack);
      localStorage.setItem('cart', JSON.stringify(cart));
      cartCount = cart.length;   // uppdatera variabeln
      updateCartCount();         // uppdatera cirkeln
      addProductToCartPreview(snack);
      updateCartTotal();
      });

      row.appendChild(col);
    });
  })
  .catch(error => console.error('Kunde inte ladda produkter:', error));

function initCartCount() {
  const countElement = document.getElementById('cart-count');
  if (!countElement) return;

  if (cartCount > 0) {
    countElement.style.display = "flex";
    countElement.textContent = cartCount;
  } else {
    countElement.style.display = "none";
  }
}

// Funktion för att visa produkter i kundvagnen
function addProductToCartPreview(snack) {
  const cartItems = document.getElementById('cart-items');

  
        updateCartCount();
  const item = document.createElement('div');
  item.className = 'border p-2 mb-2 bg-light rounded d-flex justify-content-between align-items-center';
  item.innerHTML = `
    <div>
      <strong>${snack.märke}</strong> - ${snack.smak}, ${snack.storlek}<br>
      <span class="text-muted">${snack.kategori}</span><br>
      <img src="${snack.bild}" class="card-img-top" 
     style="width:auto; height:100px; margin-left: 20px;" 
     alt="${snack.smak}">
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

  // add same product +
  addBtn.addEventListener('click', () => {
    cart.push(snack);
    localStorage.setItem('cart', JSON.stringify(cart));
    addProductToCartPreview(snack); 
    updateCartTotal();
     cartCount = cart.length; 
  updateCartCount(); 
  });

// remove product -
removeBtn.addEventListener('click', () => {
  const index = cart.findIndex(p => 
    p.märke === snack.märke && 
    p.smak === snack.smak && 
    p.storlek === snack.storlek
  );
  if (index !== -1) {
    cart.splice(index, 1);               // ta bort från cart
    localStorage.setItem('cart', JSON.stringify(cart));
    item.remove();                        // ta bort från DOM
    cartCount = cart.length;              // ✅ uppdatera variabeln
    updateCartTotal();
    updateCartCount();                     // ✅ uppdatera cirkeln
  }
});

}

// update total price
function updateCartTotal() {
  const totalDiv = document.getElementById('cart-total');
  const total = cart.reduce((sum, snack) => sum + Number(snack.price), 0);
  totalDiv.innerHTML = `<h3>Total: ${total} kr</h3>`;
}

// load cart preview on page load
window.addEventListener('DOMContentLoaded', () => {
  cart.forEach(snack => addProductToCartPreview(snack));
  updateCartTotal();
});

    function updateCartCount() {
      const count = cart.length;
      if (count > 0) {
        cartCountEl.style.display = 'flex';
        cartCountEl.textContent = count;
      } else {
        cartCountEl.style.display = 'none';
      }
    }

window.addEventListener('DOMContentLoaded', updateCartCount);

// Login form 
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


// Signup form logic
document.getElementById('signupForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const errorP = document.getElementById('signupError');
  if (!username || !password || !email) {
    errorP.textContent = 'Fyll i alla fält';
    return;
  }
  const res = await fetch('/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, email })
  });
  const data = await res.json();
  if (res.ok) {
    errorP.style.color = 'green';
    errorP.textContent = 'Konto skapat! Du skickas till inloggning...';
    setTimeout(() => window.location.href = 'login.html', 1200);
  } else {
    errorP.style.color = 'red';
    errorP.textContent = data.error || 'Kunde inte skapa konto';
  }
});