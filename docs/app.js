/*
 * Site des invités du mariage.
 * Ce fichier ne contient AUCUNE vraie info (lieu, adresses, invités) : le dépôt sera public.
 * Les infos sont demandées à Apps Script, qui ne répond qu'à un code de foyer valide.
 */

/* ---------- Réglages ---------- */

// Adresse de l'appli Apps Script (finit par /exec). Vide = seul le mode démo fonctionne.
const API_URL = '';

// Codes de démonstration : données fictives, rien n'est envoyé ni enregistré.
const CODES_DEMO = ['DEMO01', 'DEMO02'];

/* ---------- Textes de l'interface ---------- */
// L'espagnol sera rempli à l'étape 6. En attendant, un texte absent s'affiche en français.
const TEXTES = {
  fr: {
    allerContenu: 'Aller au contenu',
    chargement: 'Chargement de votre invitation…',
    connexionTitre: 'Votre invitation',
    connexionAide: 'Entrez le code à 6 caractères reçu avec votre faire-part.',
    codeEtiquette: "Code d'invitation",
    connexionBouton: 'Ouvrir mon invitation',
    codeVide: 'Entrez votre code.',
    codeInconnu: 'Ce code ne correspond à aucune invitation. Vérifiez les 6 caractères, ou écrivez-nous.',
    erreurReseau: "Impossible de joindre le site. Vérifiez votre connexion internet, puis réessayez.",
    reessayer: 'Réessayer',
    seMarient: 'se marient',
    ongletAccueil: 'Accueil',
    ongletProgramme: 'Programme',
    ongletDormir: 'Où dormir',
    ongletRepondre: 'Répondre',
    bonjour: 'Bonjour {nom} !',
    compteJours: 'Plus que <strong>{n}</strong> jours',
    compteDemain: "C'est <strong>demain</strong> !",
    compteAujourdhui: "C'est <strong>aujourd'hui</strong> !",
    limite: 'Merci de répondre avant le {date}.',
    boutonRepondre: "Répondre à l'invitation",
    bientot: 'Cette page sera remplie à la prochaine étape.',
    demo: "Mode démonstration : rien n'est enregistré.",
    changerCode: "Ce n'est pas votre invitation ? Changer de code",
  },
  es: {},
};

/* ---------- Données de démonstration (fictives) ---------- */
const DEMO_PARAMS = {
  maries: 'Morgane & Cyriaque', date: 'Samedi 21 août 2027', iso: '2027-08-21',
  lieu: 'Lieu à compléter', limite: '1er juin 2027',
};
const DEMO_FOYERS = {
  DEMO01: { code: 'DEMO01', nom: 'Famille Exemple', adultes: ['Marie Exemple', 'Paul Exemple'], enfants: ['Léa Exemple'], langue: 'fr' },
  DEMO02: { code: 'DEMO02', nom: 'Familia Ejemplo', adultes: ['Frida Ejemplo'], enfants: [], langue: 'es' },
};

/* ---------- Petits outils ---------- */
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const memoire = {
  // Le navigateur se souvient du code pour que l'invité n'ait pas à le retaper.
  // try/catch : certains navigateurs (navigation privée) refusent.
  lire(cle) { try { return localStorage.getItem(cle) || ''; } catch (e) { return ''; } },
  ecrire(cle, val) { try { val ? localStorage.setItem(cle, val) : localStorage.removeItem(cle); } catch (e) { /* tant pis */ } },
};

const etat = { langue: 'fr', donnees: null, code: '' };

/** Traduit une clé, en remplaçant {nom}, {n}… Retombe sur le français si la traduction manque. */
function t(cle, vars) {
  let s = TEXTES[etat.langue][cle] ?? TEXTES.fr[cle] ?? cle;
  for (const k in vars || {}) s = s.replaceAll('{' + k + '}', vars[k]);
  return s;
}

function appliquerTextes() {
  document.documentElement.lang = etat.langue;
  document.querySelectorAll('[data-t]').forEach((el) => { el.textContent = t(el.dataset.t); });
}

function montrerEcran(id) {
  ['ecran-chargement', 'ecran-connexion', 'ecran-site'].forEach((e) => { $('#' + e).hidden = e !== id; });
}

const normaliser = (code) => String(code || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);

/* ---------- Échanges avec Apps Script ---------- */
async function obtenirInvitation(code) {
  if (CODES_DEMO.includes(code) || !API_URL) {
    await new Promise((ok) => setTimeout(ok, 300)); // imite le temps de réponse d'internet
    const foyer = DEMO_FOYERS[code];
    return foyer ? { params: DEMO_PARAMS, foyer, reponse: null, programme: [], hebergements: [], demo: true } : { erreur: 'code' };
  }
  const rep = await fetch(API_URL + '?action=invitation&code=' + encodeURIComponent(code));
  if (!rep.ok) throw new Error('HTTP ' + rep.status);
  return rep.json();
}

/* ---------- Démarrage ---------- */
function demarrer() {
  const url = new URLSearchParams(location.search);
  const code = normaliser(url.get('code') || memoire.lire('code'));
  dessinerGuirlande();
  appliquerTextes();
  $('#form-code').addEventListener('submit', (e) => {
    e.preventDefault();
    const c = normaliser($('#code').value);
    if (!c) return afficherConnexion(t('codeVide'));
    charger(c);
  });
  $('#changer-code').addEventListener('click', () => {
    memoire.ecrire('code', '');
    history.replaceState(null, '', location.pathname);
    afficherConnexion();
  });
  window.addEventListener('hashchange', afficherOnglet);
  code ? charger(code) : afficherConnexion();
}

async function charger(code) {
  montrerEcran('ecran-chargement');
  try {
    const r = await obtenirInvitation(code);
    if (r.erreur === 'code') {
      memoire.ecrire('code', '');
      return afficherConnexion(t('codeInconnu'), code);
    }
    if (r.erreur) throw new Error(r.message || r.erreur);
    etat.code = code;
    etat.donnees = r;
    etat.langue = TEXTES[r.foyer.langue] ? r.foyer.langue : 'fr';
    memoire.ecrire('code', code);
    // Retire le code de la barre d'adresse : il ne traîne pas si l'invité partage une capture d'écran.
    if (location.search) history.replaceState(null, '', location.pathname + location.hash);
    afficherSite();
  } catch (err) {
    afficherConnexion(t('erreurReseau'), code);
  }
}

function afficherConnexion(erreur, code) {
  appliquerTextes();
  montrerEcran('ecran-connexion');
  const champ = $('#code'), msg = $('#erreur-code');
  champ.value = code || '';
  msg.textContent = erreur || '';
  msg.hidden = !erreur;
  champ.setAttribute('aria-invalid', erreur ? 'true' : 'false');
  champ.focus();
}

/* ---------- Le site ---------- */
function afficherSite() {
  const { params, foyer } = etat.donnees;
  appliquerTextes();
  document.title = params.maries;
  $('#maries').textContent = params.maries;
  $('#date').textContent = params.date;
  $('#titre-accueil').textContent = t('bonjour', { nom: foyer.nom });
  $('#compte').innerHTML = texteCompte(params.iso);
  $('#limite').textContent = params.limite ? t('limite', { date: params.limite }) : '';
  $('#bandeau-demo').hidden = !etat.donnees.demo;
  montrerEcran('ecran-site');
  afficherOnglet();
}

function texteCompte(iso) {
  const jour = new Date(iso + 'T00:00:00');
  const auj = new Date(); auj.setHours(0, 0, 0, 0);
  const n = Math.round((jour - auj) / 86400000);
  if (isNaN(n) || n < 0) return '';
  if (n === 0) return t('compteAujourdhui');
  if (n === 1) return t('compteDemain');
  return t('compteJours', { n: n.toLocaleString(etat.langue) });
}

const ONGLETS = ['accueil', 'programme', 'dormir', 'repondre'];

/** Affiche l'onglet indiqué après le # de l'adresse (#programme…). Le bouton « retour » du téléphone marche donc. */
function afficherOnglet() {
  if ($('#ecran-site').hidden) return;
  const id = location.hash.slice(1);
  const actif = ONGLETS.includes(id) ? id : 'accueil';
  document.querySelectorAll('[data-panneau]').forEach((p) => { p.hidden = p.dataset.panneau !== actif; });
  document.querySelectorAll('[data-onglet]').forEach((a) => {
    a.dataset.onglet === actif ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current');
  });
  if (id) {
    // Un changement d'onglet ramène en haut du contenu et y place le lecteur d'écran.
    $('#contenu').focus({ preventScroll: true });
    window.scrollTo({ top: id === 'accueil' ? 0 : $('.onglets').offsetTop, behavior: 'instant' });
  }
}


/* ---------- Bouteilles fleuries suspendues (inspirées de la déco guinguette du mariage) ---------- */
// Chaque bouteille pend à une ficelle de jute nouée au goulot, contient une guirlande lumineuse
// enroulée, et un petit bouquet sort du goulot. Tout est dessiné en SVG : pas d'image à charger.

// Formes dessinées à partir du haut du goulot (point 0,0). « corps » = zone intérieure pour la guirlande.
const FORMES_BOUTEILLES = {
  vin: { d: 'M-4 0h8v14q0 4 7 8v34q0 4-4 4h-14q-4 0-4-4v-34q7-4 7-8z', corps: { x: -8, y: 26, l: 16, h: 30 }, col: 8 },
  ronde: { d: 'M-3 0h6v12a15 15 0 1 1-6 0z', corps: { x: -9, y: 17, l: 18, h: 20 }, col: 6 },
  bocal: { d: 'M-6 0h12v6q6 2 6 8v24q0 4-4 4h-16q-4 0-4-4v-24q0-6 6-8z', corps: { x: -9, y: 16, l: 18, h: 22 }, col: 12 },
};

const COULEURS_FLEURS = { rouge: '#e02f2f', orange: '#ff7b00', violet: '#8a3ffc', jaune: '#f6c343', rose: '#ff6fa5', blanc: '#fffdf5' };

/** Une fleur : marguerite, gerbera (pétales fins), pompon (dahlia) ou grappe (aster). */
function fleur(type, x, y, r, couleur) {
  const petales = (nb, rx, ry, dist, fill) => {
    let s = '';
    for (let p = 0; p < nb; p++) {
      s += `<ellipse cx="0" cy="${-dist}" rx="${rx}" ry="${ry}" fill="${fill}" transform="rotate(${(360 / nb) * p})"/>`;
    }
    return s;
  };
  let contenu = '';
  if (type === 'marguerite') contenu = petales(10, 1.5, 1.9 * r, 2.8 * r, COULEURS_FLEURS.blanc) + `<circle r="${1.8 * r}" fill="#f2b705"/>`;
  if (type === 'gerbera') contenu = petales(14, 1.3, 2.2 * r, 3.3 * r, couleur) + `<circle r="${2 * r}" fill="#5a2d0c"/>`;
  if (type === 'pompon') contenu = `<circle r="${5 * r}" fill="${couleur}"/>` + petales(8, 1.4 * r, 1.8 * r, 2.6 * r, 'rgba(0,0,0,.18)') + `<circle r="${1.4 * r}" fill="rgba(0,0,0,.25)"/>`;
  if (type === 'grappe') {
    [[0, 0], [-3.2, 1.6], [3.2, 1.4], [-1.6, -3], [1.8, -3.2]].forEach(([a, b]) => {
      contenu += `<circle cx="${a * r}" cy="${b * r}" r="${2.1 * r}" fill="${couleur}"/><circle cx="${a * r}" cy="${b * r}" r="${0.7 * r}" fill="#f6c343"/>`;
    });
  }
  return `<g transform="translate(${x} ${y})">${contenu}</g>`;
}

/** Bouquet qui sort du goulot : feuillage, puis 3 ou 4 fleurs. */
function bouquet(fleurs) {
  const feuilles = [[-7, -6, -40], [7, -7, 35], [-3, -14, -12], [4, -15, 18], [0, -4, 0]]
    .map(([x, y, a], k) => `<ellipse cx="${x}" cy="${y}" rx="2.6" ry="7.5" fill="${k % 2 ? '#2f6b3a' : '#4c9a55'}" transform="rotate(${a} ${x} ${y})"/>`).join('');
  const places = [[-8, -10], [8, -12], [0, -19], [-1, -7]];
  return feuilles + fleurs.map(([type, coul], k) => fleur(type, places[k][0], places[k][1], k === 2 ? 1.1 : 0.95, COULEURS_FLEURS[coul])).join('');
}

function dessinerGuirlande() {
  // Verre rouge, orange vif et violet, comme les futures bouteilles du mariage.
  const verres = ['rouge', 'orange', 'violet', 'rouge', 'violet', 'orange', 'rouge'];
  const formes = ['vin', 'ronde', 'bocal', 'vin', 'ronde', 'vin', 'bocal'];
  const fils = [36, 56, 32, 48, 34, 58, 42]; // longueur de ficelle : irrégulière, comme dans un arbre
  const bouquets = [
    [['gerbera', 'orange'], ['marguerite'], ['pompon', 'rouge'], ['grappe', 'violet']],
    [['marguerite'], ['grappe', 'violet'], ['gerbera', 'jaune']],
    [['pompon', 'orange'], ['gerbera', 'rouge'], ['marguerite'], ['grappe', 'rose']],
    [['grappe', 'violet'], ['marguerite'], ['gerbera', 'orange']],
    [['gerbera', 'rouge'], ['pompon', 'jaune'], ['marguerite'], ['grappe', 'violet']],
    [['marguerite'], ['gerbera', 'rose'], ['pompon', 'orange']],
    [['grappe', 'violet'], ['gerbera', 'orange'], ['marguerite'], ['pompon', 'rouge']],
  ];
  const ampoules = ['#fff1b8', '#ffd27a', '#ffe9a8', '#ff9ec4', '#a0f0ff', '#fff1b8', '#c8ffb0'];
  const largeur = 400, creux = 22, n = formes.length, echelle = 1.4;
  const jute = '#c9a46b';

  let bouteilles = '';
  for (let i = 0; i < n; i++) {
    const x = 30 + i * ((largeur - 60) / (n - 1));
    const u = x / largeur;
    const y = 4 + 4 * creux * u * (1 - u); // point de la ficelle principale (elle forme un arc)
    const f = FORMES_BOUTEILLES[formes[i]], c = f.corps, fil = fils[i];

    // Guirlande lumineuse : un fil qui zigzague dans la bouteille, avec des ampoules dessus.
    const pts = [];
    for (let k = 0; k <= 5; k++) pts.push([c.x + (k % 2 ? c.l - 1 : 1), c.y + (k * c.h) / 5]);
    let lumieres = '';
    pts.forEach(([a, b], k) => {
      const suiv = pts[k + 1];
      [[a, b], suiv ? [(a + suiv[0]) / 2, (b + suiv[1]) / 2] : null].forEach((p, m) => {
        if (!p) return;
        lumieres += `<circle class="lumiere" style="--k:${(i * 3 + k * 2 + m) % 9}" cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="1.8" fill="${ampoules[(i + k * 2 + m) % ampoules.length]}"/>`;
      });
    });

    const demi = f.col / 2 + 0.6;
    bouteilles += `
      <g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">
        <g class="bouteille" style="--i:${i}">
          <line x1="0" y1="0" x2="0" y2="${fil}" stroke="${jute}" stroke-width="1.3"/>
          <g transform="translate(0 ${fil}) scale(${echelle})">
            <path d="${f.d}" fill="${COULEURS_FLEURS[verres[i]]}" fill-opacity=".78" stroke="rgba(0,0,0,.3)" stroke-width=".8"/>
            <ellipse cx="0" cy="${c.y + c.h / 2}" rx="${c.l * 0.75}" ry="${c.h * 0.65}" fill="url(#lueur)"/>
            <polyline points="${pts.map((p) => p.join(',')).join(' ')}" fill="none" stroke="#3b3326" stroke-opacity=".55" stroke-width=".6" stroke-linejoin="round"/>
            <g filter="url(#halo)">${lumieres}</g>
            <path d="${f.d}" fill="url(#reflet)"/>
            <path d="M${-demi} 4h${2 * demi}M${-demi} 6.5h${2 * demi}" stroke="${jute}" stroke-width="1.2"/>
            ${bouquet(bouquets[i])}
          </g>
        </g>
      </g>`;
  }
  // Chaque guirlande a ses propres dégradés et filtre : un élément placé dans un écran caché ne s'afficherait pas ailleurs.
  document.querySelectorAll('.guirlande').forEach((el, j) => {
    el.innerHTML = `<svg viewBox="0 0 ${largeur} ${creux + 170}" role="presentation" focusable="false">
    <defs>
      <filter id="halo${j}" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="1.4" result="flou"/>
        <feMerge><feMergeNode in="flou"/><feMergeNode in="flou"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <radialGradient id="lueur${j}"><stop offset="0" stop-color="#ffe9a8" stop-opacity=".5"/><stop offset="1" stop-color="#ffe9a8" stop-opacity="0"/></radialGradient>
      <linearGradient id="reflet${j}" x1="0" x2="1">
        <stop offset=".12" stop-color="#fff" stop-opacity=".45"/><stop offset=".32" stop-color="#fff" stop-opacity="0"/>
        <stop offset=".8" stop-color="#fff" stop-opacity="0"/><stop offset=".92" stop-color="#fff" stop-opacity=".18"/>
      </linearGradient>
    </defs>
    <path d="M0 4Q${largeur / 2} ${4 + 2 * creux} ${largeur} 4" fill="none" stroke="${jute}" stroke-width="2.2"/>
    ${bouteilles.replace(/url\(#(halo|lueur|reflet)\)/g, `url(#$1${j})`)}</svg>`;
  });
}

demarrer();
