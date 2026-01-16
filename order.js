// =========================
// Golden Glaze — Order Logic
// =========================

// Full donut pool (includes ALL flavors)
const donutPool = [
  // Classics
  "OG Glaze",
  "Chocolate Iced",
  "Sprinkle Joy",

  // Fancy
  "Berry Burst",
  "Cookie Crumble",
  "Minty Melt",

  // Seasonal
  "Golden Hour",
  "Cinnamon Cozy",
  "Strawberry Shine",
  "Frostbite Glaze", // Winter

  // Lehigh Valley Exclusives
  "Steel Worker (Bethlehem)",
  "Crayola Classic (Easton)",
  "IronPig (Allentown)",
  "Zoo-Nut (Schnecksville)"
];

// ------- State -------
let order = [];              // the official 12 donuts in the order
let lastSlotsResults = [];   // latest 12 results from slots

// ------- Helpers -------
function randItem(arr){
  return arr[Math.floor(Math.random() * arr.length)];
}

// ------- DOM (Custom Dozen) -------
const donutSelect = document.getElementById("donutSelect");
const addBtn = document.getElementById("addBtn");
const surpriseBtn = document.getElementById("surpriseBtn");
const clearBtn = document.getElementById("clearBtn");

const countEl = document.getElementById("count");
const orderList = document.getElementById("orderList");
const orderStatus = document.getElementById("orderStatus");
const formStatus = document.getElementById("formStatus");

// ------- DOM (Slots) -------
const spinBtn = document.getElementById("spinBtn");
const slotsToOrderBtn = document.getElementById("slotsToOrderBtn");
const slotsStatus = document.getElementById("slotsStatus");

const reels = Array.from({ length: 12 }, (_, i) => document.getElementById(`reel${i+1}`));

// ------- Init dropdown -------
function populateDropdown(){
  donutSelect.innerHTML = "";
  donutPool.forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    donutSelect.appendChild(opt);
  });
}
populateDropdown();

// ------- Render order -------
function renderOrder(message = ""){
  countEl.textContent = order.length;
  orderList.innerHTML = "";

  order.forEach((name, idx) => {
    const li = document.createElement("li");
    li.textContent = name;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "remove-btn";
    btn.textContent = "remove";
    btn.addEventListener("click", () => {
      order.splice(idx, 1);
      renderOrder("Removed one donut.");
    });

    li.appendChild(btn);
    orderList.appendChild(li);
  });

  if (message) orderStatus.textContent = message;
}

// ------- Custom add -------
addBtn.addEventListener("click", () => {
  if (order.length >= 12){
    renderOrder("Your dozen is full (12/12).");
    return;
  }
  const chosen = donutSelect.value;
  order.push(chosen);
  renderOrder("Added: " + chosen);
});

// ------- Surprise fill (fills remaining only) -------
surpriseBtn.addEventListener("click", () => {
  if (order.length >= 12){
    renderOrder("Your dozen is already full (12/12).");
    return;
  }
  while (order.length < 12){
    order.push(randItem(donutPool));
  }
  renderOrder("Surprise Me filled the rest of your dozen.");
});

// ------- Clear -------
clearBtn.addEventListener("click", () => {
  order = [];
  renderOrder("Cleared your order.");
});

// =========================
// Slots — 12 reels, real stop
// =========================
let spinning = false;
let timers = []; // interval ids

function stopAllReels(){
  timers.forEach(t => clearInterval(t));
  timers = [];
}

function startReelSpin(reelEl){
  return setInterval(() => {
    reelEl.textContent = randItem(donutPool);
  }, 70);
}

function grabReelResults(){
  return reels.map(r => r.textContent);
}

function applySlotsToOrder(){
  if (!lastSlotsResults || lastSlotsResults.length !== 12){
    slotsStatus.textContent = "Spin first — no results to apply yet.";
    return;
  }
  order = lastSlotsResults.slice(); // EXACT results become the order
  renderOrder("Slots results copied into your Custom Dozen.");
}


function spin12(){
  if (spinning) return;
  spinning = true;
  spinBtn.disabled = true;
  slotsStatus.textContent = "Spinning 12 reels...";

  stopAllReels();

  // start all reels
  timers = reels.map(r => startReelSpin(r));

  // stop reels one-by-one (slot machine feel)
  const baseStop = 850;  // when first reel stops
  const stepStop = 90;   // delay between each reel stop

  reels.forEach((reelEl, idx) => {
    setTimeout(() => {
      // stop this reel's interval
      clearInterval(timers[idx]);
      timers[idx] = null;

      // on last reel stop:
      if (idx === reels.length - 1){
        // clean timers array
        stopAllReels();

        lastSlotsResults = grabReelResults();
        slotsStatus.textContent = "Result locked. Filling your Custom Dozen...";

        applySlotsToOrder(); // AUTO copy into order

        spinning = false;
        spinBtn.disabled = false;
        slotsStatus.textContent = "Result locked and copied to your order ✅";
      }
    }, baseStop + (idx * stepStop));
  });
}

spinBtn.addEventListener("click", spin12);
slotsToOrderBtn.addEventListener("click", applySlotsToOrder);

// =========================
// Submit (high-fidelity mock)
// =========================
document.getElementById("orderForm").addEventListener("submit", (e) => {
  e.preventDefault();
  formStatus.textContent = "";

  const pickup = document.getElementById("pickup").value.trim();
  const name = document.getElementById("name").value.trim();

  if (!pickup || !name){
    formStatus.textContent = "Please fill out required fields (Pickup Location + Name).";
    return;
  }
  if (order.length !== 12){
    formStatus.textContent = "Please build a full dozen (12/12) before submitting.";
    return;
  }

  formStatus.textContent = "Order submitted! (High-fidelity mockup)";
});

// Initial UI
renderOrder("Start by adding donuts, hit Surprise Me, or spin Slots.");
reels.forEach(r => r.textContent = "—");
