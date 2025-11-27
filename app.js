let nextWeightComponent = document.querySelectorAll(".info-value")[1];

let nextWeight = 0;

getRandomWeight();
updateInfo();

function getRandomWeight() {
  nextWeight = Math.floor(Math.random() * 10) + 1;
}

function updateInfo() {
  nextWeightComponent.innerText = nextWeight;
}
