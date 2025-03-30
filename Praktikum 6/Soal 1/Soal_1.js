function hitung() {
    let num1 = parseInt(document.getElementById('num1').value);
    let num2 = parseInt(document.getElementById('num2').value);
    
    if (!isNaN(num1) && !isNaN(num2)) {
        document.getElementById('a').innerText = num1;
        document.getElementById('b').innerText = num2;
        document.getElementById('sum').innerText = num1 + num2;
        document.getElementById('c').innerText = num1;
        document.getElementById('d').innerText = num2;
        document.getElementById('diff').innerText = num1 - num2;
    } else {
        alert("Masukkan angka yang valid!");
    }
}