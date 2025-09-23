let qrScanner = null;
let cameraList = [];
let currentCameraIndex = 0;

// 啟動 QR 掃描
function startQRScanner() {
  const qrReaderElement = document.getElementById("qr-reader");
  qrReaderElement.style.display = "block";

  if (!qrScanner) {
    qrScanner = new Html5Qrcode("qr-reader");
  }

  Html5Qrcode.getCameras()
    .then(cameras => {
      if (!cameras || cameras.length === 0) {
        alert("找不到相機裝置！");
        return;
      }

      cameraList = cameras;
      currentCameraIndex = 0;

      startCamera(cameraList[currentCameraIndex].id);

      // 顯示切換鏡頭按鈕（如果有多個攝影機）
      document.getElementById("switch-camera-btn").style.display =
        cameraList.length > 1 ? "inline-block" : "none";
    })
    .catch(err => {
      console.error("無法取得攝影機：", err);
      alert(
        "無法啟動相機，請確認瀏覽器權限、HTTPS 或設備支援攝影機"
      );
    });
}

// 啟動指定 cameraId
function startCamera(cameraId) {
  if (!qrScanner) return;
  qrScanner
    .start(
      cameraId,
      { fps: 10, qrbox: 250 },
      onScanSuccess,
      onScanFailure
    )
    .catch(err => {
      console.error("啟動攝影機失敗：", err);
      alert("啟動攝影機失敗，請確認權限或設備支援");
    });
}

// 切換鏡頭
function switchCamera() {
  if (!cameraList.length || !qrScanner) return;

  qrScanner
    .stop()
    .then(() => {
      currentCameraIndex = (currentCameraIndex + 1) % cameraList.length;
      startCamera(cameraList[currentCameraIndex].id);
    })
    .catch(err => console.error("切換鏡頭失敗：", err));
}

// 成功掃描 QRCode
function onScanSuccess(decodedText) {
  console.log("QR 解碼成功:", decodedText);

  try {
    // 嘗試解析 JSON
    const data = JSON.parse(decodedText);
    if (data.expense && data.category) {
      document.getElementById("txAmount").value = data.expense;
      document.getElementById("txCategory").value = data.category;
      document.getElementById("txNote").value = data.note || "";
      document.getElementById("txType").value = "支出";
      addTransaction();
    }
  } catch (e) {
    // 嘗試抓金額
    const match = decodedText.match(/(\d{2,6})\s*(元|TX)?/);
    if (match) {
      document.getElementById("txAmount").value = parseInt(match[1]);
      document.getElementById("txCategory").value = "餐飲";
      document.getElementById("txNote").value = "掃描發票";
      document.getElementById("txType").value = "支出";
      addTransaction();
    } else {
      console.warn("無法解析 QR 內容:", decodedText);
      alert("QR Code 格式錯誤或無法辨識金額！");
    }
  }

  stopQRScanner();
}

// 掃描失敗（每次偵測不到 QR Code 都會呼叫，可忽略）
function onScanFailure(error) {
  // console.log("掃描失敗:", error);
}

// 停止掃描
function stopQRScanner() {
  if (!qrScanner) return;
  qrScanner
    .stop()
    .then(() => {
      document.getElementById("qr-reader").style.display = "none";
      document.getElementById("switch-camera-btn").style.display = "none";
    })
    .catch(err => console.error("停止掃描失敗：", err));
}

// 綁定按鈕
document.getElementById("qrBtn").addEventListener("click", startQRScanner);
document
  .getElementById("switch-camera-btn")
  .addEventListener("click", switchCamera);
