import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// ⭐ 定義 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ⭐ dotenv 要用絕對路徑
dotenv.config({ path: path.resolve(__dirname, ".env") });
console.log("✅ Loaded Mongo URI:", process.env.MONGODB_URI ? "OK" : "NOT FOUND");

const app = express();
const PORT = process.env.PORT || 3000;

// 解析 JSON
app.use(express.json());

// MongoDB 連線
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB 已連線"))
  .catch((err) => console.error("❌ MongoDB 連線錯誤:", err));

// 定義 Schema
const transactionSchema = new mongoose.Schema({
  type: { type: String, enum: ["income", "expense"], required: true },
  amount: { type: Number, required: true },
  category: { type: String },
  note: { type: String },
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
  console.log("📩 收到交易:", req.body); // debug
  const transaction = new Transaction(req.body);
  await transaction.save();
  res.status(201).json(transaction);
});

// API：刪除交易紀錄
app.delete("/api/transactions/:id", async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.use(express.static(path.join(__dirname, "../public")));

// 預設首頁
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
