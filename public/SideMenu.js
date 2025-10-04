/* ================== DOM 取得 ================== */
const menuBtn = document.getElementById("menuBtn");     // 左上角漢堡按鈕
const sideMenu = document.getElementById("sideMenu");   // 側邊選單
const closeMenu = document.getElementById("closeMenu"); // 選單內關閉按鈕 (×)
const overlay = document.getElementById("overlay");     // 半透明遮罩層

/* ================== 打開選單 ================== */
menuBtn.addEventListener("click", () => {
  sideMenu.classList.add("active");   // 顯示側邊選單
  overlay.classList.add("active");    // 顯示遮罩
  menuBtn.style.display = "none";     // 隱藏漢堡按鈕，避免重複點擊
});

/* ================== 關閉選單 ================== */
function hideMenu() {
  sideMenu.classList.remove("active"); // 收起側邊選單
  overlay.classList.remove("active");  // 移除遮罩
  menuBtn.style.display = "flex";      // 顯示回漢堡按鈕
}

// 點擊關閉按鈕 (×) 關閉選單
closeMenu.addEventListener("click", hideMenu);

// 點擊遮罩層也會關閉選單
overlay.addEventListener("click", hideMenu);
