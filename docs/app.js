/*
 * Site des invités du mariage.
 * Ce fichier ne contient AUCUNE vraie info (lieu, adresses, invités) : le dépôt sera public.
 * Les infos sont demandées à Apps Script, qui ne répond qu'à un code de foyer valide.
 */

/* ---------- Réglages ---------- */

// Adresse de l'appli Apps Script (finit par /exec). Vide = seul le mode démo fonctionne.
const API_URL = 'https://script.google.com/macros/s/AKfycbxKDZAknpZ2ggRCIpxQ7M7iOAHAsr9HYQk1IkaHCEfRWbS_QVaZNG9BML_Klib-K6Wo/exec';

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
    ongletInfos: 'Infos',
    ongletDormir: 'Où dormir',
    ongletRepondre: 'Répondre',
    bonjour: 'Bonjour {nom} !',
    compteJours: 'Plus que <strong>{n}</strong> jours',
    compteDemain: "C'est <strong>demain</strong> !",
    compteAujourdhui: "C'est <strong>aujourd'hui</strong> !",
    limite: 'Merci de répondre avant le {date}.',
    boutonRepondre: "Répondre à l'invitation",
    bientot: 'Cette page sera remplie à la prochaine étape.',
    infosTitre: 'Infos pratiques',
    infosIntro: "Le programme de la journée est sur votre faire-part. Ici, les réponses aux questions qu'on nous pose le plus.",
    infosVide: 'Les infos pratiques arrivent bientôt. Revenez dans quelques semaines.',
    itineraire: 'Itinéraire',
    itineraireAria: 'Itinéraire vers {lieu} (ouvre une carte)',
    dormirIntro: 'Quelques adresses près du mariage. Pensez à réserver tôt : en août, ça part vite.',
    dormirVide: 'La liste des hébergements arrive bientôt.',
    appeler: 'Appeler',
    reserver: 'Réserver ou voir le site',
    prix: 'Prix :',
    voirInfos: 'Lire les infos pratiques',
    voirDormir: 'Trouver où dormir',
    demo: "Mode démonstration : rien n'est enregistré.",
    changerCode: "Ce n'est pas votre invitation ? Changer de code",
    titrePage: 'Notre mariage',
    navAria: 'Sections du site',
    autreLangue: 'Ver en español',
  },
  // Espagnol, en tutoiement (« tú » : on s'adresse à la personne qui remplit). À faire relire par une personne hispanophone.
  es: {
    allerContenu: 'Ir al contenido',
    chargement: 'Cargando tu invitación…',
    connexionTitre: 'Tu invitación',
    connexionAide: 'Escribe el código de 6 caracteres que recibiste con la invitación.',
    codeEtiquette: 'Código de invitación',
    connexionBouton: 'Abrir mi invitación',
    codeVide: 'Escribe tu código.',
    codeInconnu: 'Este código no corresponde a ninguna invitación. Revisa los 6 caracteres o escríbenos.',
    erreurReseau: 'No se puede conectar con el sitio. Revisa tu conexión a internet y vuelve a intentarlo.',
    reessayer: 'Reintentar',
    seMarient: 'se casan',
    ongletAccueil: 'Inicio',
    ongletInfos: 'Info',
    ongletDormir: 'Dónde dormir',
    ongletRepondre: 'Responder',
    bonjour: '¡Hola, {nom}!',
    compteJours: 'Faltan <strong>{n}</strong> días',
    compteDemain: '¡Es <strong>mañana</strong>!',
    compteAujourdhui: '¡Es <strong>hoy</strong>!',
    limite: 'Por favor, responde antes del {date}.',
    boutonRepondre: 'Responder a la invitación',
    bientot: 'Esta página estará lista muy pronto.',
    infosTitre: 'Información práctica',
    infosIntro: 'El programa del día viene en tu invitación. Aquí tienes las respuestas a las preguntas más frecuentes.',
    infosVide: 'La información práctica estará disponible pronto. Vuelve dentro de unas semanas.',
    itineraire: 'Cómo llegar',
    itineraireAria: 'Cómo llegar a {lieu} (abre un mapa)',
    dormirIntro: 'Algunos alojamientos cerca de la boda. Reserva pronto: en agosto se llenan rápido.',
    dormirVide: 'La lista de alojamientos estará disponible pronto.',
    appeler: 'Llamar al',
    reserver: 'Reservar o ver la web',
    prix: 'Precio:',
    voirInfos: 'Leer la información práctica',
    voirDormir: 'Encontrar dónde dormir',
    demo: 'Modo de demostración: no se guarda nada.',
    changerCode: '¿No es tu invitación? Cambiar de código',
    titrePage: 'Nuestra boda',
    navAria: 'Secciones del sitio',
    autreLangue: 'Voir en français',
  },
};
const LANGUES = Object.keys(TEXTES);

/* ---------- Données de démonstration (fictives) ---------- */
const DEMO_PARAMS = {
  maries: 'Morgane & Cyriaque', date: 'Samedi 21 août 2027', iso: '2027-08-21',
  lieu: 'Lieu à compléter', limite: '1er juin 2027', limiteIso: '2027-06-01',
};
const DEMO_FOYERS = {
  DEMO01: { code: 'DEMO01', nom: 'Famille Exemple', adultes: ['Marie Exemple', 'Paul Exemple'], enfants: ['Léa Exemple'], langue: 'fr' },
  DEMO02: { code: 'DEMO02', nom: 'Familia Ejemplo', adultes: ['Frida Ejemplo'], enfants: [], langue: 'es' },
};
// Lieux et adresses inventés : les vrais sont dans le Google Sheet.
const DEMO_INFOS = [
  { questionFr: "Comment s'habiller ?", reponseFr: "Tenue d'été et chaussures confortables : la fête est en plein air, sur l'herbe.", questionEs: '¿Cómo me visto?', reponseEs: 'Ropa de verano y zapatos cómodos: la fiesta es al aire libre, sobre el césped.' },
  { questionFr: 'Où se garer ?', reponseFr: 'Un parking est prévu sur place (exemple).', questionEs: '¿Dónde se puede aparcar?', reponseEs: 'Hay aparcamiento en el lugar (ejemplo).' },
  { questionFr: 'Qui contacter le jour J ?', reponseFr: 'Nos témoins (exemple).\nPlus d\'infos : https://example.com', questionEs: '¿A quién llamo el día de la boda?', reponseEs: 'A nuestros testigos (ejemplo).\nMás info: https://example.com' },
  { questionFr: 'Question sans réponse (cachée)', reponseFr: '', questionEs: '', reponseEs: '' },
];
const DEMO_HEBERGEMENTS = [
  { nom: 'Gîte des Tilleuls (exemple)', adresse: 'Route du Moulin, Exempleville', telephone: '01 23 45 67 89', lien: 'https://example.com', prix: '90 € / nuit', infosFr: 'À 5 minutes à pied de la fête.', infosEs: 'A 5 minutos a pie de la fiesta.' },
  { nom: 'Camping du Lac (exemple)', adresse: 'Bord du lac, Exempleville', telephone: '', lien: '', prix: '15 €', infosFr: 'Pensez à vos tentes !', infosEs: '¡No olvides tu tienda!' },
];

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
  document.querySelectorAll('[data-t-aria]').forEach((el) => { el.setAttribute('aria-label', t(el.dataset.tAria)); });
  document.querySelectorAll('.bouton-langue').forEach((b) => { b.lang = etat.langue === 'fr' ? 'es' : 'fr'; });
  if (!etat.donnees) document.title = t('titrePage');
}

/**
 * Langue de départ : celle choisie à la main avec le bouton pour ce code, sinon celle du foyer (onglet Foyers),
 * sinon celle du téléphone (avant que l'invité ait tapé son code), sinon le français.
 */
function choisirLangue(langueFoyer, code) {
  const choix = code ? memoire.lire('langue-' + code) : '';
  if (LANGUES.includes(choix)) return choix;
  if (LANGUES.includes(langueFoyer)) return langueFoyer;
  const tel = (navigator.language || '').slice(0, 2).toLowerCase();
  return LANGUES.includes(tel) ? tel : 'fr';
}

function changerLangue() {
  etat.langue = etat.langue === 'fr' ? 'es' : 'fr';
  if (etat.code) memoire.ecrire('langue-' + etat.code, etat.langue); // choix retenu pour ce foyer seulement
  if (!etat.donnees) return appliquerTextes();
  // On garde ce qui est déjà tapé dans le formulaire.
  const brouillon = document.querySelector("#form-reponse") ? lireFormulaire() : null;
  afficherSite(brouillon);
}

/** Date AAAA-MM-JJ écrite dans la langue de l'invité : « samedi 21 août 2027 », « sábado, 21 de agosto de 2027 ». */
function formaterDate(iso, options) {
  const d = new Date(iso + 'T12:00:00');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || '') || isNaN(d)) return '';
  let s = d.toLocaleDateString(etat.langue, options);
  if (etat.langue === 'fr') s = s.replace(/^(\D*)1 /, '$11er '); // « 1er juin » en français
  return s.charAt(0).toUpperCase() + s.slice(1);
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
    return foyer ? { params: DEMO_PARAMS, foyer, reponse: null, infos: DEMO_INFOS, hebergements: DEMO_HEBERGEMENTS, demo: true } : { erreur: 'code' };
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
  etat.langue = choisirLangue();
  appliquerTextes();
  document.querySelectorAll('.bouton-langue').forEach((b) => b.addEventListener('click', changerLangue));
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
    etat.langue = choisirLangue(r.foyer.langue, code);
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
function afficherSite(brouillon) {
  const { params, foyer } = etat.donnees;
  appliquerTextes();
  document.title = params.maries;
  $('#maries').textContent = params.maries;
  $('#date').textContent = formaterDate(params.iso, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) || params.date;
  $('#titre-accueil').textContent = t('bonjour', { nom: foyer.nom });
  $('#compte').innerHTML = texteCompte(params.iso);
  const limite = formaterDate(params.limiteIso, { day: 'numeric', month: 'long', year: 'numeric' }) || params.limite;
  $('#limite').textContent = limite ? t('limite', { date: limite }) : '';
  $('#bandeau-demo').hidden = !etat.donnees.demo;
  afficherInfos(etat.donnees.infos || []);
  afficherDormir(etat.donnees.hebergements || []);
  afficherReponse(brouillon);
  montrerEcran('ecran-site');
  afficherOnglet();
}

/** Prend le texte espagnol s'il existe et que le foyer est hispanophone, sinon le français. */
function champ(obj, nom) {
  return (etat.langue === 'es' && obj[nom + 'Es']) || obj[nom + 'Fr'] || '';
}

/** Lien vers une carte (Google Maps, qui ouvre l'appli de cartes sur téléphone). */
const lienCarte = (adresse) => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(adresse);

/** N'accepte que les liens web (http/https) : on ne fait confiance à aucun texte, même venant du Sheet. */
const lienSur = (url) => (/^https?:\/\//i.test(String(url).trim()) ? String(url).trim() : '');

function boutonItineraire(lieu, adresse) {
  if (!adresse) return '';
  return `<a class="btn btn-petit" href="${esc(lienCarte(adresse))}" target="_blank" rel="noopener"
    aria-label="${esc(t('itineraireAria', { lieu: lieu || adresse }))}">${esc(t('itineraire'))}</a>`;
}

/** Texte sûr avec liens cliquables : on échappe tout, puis on transforme les adresses http(s) en liens. */
function texteAvecLiens(s) {
  return esc(s).replace(/https?:\/\/[^\s<]*[^\s<.,;:!?)]/g, (url) => `<a href="${url}" target="_blank" rel="noopener">${url}</a>`);
}

/** Infos pratiques : une question = un volet qu'on ouvre d'un toucher. Sans réponse, la question est cachée. */
function afficherInfos(liste) {
  const zone = $('#liste-infos');
  const remplies = liste.filter((q) => champ(q, 'question') && champ(q, 'reponse'));
  if (!remplies.length) { zone.innerHTML = `<p class="aide">${esc(t('infosVide'))}</p>`; return; }
  zone.innerHTML = remplies.map((q) => `
    <details class="question">
      <summary>${esc(champ(q, 'question'))}</summary>
      <p>${texteAvecLiens(champ(q, 'reponse'))}</p>
    </details>`).join('');
}

/** Où dormir : une fiche par hébergement. */
function afficherDormir(liste) {
  const zone = $('#liste-dormir');
  if (!liste.length) { zone.innerHTML = `<p class="aide">${esc(t('dormirVide'))}</p>`; return; }
  zone.innerHTML = liste.map((h) => {
    const tel = String(h.telephone || '').replace(/[^\d+]/g, '');
    const lien = lienSur(h.lien);
    return `
      <article class="fiche">
        <h3>${esc(h.nom)}</h3>
        ${h.adresse ? `<p class="adresse">${esc(h.adresse)}</p>` : ''}
        ${h.prix ? `<p><span class="etiquette-inline">${esc(t('prix'))}</span> ${esc(h.prix)}</p>` : ''}
        ${champ(h, 'infos') ? `<p class="aide">${esc(champ(h, 'infos'))}</p>` : ''}
        <div class="actions">
          ${boutonItineraire(h.nom, h.adresse)}
          ${tel ? `<a class="btn btn-petit btn-contour" href="tel:${esc(tel)}">${esc(t('appeler'))} ${esc(h.telephone)}</a>` : ''}
          ${lien ? `<a class="btn btn-petit btn-contour" href="${esc(lien)}" target="_blank" rel="noopener">${esc(t('reserver'))}</a>` : ''}
        </div>
      </article>`;
  }).join('');
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

const ONGLETS = ['accueil', 'infos', 'dormir', 'repondre'];

/** Affiche l'onglet indiqué après le # de l'adresse (#infos…). Le bouton « retour » du téléphone marche donc. */
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
    // Sur ordinateur, la barre d'onglets reste collée en haut : on décale d'autant pour ne pas cacher le titre.
    const nav = $('.onglets');
    const collee = getComputedStyle(nav).position === 'sticky' ? nav.offsetHeight : 0;
    const haut = $('#contenu').getBoundingClientRect().top + window.scrollY - collee;
    window.scrollTo({ top: id === 'accueil' ? 0 : haut, behavior: 'instant' });
  }
}


/* ---------- Onglet « Répondre » : le formulaire ---------- */
// Les choix (allergènes, régimes…) arrivent du serveur en français, et c'est en français qu'on les renvoie :
// le Google Sheet et ses totaux restent ainsi en français. On traduit seulement l'affichage.

const TEXTES_FORMULAIRE = {
  fr: {
    repIntro: "Dites-nous qui sera là, et on s'occupe du reste.",
    badgeAdulte: 'Adulte', badgeEnfant: 'Enfant',
    presentOui: 'Sera là', presentNon: 'Ne pourra pas venir',
    age: 'Âge', ans: 'ans',
    allergieQ: 'Des allergies alimentaires ?', allergenesQ: 'Lesquelles ?',
    autreAllergie: 'Autre allergie ou précision (gravité, traces…)',
    regimeQ: 'Régime alimentaire',
    prenomEnfant: "Prénom de l'enfant", retirer: 'Retirer', ajoutEnfant: '+ Ajouter un enfant',
    couchageTitre: 'Où dormez-vous ?', couchageAide: 'La nuit qui suit le mariage.',
    lendemainTitre: 'Le lendemain', lendemainAide: "{jour} : on prolonge la fête autour d'un repas. Qui reste ?",
    lendemainDefaut: 'Le lendemain',
    apporteQ: 'Apportez-vous quelque chose à manger ?', apportePlaceholder: 'Ex. : une quiche, un taboulé pour 8, des fruits…',
    transportTitre: 'Venir au mariage', transportQ: 'Comment venez-vous ?', choisir: 'Choisir…',
    covoitQ: 'Covoiturage', places: 'Places libres',
    messageTitre: 'Un mot pour nous ?', messagePlaceholder: 'Une question, une précision, un petit mot…',
    envoyer: 'Envoyer ma réponse', mettreAJour: 'Mettre à jour ma réponse', envoiEnCours: 'Envoi en cours…',
    erreurEnvoi: "La réponse n'a pas pu être envoyée. Vérifiez votre connexion et réessayez.",
    errPrenom: "Indiquez le prénom de l'enfant, ou retirez-le.",
    errPresent: 'Indiquez si cette personne sera là.',
    errAge: "Indiquez l'âge de l'enfant (0 à 17 ans).",
    errAllergie: 'Indiquez si cette personne a des allergies.',
    errAllergene: 'Cochez au moins un allergène ou précisez-le.',
    errCouchage: 'Choisissez où vous dormez.',
    errApporte: 'Dites-nous si vous apportez quelque chose.',
    errApporteQuoi: 'Précisez ce que vous apportez.',
    merciNouveau: "Merci, c'est noté !", merciDeja: 'Vous avez déjà répondu',
    merciPresent: 'Nous avons hâte de vous voir.', merciAbsent: 'Vous allez nous manquer. Merci de nous avoir prévenus.',
    votreReponse: 'Votre réponse',
    recapAbsent: 'Ne pourra pas venir', recapPresent: '{nom} sera là', recapAge: '{n} ans',
    recapAllergies: 'Allergies : {liste}', recapLendemain: 'reste le lendemain', recapAucune: 'Pas de contrainte alimentaire',
    recapCouchage: 'Couchage', recapApporte: 'Pour le lendemain, vous apportez', recapTransport: 'Transport', recapMessage: 'Votre message',
    modifier: 'Modifier ma réponse', enfantSansPrenom: 'Enfant sans prénom',
    dejaRepondu: 'Vous avez déjà répondu. Merci !', boutonVoirReponse: 'Voir ou modifier ma réponse',
  },
  es: {
    repIntro: 'Dinos quién vendrá y nosotros nos encargamos del resto.',
    badgeAdulte: 'Adulto', badgeEnfant: 'Niño/a',
    presentOui: 'Vendrá', presentNon: 'No podrá venir',
    age: 'Edad', ans: 'años',
    allergieQ: '¿Alergias alimentarias?', allergenesQ: '¿Cuáles?',
    autreAllergie: 'Otra alergia o detalle (gravedad, trazas…)',
    regimeQ: 'Dieta',
    prenomEnfant: 'Nombre del niño o la niña', retirer: 'Quitar', ajoutEnfant: '+ Añadir un niño o una niña',
    couchageTitre: 'Alojamiento', couchageAide: '¿Dónde dormirás la noche de la boda?',
    lendemainTitre: 'El día siguiente', lendemainAide: '{jour}: alargamos la fiesta con una comida. ¿Quién se queda?',
    lendemainDefaut: 'El día siguiente',
    apporteQ: '¿Traes algo de comer?', apportePlaceholder: 'Ej.: una quiche, una ensalada para 8, fruta…',
    transportTitre: 'El viaje', transportQ: '¿Cómo vienes?', choisir: 'Elegir…',
    covoitQ: 'Compartir coche', places: 'Plazas libres',
    messageTitre: '¿Unas palabras para nosotros?', messagePlaceholder: 'Una pregunta, un detalle, un mensajito…',
    envoyer: 'Enviar mi respuesta', mettreAJour: 'Actualizar mi respuesta', envoiEnCours: 'Enviando…',
    erreurEnvoi: 'No se pudo enviar la respuesta. Revisa tu conexión y vuelve a intentarlo.',
    errPrenom: 'Escribe el nombre del niño o la niña, o quítalo.',
    errPresent: 'Indica si esta persona vendrá.',
    errAge: 'Indica la edad (de 0 a 17 años).',
    errAllergie: 'Indica si esta persona tiene alergias.',
    errAllergene: 'Marca al menos un alérgeno o descríbelo.',
    errCouchage: 'Elige dónde dormirás.',
    errApporte: 'Dinos si traes algo.',
    errApporteQuoi: 'Indica qué traes.',
    merciNouveau: '¡Gracias, apuntado!', merciDeja: 'Ya has respondido',
    merciPresent: '¡Tenemos muchas ganas de verte!', merciAbsent: 'Te echaremos de menos. Gracias por avisarnos.',
    votreReponse: 'Tu respuesta',
    recapAbsent: 'No podrá venir', recapPresent: '{nom} vendrá', recapAge: '{n} años',
    recapAllergies: 'Alergias: {liste}', recapLendemain: 'se queda al día siguiente', recapAucune: 'Sin restricciones alimentarias',
    recapCouchage: 'Alojamiento', recapApporte: 'Para el día siguiente traes', recapTransport: 'Viaje', recapMessage: 'Tu mensaje',
    modifier: 'Modificar mi respuesta', enfantSansPrenom: 'Niño/a sin nombre',
    dejaRepondu: 'Ya has respondido. ¡Gracias!', boutonVoirReponse: 'Ver o modificar mi respuesta',
  },
};
LANGUES.forEach((l) => Object.assign(TEXTES[l], TEXTES_FORMULAIRE[l]));

// Traduction espagnole des valeurs envoyées par le serveur (elles restent en français dans le Sheet).
const VALEURS_ES = {
  Oui: 'Sí', Non: 'No',
  Gluten: 'Gluten', 'Crustacés': 'Crustáceos', 'Œufs': 'Huevos', Poissons: 'Pescado', Arachides: 'Cacahuetes',
  Soja: 'Soja', Lait: 'Leche', 'Fruits à coque': 'Frutos de cáscara', 'Céleri': 'Apio', Moutarde: 'Mostaza',
  'Sésame': 'Sésamo', Sulfites: 'Sulfitos', Lupin: 'Altramuces', Mollusques: 'Moluscos',
  Aucun: 'Ninguna', 'Végétarien': 'Vegetariana', 'Végan': 'Vegana', 'Sans porc': 'Sin cerdo', Halal: 'Halal',
  Casher: 'Kosher', 'Sans gluten (non allergique)': 'Sin gluten (sin alergia)', 'Femme enceinte': 'Embarazada',
  'Autre (préciser en message)': 'Otra (explícalo en el mensaje)',
  Voiture: 'Coche', Train: 'Tren', Avion: 'Avión', Autre: 'Otro',
  'Non merci': 'No, gracias', 'Je propose des places': 'Ofrezco plazas', 'Je cherche une place': 'Busco plaza',
  'Sur place': 'En el lugar de la boda', 'Je rentre chez moi': 'Vuelvo a casa',
};
const libelle = (v) => (etat.langue === 'es' && VALEURS_ES[v]) || v;

const DEMO_LISTES = {
  couchages: ['Sur place', 'Gîte des Tilleuls (exemple)', 'Camping du Lac (exemple)', 'Je rentre chez moi', 'Autre'],
  allergenes: ['Gluten', 'Crustacés', 'Œufs', 'Poissons', 'Arachides', 'Soja', 'Lait', 'Fruits à coque', 'Céleri', 'Moutarde', 'Sésame', 'Sulfites', 'Lupin', 'Mollusques'],
  regimes: ['Aucun', 'Végétarien', 'Végan', 'Sans porc', 'Halal', 'Casher', 'Sans gluten (non allergique)', 'Femme enceinte', 'Autre (préciser en message)'],
  transports: ['Voiture', 'Train', 'Avion', 'Autre'],
  covoiturages: ['Non merci', 'Je propose des places', 'Je cherche une place'],
};
Object.assign(DEMO_PARAMS, DEMO_LISTES);

/* -- Petits morceaux de formulaire -- */
let uid = 0;
const lendemainCoches = new Set();

/** Groupe de boutons à choix unique (Oui / Non…), avec une vraie légende pour les lecteurs d'écran. */
function groupe(nom, legende, options, valeur, cacherLegende) {
  return `<fieldset class="groupe">
    <legend class="question${cacherLegende ? ' masque' : ''}">${esc(legende)}</legend>
    <div class="seg">${options.map(([v, l]) =>
      `<label><input type="radio" name="${nom}" value="${esc(v)}" ${valeur === v ? 'checked' : ''}><span>${esc(l)}</span></label>`).join('')}</div>
  </fieldset>`;
}

/** Texte du jour d'après le mariage, dans la langue de l'invité. */
function texteLendemain(params) {
  const d = new Date((params.iso || '') + 'T12:00:00');
  if (isNaN(d)) return t('lendemainDefaut');
  d.setDate(d.getDate() + 1);
  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return formaterDate(iso, { weekday: 'long', day: 'numeric', month: 'long' }) || t('lendemainDefaut');
}

/** Affiche l'onglet Répondre : le récapitulatif si le foyer a déjà répondu, sinon le formulaire. */
function afficherReponse(brouillon) {
  const rep = etat.donnees.reponse;
  // Accueil : le bouton principal s'adapte
  $('#bouton-accueil').textContent = rep ? t('boutonVoirReponse') : t('boutonRepondre');
  $('#deja-repondu').hidden = !rep;
  if (brouillon) afficherFormulaire(brouillon);
  else if (rep) afficherMerci(rep, false);
  else afficherFormulaire(null);
}

function afficherFormulaire(rep) {
  const f = etat.donnees.foyer, p = etat.donnees.params;
  let personnes;
  if (rep) {
    personnes = rep.personnes.map((x) => ({ ...x, ajoute: x.ajoute || (x.type === 'Enfant' && !f.enfants.includes(x.nom)) }));
    f.adultes.concat(f.enfants).forEach((nom, i) => {
      const type = i < f.adultes.length ? 'Adulte' : 'Enfant';
      if (!personnes.some((x) => x.nom === nom && x.type === type)) personnes.push({ nom, type });
    });
  } else {
    personnes = [...f.adultes.map((nom) => ({ nom, type: 'Adulte' })), ...f.enfants.map((nom) => ({ nom, type: 'Enfant' }))];
  }
  lendemainCoches.clear();
  const zone = $('#zone-reponse');
  zone.innerHTML = `
    <form id="form-reponse" class="formulaire" novalidate>
      <p class="aide">${esc(t('repIntro'))}</p>
      <div id="personnes" class="pile"></div>
      <button type="button" class="btn btn-petit btn-contour" id="ajout-enfant">${esc(t('ajoutEnfant'))}</button>

      <section class="carte bloc-present" id="bloc-couchage" aria-labelledby="t-couchage">
        <h3 id="t-couchage">${esc(t('couchageTitre'))}</h3>
        <fieldset class="groupe">
          <legend class="aide">${esc(t('couchageAide'))}</legend>
          <div class="choix">${p.couchages.map((l) => `<label><input type="radio" name="lieu" value="${esc(l)}" ${rep && rep.lieu === l ? 'checked' : ''}><span>${esc(libelle(l))}</span></label>`).join('')}</div>
        </fieldset>
        <p class="msg-erreur" hidden></p>
      </section>

      <section class="carte bloc-present" id="bloc-lendemain" aria-labelledby="t-lendemain">
        <h3 id="t-lendemain">${esc(t('lendemainTitre'))}</h3>
        <fieldset class="groupe">
          <legend class="aide">${esc(t('lendemainAide', { jour: texteLendemain(p) }))}</legend>
          <div class="choix" id="liste-lendemain"></div>
        </fieldset>
        <div id="apport" class="pile" hidden>
          ${groupe('apporte', t('apporteQ'), [['Oui', libelle('Oui')], ['Non', libelle('Non')]], rep && rep.apporte)}
          <textarea class="champ" id="apporteQuoi" maxlength="300" aria-label="${esc(t('apporteQ'))}" placeholder="${esc(t('apportePlaceholder'))}" hidden>${esc(rep ? rep.apporteQuoi : '')}</textarea>
        </div>
        <p class="msg-erreur" hidden></p>
      </section>

      <section class="carte bloc-present" id="bloc-transport" aria-labelledby="t-transport">
        <h3 id="t-transport">${esc(t('transportTitre'))}</h3>
        <label class="question" for="transport">${esc(t('transportQ'))}</label>
        <select class="champ" id="transport">
          <option value="">${esc(t('choisir'))}</option>
          ${p.transports.map((v) => `<option value="${esc(v)}" ${rep && rep.transport === v ? 'selected' : ''}>${esc(libelle(v))}</option>`).join('')}
        </select>
        ${groupe('covoit', t('covoitQ'), p.covoiturages.map((c) => [c, libelle(c)]), rep && rep.covoit)}
        <label class="ligne" id="ligne-places" hidden>${esc(t('places'))}
          <input class="champ champ-court" type="number" inputmode="numeric" min="1" max="9" id="places" value="${esc(rep ? rep.places : '')}"></label>
      </section>

      <section class="carte" aria-labelledby="t-message">
        <h3 id="t-message"><label for="message">${esc(t('messageTitre'))}</label></h3>
        <textarea class="champ" id="message" maxlength="1000" placeholder="${esc(t('messagePlaceholder'))}">${esc(rep ? rep.message : '')}</textarea>
      </section>

      <p class="msg-erreur" id="erreur-envoi" role="alert" hidden></p>
      <button class="btn" type="submit" id="envoyer">${esc(etat.donnees.reponse ? t('mettreAJour') : t('envoyer'))}</button>
    </form>`;

  const conteneur = $('#personnes');
  personnes.forEach((x) => conteneur.appendChild(cartePersonne(x)));

  const form = $('#form-reponse');
  form.addEventListener('change', (e) => {
    if (e.target.closest('#liste-lendemain')) {
      e.target.checked ? lendemainCoches.add(e.target.value) : lendemainCoches.delete(e.target.value);
    }
    majVisibilite();
  });
  form.addEventListener('input', (e) => { if (e.target.classList.contains('nom-enfant')) majLendemain(); });
  form.addEventListener('click', (e) => {
    if (e.target.classList.contains('retirer')) {
      const c = e.target.closest('.personne');
      lendemainCoches.delete(c.dataset.uid);
      c.remove();
      majVisibilite();
    }
  });
  $('#ajout-enfant').addEventListener('click', () => {
    const c = cartePersonne({ nom: '', type: 'Enfant', ajoute: true, present: 'Oui' });
    conteneur.appendChild(c);
    majVisibilite();
    c.querySelector('.nom-enfant').focus();
  });
  form.addEventListener('submit', envoyerReponse);
  majVisibilite();
}

function cartePersonne(x) {
  const u = 'p' + (++uid);
  const p = etat.donnees.params;
  const enfant = x.type === 'Enfant';
  if (x.resteLendemain === 'Oui') lendemainCoches.add(u);
  const el = document.createElement('section');
  el.className = 'carte personne';
  el.dataset.uid = u;
  el.dataset.type = x.type;
  el.dataset.nom = x.nom || '';
  if (x.ajoute) el.dataset.ajoute = '1';
  el.setAttribute('aria-labelledby', u + '-titre');
  el.innerHTML = `
    <div class="personne-tete">
      ${x.ajoute
        ? `<input class="champ nom-enfant" id="${u}-titre" aria-label="${esc(t('prenomEnfant'))}" placeholder="${esc(t('prenomEnfant'))}" maxlength="60" value="${esc(x.nom)}">`
        : `<h3 class="personne-nom" id="${u}-titre">${esc(x.nom)}</h3>`}
      <span class="badge">${esc(enfant ? t('badgeEnfant') : t('badgeAdulte'))}</span>
      ${x.ajoute ? `<button type="button" class="lien retirer">${esc(t('retirer'))}</button>` : ''}
    </div>
    ${groupe(u + '-present', x.nom || t('prenomEnfant'), [['Oui', t('presentOui')], ['Non', t('presentNon')]], x.present, true)}
    <div class="details pile" hidden>
      ${enfant ? `<label class="ligne">${esc(t('age'))} <input class="champ champ-court" type="number" inputmode="numeric" min="0" max="17" name="${u}-age" value="${esc(x.age)}"> ${esc(t('ans'))}</label>` : ''}
      ${groupe(u + '-allergie', t('allergieQ'), [['Non', libelle('Non')], ['Oui', libelle('Oui')]], x.allergie)}
      <fieldset class="groupe allergenes" hidden>
        <legend class="question">${esc(t('allergenesQ'))}</legend>
        <div class="puces">${p.allergenes.map((a) => `<label class="puce"><input type="checkbox" name="${u}-alg" value="${esc(a)}" ${(x.allergenes || []).includes(a) ? 'checked' : ''}><span>${esc(libelle(a))}</span></label>`).join('')}</div>
        <input class="champ" name="${u}-autre" maxlength="200" aria-label="${esc(t('autreAllergie'))}" placeholder="${esc(t('autreAllergie'))}" value="${esc(x.autreAllergie)}">
      </fieldset>
      <label class="question" for="${u}-regime">${esc(t('regimeQ'))}</label>
      <select class="champ" id="${u}-regime" name="${u}-regime">${p.regimes.map((r) => `<option value="${esc(r)}" ${x.regime === r ? 'selected' : ''}>${esc(libelle(r))}</option>`).join('')}</select>
    </div>
    <p class="msg-erreur" hidden></p>`;
  return el;
}

const choisi = (n) => (document.querySelector(`[name="${n}"]:checked`) || {}).value || '';
const nomDe = (c) => (c.dataset.ajoute ? c.querySelector('.nom-enfant').value.trim() : c.dataset.nom);

/** Montre ou cache les questions selon les réponses déjà données. */
function majVisibilite() {
  const cartes = [...document.querySelectorAll('.personne')];
  let presents = 0;
  cartes.forEach((c) => {
    const u = c.dataset.uid;
    const la = choisi(u + '-present') === 'Oui';
    if (la) presents++;
    c.querySelector('.details').hidden = !la;
    c.querySelector('.allergenes').hidden = choisi(u + '-allergie') !== 'Oui';
  });
  document.querySelectorAll('.bloc-present').forEach((b) => { b.hidden = presents === 0; });
  majLendemain();
  $('#apport').hidden = lendemainCoches.size === 0;
  $('#apporteQuoi').hidden = choisi('apporte') !== 'Oui';
  $('#ligne-places').hidden = choisi('covoit') !== 'Je propose des places';
}

function majLendemain() {
  const presents = [...document.querySelectorAll('.personne')].filter((c) => choisi(c.dataset.uid + '-present') === 'Oui');
  const ids = new Set(presents.map((c) => c.dataset.uid));
  [...lendemainCoches].forEach((id) => { if (!ids.has(id)) lendemainCoches.delete(id); });
  $('#liste-lendemain').innerHTML = presents.map((c) =>
    `<label><input type="checkbox" value="${c.dataset.uid}" ${lendemainCoches.has(c.dataset.uid) ? 'checked' : ''}><span>${esc(nomDe(c) || t('enfantSansPrenom'))}</span></label>`).join('');
}

/** Lit le formulaire tel quel (sans vérifier). Sert à l'envoi et à garder la saisie si on change de langue. */
function lireFormulaire() {
  const personnes = [...document.querySelectorAll('.personne')].map((c) => {
    const u = c.dataset.uid;
    const ageEl = c.querySelector(`[name="${u}-age"]`);
    return {
      nom: nomDe(c), type: c.dataset.type, ajoute: !!c.dataset.ajoute,
      age: ageEl ? ageEl.value.trim() : '',
      present: choisi(u + '-present'),
      allergie: choisi(u + '-allergie'),
      allergenes: [...c.querySelectorAll(`[name="${u}-alg"]:checked`)].map((i) => i.value),
      autreAllergie: c.querySelector(`[name="${u}-autre"]`).value.trim(),
      regime: c.querySelector(`[name="${u}-regime"]`).value,
      resteLendemain: lendemainCoches.has(u) ? 'Oui' : 'Non',
    };
  });
  const presents = personnes.some((x) => x.present === 'Oui');
  return {
    personnes,
    lieu: presents ? choisi('lieu') : '',
    apporte: presents && lendemainCoches.size ? choisi('apporte') : '',
    apporteQuoi: $('#apporteQuoi').value.trim(),
    transport: presents ? $('#transport').value : '',
    covoit: presents ? choisi('covoit') : '',
    places: $('#places').value.trim(),
    message: $('#message').value.trim(),
  };
}

/** Vérifie la saisie et affiche les erreurs à côté des questions concernées. Renvoie null s'il en manque. */
function verifier(data) {
  document.querySelectorAll('#form-reponse .en-erreur').forEach((el) => el.classList.remove('en-erreur'));
  document.querySelectorAll('#form-reponse .msg-erreur').forEach((el) => { if (el.id !== 'erreur-envoi') el.hidden = true; });
  let premiere = null;
  const erreur = (bloc, msg) => {
    const m = bloc.querySelector(':scope > .msg-erreur');
    m.textContent = msg; m.hidden = false;
    bloc.classList.add('en-erreur');
    if (!premiere) premiere = bloc;
  };
  const cartes = [...document.querySelectorAll('.personne')];
  data.personnes.forEach((x, i) => {
    const c = cartes[i];
    if (!x.nom) erreur(c, t('errPrenom'));
    else if (!x.present) erreur(c, t('errPresent'));
    else if (x.present === 'Oui') {
      if (x.type === 'Enfant' && (x.age === '' || +x.age < 0 || +x.age > 17)) erreur(c, t('errAge'));
      else if (!x.allergie) erreur(c, t('errAllergie'));
      else if (x.allergie === 'Oui' && !x.allergenes.length && !x.autreAllergie) erreur(c, t('errAllergene'));
    }
  });
  const presents = data.personnes.some((x) => x.present === 'Oui');
  if (presents && !data.lieu) erreur($('#bloc-couchage'), t('errCouchage'));
  if (lendemainCoches.size && !data.apporte) erreur($('#bloc-lendemain'), t('errApporte'));
  else if (data.apporte === 'Oui' && !data.apporteQuoi) erreur($('#bloc-lendemain'), t('errApporteQuoi'));
  if (premiere) {
    premiere.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const champ = premiere.querySelector('input, select, textarea');
    if (champ) champ.focus({ preventScroll: true });
    return null;
  }
  return data;
}

/** Envoie la réponse à Apps Script (ou la garde en mémoire en mode démo). */
async function envoyerReponse(e) {
  e.preventDefault();
  const data = verifier(lireFormulaire());
  if (!data) return;
  const bouton = $('#envoyer'), msg = $('#erreur-envoi');
  bouton.disabled = true; bouton.textContent = t('envoiEnCours'); msg.hidden = true;
  try {
    if (!etat.donnees.demo) {
      // Corps en texte brut : évite le blocage « CORS » du navigateur avec Apps Script.
      const rep = await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: 'enregistrer', code: etat.code, data }) });
      const r = await rep.json();
      if (!r.ok) throw new Error(r.message || r.erreur || 'erreur');
    } else {
      await new Promise((ok) => setTimeout(ok, 400));
    }
    etat.donnees.reponse = data;
    afficherMerci(data, true);
    $('#bouton-accueil').textContent = t('boutonVoirReponse');
    $('#deja-repondu').hidden = false;
    $('#contenu').scrollIntoView({ block: 'start' });
    $('#titre-merci').focus();
  } catch (err) {
    msg.textContent = t('erreurEnvoi');
    msg.hidden = false;
    bouton.disabled = false; bouton.textContent = t('reessayer');
  }
}

/** Récapitulatif après l'envoi (ou au retour d'un invité qui a déjà répondu). */
function afficherMerci(r, nouveau) {
  const presents = r.personnes.filter((x) => x.present === 'Oui');
  const ligne = (x) => {
    if (x.present !== 'Oui') return `<li><span class="qui">${esc(x.nom)}</span><span class="quoi">${esc(t('recapAbsent'))}</span></li>`;
    const infos = [];
    if (x.type === 'Enfant' && x.age !== '') infos.push(t('recapAge', { n: esc(x.age) }));
    if (x.allergie === 'Oui') infos.push(t('recapAllergies', { liste: esc([...x.allergenes.map(libelle), x.autreAllergie].filter(Boolean).join(', ')) }));
    if (x.regime && x.regime !== 'Aucun') infos.push(esc(libelle(x.regime)));
    if (x.resteLendemain === 'Oui') infos.push(esc(t('recapLendemain')));
    return `<li><span class="qui">${esc(t('recapPresent', { nom: x.nom }))}</span><span class="quoi">${infos.join(', ') || esc(t('recapAucune'))}</span></li>`;
  };
  const transport = r.transport
    ? esc(libelle(r.transport)) + (r.covoit && r.covoit !== 'Non merci' ? ', ' + esc(libelle(r.covoit)) + (r.places ? ` (${esc(r.places)})` : '') : '')
    : '';
  $('#zone-reponse').innerHTML = `
    <div class="pile">
      <div class="merci">
        <h3 id="titre-merci" tabindex="-1">${esc(nouveau ? t('merciNouveau') : t('merciDeja'))}</h3>
        <p>${esc(presents.length ? t('merciPresent') : t('merciAbsent'))}</p>
      </div>
      <section class="carte" aria-labelledby="t-recap">
        <h3 id="t-recap">${esc(t('votreReponse'))}</h3>
        <ul class="recap">
          ${r.personnes.map(ligne).join('')}
          ${presents.length && r.lieu ? `<li><span class="qui">${esc(t('recapCouchage'))}</span><span class="quoi">${esc(libelle(r.lieu))}</span></li>` : ''}
          ${r.apporte === 'Oui' ? `<li><span class="qui">${esc(t('recapApporte'))}</span><span class="quoi">${esc(r.apporteQuoi)}</span></li>` : ''}
          ${transport ? `<li><span class="qui">${esc(t('recapTransport'))}</span><span class="quoi">${transport}</span></li>` : ''}
          ${r.message ? `<li><span class="qui">${esc(t('recapMessage'))}</span><span class="quoi">${esc(r.message)}</span></li>` : ''}
        </ul>
      </section>
      <button class="btn btn-contour" type="button" id="modifier">${esc(t('modifier'))}</button>
    </div>`;
  $('#modifier').addEventListener('click', () => {
    afficherFormulaire(etat.donnees.reponse);
    $('#contenu').scrollIntoView({ block: 'start' });
  });
}

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

demarrer();
