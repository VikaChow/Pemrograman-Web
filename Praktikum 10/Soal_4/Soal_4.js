$(document).ready(function () {
    $(".header").change(function () {
      $(".body").prop("checked", $(this).is(":checked"));
    });
  });
  