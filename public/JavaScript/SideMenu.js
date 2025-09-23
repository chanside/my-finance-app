const menuBtn = document.getElementById("menuBtn");
const sideMenu = document.getElementById("sideMenu");
const closeMenu = document.getElementById("closeMenu");
const overlay = document.getElementById("overlay");

// 打開選單
menuBtn.addEventListener("click", () => {
  sideMenu.classList.add("active");
  overlay.classList.add("active");
  menuBtn.style.display = "none"; // 隱藏漢堡按鈕
});

// 關閉選單
function hideMenu() {
  sideMenu.classList.remove("active");
  overlay.classList.remove("active");
  menuBtn.style.display = "flex"; // 顯示回漢堡按鈕
}

closeMenu.addEventListener("click", hideMenu);
overlay.addEventListener("click", hideMenu);
