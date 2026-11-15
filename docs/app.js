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

/* ---------- Bouteilles suspendues avec guirlandes lumineuses (comme la déco du mariage) ---------- */

// Trois formes de bouteilles, dessinées à partir du haut du goulot (point 0,0).
// « corps » = zone où l'on peut placer les petites lumières.
const FORMES_BOUTEILLES = {
  vin: { d: 'M-4 0h8v14q0 4 7 8v34q0 4-4 4h-14q-4 0-4-4v-34q7-4 7-8z', corps: { x: -8, y: 26, l: 16, h: 30 } },
  ronde: { d: 'M-3 0h6v12a15 15 0 1 1-6 0z', corps: { x: -9, y: 18, l: 18, h: 18 } },
  bocal: { d: 'M-6 0h12v6q6 2 6 8v24q0 4-4 4h-16q-4 0-4-4v-24q0-6 6-8z', corps: { x: -9, y: 16, l: 18, h: 20 } },
};

function dessinerGuirlande() {
  // Verre : rouge, orange vif, violet (les bouteilles), plus le vert et le bleu du mariage.
  const verres = ['var(--rouge)', 'var(--orange)', 'var(--violet)', 'var(--vert)', 'var(--rouge)', 'var(--violet)', 'var(--orange)'];
  const formes = ['vin', 'ronde', 'bocal', 'vin', 'ronde', 'vin', 'bocal'];
  const fils = [22, 46, 14, 38, 18, 50, 28]; // longueur du fil de chaque bouteille, irrégulière comme dans un arbre
  const lumieres = ['#fff3b0', '#ffd166', '#ff9ec4', '#a0f0ff', '#c8ffb0'];
  const largeur = 400, creux = 22, n = formes.length;

  // Petite fonction pseudo-aléatoire stable : les lumières sont toujours au même endroit.
  let graine = 7;
  const hasard = () => ((graine = (graine * 9301 + 49297) % 233280) / 233280);

  let bouteilles = '';
  for (let i = 0; i < n; i++) {
    const x = 30 + i * ((largeur - 60) / (n - 1));
    const u = x / largeur;
    const y = 4 + 4 * creux * u * (1 - u); // point de la ficelle principale (elle forme un arc)
    const f = FORMES_BOUTEILLES[formes[i]], c = f.corps, fil = fils[i];
    let points = '';
    for (let k = 0; k < 7; k++) {
      const px = c.x + hasard() * c.l, py = fil + c.y + hasard() * c.h;
      points += `<circle class="lumiere" style="--k:${(i * 7 + k) % 9}" cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="2.6" fill="${lumieres[(i + k) % lumieres.length]}"/>`;
    }
    bouteilles += `
      <g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">
        <g class="bouteille" style="--i:${i}">
          <line x1="0" y1="0" x2="0" y2="${fil}" stroke="currentColor" stroke-opacity=".6" stroke-width="1.2"/>
          <rect x="-3.5" y="${fil - 4}" width="7" height="5" rx="1.5" fill="#8a5a2b"/>
          <g transform="translate(0 ${fil})">
            <path d="${f.d}" style="fill:${verres[i]}" fill-opacity=".72" stroke="rgba(0,0,0,.25)" stroke-width="1"/>
          </g>
          <g filter="url(#halo)">${points}</g>
          <path d="M${c.x + 3} ${fil + c.y + 2}v${c.h - 6}" stroke="#fff" stroke-opacity=".45" stroke-width="2" stroke-linecap="round"/>
        </g>
      </g>`;
  }
  // Chaque guirlande a son propre filtre « halo » : un filtre placé dans un écran caché ne s'afficherait pas ailleurs.
  document.querySelectorAll('.guirlande').forEach((el, j) => {
    el.innerHTML = `<svg viewBox="0 0 ${largeur} ${creux + 120}" role="presentation" focusable="false">
    <defs><filter id="halo${j}" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="1.6" result="flou"/>
      <feMerge><feMergeNode in="flou"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter></defs>
    <path d="M0 4Q${largeur / 2} ${4 + 2 * creux} ${largeur} 4" fill="none" stroke="currentColor" stroke-opacity=".6" stroke-width="2"/>
    ${bouteilles.replaceAll('url(#halo)', `url(#halo${j})`)}</svg>`;
  });
}

demarrer();
