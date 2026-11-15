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
  maries: 'Prénom & Prénom', date: 'Samedi 21 août 2027', iso: '2027-08-21',
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
  dessinerFanions();
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

/* ---------- Guirlande de fanions (dessinée une fois, en SVG) ---------- */
function dessinerFanions() {
  const couleurs = ['var(--vert)', 'var(--soleil)', '#ffffff', 'var(--bleu)'];
  const n = 11, largeur = 560, creux = 34;
  let triangles = '';
  for (let i = 0; i < n; i++) {
    const x = 20 + i * ((largeur - 40) / (n - 1));
    const u = x / largeur;
    const y = 6 + 4 * creux * u * (1 - u); // la ficelle forme un arc
    triangles += `<path class="fanion" style="--i:${i};fill:${couleurs[i % couleurs.length]}" d="M${x - 17} ${y} L${x + 17} ${y} L${x} ${y + 40} Z" stroke="rgba(0,0,0,.15)" stroke-width="1"/>`;
  }
  const svg = `<svg viewBox="0 0 ${largeur} ${creux + 56}" role="presentation" focusable="false">
    <path d="M0 4 Q ${largeur / 2} ${4 + 2 * creux} ${largeur} 4" fill="none" stroke="currentColor" stroke-opacity=".5" stroke-width="2"/>
    ${triangles}</svg>`;
  document.querySelectorAll('.fanions').forEach((el) => { el.innerHTML = svg; });
}

demarrer();
