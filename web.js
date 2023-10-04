let currentColor = 'black';
let copyMade = false;


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
  if (!copyMade) {
    let boxes = document.querySelectorAll('.box');
    let copyCount = parseInt(document.querySelector('#copy-count').value);
    let copyDistance = parseInt(document.querySelector('#copy-distance').value);
    let maxMarks = parseInt(document.querySelector('#max-marks').value);
    let totalPins = parseInt(document.querySelector('#total-pins').value);

    let copiedIndexes = [];

    // Calculate the available space on the right side of the grid
    let availableSpace = (maxMarks - copyCount * copyDistance) * totalPins;

    // Calculate the number of selected boxes
    let selectedBoxes = 0;

    for (let row = 0; row < totalPins; row++) {
      for (let col = 0; col < maxMarks; col++) {
        let index = row * maxMarks + col;
        if (boxes[index].style.backgroundColor === currentColor) {
          selectedBoxes++;
        }
      }
    }

    // Calculate the number of boxes required for the selected copies
    let requiredBoxes = (copyCount + 1) * selectedBoxes; // +1 for the original

    if (requiredBoxes <= availableSpace && selectedBoxes > 0) {
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

      copyMade = true;
    } else {
      alert('Not enough space to copy. Reduce the number of copies or increase the distance.');
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
  copyMade = false;
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
    <input type="number" id="copy-count" value="2" min="2">
  `;
  document.body.appendChild(buttonContainer);

  buttonContainer = document.createElement('div');
  buttonContainer.classList.add('button-container');
  buttonContainer.innerHTML = `
    <label for="copy-distance">Distance between copies:</label>
    <input type="number" id="copy-distance" value="1" min="1"> <!-- Minimum value is 1 -->
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

  let downloadButton = document.createElement('button');
  downloadButton.textContent = 'Download Grid';
  downloadButton.onclick = downloadGridImage;
  buttonContainer.appendChild(downloadButton);
  document.body.appendChild(buttonContainer);

  for (let i = 1; i <= totalPinsValue; i++) {
    let rowNumber = document.createElement('div');
    rowNumber.classList.add('number', 'row-number');
    rowNumber.textContent = i;
    document.querySelector('.row-numbering').appendChild(rowNumber);
  }

  // Add column numbering
  for (let i = 1; i <= maxMarksValue; i++) {
    let colNumber = document.createElement('div');
    colNumber.classList.add('number', 'col-number');
    colNumber.textContent = i;
    document.querySelector('.column-numbering').appendChild(colNumber);
  }
}



function downloadGridImage() {
  // Get the grid element
  let gridElement = document.querySelector('#grid');

  // Set the background color of the grid element (change to your desired background color)
  gridElement.style.backgroundColor = 'white';

  // Use html2canvas to capture the grid element as an image
  html2canvas(gridElement, { backgroundColor: null }).then(function (canvas) {
    // Restore the original background color
    gridElement.style.backgroundColor = ''; // Set it back to the original color or remove it

    // Convert the canvas to a data URL
    let dataURL = canvas.toDataURL('image/png');

    // Create a link to trigger the download
    let link = document.createElement('a');
    link.href = dataURL;
    link.download = 'grid.png';
    link.click();
  });
}
