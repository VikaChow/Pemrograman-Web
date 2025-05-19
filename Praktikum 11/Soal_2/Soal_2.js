document.getElementById("lookBtn").addEventListener("click", () => {
  fetch("SIJson.json")
    .then(response => response.json())
    .then(data => {
      const titleBox = document.getElementById("titleBox");
      titleBox.innerText = data.title;
      titleBox.style.textAlign = "center";
      titleBox.style.color = "blue";
      titleBox.style.fontWeight = "bold";
      titleBox.style.textDecoration = "underline";

      document.getElementById("generatorBox").innerText = "©" + data.generator;

      const contentBox = document.getElementById("contentBox");
      contentBox.innerHTML = "";

      data.items.forEach(item => {
        const itemHTML = `
          <div class="item">
            <div class="title"><a href="${item.link}">${item.title}</a></div>
            <div>By : ${item.author} / <i>${item.published}</i></div>
            <p>${item.description}</p>
            <div>Universitas : <a href="${item.universitas.m}">Click Here</a></div>
            <div>Tag(s) : ${item.tags}</div>
          </div>
          <br>
        `;
        contentBox.innerHTML += itemHTML;
      });
    })
    .catch(error => {
      console.error("Gagal memuat JSON:", error);
    });
});