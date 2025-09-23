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

        // 預設使用後鏡頭，如果找不到則使用第一個
        let cameraId = cameras[0].id;
        const backCam = cameras.find(cam => /back|rear|environment|環境/i.test(cam.label));
        if (backCam) {
          cameraId = backCam.id;
          currentCameraIndex = cameras.indexOf(backCam);
        }

        startCamera(cameraId);

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

// 開始指定相機
function startCamera(cameraId) {
  const config = {
    fps: 10,
    qrbox: 250,
    aspectRatio: 1.0
  };

  // 如果有 cameraId，用 cameraId；否則用 facingMode 強制後鏡頭
  const cameraConfig = cameraId ? { facingMode: { exact: "environment" } } : { facingMode: "environment" };

  qrScanner.start(
    cameraId || cameraConfig,
    config,
    onScanSuccess
  ).catch(err => {
    console.error("QR 掃描啟動失敗", err);
    alert("相機啟動失敗：" + err.message);
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

// 成功掃描 QRCode
function onScanSuccess(decodedText) {
  const match = decodedText.match(/(\d{2,6})\s*(元|TX)?/);
  if (match) {
    const amount = parseInt(match[1]);
    document.getElementById("txAmount").value = amount;
    document.getElementById("txCategory").value = "餐飲";
    document.getElementById("txNote").value = "掃描發票";
    document.getElementById("txType").value = "支出";

    addTransaction();
  } else {
    alert("無法辨識金額，請確認 QR Code 格式");
    console.error("QR decode failed:", decodedText);
  }

  qrScanner.stop().then(() => {
    document.getElementById("qr-reader").style.display = "none";
    document.getElementById("switch-camera-btn").style.display = "none";
  });
}

// 綁定按鈕
document.getElementById("qrBtn").addEventListener("click", startQRScanner);
document.getElementById("switch-camera-btn").addEventListener("click", switchCamera);
