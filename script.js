console.log("Script caricato");

const sheetCSV = 'tabella.csv'; // file CSV nella root del repo

$(document).ready(function() {
    console.log("DOM pronto");

    $.get(sheetCSV, function(csvData) {
        console.log("CSV caricato:", csvData.slice(0, 100));

        const data = Papa.parse(csvData, { header: true }).data;
        console.log("Dati parsati:", data);

        if (!data.length) {
            console.error("CSV vuoto o non leggibile");
            return;
        }

        const headers = Object.keys(data[0]);

        headers.forEach(h => {
            $('#header-row').append(`<th>${h}</th>`);
            $('#filter-row').append(`<th>
                <div class="filter-container">
                    <input type="text" class="filter-search" placeholder="Cerca...">
                </div>
            </th>`);
        });

        const rows = data.map(row => headers.map(h => {
            const val = row[h];
            return val && val.startsWith('http') ? `<a href="${val}" target="_blank">${val}</a>` : val || '';
        }));

        const table = $('#excelTable').DataTable({
            data: rows,
            orderCellsTop: true
        });

        table.columns().every(function(i) {
            const column = this;
            const container = $('div.filter-container', $('#filter-row th').eq(i));

            let vals = column.data().unique().sort().toArray().map(d => d || '(Vuoto)');

            vals.forEach(val => {
                container.append(`<label>
                    <input type="checkbox" class="col-filter" data-col="${i}" value="${val}"> ${val}
                </label>`);
            });

            container.find('.filter-search').on('input', function() {
                const query = $(this).val().toLowerCase();
                container.find('label').each(function() {
                    $(this).toggle($(this).text().toLowerCase().includes(query));
                });
            });

            container.on('change', 'input.col-filter', function() {
                const selected = container.find('input:checked').map(function(){ return $(this).val(); }).get();
                if (selected.length) {
                    const regex = selected.map
