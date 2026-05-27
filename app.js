const experiences = [
  {
    id: "app-desde-cero",
    title: "Como se crea una app desde cero",
    area: "Tecnologia",
    mode: "Virtual",
    type: "Interinstitucional",
    source: "Interes detectado",
    host: "ProductoLab",
    date: "12 de junio",
    years: "3ro a 6to",
    level: "Exploratorio",
    seats: 18,
    totalSeats: 100,
    match: 96,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAchdwwzBKdGTZQ5-VzEirOEFiGln5PutkT8NFma7Eas_ZA_K3dXHWHBO74cZnZC52RB9F963RQvE_GDNj-VIFgjQKezl_skuTkxxhFHn9Tlv4YN620ceU9rBDMC3LvNNjbDIPh-qB0cymnp-IQDBCu1zXm4QyV6dDeKOgCLUSdVMJmdKGQUFcyhd-ITC0QWwDDugk-9_Lq9SdFfrVfzBEHJqS2m6E_6RiC2_eplPocDOeypj6T4BHPIw8lhymk3PyZ_JbKKbi1OeVQ",
    institutions: ["Escuela Tecnica N°1", "Colegio San Martin", "Instituto Belgrano", "Escuela Media N°12"],
    description:
      "Un recorrido por las decisiones, roles y herramientas que convierten una idea en una aplicacion real.",
    tags: ["Tecnologia", "Diseño UX", "Emprendimiento"],
  },
  {
    id: "ux-ui",
    title: "Diseño UX/UI: como se piensa una app",
    area: "Diseño",
    mode: "Presencial",
    type: "Compartida",
    source: "Propuesta de empresa",
    host: "Globant",
    date: "18 de junio",
    years: "3ro a 6to",
    level: "Inicial",
    seats: 32,
    totalSeats: 60,
    match: 91,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCuwA154YVTjpaYwgkXSBZMR9TG6uxnkOilEpRFEKszdJbWY11zamGayEFvoeJg9WOPfKRNe9_hlYGLBozcZV2ask3a7jC06IHNj0ywSnMwxo9hmlCFh72i2ZdXffK14dMJxn8ORdYp5pt-YjIBueZE8imb9jwl-1g36zDuzycqwiiFvlce6bsrCHqeMgcGc3ff1T1F9IvG_5-8YeHhbm8GuXeFiMSQeEY_2TbCoSTauPN6KVLy5XuGwZA64x7DZFJLNs1ySYQ2CyAm",
    institutions: ["Escuela Tecnica N°1", "Instituto Belgrano"],
    description:
      "Actividad practica para entender usuarios, pantallas, prototipos y decisiones de diseño digital.",
    tags: ["Diseño", "Tecnologia", "Producto"],
  },
  {
    id: "finanzas",
    title: "Finanzas personales para adolescentes",
    area: "Finanzas",
    mode: "Virtual",
    type: "Interinstitucional",
    source: "Interes detectado",
    host: "Banco Ciudad",
    date: "20 de junio",
    years: "4to a 6to",
    level: "Exploratorio",
    seats: 44,
    totalSeats: 120,
    match: 78,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBqgpo5PcQwW9N8HIqRi3taol4WrFesnPVcWdViAX04g-lt0hQKliMxQlIxA0xM8J1ZfLoITjB6fCtRH50T9xwDzL2toyVfCIQF24VT4kL_bbVf1SVKoEXKjWOyFohOLvUeG9HBd3FmxXlNn8NLzRHR1R_0ox4tBSx0VtkHW7we-KdZlzCRzVTTyLbiQoVdq27uDRjOQ7D7YSPavHMlyheiNDVd837RaWJSUJZy9c7rrJx8Qu8Rt4KaphLYl9kCt-rlE8jEcjT-VLW_",
    institutions: ["Escuela Comercial N°4", "Escuela Tecnica N°1", "Colegio Norte"],
    description:
      "Una experiencia simple para aprender presupuesto, ahorro, consumo responsable y primeras decisiones economicas.",
    tags: ["Finanzas", "Vida adulta", "Negocios"],
  },
  {
    id: "salud",
    title: "Como es trabajar en salud hoy",
    area: "Salud",
    mode: "Hibrida",
    type: "Compartida",
    source: "Propuesta profesional",
    host: "Hospital Universitario Austral",
    date: "26 de junio",
    years: "3ro a 6to",
    level: "Exploratorio",
    seats: 25,
    totalSeats: 50,
    match: 74,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB4Cvoe-YGZoUCEwucqqxXg0zTskRobXoAO2CNfblUiSpzDSSVLaThmVr7ySQSJYDw4bW6KM_tmYoKbj07-C2m8kpdfysyox3weOinasXOq4uHQfT06BeBCdN7t79DV18tNZzGuqH_IbdhTTZSu4CiZelN9WeSHdEv4DrMWHxlByWh-uo1I-ji2-ku8CIl7QIB8tFp6M2o16fSl44X0WXIshgcu4HFeJJWuxXGhmNCWz15GdZwf0IjxdueT4yHAAc_CbynFso9dHtPz",
    institutions: ["Instituto Belgrano", "Escuela Media N°12"],
    description:
      "Profesionales de distintas areas cuentan como se trabaja en equipos de salud y que caminos formativos existen.",
    tags: ["Salud", "Ciencias", "Comunidad"],
  },
  {
    id: "ambiente",
    title: "Soluciones ambientales desde la escuela",
    area: "Ambiente",
    mode: "Presencial",
    type: "Exclusiva",
    source: "Propuesta de empresa",
    host: "EcoLab Argentina",
    date: "2 de julio",
    years: "2do a 6to",
    level: "Inicial",
    seats: 30,
    totalSeats: 30,
    match: 69,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDVFJ87IymdsHdFQW7KWYaP96O3v8OXN3pg1FvQL5x-aNVnNZ0JIT03KekyRB0TWMo9gB0IEIm1PX7ELy0KC4XYu5J7w5IEIKBIMdJ6tLArf21Ulqrn-OIhY1EbNiRjKpMPLGoFx3sg_gR2CK511S2fGrNi6DwOrH85YqDNxbBa1UVS0x9k3T7fEnXZH_nuoNN8RWtVjDjbG89rMrMIFig3OqM_NxU_8-1xaWOTHtbin8dljfmk9SWP3yIvefW5PyZ6inQfc3Q6RjvU",
    institutions: ["Escuela Tecnica N°1"],
    description:
      "Taller para conectar problemas ambientales cotidianos con profesiones, empresas y proyectos reales.",
    tags: ["Ambiente", "Ciencias", "Impacto"],
  },
  {
    id: "logistica",
    title: "Logistica: como llega un producto a tu casa",
    area: "Tecnologia",
    mode: "Presencial",
    type: "Compartida",
    source: "Propuesta de empresa",
    host: "Mercado Libre",
    date: "8 de julio",
    years: "3ro a 6to",
    level: "Exploratorio",
    seats: 22,
    totalSeats: 70,
    match: 84,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDyLIBklXtI8IOlGDMvbD07O8YvUt4SlY9OCvvNm-SqvJomlQ1paFkh9oRX7fQ_kS7bHriKjvWiE9_DE4r_czTq48Vob2sl7oGHVVo2vj8PkEB1BPBeRprnt4LxSmAjPV9Db3O6glxnGpBn-tpLbQr5aRpGcuo6EcILD0byl8JilTuFdmcrEfEcGnSxtkxikuoz6RALMmDL3ub3MWSllnkyi3n4mVvrKFrpw1UJU4earY7eXXyystZShzXVfj6ht0AzUqselPTjNlmQ",
    institutions: ["Escuela Tecnica N°1", "Colegio San Martin", "Escuela Media N°8"],
    description:
      "Una visita guiada para conocer operaciones, datos, tecnologia y perfiles profesionales detras del comercio digital.",
    tags: ["Tecnologia", "Logistica", "Operaciones"],
  },
];

const routes = {
  landing: "landing-template",
  onboarding: "onboarding-template",
  experiencias: "experiencias-template",
  detalle: "detalle-template",
  estudiante: "estudiante-template",
  institucion: "institucion-template",
  profesional: "profesional-template",
  empresa: "empresa-template",
  "crear-experiencia": "crear-experiencia-template",
  "sumar-institucion": "sumar-institucion-template",
  "interes-detectado": "interes-detectado-template",
  inscripcion: "inscripcion-template",
  demanda: "demanda-template",
  feedback: "feedback-template",
  certificado: "certificado-template",
};

const app = document.querySelector("#app");

function getRoute() {
  return (window.location.hash.replace("#", "").split("?")[0] || "landing");
}

function getHashParam(name) {
  const query = window.location.hash.split("?")[1] || "";
  return new URLSearchParams(query).get(name);
}

function navigate(route) {
  window.location.hash = route;
}

function render() {
  const route = routes[getRoute()] ? getRoute() : "landing";
  const template = document.querySelector(`#${routes[route]}`);
  app.innerHTML = "";
  app.append(template.content.cloneNode(true));
  window.scrollTo(0, 0);
  requestAnimationFrame(() => window.scrollTo(0, 0));
  setTimeout(() => window.scrollTo(0, 0), 80);

  wireRouteButtons();

  if (route === "experiencias") {
    setupCatalog();
  }

  if (route === "estudiante") {
    renderStudentRecommendations();
  }

  if (route === "detalle") {
    renderExperienceDetail();
  }
}

function wireRouteButtons() {
  document.querySelectorAll("[data-route]").forEach((element) => {
    element.addEventListener("click", () => navigate(element.dataset.route));
  });
}

function setupCatalog() {
  const areaFilter = document.querySelector("#area-filter");
  const modeFilter = document.querySelector("#mode-filter");
  const typeFilter = document.querySelector("#type-filter");
  const update = () => {
    const area = areaFilter.value;
    const mode = modeFilter.value;
    const type = typeFilter.value;
    const filtered = experiences.filter((experience) => {
      const areaMatches = area === "Todas" || experience.area === area;
      const modeMatches = mode === "Todas" || experience.mode === mode;
      const typeMatches = type === "Todas" || experience.type === type;
      return areaMatches && modeMatches && typeMatches;
    });

    document.querySelector("#result-count").textContent =
      filtered.length === 1 ? "1 experiencia" : `${filtered.length} experiencias`;

    document.querySelector("#experience-grid").innerHTML = filtered
      .map((experience) => experienceCard(experience))
      .join("");

    wireRouteButtons();
  };

  areaFilter.addEventListener("change", update);
  modeFilter.addEventListener("change", update);
  typeFilter.addEventListener("change", update);
  update();
}

function experienceCard(experience) {
  return `
    <article class="experience-card">
      <div class="experience-media">
        <img src="${experience.image}" alt="${experience.title}" />
        <div class="media-badges">
          <span class="open-badge">Cupos abiertos</span>
          <span class="type-badge">${experience.type}</span>
        </div>
        <span class="match-badge">${experience.match}% afinidad</span>
      </div>
      <div class="experience-content">
      <header>
        <div>
          <span class="eyebrow">${experience.area}</span>
          <h2>${experience.title}</h2>
        </div>
      </header>
      <p>${experience.description}</p>
      <div class="card-meta">
        <span>${experience.host}</span>
        <span>${experience.type}</span>
        <span>${experience.mode}</span>
        <span>${experience.date}</span>
        <span>${experience.years}</span>
        <span>${experience.seats} cupos libres</span>
      </div>
      <p class="shared-note">${experience.institutions.length > 1 ? `Participan ${experience.institutions.length} instituciones` : "Experiencia para una institucion"}</p>
      <div class="interest-list">
        ${experience.tags.map((tag) => `<span>${tag}</span>`).join("")}
      </div>
      <div class="card-actions">
        <button class="primary-button" onclick="window.location.hash='detalle?id=${experience.id}'">Ver detalle</button>
        <button class="secondary-button">Guardar</button>
      </div>
      </div>
    </article>
  `;
}

function renderStudentRecommendations() {
  const target = document.querySelector("#student-recommendations");
  target.innerHTML = experiences
    .slice(0, 3)
    .map(
      (experience) => `
        <article class="list-card">
          <b>${experience.title}</b>
          <span>${experience.host} · ${experience.mode} · ${experience.date} · ${experience.match}% afinidad</span>
        </article>
      `,
    )
    .join("");
}

function renderExperienceDetail() {
  const id = getHashParam("id") || experiences[0].id;
  const experience = experiences.find((item) => item.id === id) || experiences[0];
  const setText = (selector, value) => {
    const node = document.querySelector(selector);
    if (node) node.textContent = value;
  };

  setText("#detail-area", experience.area);
  setText("#detail-title", experience.title);
  setText("#detail-description", experience.description);
  setText("#detail-host", experience.host);
  setText("#detail-mode", experience.mode);
  setText("#detail-date", experience.date);
  setText("#detail-years", experience.years);
  setText("#detail-seats", `${experience.seats} de ${experience.totalSeats} cupos disponibles`);
  setText("#detail-enrollment-copy", `${experience.seats} de ${experience.totalSeats} cupos disponibles. Participan estudiantes de ${experience.institutions.length} instituciones.`);
  setText("#detail-type", experience.type);
  const sourceNode = document.querySelector("#detail-source");
  if (sourceNode) sourceNode.textContent = experience.source;
  const imageNode = document.querySelector("#detail-image");
  if (imageNode) imageNode.src = experience.image;
  document.querySelector("#detail-institutions").innerHTML = experience.institutions
    .map((institution) => `<span>${institution}</span>`)
    .join("");
  document.querySelector("#detail-tags").innerHTML = experience.tags.map((tag) => `<span>${tag}</span>`).join("");
}

window.addEventListener("hashchange", render);
render();
