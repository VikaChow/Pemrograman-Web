$(document).ready(function () {
  $("#search").click(function () {
    const kelas = $(":radio[name='kelas']:checked").val();
    let url = "";
    if (kelas === "A") {
      url = "nilaiA.json";
    } else if (kelas === "B") {
      url = "nilaib.json"; 
    } else {
      url = "nilai.json";
    }
    $.getJSON(url, function (data) {
      let rows = "";
      $.each(data.mahasiswa, function (index, mhs) {
        rows += `
          <tr>
            <td>${mhs.NRP}</td>
            <td>${mhs.nama}</td>
            <td>${mhs.kelas}</td>
            <td>${mhs.nilaiakhir}</td>
          </tr>`;
      });
      $("#DaftarMahasiswa tbody").html(rows);
    });
  });
});
