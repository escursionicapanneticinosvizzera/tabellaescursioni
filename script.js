// URL del CSV pubblico su GitHub (raw)
const sheetCSV = 'https://raw.githubusercontent.com/escursionicapanneticinosvizzera/tabellaescursioni/main/tabella.csv';

$(document).ready(function() {
  // Carica CSV tramite AJAX
  $.ajax({
    url: sheetCSV,
    dataType: 'text',
    success: function(csvData) {
      const data = Papa.parse(csvData, { header: true }).data;

      if (!data.length) {
        console.error('CSV vuoto o non accessibile');
        return;
      }

      const headers = Object.keys(data[0]);

      // Crea intestazioni e filtri
      headers.forEach(h => {
        $('#header-row').append(`<th>${h}</th>`);
        $('#filter-row').append(`<th>
          <div class="filter-container">
            <input type="text" class="filter-search" placeholder="Cerca...">
          </div>
        </th>`);
      });

      // Prepara i dati per DataTable (trasforma i link in <a>)
      const rows = data.map(row => headers.map(h => {
        const val = row[h];
        return val && val.startsWith('http') ? `<a href="${val}" target="_blank">${val}</a>` : val || '';
      }));

      // Inizializza DataTable
      const table = $('#excelTable').DataTable({
        data: rows,
        orderCellsTop: true
      });

      // Aggiungi filtri per ogni colonna
      table.columns().every(function(i) {
        const column = this;
        const container = $('div.filter-container', $('#filter-row th').eq(i));

        // Valori unici + (Vuoto)
        let vals = column.data().unique().sort().toArray().map(d => d || '(Vuoto)');

        vals.forEach(val => {
          container.append(`<label>
            <input type="checkbox" class="col-filter" data-col="${i}" value="${val}"> ${val}
          </label>`);
        });

        // Ricerca testo
        container.find('.filter-search').on('input', function(){
          const query = $(this).val().toLowerCase();
          container.find('label').each(function(){
            $(this).toggle($(this).text().toLowerCase().includes(query));
          });
        });

        // Filtri checkbox
        container.on('change', 'input.col-filter', function(){
          const selected = container.find('input:checked').map(function(){ return $(this).val(); }).get();
          if (selected.length) {
            const regex = selected.map(v => v === '(Vuoto)' ? '^$' : v).join('|');
            column.search(regex, true, false).draw();
          } else {
            column.search('').draw();
          }
        });
      });

    },
    error: function(err) {
      console.error('Errore caricamento CSV:', err);
    }
  });
});
