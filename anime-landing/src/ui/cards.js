export function mountCards(container) {
  const cards = [
    { title: "Intro timeline", body: "Secuencia de entrada (3D + UI) sincronizada.", chip: "TL" },
    { title: "Loop 3D", body: "Rotacion + respiracion + shimmer particulas.", chip: "3D" },
    { title: "Pointer parallax", body: "Respuesta suave a mouse/touch.", chip: "UX" },
    { title: "Scroll-driven", body: "Scroll controla intensidad y animaciones.", chip: "SCR" },
  ];

  container.innerHTML = cards
    .map(
      (c) => `
      <div class="card">
        <div class="card-chip">${c.chip}</div>
        <div class="card-title">${c.title}</div>
        <div class="card-body">${c.body}</div>
      </div>
    `
    )
    .join("");
}
