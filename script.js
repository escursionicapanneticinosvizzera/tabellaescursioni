<!-- Include PapaParse before your script.js -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js"></script>
<script src="script.js"></script>
// Inserisci qui l'URL del tuo Google Sheet pubblicato come CSV
const sheetCSV = 'https://raw.githubusercontent.com/escursionicapanneticinosvizzera/tabellaescursioni/refs/heads/main/tabella.csv';

$(document).ready(function() {
  $.get(sheetCSV, function(csvData) {
    const data = Papa.parse(csvData, {header: true}).data;

    const headers = Object.keys(data[0]);
    headers.forEach(h => {
      $('#header-row').append(`<th>${h}</th>`);
      $('#filter-row').append(`<th><div class="filter-container">
        <input type="text" class="filter-search" placeholder="Cerca...">
      </div></th>`);
    });

    const rows = data.map(row => headers.map(h => {
      const val = row[h];
      // Controlla se è un hyperlink
      const hyperlink = val && val.startsWith('http') ? `<a href="${val}" target="_blank">${val}</a>` : val || '';
      return hyperlink;
    }));

    const table = $('#excelTable').DataTable({ data: rows, orderCellsTop: true });

    table.columns().every(function(i) {
      const column = this;
      const container = $('div.filter-container', $('#filter-row th').eq(i));

      // valori unici + (Vuoto)
      let vals = column.data().unique().sort().toArray().map(d => d || '(Vuoto)');

      vals.forEach(val => {
        container.append(`
          <label>
            <input type="checkbox" class="col-filter" data-col="${i}" value="${val}"> ${val}
          </label>
        `);
      });

      // ricerca
      container.find('.filter-search').on('input', function(){
        const query = $(this).val().toLowerCase();
        container.find('label').each(function(){
          const text = $(this).text().toLowerCase();
          $(this).toggle(text.includes(query));
        });
      });

      // checkbox
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

  });
});
