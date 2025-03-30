let number;

while (true) {
    number = prompt("Masukkan angka untuk membuat tabel perkalian:");

    if (number !== null && !isNaN(number) && number.trim() !== "") {
        number = parseInt(number);
        break;
    } else {
        alert("Masukkan angka yang valid!");
    }
}

let table = `<h2>Tabel Perkalian ${number}</h2><table border='1' cellpadding='5'>`;

for (let i = 1; i <= number; i++) {
    table += `<tr><td>${number} x ${i}</td><td>=</td><td>${number * i}</td></tr>`;
}

table += "</table>";

document.getElementById("output").innerHTML = table;