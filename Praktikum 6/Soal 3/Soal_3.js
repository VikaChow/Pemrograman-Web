function generatePyramid() {
    let height = document.getElementById("height").value;
    
    if (!height || isNaN(height) || height <= 0) {
        alert("Masukkan angka yang valid!");
        return;
    }

    height = parseInt(height);
    let table = "<table>";

    for (let i = 1; i <= height; i++) {
        table += "<tr>";

        for (let j = 0; j < height - i; j++) {
            table += "<td></td>";
        }

        for (let k = 0; k < 2 * i - 1; k++) {
            table += `<td style="background-color: orange;"></td>`;
        }

        table += "</tr>";
    }

    table += "</table>";
    document.getElementById("output").innerHTML = table;
}