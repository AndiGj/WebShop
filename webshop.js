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
document.getElementById('signupForm')?.addEventListener('submit', async function(e) {
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

// Helpers to build and download a text receipt
function formatKr(value) {
  return `${Number(value).toLocaleString('sv-SE')} kr`;
}

function generateReceiptText(cartItems) {
  const now = new Date();
  const timestamp = now.toLocaleString('sv-SE');
  const orderId = now.getTime();

  // Group identical products to show quantity
  const grouped = {};
  cartItems.forEach(snack => {
    const key = `${snack.märke}|${snack.smak}|${snack.storlek}|${snack.price}`;
    if (!grouped[key]) grouped[key] = { snack, qty: 0 };
    grouped[key].qty += 1;
  });

  const lines = [];
  lines.push('Kvitto - WebShop');
  lines.push(`Datum: ${timestamp}`);
  lines.push(`Ordernummer: ${orderId}`);
  lines.push('----------------------------------------');

  let totalItems = 0;
  let totalSum = 0;

  Object.values(grouped).forEach(({ snack, qty }) => {
    const price = Number(snack.price);
    const lineTotal = price * qty;
    totalItems += qty;
    totalSum += lineTotal;
    lines.push(`${qty} x ${snack.märke} - ${snack.smak}, ${snack.storlek} @ ${formatKr(price)} = ${formatKr(lineTotal)}`);
  });

  lines.push('----------------------------------------');
  lines.push(`Antal varor: ${totalItems}`);
  lines.push(`Totalsumma: ${formatKr(totalSum)}`);
  lines.push('');
  lines.push('Tack för ditt köp!');

  return lines.join('\n');
}

function downloadReceipt(text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');

  const now = new Date();
  const name = `kvitto-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}.txt`;

  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Checkout button functionality
document.getElementById('checkout-button')?.addEventListener('click', () => {
  if (cart.length === 0) {
    alert('Din kundvagn är tom. Lägg till produkter innan du går till kassan.');
    return;
  }

  const confirmCheckout = confirm('Vill du gå vidare till kassan?');
  if (confirmCheckout) {
    // Build and download receipt before clearing the cart
    const receiptText = generateReceiptText(cart);
    downloadReceipt(receiptText);

    // Clear cart
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    const itemsEl = document.getElementById('cart-items');
    if (itemsEl) itemsEl.innerHTML = '';
    updateCartTotal();
    updateCartCount();

    alert('Tack för ditt köp! Kvitto har laddats ner.');
  }
});

// Hamburger menu functionality
document.addEventListener('DOMContentLoaded', function() {
  const hamburger = document.querySelector('.hamburger');
  const navbarLinks = document.getElementById('navbar-links');
  const cartContainer = document.querySelector('.cart-container');
  
  if (hamburger && navbarLinks) {
    hamburger.addEventListener('click', function() {
      // Toggle active class on hamburger for animation
      hamburger.classList.toggle('active');
      
      // Toggle active class on navbar links to show/hide menu
      navbarLinks.classList.toggle('active');
      
      // Update aria-expanded for accessibility
      const isExpanded = navbarLinks.classList.contains('active');
      hamburger.setAttribute('aria-expanded', isExpanded);
      
      // Hide/show cart container
      if (cartContainer) {
        if (isExpanded) {
          cartContainer.style.opacity = '0';
          cartContainer.style.pointerEvents = 'none';
        } else {
          cartContainer.style.opacity = '1';
          cartContainer.style.pointerEvents = 'auto';
        }
      }
    });
    
    // Close menu when clicking on a link (except logo)
    const navLinks = navbarLinks.querySelectorAll('a:not(.logo a)');
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        hamburger.classList.remove('active');
        navbarLinks.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        
        // Show cart container again
        if (cartContainer) {
          cartContainer.style.opacity = '1';
          cartContainer.style.pointerEvents = 'auto';
        }
      });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
      const isHamburger = hamburger.contains(event.target);
      const isNavbar = navbarLinks.contains(event.target);
      
      if (!isHamburger && !isNavbar && navbarLinks.classList.contains('active')) {
        hamburger.classList.remove('active');
        navbarLinks.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        
        // Show cart container again
        if (cartContainer) {
          cartContainer.style.opacity = '1';
          cartContainer.style.pointerEvents = 'auto';
        }
      }
    });
    
    // Close menu when pressing Escape key
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape' && navbarLinks.classList.contains('active')) {
        hamburger.classList.remove('active');
        navbarLinks.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        
        // Show cart container again
        if (cartContainer) {
          cartContainer.style.opacity = '1';
          cartContainer.style.pointerEvents = 'auto';
        }
      }
    });
  }
});