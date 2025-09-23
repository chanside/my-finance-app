// QRCODE.js - 手機優先 QR 掃描器，自動填入交易欄位

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

  Html5Qrcode.getCameras()
    .then(cameras => {
      if (cameras && cameras.length) {
        cameraList = cameras;

        // 手機優先使用後置鏡頭
        currentCameraIndex = cameras.findIndex(cam => /back|rear|環境/i.test(cam.label)) || 0;

        startCamera(cameraList[currentCameraIndex].id);

        document.getElementById("switch-camera-btn").style.display =
          cameraList.length > 1 ? "inline-block" : "none";
      } else {
        alert("找不到相機裝置。");
      }
    })
    .catch(err => {
      alert("無法啟動相機，請允許權限或確認設備支援攝影機。");
      console.error(err);
    });
}

// 開始指定相機
function startCamera(cameraId) {
  qrScanner.start(
    cameraId,
    { fps: 10, qrbox: 250, aspectRatio: 1.0 },
    onScanSuccess
  ).catch(err => {
    console.error("QR 掃描啟動失敗", err);
  });
}

// 切換鏡頭
function switchCamera() {
  if (!cameraList.length || !qrScanner) return;

  qrScanner.stop().then(() => {
    currentCameraIndex = (currentCameraIndex + 1) % cameraList.length;
    startCamera(cameraList[currentCameraIndex].id);
  }).catch(err => {
    console.error("切換相機失敗", err);
  });
}

function startQRScanner() {
  const qrReaderElement = document.getElementById("qr-reader");
  qrReaderElement.style.display = "block";

  if (!qrScanner) {
    qrScanner = new Html5Qrcode("qr-reader");
  }

  Html5Qrcode.getCameras()
    .then(cameras => {
      if (cameras && cameras.length) {
        let cameraId = cameras[0].id;
        // 手機優先使用後鏡頭
        for (let cam of cameras) {
          if (/back|rear|environment/i.test(cam.label)) {
            cameraId = cam.id;
            break;
          }
        }
        qrScanner.start(
          cameraId,
          { fps: 10, qrbox: 250 },
          onScanSuccess
        ).catch(err => console.error(err));
        document.getElementById("switch-camera-btn").style.display =
          cameras.length > 1 ? "inline-block" : "none";
      } else {
        alert("找不到相機裝置。");
      }
    })
    .catch(err => {
      alert("無法啟動相機，請確認權限或設備支援攝影機");
      console.error(err);
    });
}


// 成功掃描 QRCode
function onScanSuccess(decodedText) {
  // 嘗試從文字中抓取金額（發票通常有 2-6 位數字）
  const match = decodedText.match(/(\d{2,6})\s*(元|TX)?/);
  if (match) {
    const amount = parseInt(match[1]);
    document.getElementById("txAmount").value = amount;
    document.getElementById("txCategory").value = "餐飲";
    document.getElementById("txNote").value = "掃描發票";
    document.getElementById("txType").value = "支出";

    // 呼叫 script.js 的 addTransaction()
    addTransaction();
  } else {
    alert("無法辨識金額，請確認 QR Code 格式");
    console.error("QR decode failed:", decodedText);
  }

  // 停止掃描並隱藏 UI
  qrScanner.stop().then(() => {
    document.getElementById("qr-reader").style.display = "none";
    document.getElementById("switch-camera-btn").style.display = "none";
  });
}

// 綁定按鈕
document.getElementById("qrBtn").addEventListener("click", startQRScanner);
document.getElementById("switch-camera-btn").addEventListener("click", switchCamera);
