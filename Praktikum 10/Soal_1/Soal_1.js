$(document).ready(function () {
    $("li").hover(
      function () {
        $("li ol").hide();
        $(this).children("ol").show();
      },
      function () {}
    );
  });
  