let qrScanner;
let currentCameraIndex = 0;
let cameraList = [];

// 啟動 QR 掃描
function startQRScanner() {
  const qrReaderElement = document.getElementById("qr-reader");
  qrReaderElement.style.display = "block";

  if (!qrScanner) {
    qrScanner = new Html5Qrcode("qr-reader");
  }

  Html5Qrcode.getCameras().then(cameras => {
    if (cameras && cameras.length) {
      cameraList = cameras;
      currentCameraIndex = 0;
      qrScanner.start(
        cameras[currentCameraIndex].id,
        { fps: 10, qrbox: 250 },
        onScanSuccess
      );
      document.getElementById("switch-camera-btn").style.display =
        cameraList.length > 1 ? "inline-block" : "none";
    } else {
      alert("找不到相機裝置。");
    }
  }).catch(err => {
    alert("無法啟動相機，請允許權限或確認設備支援攝影機。");
    console.error(err);
  });
}

// 切換鏡頭
function switchCamera() {
  if (!cameraList.length || !qrScanner) return;
  qrScanner.stop().then(() => {
    currentCameraIndex = (currentCameraIndex + 1) % cameraList.length;
    qrScanner.start(
      cameraList[currentCameraIndex].id,
      { fps: 10, qrbox: 250 },
      onScanSuccess
    );
  }).catch(err => {
    console.error("切換相機失敗", err);
  });
}

// 成功掃描 QRCode
function onScanSuccess(decodedText) {
  try {
    // 嘗試解析 JSON 格式
    const data = JSON.parse(decodedText);
    if (data.expense && data.category) {
      document.getElementById("txAmount").value = data.expense;
      document.getElementById("txCategory").value = data.category;
      document.getElementById("txNote").value = data.note || "";
      document.getElementById("txType").value = "expense"; // ✅ 改成英文 (支出)
      addTransaction(); // ✅ 需在 script.js 中定義
    }
  } catch (e) {
    // 如果不是 JSON，嘗試從文字中抓取金額
    const match = decodedText.match(/(\d{2,6})\s*(元|TX)?/);
    if (match) {
      document.getElementById("txAmount").value = parseInt(match[1]);
      document.getElementById("txCategory").value = "餐飲";
      document.getElementById("txNote").value = "掃描發票";
      document.getElementById("txType").value = "expense"; // ✅ 改成英文
      addTransaction();
    } else {
      alert("QR Code 格式錯誤或無法辨識金額！");
      console.error("QR decode failed:", decodedText);
    }
  }

  // 停止掃描並隱藏 UI
  qrScanner.stop().then(() => {
    document.getElementById("qr-reader").style.display = "none";
    document.getElementById("switch-camera-btn").style.display = "none";
  });
}

// 📌 addTransaction 函式：和手動新增交易共用
function addTransaction() {
  const date = document.getElementById("txDate").value || new Date().toISOString().slice(0, 10);
  const type = document.getElementById("txType").value;
  const amount = Number(document.getElementById("txAmount").value);
  const category = document.getElementById("txCategory").value || (type === "income" ? "其他收入" : "其他支出");
  const note = document.getElementById("txNote").value || "";

  if (!amount || amount <= 0) {
    alert("請輸入有效金額");
    return;
  }

  // 使用全域 state（script.js 定義）
  state.tx.push({ id: uid(), date, type, amount, category, note });
  save();
  render();

  // 清空輸入欄位
  document.getElementById("txAmount").value = "";
  document.getElementById("txNote").value = "";
  document.getElementById("txCategory").value = "";
}

// 綁定切換鏡頭按鈕（啟動按鈕用 HTML 的 onclick="startQRScanner()" 即可）
document.getElementById("switch-camera-btn").addEventListener("click", switchCamera);
