import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// ⭐ 先定義 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ⭐ dotenv 要用絕對路徑，這樣一定會讀到
dotenv.config({ path: path.resolve(__dirname, ".env") });
console.log("✅ Loaded Mongo URI:", process.env.MONGODB_URI ? "OK" : "NOT FOUND");

const app = express();
const PORT = process.env.PORT || 3000;

// 解析 JSON
app.use(express.json());

// 靜態檔案 (這裡先用 __dirname，因為你的 index.html 在根目錄)
app.use(express.static(__dirname, "../public/html"));

// MongoDB 連線
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB 已連線"))
  .catch((err) => console.error("❌ MongoDB 連線錯誤:", err));

// 定義 Schema
const transactionSchema = new mongoose.Schema({
  type: { type: String, required: true },   // 收入 or 支出
  amount: { type: Number, required: true },
  category: { type: String },               // 類別（餐飲、交通…）
  note: { type: String },                   // 備註
  date: { type: Date, default: Date.now }
});
const Transaction = mongoose.model("Transaction", transactionSchema);

// API：取得所有交易紀錄
app.get("/api/transactions", async (req, res) => {
  const transactions = await Transaction.find();
  res.json(transactions);
});

// API：新增交易紀錄
app.post("/api/transactions", async (req, res) => {
  const transaction = new Transaction(req.body);
  await transaction.save();
  res.status(201).json(transaction);
});

// 把 / 導向到 index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// 啟動伺服器（只留這一個）
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
