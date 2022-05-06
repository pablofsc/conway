var gridHeight;
var gridWidth;

var intervalHandle;

var cycleNowRunning = false;

var cellButtonElements = [];
var cellStates = [];

var changesList = [];
var interventionsList = [];

var paused = true;
var infiniteBorders = true;
let shouldAutopause = true;

$(function () {
    $('[data-toggle="tooltip"]').tooltip();
})

window.onload = function () {
    setUpSize();

    const parentElement = document.getElementById("container-table");

    let currentID = 0;
    for (j = 0; j < gridHeight; j++) {
        for (i = 0; i < gridWidth; i++) {
            let button = document.createElement("button");
            button.classList.add("cell");
            button.id = currentID;
            parentElement.appendChild(button);

            cellButtonElements.push(button);
            cellStates.push(false);

            currentID++;
        }

        let setWidth = gridWidth * 10 + 40; // padding size

        $("#container-table").css("width", setWidth);
        //parentElement.appendChild(document.createElement("br"));
    }

    for (let id = 0; id < gridHeight * gridWidth; id++) {
        cellButtonElements[id].addEventListener("click", () => {
            cellClick(id);
        })
    }

    setUpButtons();

    let language = navigator.language || navigator.userLanguage;

    if (language.includes("pt-")) {
        $("#portuguese").attr("checked", true);
        changeLanguage("pt");
    }
    else {
        $("#english").attr("checked", true);
        changeLanguage("en");
    }
}

function setUpSize() {
    let height = $(document).height();
    let width = $(document).width()

    if (width < 1100) {
        alert("Window size not supported")
    }

    gridHeight = Math.round((height - 200) / 10);
    gridWidth = Math.round((width - 125) / 10);

    if (gridHeight > 100) {
        gridHeight = 100;
    }

    if (gridWidth > 150) {
        gridWidth = 150;
    }
}

function switchAutoPause() {
    shouldAutopause = !shouldAutopause;
}

function switchInfiniteBorders() {
    infiniteBorders = !infiniteBorders;
}

function setUpButtons() {
    $("#wipe").on("click", () => {
        wipeGrid();
        updateGrid();
    });

    $("#random").on("click", () => {
        randomizeGrid(document.getElementById("randomizePercentage").value);
        updateGrid();
    });

    $("#advanceOneCycle").on("click", () => {
        calculateNextCycle();
        updateGrid();
    });

    $("#pause").on("click", () => {
        paused = true;
        clearInterval(intervalHandle);
    });

    $("#play").on("click", () => {
        startCycling((1000 / 5));
    });

    $("#ff").on("click", () => {
        startCycling(1000 / 30);
    });
}

function startCycling(cycleDuration) {
    paused = false;

    clearInterval(intervalHandle);
    intervalHandle = setInterval(() => {
        if (cycleNowRunning) {
            console.log("Cycles are taking longer than expected");
            while (cycleNowRunning);
        }
        cycle();
    }, cycleDuration);
}

function cycle() {
    cycleNowRunning = true;

    if (!paused) {
        calculateNextCycle();
    }
    updateGrid();

    cycleNowRunning = false;
}

function wipeGrid() {
    while (changesList.length > 0) {
        changesList.pop();
    }

    for (let i = 0; i < gridHeight * gridWidth; i++) {
        if (cellStates[i] === true) {
            registerChange(i);
        }
    }

    updateGrid();
}

function randomizeGrid(randomizePercentage) {
    for (let i = 0; i < gridHeight * gridWidth; i++) {
        let nextState;
        if (Math.floor(Math.random() * 100) + 1 > randomizePercentage) {
            nextState = false;
        }
        else {
            nextState = true;
        }

        if (nextState != cellStates[i]) {
            registerChange(i);
        }
    }
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

    if (!infiniteBorders) {
        if (x === 0 || x === gridWidth - 1 || y === 0 || y === gridHeight - 1) {
            return false;
        }
    }

    adjacentCells = getAdjacentCells(x, y);

    let neighborCount = 0;
    for (let cell in adjacentCells) {
        if (cellStates[adjacentCells[cell]] === true) {
            neighborCount++;
            //console.log(adjacentCells[cell] + " is true. (neighbor of " + id + ") -> " + adjacentCells);
        }
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

function cellClick(id) {
    while (cycleNowRunning);
    //console.log("cellClick called for " + id)
    registerChange(id);
    registerIntervention(id);
    if (paused) {
        updateGrid();
    }
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

    if (shouldAutopause && changesList.length === 0 && interventionsList.length === 0) {
        $("#pause").click();
        return;
    }

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

function gridIsEmpty() {
    for (let i = 0; i < gridHeight * gridWidth; i++) {
        if (cellStates[i] === true) return false;
    }

    return true;
}

function changeLanguage(language) {
    if (language === 'en') {
        $('#aboutText').html(
            `
        Conway's Game of Life is a cellular automata devised by mathematician John Conway in 1970.
        <br>
        This is a zero-player game, which means the game's evolution is determined by its initial state and
        a set of rules. This version of the game also allows the user to intervene while it evolves.
        <br>
        <br>
        <br>
        The state of every cell in the next cycle is determined by the amount of live neighbours it has.
        Every possible behaviour in this game stems from the following rules:
        <br>
        <br>
        <ul>
            <li>Any live cell with two or three live neighbours survives.</li>
            <li>Any dead cell with three live neighbours becomes a live cell.</li>
            <li>All other cells die or stay dead.</li>
        </ul>
        `);

        $('#modalTitle').html("About Conway's Game of Life");

        $('#autoPauseLabel').html('AUTOPAUSE');
        $('#autoPauseTooltip').tooltip().attr('data-original-title', 'Automatically pause when screen stabilizes');

        $('#infiniteBordersLabel').html('INFINITE BORDERS');
        $('#infiniteBordersTooltip').tooltip().attr('data-original-title', 'Enable infinite borders');

        $('#random').tooltip().attr('data-original-title', 'Randomize screen (will wipe the current screen)');
        $('#randomizePercentage').tooltip().attr('data-original-title', 'Percentage of live cells on randomization');

        $('#wipe').tooltip().attr('data-original-title', 'Wipe screen');

        $('#advanceOneCycle').tooltip().attr('data-original-title', 'Advance one cicle');
    }
    else if (language === 'pt') {
        $('#aboutText').html(
            `
        O Jogo de Conway é um autômato celular desenvolvido pelo matemático John Conway em 1970.
        <br>
        Trata-se de um jogo sem jogadores, o que quer dizer que a evolução do jogo é determinada pelo seu 
        estado inicial e por um conjunto de regras. Esta versão do jogo também permite que o usuário 
        interfira enquanto ele evolui.
        <br>
        <br>
        O estado de cada célula no próximo ciclo é determinado pela quantidade de vizinhos vivos que ela
        tem.
        Todo comportamento possível neste jogo advem das seguintes três regras:
        <br>
        <br>
        <ul>
            <li>Toda célula viva com dois ou três vizinhos vivos sobrevive.</li>
            <li>Toda célula morta com três vizinhos vivos se torna viva.</li>
            <li>Todas as outras células morrem ou permanecem mortas.</li>
        </ul>
        `);

        $('#modalTitle').html('Sobre o Jogo de Conway');

        $('#autoPauseLabel').html('PAUSA AUTOMÁTICA');
        $('#autoPauseTooltip').tooltip().attr('data-original-title', 'Pausar automaticamente quando a tela se estabilizar');

        $('#infiniteBordersLabel').html('BORDAS INFINITAS');
        $('#infiniteBordersTooltip').tooltip().attr('data-original-title', 'Habilitar bordas infinitas');

        $('#random').tooltip().attr('data-original-title', 'Randomizar tela (limpa a tela atual)');
        $('#randomizePercentage').tooltip().attr('data-original-title', 'Porcentagem de células vivas ao randomizar');

        $('#wipe').tooltip().attr('data-original-title', 'Limpar tela');

        $('#advanceOneCycle').tooltip().attr('data-original-title', 'Avançar um ciclo');
    }
}