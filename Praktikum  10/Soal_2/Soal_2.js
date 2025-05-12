$(document).ready(function () {
    $("#add").click(function () {
      const nama = $("#nama").val();
      if (nama) {
        $("<div>" + nama + "</div>").appendTo("#list-nama");
      }
    });
  
    $("#search").click(function () {
      const keyword = $("#nama").val();
      $("#list-nama div").removeClass("underline");
      $("#list-nama div:contains('" + keyword + "')").addClass("underline");
    });
  });
  