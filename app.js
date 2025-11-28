const seesawComponents = {
  nextWeightVal: document.querySelectorAll(".info-value")[1],
  nextWeightDisplay: document.getElementById("object-preview"),
  plank: document.getElementById("seesaw-plank"),
  resetButton: document.getElementById("button"),
  angle: document.querySelectorAll(".info-value")[3],
  leftWeightsSumVal: document.querySelectorAll(".info-value")[0],
  rightWeightsSumVal: document.querySelectorAll(".info-value")[2],
  log: document.getElementById("log"),
  container: document.getElementById("seesaw-container"),
  colors: [
    "#3498db",
    "#e74c3c",
    "#2ecc71",
    "#9b59b6",
    "#f1c40f",
    "#1abc9c",
    "#e67e22",
    "#16a085",
    "#832167ff",
    "#d35400",
  ],
};
let appState = {
  nextWeight: 0,
  leftWeights: [],
  rightWeights: [],
  colors: [],
  angle: 0,
};

const audio = {
  drop: new Audio("sounds/weightDrop.mp3"),
  crack: new Audio("sounds/woodCrack.mp3"),
};

function init() {
  createRuler();
  const previousState = localStorage.getItem("seesawState");

  if (previousState) {
    appState = JSON.parse(previousState);
    renderAllObjects();
  } else {
    generateNextWeight();
  }

  updateUI();
}

function saveState() {
  localStorage.setItem("seesawState", JSON.stringify(appState));
}

function generateNextWeight() {
  appState.nextWeight = Math.floor(Math.random() * 10) + 1;
}

function updateUI() {
  seesawComponents.nextWeightVal.innerText = appState.nextWeight + " kg";
  seesawComponents.angle.innerText = appState.angle.toFixed(1) + "°";

  let totalLeft = 0;
  for (const obj of appState.leftWeights) {
    totalLeft += obj.weight;
  }

  let totalRight = 0;
  for (const obj of appState.rightWeights) {
    totalRight += obj.weight;
  }

  seesawComponents.leftWeightsSumVal.innerText = totalLeft + " kg";
  seesawComponents.rightWeightsSumVal.innerText = totalRight + " kg";
}

seesawComponents.container.addEventListener("mousemove", (e) => {
  const rect = seesawComponents.container.getBoundingClientRect();

  const x = e.clientX - rect.left;
  let y = e.clientY - rect.top;
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const distanceFromCenter = x - centerX;
  const angleInRadians = appState.angle * (Math.PI / 180);
  const verticalOffset = distanceFromCenter * Math.tan(angleInRadians);
  const plankPositionY = centerY + verticalOffset - 10;
  const limit = plankPositionY - 60;

  if (y > limit) {
    y = limit;
  }

  const guideHeight = plankPositionY - y;
  const constrainedX = Math.max(0, Math.min(x, rect.width));
  seesawComponents.nextWeightDisplay.style.display = "flex";
  seesawComponents.nextWeightDisplay.style.left = constrainedX - 15 + "px";
  seesawComponents.nextWeightDisplay.style.top = y - 15 + "px";
  seesawComponents.nextWeightDisplay.style.setProperty(
    "--guide-height",
    guideHeight + "px"
  );
  seesawComponents.nextWeightDisplay.innerText = appState.nextWeight;
});

seesawComponents.container.addEventListener("click", (e) => {
  const rect = seesawComponents.container.getBoundingClientRect();
  const x = e.clientX - rect.left;

  if (x < 0 || x > rect.width) return;

  const weight = appState.nextWeight;
  const plankLength = 400;
  const pivotPoint = plankLength / 2;
  const distanceFromPivot = Math.abs(x - pivotPoint);
  const side = x < pivotPoint ? "left" : "right";

  const newObject = {
    id: Date.now(),
    weight: weight,
    distance: distanceFromPivot,
    position: x,
    side: side,
  };

  if (side === "left") {
    appState.leftWeights.push(newObject);
  } else {
    appState.rightWeights.push(newObject);
  }

  audio.drop.pause();
  audio.drop.currentTime = 0;
  audio.drop.play();

  createObjectDOM(newObject, true);
  createLogMessage(side, weight);
  generateNextWeight();
  updateUI();
  saveState();
});

seesawComponents.container.addEventListener("mouseleave", () => {
  seesawComponents.nextWeightDisplay.style.display = "none";
});

function createObjectDOM(obj, isNew = false) {
  const weightDiv = document.createElement("div");
  weightDiv.classList.add("object");

  const size = 20 + (obj.weight - 1) * (20 / 9);
  weightDiv.style.left = obj.position - size / 2 + "px";
  weightDiv.style.top = (20 - size) / 2 + "px";
  weightDiv.style.width = size + "px";
  weightDiv.style.height = size + "px";
  weightDiv.style.fontSize = size / 2 + "px";
  weightDiv.innerText = obj.weight;
  weightDiv.style.backgroundColor = getWeightColor(obj.weight);
  seesawComponents.plank.appendChild(weightDiv);

  if (isNew) {
    weightDiv.style.opacity = "0";

    const rect = weightDiv.getBoundingClientRect();

    const ghost = weightDiv.cloneNode(true);
    ghost.style.opacity = "1";
    ghost.style.position = "fixed";
    ghost.style.zIndex = "1000";
    ghost.style.margin = "0";
    ghost.style.transform = "none";
    ghost.style.left = rect.left + "px";
    ghost.style.top = rect.top - 200 + "px";
    ghost.style.transition = "top 0.5s ease-in";

    document.body.appendChild(ghost);

    requestAnimationFrame(() => {
      ghost.style.top = rect.top + "px";
    });

    setTimeout(() => {
      ghost.remove();
      weightDiv.style.opacity = "1";
      audio.drop.pause();
      updateSimulation();
    }, 500);
  }
}
function getWeightColor(weight) {
  return seesawComponents.colors[weight - 1];
}
function updateSimulation() {
  let leftTorque = 0;
  const previousAngle = appState.angle;

  appState.leftWeights.forEach((obj) => {
    leftTorque += obj.weight * obj.distance;
  });

  let rightTorque = 0;
  appState.rightWeights.forEach((obj) => {
    rightTorque += obj.weight * obj.distance;
  });

  const torqueDifference = rightTorque - leftTorque;
  const rawAngle = torqueDifference / 10;
  const angle = Math.max(-30, Math.min(30, rawAngle));
  appState.angle = angle;
  seesawComponents.plank.style.transform = `translate(-50%, -50%) rotate(${appState.angle}deg)`;

  updateUI();
  if (Math.abs(appState.angle - previousAngle) > 1) {
    audio.crack.currentTime = 0;

    audio.crack.currentTime = 0;
    audio.crack.volume = 0.5;
    audio.crack.play();
  }
}

function renderAllObjects() {
  appState.leftWeights.forEach((obj) => createObjectDOM(obj), false);
  appState.rightWeights.forEach((obj) => createObjectDOM(obj), false);

  updateSimulation();
}

seesawComponents.resetButton.addEventListener("click", () => {
  appState.leftWeights = [];
  appState.rightWeights = [];
  appState.colors = [];
  appState.angle = 0;

  const objects = document.querySelectorAll(".object");
  objects.forEach((obj) => obj.remove());
  seesawComponents.log.innerHTML = "";
  seesawComponents.plank.style.transform = "translate(-50%, -50%) rotate(0deg)";
  localStorage.removeItem("seesawState");

  generateNextWeight();
  updateUI();
});

function createLogMessage(side, weight) {
  const logDiv = document.createElement("div");
  logDiv.classList.add("log-item");
  let sideName = side === "left" ? "left" : "right";
  logDiv.innerText = `📦${weight} kg is added to the ${sideName} side`;
  seesawComponents.log.prepend(logDiv);
}
function createRuler() {
  const plankWidth = 400;
  const distance = 20;

  for (let i = distance; i < plankWidth; i += distance) {
    if (i === plankWidth / 2) continue;

    const line = document.createElement("div");
    const unit = Math.abs(i - plankWidth / 2) / distance;

    const label = document.createElement("div");
    label.classList.add("scale-label");
    label.style.left = i + "px";
    label.innerText = unit;
    seesawComponents.plank.appendChild(label);
  }
}
init();
