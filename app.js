const elements = {
  infoNext: document.querySelectorAll(".info-value")[1],
  objectPreview: document.getElementById("object-preview"),
  plank: document.getElementById("seesaw-plank"),
};

let appState = {
  nextWeight: 0,
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
