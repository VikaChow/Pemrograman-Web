$(document).ready(function () {
    $("#cari").on("input", function () {
      const keyword = $(this).val().toLowerCase();
      $(".nama").each(function () {
        const nama = $(this).text().toLowerCase();
        if (nama.includes(keyword)) {
          $(this).addClass("highlight");
        } else {
          $(this).removeClass("highlight");
        }
      });
    });
  });
  