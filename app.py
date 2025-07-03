import yfinance as yf
from flask import Flask, jsonify, request, render_template

app = Flask(__name__, template_folder='templates')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/retrieve_stock_data', methods=['POST'])
def retrieve_stock_data():
    ticker = request.get_json().get('ticker')
    stock = yf.Ticker(ticker)

    try:
        current_price = stock.fast_info['last_price']
        open_price = stock.fast_info['open']
    except Exception as e:
        print(f"Error fetching data for {ticker}: {e}")
        return jsonify({"error": "Failed to fetch stock data"}), 400

    return jsonify({
        "currentPrice": current_price,
        "openPrice": open_price
    })

if __name__ == '__main__':
    app.run(debug=True, port=5001)

