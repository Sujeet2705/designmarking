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
  let mirrorCount = parseInt(document.querySelector('#mirror-count').value);
  let mirrorDistance = parseInt(document.querySelector('#mirror-distance').value);
  let columns = parseInt(document.querySelector('#columns').value);
  let rows = parseInt(document.querySelector('#rows').value);

  let mirroredIndexes = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      let index = row * columns + col;
      if (boxes[index].style.backgroundColor === currentColor) {
        mirroredIndexes.push(index);
      }
    }
  }

  for (let m = 1; m <= mirrorCount; m++) {
    let mirroredCol = columns + m * mirrorDistance;

    if (mirroredCol < columns + mirrorCount * mirrorDistance) {
      mirroredIndexes.forEach((index) => {
        let row = Math.floor(index / columns);
        let col = index % columns;
        let mirroredIndex = row * columns + mirroredCol + (col - columns);

        if (mirroredIndex >= 0 && mirroredIndex < boxes.length) {
          boxes[mirroredIndex].style.backgroundColor = currentColor;
        }
      });
    }
  }
}
function undoMirror() {
  let boxes = document.querySelectorAll('.box');
  let mirrorCount = parseInt(document.querySelector('#mirror-count').value) - 1;
  let mirrorDistance = parseInt(document.querySelector('#mirror-distance').value);
  let columns = parseInt(document.querySelector('#columns').value);
  let rows = parseInt(document.querySelector('#rows').value);

  let lastColumn = columns + (mirrorCount - 1) * mirrorDistance;

  for (let row = 0; row < rows; row++) {
    let mirroredIndexes = [];

    for (let col = 0; col < columns; col++) {
      let index = row * columns + col;
      if (boxes[index].style.backgroundColor === currentColor) {
        mirroredIndexes.push(index);
      }
    }

    for (let m = 1; m <= mirrorCount; m++) {
      mirroredIndexes.forEach((index) => {
        let col = index % columns;
        let mirroredCol = col + m * mirrorDistance;

        if (mirroredCol < columns) {
          let mirroredIndex = row * columns + mirroredCol;
          boxes[mirroredIndex].style.backgroundColor = '';
        }
      });
    }
  }
}

function extractPoints() {
  let result = '';
  let boxes = document.querySelectorAll('.box');
  let columns = parseInt(document.querySelector('#columns').value);
  let rows = parseInt(document.querySelector('#rows').value);

  for (let i = 0; i < boxes.length / columns; i++) {
    let start = -1;
    let end = -1;
    for (let j = 0; j < columns; j++) {
      let box = boxes[i * columns + j];
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

function createGrid() {
  // Get the grid element and clear its content
  let gridElement = document.querySelector('#grid');
  gridElement.innerHTML = '';
  document.getElementById('download-button').style.display = 'block';

  // Attach the function to the button's click event
  document.getElementById('download-button').addEventListener('click', () => {
    downloadFullPageScreenshot();
  });
  // Get the number of columns and rows
  let columnsElement = document.querySelector('#columns');
  let rowsElement = document.querySelector('#rows');
  let columnsValue = parseInt(columnsElement.value);
  let rowsValue = parseInt(rowsElement.value);

  // Set the CSS variables for the number of columns and rows
  gridElement.style.setProperty('--columns', columnsValue);
  gridElement.style.setProperty('--rows', rowsValue);

  // Create the grid boxes
  for (let i = 0; i < rowsValue; i++) {
    for (let j = 0; j < columnsValue; j++) {
      let box = document.createElement('div');
      box.classList.add('box');
      box.onclick = () => markBox(box);
      gridElement.appendChild(box);
    }
  }

  // Hide the input elements and button for choosing the number of rows and columns
  columnsElement.parentElement.style.display = 'none';
  rowsElement.parentElement.style.display = 'none';
  document.querySelector('button[onclick="createGrid()"]').style.display = 'none';

  // Add the remaining input elements and buttons
  let buttonContainer = document.createElement('div');
  buttonContainer.classList.add('button-container');
  buttonContainer.innerHTML = `
    <label for="mirror-count">Number of mirrors:</label>
    <input type="number" id="mirror-count" value="1">
  `;
  document.body.appendChild(buttonContainer);

  buttonContainer = document.createElement('div');
  buttonContainer.classList.add('button-container');
  buttonContainer.innerHTML = `
    <label for="mirror-distance">Distance between mirrors:</label>
    <input type="number" id="mirror-distance" value="10">
  `;
  document.body.appendChild(buttonContainer);

  buttonContainer = document.createElement('div');
  buttonContainer.classList.add('button-container');
  let mirrorButton = document.createElement('button');
  mirrorButton.onclick = mirrorDesign;
  mirrorButton.textContent = 'Mirror';
  buttonContainer.appendChild(mirrorButton);
  document.body.appendChild(buttonContainer);

  buttonContainer = document.createElement('div');
  buttonContainer.classList.add('button-container');
  let undoButton = document.createElement('button');
  undoButton.onclick = undoMirror;
  undoButton.textContent = 'Undo';
  buttonContainer.appendChild(undoButton);
  document.body.appendChild(buttonContainer);

  buttonContainer = document.createElement('div');
  buttonContainer.classList.add('button-container');
  let finishButton = document.createElement('button');
  finishButton.onclick = extractPoints;
  finishButton.textContent = 'Finish';
  buttonContainer.appendChild(finishButton);
  document.body.appendChild(buttonContainer);
}


let isDragging = false;
let startBox = null;

document.querySelector('.grid').addEventListener('mousedown', event => {
  isDragging = true;
  startBox = event.target;

  if (startBox.classList.contains('box')) {
    startBox.style.backgroundColor = currentColor;
  }
});

document.addEventListener('mouseup', () => {
  isDragging = false;
  startBox = null;
});

document.querySelectorAll('.box').forEach(box => {
  box.addEventListener('mouseenter', () => {
    if (isDragging && startBox) {
      box.style.backgroundColor = startBox.style.backgroundColor;
    }
  });
});

document.addEventListener('mousemove', event => {
  if (isDragging && startBox) {
    const hoveredBox = document.elementFromPoint(event.clientX, event.clientY);
    if (hoveredBox && hoveredBox.classList.contains('box')) {
      hoveredBox.style.backgroundColor = startBox.style.backgroundColor;
    }
  }
});


function downloadFullPageScreenshot() {
  const body = document.body;
  const html = document.documentElement;
  const width = Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth);
  const height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
  
  // Create a canvas element to capture the full page screenshot
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const context = canvas.getContext('2d');

  // Capture the full page screenshot
  html2canvas(document.body, {
    canvas: canvas,
    width: width,
    height: height,
    scrollX: window.scrollX,
    scrollY: window.scrollY,
  }).then(canvas => {
    // Convert the canvas content to a data URL
    const image = canvas.toDataURL('image/png');

    // Create a link element and trigger a click event to download the screenshot
    const link = document.createElement('a');
    link.href = image;
    link.download = 'full-page-screenshot.png';
    link.click();
  });
}

// Attach the function to the button's click event
document.getElementById('full-page-screenshot').addEventListener('click', downloadFullPageScreenshot);
