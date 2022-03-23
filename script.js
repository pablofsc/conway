var gridHeight = 75;
var gridWidth = 100;
var waitTimeBetweenCycles = 100;

var updateSemaphore = false;

var cellButtonElements = [];
var cellStates = [];

var changesList = [];

var pause = true;

window.onload = function () {
    const parentElement = document.getElementById("container-table"); // DOM location when buttons will be added

    let currentID = 0;
    for (j = 0; j < gridHeight; j++) {
        for (i = 0; i < gridWidth; i++) {
            let button = document.createElement("button");
            button.classList.add("cell");
            button.id = currentID;
            parentElement.appendChild(button); // to add new element to DOM

            cellButtonElements.push(button);
            cellStates.push(false);

            currentID++;
        }

        parentElement.appendChild(document.createElement("br"));
    }

    for (let id = 0; id < gridHeight * gridWidth; id++) {
        cellButtonElements[id].addEventListener("click", () => {
            cellClick(id);
        })
    }

    setInterval(() => {
        updateSemaphore = true;
        if (!pause) {
            calculateNextCycle();
        }
        updateGrid();
        updateSemaphore = false;
    }, waitTimeBetweenCycles);

    document.getElementById("play").addEventListener("click", () => {
        switch (pause) {
            case true:
                document.getElementById("play").innerHTML = "PAUSE";
                waitTimeBetweenCycles = 100;
                break;

            case false:
                document.getElementById("play").innerHTML = "PLAY"
                waitTimeBetweenCycles = 10;
        }

        pause = !pause;
    });
}

function calculateNextCycle() {
    let id = 0;
    for (j = 0; j < gridHeight; j++) {
        for (i = 0; i < gridWidth; i++) {
            if (calculateCellFate(i, j, id) != cellStates[id]) {
                //console.log("CELL " + id + " WILL SWITCH STATE NEXT CYCLE. CURRENTLY " + cellStates[id]);
                registerChange(id);
            }
            id++;
        }
    }
}

function calculateCellFate(x, y, id) {
    if (interventionsList.includes(id)) {
        return (cellStates[id]);
    }

    adjacentCells = getAdjacentCells(x, y);

    let neighborCount = 0;
    for (let cell in adjacentCells) {
        if (cellStates[adjacentCells[cell]] === true) {
            neighborCount++;
            //console.log(adjacentCells[cell] + " is true. (neighbor of " + id + ") -> " + adjacentCells);
        }
    }

    if (neighborCount > 0) {
        //console.log("CELL " + id + " HAS " + neighborCount + " NEIGHBORS");
    }

    if (cellStates[id]) { // cell is alive
        if (neighborCount < 2) return false;
        if (neighborCount > 3) return false;
        else return true;
    }
    else { // cell is dead
        if (neighborCount === 3) return true;
        else return false;
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
    registerChange(id);
    registerIntervention(id);
}

function registerChange(id) {
    changesList.push(id);
}

function registerIntervention(id) {
    interventionsList.push(id);
}

function updateGrid() {
    //console.log("updadeGrid function called for the following changes: \n" + changesList);
    //console.log("...with the following list of interventions: " + interventionsList);

    while (changesList.length > 0) {
        switchCellStateNow(changesList.pop());
    }

    while (interventionsList.length > 0) {
        interventionsList.pop();
    }

    //console.log("updateGrid finished resulting with this changes list: \n " + changesList);
    //console.log("updateGrid finished resulting with this interv. list: \n " + interventionsList);
}

function switchCellStateNow(id) {
    cellStates[id] ? cellStates[id] = false : cellStates[id] = true;
    cellStates[id] ? cellButtonElements[id].style.backgroundColor = "#FCDAB7" : cellButtonElements[id].style.backgroundColor = "";
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