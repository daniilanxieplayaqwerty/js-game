const $ = (s) => document.querySelector(s);
const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function createFighter({ name, maxHP = 100, selectors }) {
  const els = {
    bar: $(selectors.bar),
    text: $(selectors.text),
    title: $(selectors.title),
    sprite: $(selectors.sprite),
    card: $(selectors.card),
  };
  const api = {
    name,
    maxHP,
    currentHP: maxHP,
    changeHP(delta) {
      this.currentHP = clamp(this.currentHP + delta, 0, this.maxHP);
      this.render();
    },
    render() {
      const pct = Math.round((this.currentHP / this.maxHP) * 100);
      els.text.textContent = `${this.currentHP} / ${this.maxHP}`;
      els.bar.style.width = pct + "%";
      els.bar.classList.remove("low", "critical");
      if (pct <= 20) els.bar.classList.add("critical");
      else if (pct <= 50) els.bar.classList.add("low");
      if (els.title) els.title.textContent = this.name;
    },
    hitEffect(damage) {
      els.bar.classList.add("hit");
      setTimeout(() => els.bar.classList.remove("hit"), 350);
      if (els.sprite) {
        els.sprite.classList.add("shake");
        setTimeout(() => els.sprite.classList.remove("shake"), 350);
      }
      if (els.card) {
        const tag = document.createElement("div");
        tag.className = "float-dmg";
        tag.textContent = `-${damage}`;
        els.card.appendChild(tag);
        setTimeout(() => tag.remove(), 900);
      }
    },
    isAlive() {
      return this.currentHP > 0;
    },
  };
  api.render();
  return api;
}

const character = createFighter({
  name: "Pikachu",
  selectors: {
    bar: "#progressbar-character",
    text: "#health-character",
    title: "#name-character",
    sprite: ".character .sprite",
    card: ".character",
  },
});

const enemy = createFighter({
  name: "Charmander",
  selectors: {
    bar: "#progressbar-enemy",
    text: "#health-enemy",
    title: "#name-enemy",
    sprite: ".enemy .sprite",
    card: ".enemy",
  },
});

function createMove({ name, dmgMin, dmgMax, recoilMin = 0, recoilMax = 0 }) {
  return { name, dmgMin, dmgMax, recoilMin, recoilMax };
}

function useMove(attacker, defender, move) {
  if (!attacker.isAlive() || !defender.isAlive()) return;
  const dmg = rand(move.dmgMin, move.dmgMax);
  defender.changeHP(-dmg);
  defender.hitEffect(dmg);
  const recoil = move.recoilMax ? rand(move.recoilMin, move.recoilMax) : 0;
  if (recoil) {
    attacker.changeHP(-recoil);
    attacker.hitEffect(recoil);
  }
}

const thunderJolt = createMove({ name: "Thunder Jolt", dmgMin: 8, dmgMax: 15 });
const voltTackle = createMove({
  name: "Volt Tackle",
  dmgMin: 16,
  dmgMax: 28,
  recoilMin: 3,
  recoilMax: 7,
});

function enemyCounter() {
  if (!enemy.isAlive() || !character.isAlive()) return;
  const dmg = rand(6, 12);
  character.changeHP(-dmg);
  character.hitEffect(dmg);
}

const btnLight = $("#btn-kick");
const btnStrong = $("#btn-strong");
const logo = $(".logo");
const endScreen = document.getElementById("end-screen");
const winnerText = document.getElementById("winner-text");
const btnRestart = document.getElementById("btn-restart");

function setButtons(on) {
  if (btnLight) btnLight.disabled = !on;
  if (btnStrong) btnStrong.disabled = !on;
  const op = on ? "1" : ".6";
  if (btnLight) btnLight.style.opacity = op;
  if (btnStrong) btnStrong.style.opacity = op;
}

function showEnd(winnerName) {
  if (!endScreen || !winnerText) return;
  winnerText.textContent = `${winnerName} wins!`;
  endScreen.classList.remove("hidden");
  setButtons(false);
}

function restartGame() {
  character.currentHP = character.maxHP;
  enemy.currentHP = enemy.maxHP;
  character.render();
  enemy.render();
  if (endScreen) endScreen.classList.add("hidden");
  setButtons(true);
}

if (btnRestart) btnRestart.addEventListener("click", restartGame);
if (logo) logo.addEventListener("click", restartGame);

function endCheck() {
  if (!character.isAlive() || !enemy.isAlive()) {
    const winner = character.isAlive() ? character.name : enemy.name;
    showEnd(winner);
  }
}

function doTurn(move) {
  if (!character.isAlive() || !enemy.isAlive()) return;
  setButtons(false);
  useMove(character, enemy, move);
  setTimeout(() => {
    if (enemy.isAlive()) enemyCounter();
    endCheck();
    setButtons(true);
  }, 400);
}

if (btnLight) btnLight.addEventListener("click", () => doTurn(thunderJolt));
if (btnStrong) btnStrong.addEventListener("click", () => doTurn(voltTackle));

setButtons(true);
