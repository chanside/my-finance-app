import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import bodyParser from "body-parser";

// ================= 設定目錄與 dotenv =================
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });
console.log("✅ Loaded Mongo URI:", process.env.MONGODB_URI ? "OK" : "NOT FOUND");
console.log("🔑 OpenAI Key:", process.env.OPENAI_API_KEY ? "存在" : "沒找到");
console.log("HF Key:", process.env.HF_API_KEY ? "已載入" : "缺失");

// ================= 初始化 Express =================
const app = express();
const PORT = process.env.PORT || 3000;

// ================= Middleware =================
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ================= MongoDB 連線 =================
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB 已連線"))
  .catch(err => console.error("❌ MongoDB 連線錯誤:", err));

// ================= Schema =================
const transactionSchema = new mongoose.Schema({
  type: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, default: "未分類" },
  note: { type: String, default: "" },
  date: { type: Date, default: Date.now },
});
const Transaction = mongoose.model("Transaction", transactionSchema);

const budgetSchema = new mongoose.Schema({
  category: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
});
const Budget = mongoose.model("Budget", budgetSchema);

const goalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  target: { type: Number, required: true },
});
const Goal = mongoose.model("Goal", goalSchema);

// ================= API Routes =================

// ---- 交易紀錄 ----
app.get("/api/transactions", async (req, res) => {
  const transactions = await Transaction.find().sort({ date: -1 });
  res.json(transactions);
});

app.post("/api/transactions", async (req, res) => {
  try {
    const transaction = new Transaction(req.body);
    await transaction.save();
    res.status(201).json(transaction);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete("/api/transactions/:id", async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ message: "刪除成功" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ---- 預算 ----
app.get("/api/budgets", async (req, res) => {
  const budgets = await Budget.find();
  res.json(budgets);
});

app.post("/api/budgets", async (req, res) => {
  const { category, amount } = req.body;
  if (!category || amount === undefined) 
    return res.status(400).json({ error: "分類或金額錯誤" });

  const budget = await Budget.findOneAndUpdate(
    { category },
    { amount },
    { upsert: true, new: true }
  );
  res.json(budget);
});

app.delete("/api/budgets/:id", async (req, res) => {
  try {
    await Budget.findByIdAndDelete(req.params.id);
    res.json({ message: "刪除成功" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ---- 儲蓄目標 ----
app.get("/api/goals", async (req, res) => {
  const goals = await Goal.find();
  res.json(goals);
});

app.post("/api/goals", async (req, res) => {
  const { name, target } = req.body;
  if (!name || target === undefined) return res.status(400).json({ error: "名稱或目標錯誤" });

  const goal = new Goal({ name, target });
  await goal.save();
  res.json(goal);
});

app.delete("/api/goals/:id", async (req, res) => {
  try {
    await Goal.findByIdAndDelete(req.params.id);
    res.json({ message: "刪除成功" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ---- QR Code 上傳解析 ----
app.post("/api/qrcode", async (req, res) => {
  try {
    const { type, amount, category, note, date } = req.body;
    if (!amount || !type) return res.status(400).json({ error: "QR Code 資料不完整" });

    const tx = new Transaction({ type, amount, category, note, date });
    await tx.save();
    res.json(tx);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ---- Chat API (Hugging Face) ----
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "請提供訊息" });

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.HF_API_KEY}`,
        },
        body: JSON.stringify({ inputs: { text: message } }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("HF API HTTP 錯誤:", response.status, errText);
      return res.status(500).json({ error: `HF API 錯誤: ${response.status}` });
    }

    const data = await response.json();
    console.log("HF 回傳:", data);

    let reply = "⚠️ AI 沒有回應";
    if (Array.isArray(data) && data[0]?.generated_text) reply = data[0].generated_text.trim();
    else if (data.generated_text) reply = data.generated_text.trim();

    res.json({ reply });
  } catch (err) {
    console.error("❌ Hugging Face API 錯誤:", err);
    res.status(500).json({ error: "伺服器錯誤，請稍後再試" });
  }
});

// ================= 靜態資源 =================
app.use(express.static(path.join(__dirname, "../public")));
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "../public/index.html")));

// ================= 啟動 =================
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
