const API_URL = "https://data.jujutsukaisenapi.site/api/v1/characters";

let allCharacters = [];
let activeFilter = "all";

// DOM refs
const grid = document.getElementById("grid");
const loading = document.getElementById("loading");
const error = document.getElementById("error");
const errorMsg = document.getElementById("error-msg");
const noResults = document.getElementById("no-results");
const resultsCount = document.getElementById("results-count");
const searchInput = document.getElementById("search");
const modal = document.getElementById("modal");
const modalContent = document.getElementById("modal-content");
const modalBackdrop = document.getElementById("modal-backdrop");
const modalClose = document.getElementById("modal-close");

// Fetch
async function fetchCharacters() {
  loading.classList.remove("hidden");
  error.classList.add("hidden");
  grid.innerHTML = "";
  noResults.classList.add("hidden");
  resultsCount.classList.add("hidden");

  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    allCharacters = json.data || [];
    renderCharacters();
  } catch (err) {
    loading.classList.add("hidden");
    error.classList.remove("hidden");
    error.classList.add("flex");
    errorMsg.textContent = err.message;
  }
}

// Render
function renderCharacters() {
  loading.classList.add("hidden");
  grid.innerHTML = "";

  const query = searchInput.value.toLowerCase().trim();

  const filtered = allCharacters.filter((c) => {
    const matchesSearch =
      !query ||
      c.name.toLowerCase().includes(query) ||
      (c.alias && c.alias.some((a) => a.toLowerCase().includes(query)));

    const status = c.status?.name || "Unknown";
    const matchesFilter =
      activeFilter === "all" || status === activeFilter;

    return matchesSearch && matchesFilter;
  });

  resultsCount.classList.remove("hidden");
  resultsCount.textContent = `${filtered.length} character${filtered.length !== 1 ? "s" : ""}`;

  if (filtered.length === 0) {
    noResults.classList.remove("hidden");
    return;
  }
  noResults.classList.add("hidden");

  filtered.forEach((char, i) => {
    const card = document.createElement("div");
    card.className = "fade-in card-hover bg-jjk-card border border-white/5 rounded-xl overflow-hidden cursor-pointer";
    card.style.animationDelay = `${i * 40}ms`;
    card.onclick = () => openModal(char);

    const statusName = char.status?.name || "Unknown";
    const statusColor = statusName === "Alive" ? "bg-jjk-alive" : statusName === "Dead" ? "bg-jjk-dead" : "bg-jjk-unknown";

    const gradeName = char.grade?.name || "Unknown";
    const affiliations = (char.affiliations || []).map((a) => a.affiliation_name).join(", ") || "None";

    card.innerHTML = `
      <div class="relative aspect-[3/4] bg-black/30 overflow-hidden">
        <img
          src="${char.image || ""}"
          alt="${char.name}"
          class="w-full h-full object-cover object-top"
          loading="lazy"
          onerror="this.style.display='none'"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-jjk-card via-transparent to-transparent"></div>
        <span class="absolute top-3 right-3 flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm">
          <span class="w-2 h-2 rounded-full ${statusColor}"></span>
          ${statusName}
        </span>
      </div>
      <div class="p-4 -mt-8 relative">
        <h2 class="text-lg font-bold leading-tight truncate">${char.name}</h2>
        ${char.alias?.length ? `<p class="text-xs text-gray-500 mt-0.5 truncate">${char.alias[0]}</p>` : ""}
        <div class="mt-3 flex flex-wrap gap-1.5">
          <span class="px-2 py-0.5 text-[10px] font-medium rounded bg-jjk-accent/20 text-jjk-light">${gradeName}</span>
          <span class="px-2 py-0.5 text-[10px] font-medium rounded bg-white/5 text-gray-400">${char.species?.species_name || "Unknown"}</span>
          <span class="px-2 py-0.5 text-[10px] font-medium rounded bg-white/5 text-gray-400">${char.gender?.name || "?"}</span>
        </div>
        <p class="text-[11px] text-gray-500 mt-2 truncate" title="${affiliations}">${affiliations}</p>
      </div>
    `;

    grid.appendChild(card);
  });
}

// Modal
function openModal(char) {
  const statusName = char.status?.name || "Unknown";
  const statusColor = statusName === "Alive" ? "text-jjk-alive" : statusName === "Dead" ? "text-jjk-dead" : "text-jjk-unknown";

  const techniques = (char.cursedTechniques || [])
    .map(
      (t) => `
      <div class="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
        ${t.image ? `<img src="${t.image}" alt="${t.technique_name}" class="w-10 h-10 rounded object-cover flex-shrink-0" onerror="this.style.display='none'" />` : ""}
        <div class="min-w-0">
          <p class="text-sm font-semibold">${t.technique_name}</p>
          <p class="text-[11px] text-gray-400 mt-0.5">${t.description || ""}</p>
          <div class="flex gap-1.5 mt-1">
            <span class="text-[9px] px-1.5 py-0.5 rounded bg-jjk-accent/20 text-jjk-light">${t.type?.name || ""}</span>
            <span class="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-gray-400">${t.range?.name || ""}</span>
          </div>
        </div>
      </div>
    `
    )
    .join("");

  const domain = char.domainExpansion;
  const domainHtml = domain
    ? `
    <div class="mt-6">
      <h3 class="text-sm font-bold text-jjk-light mb-2">Domain Expansion</h3>
      <div class="flex items-start gap-3 p-3 bg-jjk-accent/10 border border-jjk-accent/20 rounded-lg">
        ${domain.image ? `<img src="${domain.image}" alt="${domain.name}" class="w-14 h-14 rounded-lg object-cover flex-shrink-0" onerror="this.style.display='none'" />` : ""}
        <div>
          <p class="text-sm font-bold">${domain.name}</p>
          <p class="text-[11px] text-gray-400 mt-1">${domain.description || ""}</p>
        </div>
      </div>
    </div>
  `
    : "";

  const info = [
    ["Birthday", char.birthday],
    ["Height", char.height],
    ["Age", char.age],
    ["Species", char.species?.species_name],
    ["Grade", char.grade?.name],
    ["Anime Debut", char.animeDebut],
    ["Manga Debut", char.mangaDebut],
  ];

  const infoHtml = info
    .filter(([, v]) => v)
    .map(
      ([label, value]) =>
        `<div class="flex justify-between text-sm py-1.5 border-b border-white/5">
        <span class="text-gray-500">${label}</span>
        <span class="font-medium">${value}</span>
      </div>`
    )
    .join("");

  const affiliations = (char.affiliations || [])
    .map(
      (a) => `
      <span class="inline-flex items-center gap-1.5 px-2 py-1 text-xs bg-white/5 rounded-full">
        ${a.image ? `<img src="${a.image}" alt="" class="w-4 h-4 rounded-full object-cover" onerror="this.style.display='none'" />` : ""}
        ${a.affiliation_name}
      </span>
    `
    )
    .join("");

  modalContent.innerHTML = `
    <div class="relative">
      ${
        char.image
          ? `<div class="h-64 overflow-hidden">
              <img src="${char.image}" alt="${char.name}" class="w-full h-full object-cover object-top" onerror="this.style.display='none'" />
              <div class="absolute inset-0 bg-gradient-to-t from-jjk-card via-jjk-card/50 to-transparent"></div>
            </div>`
          : '<div class="h-16"></div>'
      }
      <div class="px-6 pb-6 ${char.image ? "-mt-20 relative" : "pt-10"}">
        <h2 class="text-2xl font-black">${char.name}</h2>
        ${char.alias?.length ? `<p class="text-sm text-gray-400 mt-1">${char.alias.join(" · ")}</p>` : ""}
        <span class="inline-block mt-2 text-sm font-semibold ${statusColor}">${statusName}</span>

        ${affiliations ? `<div class="flex flex-wrap gap-2 mt-3">${affiliations}</div>` : ""}

        <div class="mt-5">${infoHtml}</div>

        ${
          techniques
            ? `<div class="mt-6">
                <h3 class="text-sm font-bold text-jjk-light mb-2">Cursed Techniques (${char.cursedTechniques.length})</h3>
                <div class="grid gap-2 max-h-64 overflow-y-auto pr-1">${techniques}</div>
              </div>`
            : ""
        }

        ${domainHtml}

        ${
          char.relatives?.length
            ? `<div class="mt-6">
                <h3 class="text-sm font-bold text-jjk-light mb-2">Relatives</h3>
                <div class="flex flex-wrap gap-1.5">
                  ${char.relatives.map((r) => `<span class="text-[11px] px-2 py-1 bg-white/5 rounded-full text-gray-400">${r}</span>`).join("")}
                </div>
              </div>`
            : ""
        }
      </div>
    </div>
  `;

  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modal.classList.add("hidden");
  document.body.style.overflow = "";
}

// Events
searchInput.addEventListener("input", renderCharacters);

document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach((b) => {
      b.classList.remove("bg-jjk-accent", "text-white", "active");
      b.classList.add("bg-white/5", "text-gray-400");
    });
    btn.classList.remove("bg-white/5", "text-gray-400");
    btn.classList.add("bg-jjk-accent", "text-white", "active");
    activeFilter = btn.dataset.filter;
    renderCharacters();
  });
});

modalBackdrop.addEventListener("click", closeModal);
modalClose.addEventListener("click", closeModal);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

// Init
fetchCharacters();
