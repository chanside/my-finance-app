const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..')));

let transactions = []; // 暫存在記憶體中，不存 MongoDB

// 傳回 HTML 頁面
app.get('/', (req, res) => {
  const filePath = path.join(__dirname, '..', 'index.html');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('找不到 index.html');
    } else {
      res.send(data);
    }
  });
});

// 儲存交易
app.post('/api/transactions', (req, res) => {
  const { expense, category, timestamp } = req.body;
  transactions.push({ expense, category, timestamp });
  res.json({ message: '交易已儲存', data: req.body });
});

// 取得交易
app.get('/api/transactions', (req, res) => {
  res.json(transactions);
});

// 啟動伺服器
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`伺服器正在 http://localhost:${PORT} 運作`);
});
