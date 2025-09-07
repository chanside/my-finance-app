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
      // 顯示切換鏡頭按鈕（如果有多個相機）
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
    // 嘗試解析 JSON 格式的 QRCode
    const data = JSON.parse(decodedText);
    if (data.expense && data.category) {
      document.getElementById("txAmount").value = data.expense;
      document.getElementById("txCategory").value = data.category;
      document.getElementById("txNote").value = data.note || "";
      document.getElementById("txType").value = "expense"; // 預設為支出
      addTransaction();
    }
  } catch (e) {
    // 如果不是 JSON，則嘗試匹配金額數字
    const match = decodedText.match(/(\d{2,6})\s*(元|TX)?/);
    if (match) {
      document.getElementById("txAmount").value = parseInt(match[1]);
      document.getElementById("txCategory").value = "餐飲";
      document.getElementById("txNote").value = "掃描發票";
      document.getElementById("txType").value = "expense";
      addTransaction();
    } else {
      alert("QR Code 格式錯誤或無法辨識金額！");
    }
  }

  // 掃描完成後關閉鏡頭
  qrScanner.stop().then(() => {
    document.getElementById("qr-reader").style.display = "none";
    document.getElementById("switch-camera-btn").style.display = "none";
  });
}
