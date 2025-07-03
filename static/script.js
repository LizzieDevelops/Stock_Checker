// Initialize ticker list and timer
var tickers = JSON.parse(localStorage.getItem("tickers")) || [];
var timer = 10;
var lastPrices = {};

// Start countdown timer and price updates
function updateFunction() {
    updatePrices();
    var counter = timer;
    setInterval(function () {
        counter--;
        $("#timer").text(counter);
        if (counter <= 0) {
            updatePrices();
            counter = timer;
        }
    }, 1000);
}

// On page load
$(document).ready(function () {
    tickers.forEach(function (ticker) {
        addTickerToGrid(ticker);
    });

    updatePrices();

    // Add new ticker
    $('#stock-form').submit(function (e) {
        e.preventDefault();
        var newTicker = $('#new-ticker').val().toUpperCase();

        if (!tickers.includes(newTicker)) {
            tickers.push(newTicker);
            localStorage.setItem('tickers', JSON.stringify(tickers));
            addTickerToGrid(newTicker);
        }

        $('#new-ticker').val('');
        updatePrices();
    });

    // Remove ticker
    $('#ticker-grid').on('click', '.remove-btn', function () {
        var tickerToRemove = $(this).data('ticker');
        tickers = tickers.filter(t => t !== tickerToRemove);
        localStorage.setItem('tickers', JSON.stringify(tickers));
        $(`#${tickerToRemove}`).remove();
    });

    updateFunction();
});

// Adds ticker card to grid
function addTickerToGrid(ticker) {
    $('#ticker-grid').append(`
        <div id="${ticker}" class="stock-box">
            <h2>${ticker}</h2>
            <p id="${ticker}-price"></p>
            <p id="${ticker}-pct"></p>
            <button class="remove-btn" data-ticker="${ticker}">Remove</button>
        </div>
    `);
}

// Fetch and update stock prices
function updatePrices() {
    tickers.forEach(function (ticker) {
        $.ajax({
            url: '/retrieve_stock_data',
            type: 'POST',
            data: JSON.stringify({ ticker: ticker }),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function (data) {
                var changePercent = ((data.currentPrice - data.openPrice) / data.openPrice) * 100;
                var colorClass;

                if (changePercent <= -2) colorClass = 'dark-red';
                else if (changePercent < 0) colorClass = 'red';
                else if (changePercent === 0) colorClass = 'gray';
                else if (changePercent <= 2) colorClass = 'green';
                else colorClass = 'dark-green';

                $(`#${ticker}-price`).text(`$${data.currentPrice.toFixed(2)}`)
                    .removeClass('dark-red red gray green dark-green')
                    .addClass(colorClass);

                $(`#${ticker}-pct`).text(`${changePercent.toFixed(2)}%`)
                    .removeClass('dark-red red gray green dark-green')
                    .addClass(colorClass);

                // Flash animation
                var flashClass = 'gray-flash';
                if (lastPrices[ticker] > data.currentPrice) flashClass = 'red-flash';
                else if (lastPrices[ticker] < data.currentPrice) flashClass = 'green-flash';

                lastPrices[ticker] = data.currentPrice;

                $(`#${ticker}`).addClass(flashClass);
                setTimeout(() => {
                    $(`#${ticker}`).removeClass(flashClass);
                }, 1000);
            }
        });
    });
}

