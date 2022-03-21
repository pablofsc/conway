window.onload = function () {
    const parentElement = document.getElementById("container-table"); // DOM location when buttons will be added

    for (let i = 0; i < 7500; i++) {
        if (i % 150 === 0 && i != 0) {
            let lineBreak = document.createElement("br");
            parentElement.appendChild(lineBreak);
        }
        const button = document.createElement("button");
        button.classList.add("cell");
        button.classList.add("btn");
        button.classList.add("btn-dark");
        button.innerText = "";
        parentElement.appendChild(button); // to add new element to DOM
    }
}