var gridHeight = 75;
var gridWidth = 100;
var waitTimeBetweenCycles = 100;

var dotElements = [];
var dotContents = [];

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

            dotElements.push(button);
            dotContents.push(false);

            currentID++;
        }

        parentElement.appendChild(document.createElement("br"));
    }

    for (let id = 0; id < gridHeight * gridWidth; id++) {
        dotElements[id].addEventListener("click", () => {
            dotClick(id);
        })
    }

    setInterval(() => {
        updateGrid();
    }, waitTimeBetweenCycles);
}

function dotClick(id) {
    //console.log("dotClicked called for " + id)
    if (dotContents[id]) {
        dotContents[id] = false;
    }
    else {
        dotContents[id] = true;
    }

    changesList.push(id);
}

function updateGrid() {
    //console.log("updadeGrid function called for the following changes: \n" + changesList);

    while (changesList.length > 0) {
        switchDot(changesList.shift());
    }

    //console.log("updateGrid finished with resulting changes list: \n " + changesList);
}

function switchDot(id) {
    dotContents[id] ? dotElements[id].style.backgroundColor = "#FCDAB7" : dotElements[id].style.backgroundColor = "";
}