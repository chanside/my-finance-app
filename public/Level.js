// 等級系統資料
let levelData = JSON.parse(localStorage.getItem("levelData")) || {
  level: 1,
  xp: 0,
  xpNeeded: 5
};

// 更新畫面
function updateLevelUI() {
  document.getElementById("level").textContent = levelData.level;
  document.getElementById("xp").textContent = levelData.xp;
  document.getElementById("xpNeeded").textContent = levelData.xpNeeded;
  document.getElementById("xpBar").style.width = 
    `${(levelData.xp / levelData.xpNeeded) * 100}%`;
}

// 增加經驗值
function addXP(amount) {
  levelData.xp += amount;
  if (levelData.xp >= levelData.xpNeeded) {
    levelData.level++;
    levelData.xp = 0;
    levelData.xpNeeded += 5; // 每次升級需要更多 XP
    alert(`🎉 恭喜！升到 Lv.${levelData.level}`);
  }
  localStorage.setItem("levelData", JSON.stringify(levelData));
  updateLevelUI();
}

// 任務完成 → 增加經驗值
document.addEventListener("change", (e) => {
  if (e.target.type === "checkbox" && e.target.checked) {
    addXP(1); // 每個任務 +1 XP
  }
});

// 初始化
updateLevelUI();
