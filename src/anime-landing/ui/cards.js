const CARD_COPY = {
  es: [
    { title: "Timeline de entrada", body: "Secuencia de entrada sincronizada entre 3D y UI.", chip: "TL" },
    { title: "Loop 3D", body: "Rotación, respiración y shimmer de partículas.", chip: "3D" },
    { title: "Parallax por puntero", body: "Respuesta suave a ratón y touch.", chip: "UX" },
    { title: "Scroll-driven", body: "El scroll controla intensidad y animaciones.", chip: "SCR" },
  ],
  en: [
    { title: "Intro timeline", body: "Synchronized intro sequence across 3D and UI.", chip: "TL" },
    { title: "3D loop", body: "Rotation, breathing and particle shimmer.", chip: "3D" },
    { title: "Pointer parallax", body: "Smooth response to mouse and touch.", chip: "UX" },
    { title: "Scroll-driven", body: "Scroll controls intensity and animations.", chip: "SCR" },
  ],
};

export function mountCards(container, lang = "es") {
  const cards = CARD_COPY[lang === "en" ? "en" : "es"];

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
