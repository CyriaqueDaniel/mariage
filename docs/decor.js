/*
 * Décor partagé par les pages du site (index.html, inscription.html).
 * À charger AVANT le script de la page, qui appelle dessinerGuirlande().
 */

/* ---------- Bouteilles fleuries suspendues (inspirées de la déco guinguette du mariage) ---------- */
// Chaque bouteille pend à une ficelle de jute nouée au goulot, contient une guirlande lumineuse
// enroulée, et un bouquet sort du goulot. Tout est dessiné en SVG : aucune image à charger.
// Le réalisme vient de couches superposées : verre teinté, ombre de volume, verre épais au fond,
// lueur des ampoules, reflets, puis le bouquet.

// Formes dessinées à partir du haut du goulot (point 0,0).
// corps = zone intérieure pour la guirlande ; col = largeur du goulot ; fond = hauteur du fond.
const FORMES_BOUTEILLES = {
  vin: { d: 'M-4 0h8v14q0 4 7 8v34q0 4-4 4h-14q-4 0-4-4v-34q7-4 7-8z', corps: { x: -8, y: 26, l: 16, h: 30 }, col: 8, fond: 60, demiLargeur: 11 },
  ronde: { d: 'M-3 0h6v12a15 15 0 1 1-6 0z', corps: { x: -9, y: 17, l: 18, h: 20 }, col: 6, fond: 41.5, demiLargeur: 14 },
  bocal: { d: 'M-6 0h12v6q6 2 6 8v24q0 4-4 4h-16q-4 0-4-4v-24q0-6 6-8z', corps: { x: -9, y: 16, l: 18, h: 22 }, col: 12, fond: 42, demiLargeur: 12 },
};

// Une teinte de verre différente par bouteille, dans les familles rouge, orange et violet.
const TEINTES_VERRE = [
  '#c1121f', // rouge rubis
  '#ffa62b', // mandarine
  '#7b2cbf', // améthyste
  '#e85d04', // orange brûlé
  '#b185f5', // lilas
  '#8d0b1a', // bordeaux
  '#ff4d6d', // cerise
];

const FLEURS = {
  blanc: '#fffdf7', jaune: '#ffc93c', orange: '#ff8c1a', corail: '#ff6b4a', rouge: '#d62828',
  rose: '#ff5d8f', fuchsia: '#d81b60', violet: '#7b2cbf', lavande: '#9d8df1',
};

/** Pétales disposés en rond. ombre = pétales plus sombres dessous ; clair = reflet plus clair dessus. */
function couronne(nb, rx, ry, dist, fill, decalage = 0, extra = '') {
  let s = '';
  for (let p = 0; p < nb; p++) {
    s += `<ellipse cx="0" cy="${(-dist).toFixed(2)}" rx="${rx.toFixed(2)}" ry="${ry.toFixed(2)}" fill="${fill}" ${extra} transform="rotate(${((360 / nb) * p + decalage).toFixed(1)})"/>`;
  }
  return s;
}

/** Une fleur : marguerite, gerbera, dahlia (pompon) ou grappe (aster). */
function fleur(type, x, y, r, c) {
  let s = '';
  if (type === 'marguerite') {
    s = couronne(12, 1.3 * r, 3 * r, 3.2 * r, '#d9d6cc', 4)            // pétales du dessous, ombrés
      + couronne(12, 1.2 * r, 2.8 * r, 3 * r, FLEURS.blanc)
      + `<circle r="${2 * r}" fill="url(#coeur)"/><circle r="${2 * r}" fill="none" stroke="#c98a00" stroke-width=".4" stroke-dasharray=".6 .6"/>`;
  }
  if (type === 'gerbera') {
    s = couronne(16, 1.2 * r, 3 * r, 3.6 * r, c, 0, 'fill-opacity=".85"')
      + couronne(16, 1, 2.6 * r, 3.2 * r, c, 11)
      + couronne(16, 0.8, 1.6 * r, 2.6 * r, '#ffffff', 11, 'fill-opacity=".22"')   // reflet sur les pétales
      + `<circle r="${2.1 * r}" fill="#3d1f08"/><circle r="${1.2 * r}" fill="#6b3a12"/>`;
  }
  if (type === 'dahlia') {
    s = `<circle r="${5 * r}" fill="${c}"/>`
      + couronne(12, 1.7 * r, 2 * r, 3.6 * r, 'rgba(0,0,0,.22)')
      + couronne(12, 1.6 * r, 1.9 * r, 3.4 * r, c, 15)
      + couronne(9, 1.3 * r, 1.5 * r, 2.2 * r, 'rgba(0,0,0,.2)', 7)
      + couronne(9, 1.2 * r, 1.4 * r, 2 * r, c, 20)
      + couronne(6, 0.9 * r, 1 * r, 1 * r, 'rgba(255,255,255,.25)', 0)
      + `<circle r="${0.9 * r}" fill="rgba(0,0,0,.3)"/>`;
  }
  if (type === 'grappe') {
    [[0, 0, 1], [-3.4, 1.8, .9], [3.3, 1.5, .95], [-1.7, -3.2, .85], [2, -3.3, .9], [0, 3.6, .8]].forEach(([a, b, t]) => {
      s += `<g transform="translate(${(a * r).toFixed(2)} ${(b * r).toFixed(2)}) scale(${(t * r).toFixed(2)})">`
        + couronne(8, .55, 1.3, 1.3, c) + `<circle r=".7" fill="#ffd23f"/></g>`;
    });
  }
  return `<g transform="translate(${x} ${y})">${s}</g>`;
}

/** Bouquet qui sort du goulot : tiges, feuillage avec nervure, petits boutons, puis les fleurs. */
function bouquet(fleurs, i) {
  const tiges = [[-8, -10], [8, -12], [0, -19], [-1, -7]].slice(0, fleurs.length)
    .map(([x, y]) => `<path d="M0 2Q${x / 2} ${y / 2} ${x} ${y}" stroke="#2f6b3a" stroke-width=".9" fill="none"/>`).join('');
  const feuilles = [[-7, -5, -42, 7.5], [7, -6, 38, 7], [-3.5, -14, -14, 7], [4.5, -15, 20, 6.5], [-10, -1, -70, 5.5], [10, -2, 72, 5]]
    .map(([x, y, a, h], k) => `<g transform="rotate(${a} ${x} ${y})">
        <ellipse cx="${x}" cy="${y}" rx="2.7" ry="${h}" fill="${k % 2 ? '#2f6b3a' : '#4f9d58'}"/>
        <path d="M${x} ${y - h + 1}V${y + h - 1}" stroke="#1e4a27" stroke-opacity=".6" stroke-width=".45"/></g>`).join('');
  const boutons = [[-12, -16], [12, -19]].map(([x, y], k) =>
    `<path d="M${x * 0.5} -4Q${x * 0.8} ${y / 2} ${x} ${y}" stroke="#2f6b3a" stroke-width=".7" fill="none"/>
     <ellipse cx="${x}" cy="${y}" rx="1.3" ry="2" fill="${k ? FLEURS.lavande : FLEURS.corail}"/>`).join('');
  const places = [[-8, -10], [8, -12], [0, -19], [-1, -7]];
  return (i % 2 ? boutons : '') + tiges + feuilles
    + fleurs.map(([type, coul], k) => fleur(type, places[k][0], places[k][1], k === 2 ? 1.1 : 0.95, FLEURS[coul])).join('');
}

/** Ficelle de jute : un trait clair + un pointillé sombre par-dessus, pour l'effet torsadé. */
function ficelle(d, epaisseur) {
  return `<path d="${d}" fill="none" stroke="#c9a46b" stroke-width="${epaisseur}" stroke-linecap="round"/>
    <path d="${d}" fill="none" stroke="#7a5a2e" stroke-width="${epaisseur * 0.55}" stroke-dasharray="${epaisseur * 0.9} ${epaisseur * 0.9}" stroke-opacity=".55"/>`;
}

function dessinerGuirlande() {
  const formes = ['vin', 'ronde', 'bocal', 'vin', 'ronde', 'vin', 'bocal'];
  const fils = [36, 56, 32, 48, 34, 58, 42]; // longueur de ficelle : irrégulière, comme dans un arbre
  const bouquets = [
    [['gerbera', 'orange'], ['marguerite'], ['dahlia', 'rouge'], ['grappe', 'violet']],
    [['marguerite'], ['grappe', 'lavande'], ['gerbera', 'fuchsia']],
    [['dahlia', 'corail'], ['gerbera', 'jaune'], ['marguerite'], ['grappe', 'rose']],
    [['grappe', 'violet'], ['marguerite'], ['gerbera', 'rouge']],
    [['gerbera', 'corail'], ['dahlia', 'jaune'], ['marguerite'], ['grappe', 'lavande']],
    [['marguerite'], ['gerbera', 'rose'], ['dahlia', 'orange']],
    [['grappe', 'violet'], ['gerbera', 'orange'], ['marguerite'], ['dahlia', 'fuchsia']],
  ];
  const ampoules = ['#fff4c2', '#ffd27a', '#ffe9a8', '#ffb3d1', '#b8f3ff', '#fff4c2', '#d4ffc2', '#ffcf6b'];
  const largeur = 400, creux = 22, n = formes.length, echelle = 1.4;

  let bouteilles = '';
  for (let i = 0; i < n; i++) {
    const x = 30 + i * ((largeur - 60) / (n - 1));
    const u = x / largeur;
    const y = 4 + 4 * creux * u * (1 - u); // point de la ficelle principale (elle forme un arc)
    const f = FORMES_BOUTEILLES[formes[i]], c = f.corps, fil = fils[i], teinte = TEINTES_VERRE[i];

    // Guirlande lumineuse : un fil cuivré qui spirale dans la bouteille, avec des ampoules dessus.
    const pts = [];
    for (let k = 0; k <= 6; k++) pts.push([c.x + (k % 2 ? c.l - 1.5 : 1.5), c.y + (k * c.h) / 6]);
    let chemin = `M${pts[0][0]} ${pts[0][1]}`;
    for (let k = 1; k < pts.length; k++) {
      const [a, b] = pts[k], [pa, pb] = pts[k - 1];
      chemin += `Q${((a + pa) / 2).toFixed(1)} ${(pb - 2).toFixed(1)} ${a} ${b}`;
    }
    let lumieres = '';
    pts.forEach(([a, b], k) => {
      const suiv = pts[k + 1];
      [[a, b], suiv ? [(a + suiv[0]) / 2, (b + suiv[1]) / 2 - 1] : null].forEach((p, m) => {
        if (!p) return;
        const coul = ampoules[(i * 2 + k * 2 + m) % ampoules.length];
        const t = 1.5 + ((i + k + m) % 3) * 0.35; // ampoules de tailles légèrement différentes
        lumieres += `<g class="lumiere" style="--k:${(i * 3 + k * 2 + m) % 9}">
          <circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${(t * 1.8).toFixed(2)}" fill="${coul}" fill-opacity=".35" filter="url(#halo)"/>
          <circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${t.toFixed(2)}" fill="${coul}"/>
          <circle cx="${(p[0] - t * 0.3).toFixed(2)}" cy="${(p[1] - t * 0.3).toFixed(2)}" r="${(t * 0.45).toFixed(2)}" fill="#fff"/></g>`;
      });
    });

    const demi = f.col / 2 + 0.6;
    bouteilles += `
      <g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">
        <g class="bouteille" style="--i:${i}">
          ${ficelle(`M0 0V${fil + 4}`, 1.4)}
          <g transform="translate(0 ${fil}) scale(${echelle})">
            <ellipse cx="0" cy="${c.y + c.h / 2}" rx="${f.demiLargeur * 1.6}" ry="${c.h * 0.9}" fill="#ffcf6b" fill-opacity=".22" filter="url(#diffus)"/>
            <path d="${f.d}" fill="${teinte}" fill-opacity=".8"/>
            <ellipse cx="0" cy="${c.y + c.h / 2}" rx="${c.l * 0.8}" ry="${c.h * 0.7}" fill="url(#lueur)"/>
            <path d="${chemin}" fill="none" stroke="#6b4f2a" stroke-width=".55" stroke-opacity=".8"/>
            ${lumieres}
            <path d="${f.d}" fill="url(#volume)"/>
            <ellipse cx="0" cy="${f.fond - 2.2}" rx="${f.demiLargeur - 2.5}" ry="1.8" fill="#000" fill-opacity=".28"/>
            <path d="${f.d}" fill="url(#reflet)"/>
            <path d="M${-f.demiLargeur + 3.2} ${c.y + 1}q-.6 ${c.h * 0.45} 0 ${c.h * 0.85}" stroke="#fff" stroke-opacity=".65" stroke-width="1.1" stroke-linecap="round" fill="none"/>
            <path d="M${f.demiLargeur - 2.6} ${c.y + 4}v${c.h * 0.35}" stroke="#fff" stroke-opacity=".3" stroke-width=".7" stroke-linecap="round"/>
            <path d="${f.d}" fill="none" stroke="${teinte}" stroke-width=".9"/>
            <path d="${f.d}" fill="none" stroke="#000" stroke-opacity=".25" stroke-width=".5"/>
            <rect x="${-f.col / 2 - 0.8}" y="-1.2" width="${f.col + 1.6}" height="2.4" rx="1.1" fill="${teinte}"/>
            <rect x="${-f.col / 2 - 0.8}" y="-1.2" width="${f.col + 1.6}" height="1" rx=".5" fill="#fff" fill-opacity=".45"/>
            ${ficelle(`M${-demi} 4h${2 * demi}M${-demi} 6.4h${2 * demi}`, 1.1)}
            ${bouquet(bouquets[i], i)}
          </g>
        </g>
      </g>`;
  }
  // Chaque guirlande a ses propres dégradés et filtres : un élément placé dans un écran caché ne s'afficherait pas ailleurs.
  document.querySelectorAll('.guirlande').forEach((el, j) => {
    el.innerHTML = `<svg viewBox="0 0 ${largeur} ${creux + 170}" role="presentation" focusable="false">
    <defs>
      <filter id="halo${j}" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="1.2"/></filter>
      <filter id="diffus${j}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5"/></filter>
      <radialGradient id="lueur${j}"><stop offset="0" stop-color="#ffe9a8" stop-opacity=".7"/><stop offset=".6" stop-color="#ffd27a" stop-opacity=".25"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>
      <radialGradient id="coeur${j}" cx=".4" cy=".35"><stop offset="0" stop-color="#ffe066"/><stop offset=".7" stop-color="#f2a900"/><stop offset="1" stop-color="#c98a00"/></radialGradient>
      <linearGradient id="volume${j}" x1="0" x2="1">
        <stop offset="0" stop-color="#000" stop-opacity=".45"/><stop offset=".22" stop-color="#000" stop-opacity=".05"/>
        <stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".5"/>
      </linearGradient>
      <linearGradient id="reflet${j}" x1="0" x2="1">
        <stop offset=".1" stop-color="#fff" stop-opacity="0"/><stop offset=".2" stop-color="#fff" stop-opacity=".35"/>
        <stop offset=".34" stop-color="#fff" stop-opacity="0"/><stop offset=".84" stop-color="#fff" stop-opacity="0"/>
        <stop offset=".9" stop-color="#fff" stop-opacity=".15"/><stop offset=".96" stop-color="#fff" stop-opacity="0"/>
      </linearGradient>
    </defs>
    ${ficelle(`M0 4Q${largeur / 2} ${4 + 2 * creux} ${largeur} 4`, 2.4)}
    ${bouteilles.replace(/url\(#(halo|diffus|lueur|coeur|volume|reflet)\)/g, `url(#$1${j})`)}</svg>`;
  });
}
