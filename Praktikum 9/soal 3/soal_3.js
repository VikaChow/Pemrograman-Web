let dataArray = [];

function addData() {
    const input = document.getElementById("dataInput");
    const value = parseFloat(input.value);
    if (!isNaN(value)) {
        dataArray.push(value);
        input.value = "";
    }
}

function performOperation() {
    const op = document.getElementById("operationSelect").value;
    let result = "";

    switch(op) {
        case "display":
            result = dataArray.join(", ");
            break;
        case "count":
            result = dataArray.length;
            break;
        case "sum":
            result = dataArray.reduce((a, b) => a + b, 0);
            break;
        case "average":
            result = dataArray.length ? (dataArray.reduce((a, b) => a + b, 0) / dataArray.length).toFixed(2) : "0";
            break;
        case "max":
            result = Math.max(...dataArray);
            break;
        case "min":
            result = Math.min(...dataArray);
            break;
        case "odd":
            result = dataArray.filter(x => x % 2 !== 0).join(", ");
            break;
        case "even":
            result = dataArray.filter(x => x % 2 === 0).join(", ");
            break;
        case "clear":
            dataArray = [];
            result = "";
            break;
        default:
            result = "";
    }
    document.getElementById("result").value = result;
}