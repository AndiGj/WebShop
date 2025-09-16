
function renderProductsAndAddCard(data) {
  const row = document.getElementById('snacks-row');
  row.innerHTML = '';
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
          <button class="btn btn-warning btn-sm px-4 remove">Ta bort</button>
        </div>
      </div>
    `;
    // Lägg till click-event för att ta bort produkt från servern
    const removeButton = col.querySelector('.remove');
    removeButton.addEventListener('click', async () => {
      if (confirm(`Är du säker på att du vill ta bort ${snack.märke}?`)) {
        const res = await fetch(`/products/${snack.id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          col.remove();
          alert(`${snack.märke} har tagits bort.`);
        } else {
          alert('Kunde inte ta bort produkten.');
        }
      }
    });
    row.appendChild(col);
  });

  // Lägg till tomt kort för att lägga till produkt
  const addCol = document.createElement('div');
  addCol.className = 'col-md-4 mb-4';
  addCol.innerHTML = `
    <div class="card h-100 border-success shadow-sm text-center">
      <div class="card-body">
        <h5 class="card-title fw-bold mb-2">Lägg till ny produkt</h5>
        <form id="addProductForm">
          <input type="text" class="form-control mb-2" name="märke" placeholder="Märke" required>
          <input type="text" class="form-control mb-2" name="smak" placeholder="Smak" required>
          <input type="text" class="form-control mb-2" name="kategori" placeholder="Kategori" required>
          <input type="text" class="form-control mb-2" name="storlek" placeholder="Storlek" required>
          <input type="number" class="form-control mb-2" name="price" placeholder="Pris" required>
          <input type="file" class="form-control mb-2" name="bild" accept="image/png" required>
          <button type="submit" class="btn btn-success mt-2">Lägg till</button>
          <div id="addProductMsg" class="mt-2"></div>
        </form>
      </div>
    </div>
  `;
  row.appendChild(addCol);

  // Lägg till submit-event för formuläret
  const addProductForm = addCol.querySelector('#addProductForm');
  addProductForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData(addProductForm);
    // Hantera bilduppladdning
    const file = formData.get('bild');
    if (!file || file.type !== 'image/png') {
      addCol.querySelector('#addProductMsg').textContent = 'Endast PNG-bilder stöds!';
      return;
    }
    // Läs in bilden som base64
    const reader = new FileReader();
    reader.onload = async function(event) {
      const base64Image = event.target.result;
      // Skicka produktdata till servern
      const product = {
        märke: formData.get('märke'),
        smak: formData.get('smak'),
        kategori: formData.get('kategori'),
        storlek: formData.get('storlek'),
        price: formData.get('price'),
        bild: base64Image
      };
      const res = await fetch('/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      if (res.ok) {
        addCol.querySelector('#addProductMsg').textContent = 'Produkten har lagts till!';
        addProductForm.reset();
        setTimeout(() => location.reload(), 1000);
      } else {
        addCol.querySelector('#addProductMsg').textContent = 'Kunde inte lägga till produkt.';
      }
    };
    reader.readAsDataURL(file);
  });
}

fetch('/products')
  .then(response => response.json())
  .then(data => {
    renderProductsAndAddCard(data);
  })
  .catch(error => console.error('Kunde inte ladda produkter:', error));