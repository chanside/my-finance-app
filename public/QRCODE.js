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
    const data = JSON.parse(decodedText);
    if (data.expense && data.category) {
      document.getElementById("txAmount").value = data.expense;
      document.getElementById("txCategory").value = data.category;
      document.getElementById("txNote").value = data.note || "";
      document.getElementById("txType").value = "支出"; // 中文支出
      addTransaction();
    }
  } catch (e) {
    const match = decodedText.match(/(\d{2,6})\s*(元|TX)?/);
    if (match) {
      document.getElementById("txAmount").value = parseInt(match[1]);
      document.getElementById("txCategory").value = "餐飲";
      document.getElementById("txNote").value = "掃描發票";
      document.getElementById("txType").value = "支出";
      addTransaction();
    } else {
      alert("QR Code 格式錯誤或無法辨識金額！");
    }
  }

  qrScanner.stop().then(() => {
    document.getElementById("qr-reader").style.display = "none";
    document.getElementById("switch-camera-btn").style.display = "none";
  });
}

// 綁定按鈕
document.getElementById("qrBtn").addEventListener("click", startQRScanner);
document.getElementById("switch-camera-btn").addEventListener("click", switchCamera);
