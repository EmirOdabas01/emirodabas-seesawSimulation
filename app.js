const elements = {
  infoNext: document.querySelectorAll(".info-value")[1],
  objectPreview: document.getElementById("object-preview"),
  plank: document.getElementById("seesaw-plank"),
  colors: ["green", "red", "blue", "orange", "purple", "yellow"],
};

let appState = {
  nextWeight: 0,
  leftWeights: [],
  rightWeights: [],
};

function init() {
  generateNextWeight();
  updateUI();
}

function generateNextWeight() {
  appState.nextWeight = Math.floor(Math.random() * 10) + 1;
}

function updateUI() {
  elements.infoNext.innerText = appState.nextWeight;
}

elements.plank.addEventListener("mousemove", (event) => {
  const rect = elements.plank.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const constrainedX = Math.max(0, Math.min(x, rect.width));
  elements.objectPreview.style.display = "flex";
  elements.objectPreview.style.left = constrainedX - 15 + "px";
  elements.objectPreview.style.top = "45%";
  elements.objectPreview.innerText = appState.nextWeight;
});

elements.plank.addEventListener("mouseleave", () => {
  elements.objectPreview.style.display = "none";
});

init();

elements.plank.addEventListener("click", (e) => {
  const rect = elements.plank.getBoundingClientRect();
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

  createObjectDOM(newObject, true);
  updateSimulation();
  generateNextWeight();
  updateUI();
});

function createObjectDOM(obj, isNew = false) {
  const element = document.createElement("div");
  element.classList.add("object");

  element.style.left = obj.position - 15 + "px";
  element.style.backgroundColor = getWeightColor(obj.weight);
  element.innerText = obj.weight;

  if (isNew) {
    element.style.bottom = "150px";
  } else {
    element.style.bottom = "20px";
  }

  elements.plank.appendChild(element);

  if (isNew) {
    setTimeout(() => {
      element.style.bottom = "20px";
    }, 50);
  }
}

function getWeightColor() {
  return elements.colors[Math.floor(Math.random() * elements.colors.length)];
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

  const torqueDiff = rightTorque - leftTorque;
  const rawAngle = torqueDiff / 10;
  const clampedAngle = Math.max(-30, Math.min(30, rawAngle));
  appState.angle = clampedAngle;
  elements.plank.style.transform = `translate(-50%, -50%) rotate(${appState.angle}deg)`;

  updateUI();
}
