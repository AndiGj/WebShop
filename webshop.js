// Hämta kundvagn från localStorage eller skapa tom
let cart = JSON.parse(localStorage.getItem('cart')) || [];

fetch('snacks.json')
  .then(response => response.json())
  .then(data => {
    const row = document.getElementById('snacks-row');

    data.chips.forEach(snack => {
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
        localStorage.setItem('cart', JSON.stringify(cart)); // uppdatera localStorage
        alert(`${snack.märke} har lagts till i kundvagnen!`);
        console.log('Kundvagn:', cart);
      });

      row.appendChild(col);
    });
  })
  .catch(error => console.error('Kunde inte ladda JSON:', error));
