const seesawComponents = {
  nextWeightVal: document.querySelectorAll(".info-value")[1],
  nextWeightDisplay: document.getElementById("object-preview"),
  plank: document.getElementById("seesaw-plank"),
  resetButton: document.getElementById("button"),
  angle: document.querySelectorAll(".info-value")[3],
  leftWeightsSumVal: document.querySelectorAll(".info-value")[0],
  rightWeightsSumVal: document.querySelectorAll(".info-value")[2],
  log: document.getElementById("log"),
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
};

function init() {
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
  seesawComponents.nextWeightVal.innerText = appState.nextWeight;
  seesawComponents.angle.innerText = Math.round(appState.angle);

  let totalLeft = 0;
  for (const obj of appState.leftWeights) {
    totalLeft += obj.weight;
  }

  let totalRight = 0;
  for (const obj of appState.rightWeights) {
    totalRight += obj.weight;
  }

  seesawComponents.leftWeightsSumVal.innerText = totalLeft;
  seesawComponents.rightWeightsSumVal.innerText = totalRight;
}

seesawComponents.plank.addEventListener("mousemove", (event) => {
  const rect = seesawComponents.plank.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const constrainedX = Math.max(0, Math.min(x, rect.width));
  seesawComponents.nextWeightDisplay.style.display = "flex";
  seesawComponents.nextWeightDisplay.style.left = constrainedX - 15 + "px";
  seesawComponents.nextWeightDisplay.style.top = "45%";
  seesawComponents.nextWeightDisplay.innerText = appState.nextWeight;
});

seesawComponents.plank.addEventListener("mouseleave", () => {
  seesawComponents.nextWeightDisplay.style.display = "none";
});

seesawComponents.plank.addEventListener("click", (event) => {
  const rect = seesawComponents.plank.getBoundingClientRect();
  const x = event.clientX - rect.left;

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

  createObjectDOM(newObject, true);
  createLogMessage(side, weight);
  updateSimulation();
  generateNextWeight();
  updateUI();
  saveState();
});

function createObjectDOM(obj, isNew = false) {
  const weightDivComponent = document.createElement("div");
  weightDivComponent.classList.add("object");

  weightDivComponent.style.left = obj.position - 15 + "px";
  weightDivComponent.style.backgroundColor = getWeightColor(obj.weight);
  weightDivComponent.innerText = obj.weight;

  if (isNew) {
    weightDivComponent.style.bottom = "150px";
  } else {
    weightDivComponent.style.bottom = "20px";
  }

  seesawComponents.plank.appendChild(weightDivComponent);

  if (isNew) {
    setTimeout(() => {
      weightDivComponent.style.bottom = "20px";
    }, 50);
  }
}

function getWeightColor(weight) {
  return seesawComponents.colors[weight - 1];
}
function updateSimulation() {
  let leftTorque = 0;
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
  seesawComponents.plank.style.transform = "translate(-50%, -50%) rotate(0deg)";
  localStorage.removeItem("seesawState");

  generateNextWeight();
  updateUI();
});

function createLogMessage(side, weight) {
  const logDiv = document.createElement("div");
  logDiv.classList.add("log-item");
  let sideName = side === "left" ? "left" : "right";
  logDiv.innerText = `${weight} kg is added to the ${sideName} side`;
  seesawComponents.log.prepend(logDiv);
}
init();
