fetch('snacks.json')
  .then(response => response.json())
  .then(data => {
    const row = document.getElementById('snacks-row');

    data.chips.forEach(snack => {
      const col = document.createElement('div');
      col.className = 'col-md-4 mb-4';

      col.innerHTML = `
        <div class="card h-100 border-warning shadow-sm">
          <div class="card-body">
            <h5 class="card-title">${snack.märke}</h5>
            <p class="card-text">
              Smak: ${snack.smak}<br>
              Kategori: ${snack.kategori}<br>
              Storlek: ${snack.storlek}
            </p>
          </div>
          <img src="${snack.bild}" class="card-img-top" alt="${snack.smak}">
        </div>
      `;

      row.appendChild(col);
    });
  })
  .catch(error => console.error('Kunde inte ladda JSON:', error));