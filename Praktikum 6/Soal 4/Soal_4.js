function convert() {
    let inputValue = document.getElementById("inputValue").value;
    let conversionType = document.getElementById("conversionType").value;
    let outputField = document.getElementById("outputValue");

    if (conversionType === "decimal-binary") {
        if (!inputValue || isNaN(inputValue) || inputValue < 0 || inputValue > 255) {
            alert("Masukkan angka antara 0 hingga 255!");
            return;
        }

        let decimal = parseInt(inputValue);
        let binary = "";

        for (let i = 7; i >= 0; i--) {
            let bit = Math.floor(decimal / Math.pow(2, i));
            binary += bit;
            decimal -= bit * Math.pow(2, i);
        }

        outputField.value = binary;

    } else if (conversionType === "binary-decimal") {
        if (!/^[01]{8}$/.test(inputValue)) {
            alert("Masukkan 8 digit angka biner (0 atau 1)!");
            return;
        }

        let decimal = 0;

   
        for (let i = 0; i < 8; i++) {
            decimal += parseInt(inputValue[i]) * Math.pow(2, 7 - i);
        }

        outputField.value = decimal;
    }
}

function resetForm() {
    document.getElementById("inputValue").value = "";
    document.getElementById("outputValue").value = "";
}