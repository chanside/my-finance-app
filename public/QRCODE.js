
let qrScanner;
let currentCameraIndex = 0;
let cameraList = [];
let scanning = false;

// 啟動 QR 掃描
function startQRScanner() {
  const qrReaderElement = document.getElementById("qr-reader");
  qrReaderElement.style.display = "block";

  if (!qrScanner) {
    qrScanner = new Html5Qrcode("qr-reader");
  }

  Html5Qrcode.getCameras()
    .then(cameras => {
      console.log("偵測到相機：", cameras);

      if (cameras && cameras.length) {
        cameraList = cameras;

        // 預設後鏡頭
        let cameraId = cameras[0].id;
        const backCam = cameras.find(cam =>
          /back|rear|environment|環境/i.test(cam.label)
        );
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
      console.error("getCameras 錯誤：", err);
    });
}

// 開始指定相機
function startCamera(cameraId) {
  const config = { fps: 10, qrbox: 250, aspectRatio: 1.0 };

  console.log("準備啟動相機，cameraId=", cameraId);

  qrScanner
    .start(
      cameraId ? cameraId : { facingMode: "environment" },
      config,
      onScanSuccess
    )
    .then(() => {
      console.log("相機啟動成功");
    })
    .catch(err => {
      console.error("相機啟動失敗：", err.name, err.message, err);
      alert("相機啟動失敗：" + (err?.message || err));
    });
}

// 切換鏡頭
function switchCamera() {
  if (!cameraList.length || !qrScanner) return;

  qrScanner
    .stop()
    .then(() => {
      currentCameraIndex = (currentCameraIndex + 1) % cameraList.length;
      console.log("切換到相機：", cameraList[currentCameraIndex]);
      startCamera(cameraList[currentCameraIndex].id);
    })
    .catch(err => {
      console.error("切換相機失敗", err);
    });
}

// 成功掃描 QRCode
function onScanSuccess(decodedText) {
  if (scanning) return;
  scanning = true;

  console.log("掃描成功：", decodedText);

  const match = decodedText.match(/(\d{2,6})(\s*元|\s*NTD|\s*NT|\s*TX)?/i);
  if (match) {
    const amount = parseInt(match[1]);
    document.getElementById("txAmount").value = amount;
    document.getElementById("txCategory").value = "餐飲";
    document.getElementById("txNote").value = "掃描發票";
    document.getElementById("txType").value = "支出";

    addTransaction?.(); // 確保函式存在才呼叫
  } else {
    alert("無法辨識金額，請確認 QR Code 格式");
    console.error("QR decode failed:", decodedText);
  }

  qrScanner
    .stop()
    .then(() => {
      document.getElementById("qr-reader").style.display = "none";
      document.getElementById("switch-camera-btn").style.display = "none";
      scanning = false;
    })
    .catch(err => console.error("停止掃描失敗", err));
}

// 綁定按鈕
document.getElementById("qrBtn").addEventListener("click", startQRScanner);
document.getElementById("switch-camera-btn").addEventListener("click", switchCamera);

