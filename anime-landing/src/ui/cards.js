export function mountCards(container) {
  const cards = [
    { title: "Intro timeline", body: "Secuencia de entrada (3D + UI) sincronizada.", chip: "TL" },
    { title: "Loop 3D", body: "Rotacion + respiracion + shimmer particulas.", chip: "3D" },
    { title: "Pointer parallax", body: "Respuesta suave a mouse/touch.", chip: "UX" },
    { title: "Scroll-driven", body: "Scroll controla intensidad y animaciones.", chip: "SCR" },
  ];

  container.replaceChildren();
  const fragment = document.createDocumentFragment();

  cards.forEach((card) => {
    const item = document.createElement("div");
    item.className = "card";

    const chip = document.createElement("div");
    chip.className = "card-chip";
    chip.textContent = card.chip;

    const title = document.createElement("div");
    title.className = "card-title";
    title.textContent = card.title;

    const body = document.createElement("div");
    body.className = "card-body";
    body.textContent = card.body;

    item.append(chip, title, body);
    fragment.appendChild(item);
  });

  container.appendChild(fragment);
}
