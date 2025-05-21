$(document).ready(function () {

    $(".box").click(function () {
      $(this).css("background-color", "red");
    });
    $("#change").click(function () {
      $(".box").each(function () {
        const color = $(this).css("background-color");
  
        if (color === "rgb(255, 0, 0)") {
          return false;
        }
        $(this).css("background-color", "yellow");
      });
    });
  });
  