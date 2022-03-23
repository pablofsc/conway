var gridHeight = 75;
var gridWidth = 100;
var waitTimeBetweenCycles = 1000;

var cellElements = [];
var cellContents = [];

var changesList = [];

window.onload = function () {
    const parentElement = document.getElementById("container-table"); // DOM location when buttons will be added

    let currentID = 0;
    for (j = 0; j < gridHeight; j++) {
        for (i = 0; i < gridWidth; i++) {
            let button = document.createElement("button");
            button.classList.add("cell");
            button.id = currentID;
            parentElement.appendChild(button); // to add new element to DOM

            cellElements.push(button);
            cellContents.push(false);

            currentID++;
        }

        parentElement.appendChild(document.createElement("br"));
    }

    for (let id = 0; id < gridHeight * gridWidth; id++) {
        cellElements[id].addEventListener("click", () => {
            cellClick(id);
        })
    }

    setInterval(() => {
        calculateNextCycle();
        updateGridLights();
    }, waitTimeBetweenCycles);
}

function calculateNextCycle() {
    let id = 0;
    for (j = 0; j < gridHeight; j++) {
        for (i = 0; i < gridWidth; i++) {
            if (calculateCellFate(i, j, id) != cellContents[id]) {
                console.log("CELL " + id + " WILL SWITCH STATE.")
                switchCellState(id);
                registerChange(id);
            }
            id++;
        }
    }
}

function calculateCellFate(x, y, id) {
    if (interventionsList.includes(id)) {
        return (cellContents[id]);
    }

    adjacentCells = getAdjacentCells(x, y);

    let neighborCount = 0;
    for (let cell in adjacentCells) {
        if (cellContents[adjacentCells[cell]] === true) {
            neighborCount++;
            console.log(cell + " is true. (neighbor of " + id + ") ->" + adjacentCells);
        }
    }

    if (neighborCount > 0) {
        console.log("CELL " + id + " HAS " + neighborCount + " NEIGHBORS");
    }

    if (neighborCount < 2) {
        return false; // dies by underpopulation
    }
    if (neighborCount === 3) {
        return true; // survives or becomes alive
    }
    if (neighborCount > 3) {
        return false; // dies by overpopulation
    }
}

function getAdjacentCells(x, y) {
    let adjacentCells = [];

    for (let j = y - 1; j <= y + 1; j++) {
        for (let i = x - 1; i <= x + 1; i++) {
            adjacentCells.push(getIDByCoordinates(i, j));
        }
    }

    adjacentCells.splice(4, 1); // removes the center cell from the array

    return (adjacentCells);
}

var interventionsList = [];

function cellClick(id) {
    while (updateSemaphore);
    //console.log("cellClicked called for " + id)
    if (cellContents[id]) {
        cellContents[id] = false;
    }
    else {
        cellContents[id] = true;
    }

    registerIntervention(id);
    registerChange(id);
}

function registerChange(id) {
    changesList.push(id);
}

function registerIntervention(id) {
    interventionsList.push(id);
}

var updateSemaphore = false;

function updateGridLights() {
    updateSemaphore = true;

    //console.log("updadeGrid function called for the following changes: \n" + changesList);
    //console.log("...with the following list of interventions: " + interventionsList);

    while (changesList.length > 0) {
        switchLight(changesList.pop());
    }

    while (interventionsList.length > 0) {
        interventionsList.pop();
    }

    //console.log("updateGrid finished resulting with this changes list: \n " + changesList);
    //console.log("updateGrid finished resulting with this interv. list: \n " + interventionsList);
    updateSemaphore = false;
}

function switchLight(id) {
    cellContents[id] ? cellElements[id].style.backgroundColor = "#FCDAB7" : cellElements[id].style.backgroundColor = "";
}

function switchCellState(id) {
    cellContents[id] ? cellContents[id] = false : cellContents[id] = true;
}

function getCoordinatesByID(targetID) {
    let id = 0;
    for (j = 0; j < gridHeight; j++) {
        for (i = 0; i < gridWidth; i++) {
            if (id === targetID) {
                return ([i, j]);
            }
            id++;
        }
    }
}

function getIDByCoordinates(inx, iny) {
    x = inx;
    y = iny;

    if (inx < 0) {
        x += gridWidth;
    }
    else if (inx >= gridWidth) {
        x -= gridWidth;
    }

    if (iny < 0) {
        y += gridHeight;
    }
    else if (iny >= gridHeight) {
        y -= gridHeight;
    }

    return (y * gridWidth + x);
}

function lightUp(arrayOfCellIDs) { // DEBUG-ONLY FUNCTION!
    for (const cell of arrayOfCellIDs) {
        cellClick(cell);
    }

    return;
}