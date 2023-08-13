let currentColor = 'black';

function changeColor(input) {
  currentColor = input.value;
}

function markBox(box) {
  if (box.style.backgroundColor === currentColor) {
    box.style.backgroundColor = '';
  } else {
    box.style.backgroundColor = currentColor;
  }
}

function mirrorDesign() {
  let boxes = document.querySelectorAll('.box');
  let copyCount = parseInt(document.querySelector('#copy-count').value);
  let copyDistance = parseInt(document.querySelector('#copy-distance').value);
  let maxMarks = parseInt(document.querySelector('#max-marks').value);
  let totalPins = parseInt(document.querySelector('#total-pins').value);

  let copiedIndexes = [];

  for (let row = 0; row < totalPins; row++) {
    for (let col = 0; col < maxMarks; col++) {
      let index = row * maxMarks + col;
      if (boxes[index].style.backgroundColor === currentColor) {
        copiedIndexes.push(index);
      }
    }
  }

  for (let c = 1; c <= copyCount; c++) {
    let copiedCol = maxMarks + c * copyDistance;

    if (copiedCol < maxMarks + copyCount * copyDistance) {
      copiedIndexes.forEach((index) => {
        let row = Math.floor(index / maxMarks);
        let col = index % maxMarks;
        let copiedIndex = row * maxMarks + copiedCol + (col - maxMarks);

        if (copiedIndex >= 0 && copiedIndex < boxes.length) {
          boxes[copiedIndex].style.backgroundColor = currentColor;
        }
      });
    }
  }
}

function undoCopy() {
  let boxes = document.querySelectorAll('.box');
  let copyCount = parseInt(document.querySelector('#copy-count').value) - 1;
  let copyDistance = parseInt(document.querySelector('#copy-distance').value);
  let maxMarks = parseInt(document.querySelector('#max-marks').value);
  let totalPins = parseInt(document.querySelector('#total-pins').value);

  let lastColumn = maxMarks + (copyCount - 1) * copyDistance;

  for (let row = 0; row < totalPins; row++) {
    let copiedIndexes = [];

    for (let col = 0; col < maxMarks; col++) {
      let index = row * maxMarks + col;
      if (boxes[index].style.backgroundColor === currentColor) {
        copiedIndexes.push(index);
      }
    }

    for (let c = 1; c <= copyCount; c++) {
      copiedIndexes.forEach((index) => {
        let col = index % maxMarks;
        let copiedCol = col + c * copyDistance;

        if (copiedCol < maxMarks) {
          let copiedIndex = row * maxMarks + copiedCol;
          boxes[copiedIndex].style.backgroundColor = '';
        }
      });
    }
  }
}

function extractPoints() {
  let result = '';
  let boxes = document.querySelectorAll('.box');
  let maxMarks = parseInt(document.querySelector('#max-marks').value);
  let totalPins = parseInt(document.querySelector('#total-pins').value);

  for (let i = 0; i < boxes.length / maxMarks; i++) {
    let start = -1;
    let end = -1;
    for (let j = 0; j < maxMarks; j++) {
      let box = boxes[i * maxMarks + j];
      if (box.style.backgroundColor === 'black') {
        if (start === -1) {
          start = j;
        }
        end = j + 1;
      } else if (start !== -1) {
        result += `${start},${end},`;
        start = -1;
        end = -1;
      }
    }
    if (start !== -1) {
      result += `${start},${end},`;
    }
    result += '0,\n';
  }

  // Download the design data as a text file
  let data = new Blob([result.slice(0, -2)], {type: 'text/plain'});
  let url = window.URL.createObjectURL(data);
  let link = document.createElement('a');
  link.href = url;
  link.download = 'design.txt';
  link.click();
  window.URL.revokeObjectURL(url);
}

function createGraph() {
  // Get the grid element and clear its content
  let gridElement = document.querySelector('#grid');
  gridElement.innerHTML = '';

  // Get the max marks and total pins
  let maxMarksElement = document.querySelector('#max-marks');
  let totalPinsElement = document.querySelector('#total-pins');
  let maxMarksValue = parseInt(maxMarksElement.value);
  let totalPinsValue = parseInt(totalPinsElement.value);

  // Set the CSS variables for max marks and total pins
  gridElement.style.setProperty('--columns', maxMarksValue);
  gridElement.style.setProperty('--rows', totalPinsValue);

  // Create the graph nodes
  for (let i = 0; i < totalPinsValue; i++) {
    for (let j = 0; j < maxMarksValue; j++) {
      let box = document.createElement('div');
      box.classList.add('box');
      box.onclick = () => markBox(box);
      gridElement.appendChild(box);
    }
  }

  // Hide the input elements and button for choosing max marks and total pins
  maxMarksElement.parentElement.style.display = 'none';
  totalPinsElement.parentElement.style.display = 'none';
  document.querySelector('button[onclick="createGraph()"]').style.display = 'none';

  // Add the remaining input elements and buttons
  let buttonContainer = document.createElement('div');
  buttonContainer.classList.add('button-container');
  buttonContainer.innerHTML = `
    <label for="copy-count">Number of copies:</label>
    <input type="number" id="copy-count" value="1">
  `;
  document.body.appendChild(buttonContainer);

  buttonContainer = document.createElement('div');
  buttonContainer.classList.add('button-container');
  buttonContainer.innerHTML = `
    <label for="copy-distance">Distance between copies:</label>
    <input type="number" id="copy-distance" value="10">
  `;
  document.body.appendChild(buttonContainer);

  buttonContainer = document.createElement('div');
  buttonContainer.classList.add('button-container');
  let copyButton = document.createElement('button');
  copyButton.onclick = mirrorDesign;
  copyButton.textContent = 'Copy';
  buttonContainer.appendChild(copyButton);
  document.body.appendChild(buttonContainer);

  buttonContainer = document.createElement('div');
  buttonContainer.classList.add('button-container');
  let undoButton = document.createElement('button');
  undoButton.onclick = undoCopy;
  undoButton.textContent = 'Undo';
  buttonContainer.appendChild(undoButton);
  document.body.appendChild(buttonContainer);

  buttonContainer = document.createElement('div');
  buttonContainer.classList.add('button-container');
  let completeButton = document.createElement('button');
  completeButton.onclick = extractPoints;
  completeButton.textContent = 'Completed';
  buttonContainer.appendChild(completeButton);
  document.body.appendChild(buttonContainer);
}
