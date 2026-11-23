/*
 * Page d'inscription : chaque foyer donne ses prénoms, noms et son contact (email et/ou WhatsApp).
 * Les infos partent dans l'onglet « Inscriptions » du Google Sheet.
 * Le lien contient une clé secrète (?cle=…) choisie dans le Sheet : sans elle, rien n'est enregistré.
 * Langue : ?lang=es pour l'espagnol, sinon français. Lien de test sans rien enregistrer : ?cle=demo
 * API_URL est dans reglages.js, le décor dans decor.js.
 */

/* ---------- Textes ---------- */
// Français en « vous », espagnol en « tú » comme le reste du site (à faire relire).
const TEXTES = {
  fr: {
    allerContenu: 'Aller au contenu',
    titrePage: 'Inscription au mariage',
    chargement: 'Chargement…',
    erreurTitre: 'Oups',
    lienInvalide: "Ce lien n'est pas complet. Vérifiez que vous l'avez copié en entier, ou demandez-nous-en un nouveau.",
    erreurReseau: 'Impossible de joindre le site. Vérifiez votre connexion internet, puis réessayez.',
    reessayer: 'Réessayer',
    seMarient: 'se marient',
    titre: 'Qui sera de la fête ?',
    intro: 'Pour vous envoyer votre invitation, dites-nous qui fait partie de votre foyer et comment vous joindre. Ça prend une minute.',
    adultes: 'Adultes',
    enfants: 'Enfants',
    enfantsAide: "Moins de 18 ans le jour du mariage. Pas d'enfant ? Passez à la suite.",
    adulteN: 'Adulte {n}',
    enfantN: 'Enfant {n}',
    prenom: 'Prénom',
    nom: 'Nom',
    retirer: 'Retirer',
    ajoutAdulte: '+ Ajouter un adulte',
    ajoutEnfant: '+ Ajouter un enfant',
    contact: 'Comment vous joindre ?',
    contactAide: "Au moins l'un des deux. C'est là que vous recevrez votre invitation.",
    email: 'Adresse email',
    whatsapp: 'Numéro WhatsApp',
    whatsappAide: "Avec l'indicatif du pays si votre numéro n'est pas français, par exemple +34 612 34 56 78.",
    envoyer: 'Envoyer',
    envoi: 'Envoi…',
    errPrenom: 'Indiquez le prénom.',
    errNom: 'Indiquez le nom.',
    errContact: 'Indiquez une adresse email ou un numéro WhatsApp.',
    errEmail: 'Cette adresse email ne semble pas complète.',
    errWhatsapp: "Ce numéro ne semble pas complet. Ajoutez l'indicatif du pays, par exemple +33.",
    errCorriger: 'Il manque quelque chose : regardez les cases en rouge.',
    errEnvoi: "L'envoi n'a pas marché. Vérifiez votre connexion internet, puis réessayez.",
    merciTitre: 'Merci {prenoms} !',
    merciTexte: "C'est noté. Vous recevrez bientôt votre invitation.",
    autreFoyer: 'Inscrire un autre foyer',
    demo: "Mode démonstration : rien n'est enregistré.",
    autreLangue: 'Ver en español',
    et: 'et',
  },
  es: {
    allerContenu: 'Ir al contenido',
    titrePage: 'Inscripción a la boda',
    chargement: 'Cargando…',
    erreurTitre: 'Vaya',
    lienInvalide: 'Este enlace no está completo. Comprueba que lo has copiado entero o pídenos uno nuevo.',
    erreurReseau: 'No se puede conectar con el sitio. Revisa tu conexión a internet y vuelve a intentarlo.',
    reessayer: 'Reintentar',
    seMarient: 'se casan',
    titre: '¿Quién vendrá a la fiesta?',
    intro: 'Para enviarte la invitación, dinos quién forma parte de tu familia y cómo contactarte. Solo te llevará un minuto.',
    adultes: 'Adultos',
    enfants: 'Niños',
    enfantsAide: 'Menores de 18 años el día de la boda. ¿Sin niños? Sigue adelante.',
    adulteN: 'Adulto {n}',
    enfantN: 'Niño/a {n}',
    prenom: 'Nombre',
    nom: 'Apellidos',
    retirer: 'Quitar',
    ajoutAdulte: '+ Añadir un adulto',
    ajoutEnfant: '+ Añadir un niño o una niña',
    contact: '¿Cómo te contactamos?',
    contactAide: 'Al menos uno de los dos. Ahí recibirás tu invitación.',
    email: 'Correo electrónico',
    whatsapp: 'Número de WhatsApp',
    whatsappAide: 'Con el prefijo del país si tu número no es español, por ejemplo +33 6 12 34 56 78.',
    envoyer: 'Enviar',
    envoi: 'Enviando…',
    errPrenom: 'Escribe el nombre.',
    errNom: 'Escribe los apellidos.',
    errContact: 'Escribe un correo electrónico o un número de WhatsApp.',
    errEmail: 'Este correo no parece completo.',
    errWhatsapp: 'Este número no parece completo. Añade el prefijo del país, por ejemplo +34.',
    errCorriger: 'Falta algo: revisa las casillas en rojo.',
    errEnvoi: 'No se ha podido enviar. Revisa tu conexión a internet y vuelve a intentarlo.',
    merciTitre: '¡Gracias, {prenoms}!',
    merciTexte: 'Apuntado. Pronto recibirás tu invitación.',
    autreFoyer: 'Inscribir a otra familia',
    demo: 'Modo de demostración: no se guarda nada.',
    autreLangue: 'Voir en français',
    et: 'y',
  },
};
const LANGUES = Object.keys(TEXTES);
const DEMO = { maries: 'Morgane & Cyriaque', iso: '2027-08-21' };
const MAX_ADULTES = 10, MAX_ENFANTS = 10; // mêmes limites que Code.gs

/* ---------- Petits outils ---------- */
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const etat = { langue: 'fr', cle: '', demo: false, infos: null, envoiEnCours: false };

function t(cle, vars) {
  let s = TEXTES[etat.langue][cle] ?? TEXTES.fr[cle] ?? cle;
  for (const k in vars || {}) s = s.replaceAll('{' + k + '}', vars[k]);
  return s;
}

function appliquerTextes() {
  document.documentElement.lang = etat.langue;
  document.title = t('titrePage');
  document.querySelectorAll('[data-t]').forEach((el) => { el.textContent = t(el.dataset.t); });
  document.querySelectorAll('.bouton-langue').forEach((b) => { b.lang = etat.langue === 'fr' ? 'es' : 'fr'; });
}

function formaterDate(iso) {
  const d = new Date(iso + 'T12:00:00');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso || '') || isNaN(d)) return '';
  const s = d.toLocaleDateString(etat.langue, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function montrerEcran(id) {
  ['ecran-chargement', 'ecran-erreur', 'ecran-site'].forEach((e) => { $('#' + e).hidden = e !== id; });
}

/** « Marie, Paul et Léa » ; en espagnol « y », ou « e » devant le son « i » (Inés). */
function listePrenoms(liste) {
  if (liste.length < 2) return liste.join('');
  const dernier = liste[liste.length - 1];
  const et = etat.langue === 'es' && /^h?[ií](?![aeoáéó])/i.test(dernier) ? 'e' : t('et');
  return liste.slice(0, -1).join(', ') + ' ' + et + ' ' + dernier;
}

/** Même règle que normaliserTelephone_ dans Code.gs : '' si le numéro n'est pas plausible. */
function telephoneValide(v) {
  let s = String(v || '').trim().replace(/[\s.\-()/]/g, '');
  if (s.startsWith('00')) s = '+' + s.slice(2);
  if (!/^\+?\d+$/.test(s)) return false;
  if (!s.startsWith('+')) return /^0\d{9}$/.test(s) || (etat.langue === 'es' && /^[67]\d{8}$/.test(s));
  return s.length - 1 >= 8 && s.length - 1 <= 15;
}
const emailValide = (v) => /^[^\s@;,]+@[^\s@;,]+\.[^\s@;,]+$/.test(v);

/* ---------- Échanges avec Apps Script ---------- */
async function verifierCle() {
  if (etat.demo) return { ok: true, ...DEMO };
  const rep = await fetch(API_URL + '?action=cle&cle=' + encodeURIComponent(etat.cle));
  if (!rep.ok) throw new Error('HTTP ' + rep.status);
  return rep.json();
}

async function envoyerInscription(donnees) {
  if (etat.demo) {
    await new Promise((ok) => setTimeout(ok, 400));
    return { ok: true };
  }
  // Corps en texte : le navigateur l'envoie sans vérification préalable, ce qu'Apps Script exige.
  const rep = await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: 'inscription', cle: etat.cle, ...donnees }) });
  if (!rep.ok) throw new Error('HTTP ' + rep.status);
  return rep.json();
}

/* ---------- Démarrage ---------- */
function demarrer() {
  const url = new URLSearchParams(location.search);
  etat.cle = (url.get('cle') || '').trim();
  etat.demo = etat.cle.toLowerCase() === 'demo' || !API_URL;
  etat.langue = LANGUES.includes(url.get('lang')) ? url.get('lang') : 'fr';
  dessinerGuirlande();
  appliquerTextes();

  document.querySelectorAll('.bouton-langue').forEach((b) => b.addEventListener('click', changerLangue));
  $('#reessayer').addEventListener('click', charger);
  $('#ajout-adulte').addEventListener('click', () => { ajouterPersonne('adulte'); focusDernier('adulte'); });
  $('#ajout-enfant').addEventListener('click', () => { ajouterPersonne('enfant'); focusDernier('enfant'); });
  $('#form-inscription').addEventListener('submit', soumettre);
  $('#form-inscription').addEventListener('input', (e) => effacerErreur(e.target));
  $('#autre-foyer').addEventListener('click', recommencer);

  ajouterPersonne('adulte');
  charger();
}

async function charger() {
  if (!etat.cle) return afficherErreur(t('lienInvalide'), false);
  montrerEcran('ecran-chargement');
  try {
    const r = await verifierCle();
    if (r.erreur === 'cle') return afficherErreur(t('lienInvalide'), false);
    if (!r.ok) throw new Error(r.message || r.erreur);
    etat.infos = r;
    afficherPage();
  } catch (err) {
    afficherErreur(t('erreurReseau'), true);
  }
}

function afficherErreur(message, peutReessayer) {
  appliquerTextes();
  $('#erreur-texte').textContent = message;
  $('#reessayer').hidden = !peutReessayer;
  montrerEcran('ecran-erreur');
}

function afficherPage() {
  appliquerTextes();
  $('#maries').textContent = etat.infos.maries || '';
  $('#date').textContent = formaterDate(etat.infos.iso) || etat.infos.date || '';
  document.title = (etat.infos.maries ? etat.infos.maries + ' · ' : '') + t('titrePage');
  $('#bandeau-demo').hidden = !etat.demo;
  traduireCartes();
  montrerEcran('ecran-site');
}

function changerLangue() {
  etat.langue = etat.langue === 'fr' ? 'es' : 'fr';
  // La langue choisie reste dans l'adresse : elle sera enregistrée avec l'inscription.
  const url = new URL(location.href);
  etat.langue === 'es' ? url.searchParams.set('lang', 'es') : url.searchParams.delete('lang');
  history.replaceState(null, '', url);
  if (etat.infos) {
    afficherPage();
    if (!$('#merci').hidden) afficherMerci(etat.dernier);
  } else {
    appliquerTextes();
  }
}

/* ---------- Les personnes du foyer ---------- */
let compteur = 0; // identifiants uniques des champs

function ajouterPersonne(type, valeurs) {
  const liste = $('#liste-' + type + 's');
  if (liste.children.length >= (type === 'adulte' ? MAX_ADULTES : MAX_ENFANTS)) return;
  const id = 'p' + ++compteur;
  const carte = document.createElement('div');
  carte.className = 'carte personne';
  carte.dataset.type = type;
  carte.innerHTML = `
    <div class="personne-tete">
      <h4 class="personne-titre"></h4>
      <button type="button" class="lien retirer"></button>
    </div>
    <div class="deux-champs">
      <div>
        <label class="etiquette" for="${id}-prenom" data-t="prenom"></label>
        <input class="champ" id="${id}-prenom" data-champ="prenom" autocomplete="${type === 'adulte' ? 'given-name' : 'off'}" maxlength="40">
        <p class="msg-erreur" hidden></p>
      </div>
      <div>
        <label class="etiquette" for="${id}-nom" data-t="nom"></label>
        <input class="champ" id="${id}-nom" data-champ="nom" autocomplete="${type === 'adulte' ? 'family-name' : 'off'}" maxlength="40">
        <p class="msg-erreur" hidden></p>
      </div>
    </div>`;
  if (valeurs) {
    carte.querySelector('[data-champ=prenom]').value = valeurs.prenom || '';
    carte.querySelector('[data-champ=nom]').value = valeurs.nom || '';
  }
  carte.querySelector('.retirer').addEventListener('click', () => {
    const suivante = carte.nextElementSibling || carte.previousElementSibling;
    carte.remove();
    traduireCartes();
    (suivante?.querySelector('input') || $('#ajout-' + type)).focus();
  });
  liste.appendChild(carte);
  traduireCartes();
}

function focusDernier(type) {
  $('#liste-' + type + 's').lastElementChild?.querySelector('input').focus();
}

/** Titres « Adulte 1 », boutons « Retirer », et nom de famille proposé aux enfants. */
function traduireCartes() {
  const nomAdulte = $('#liste-adultes [data-champ=nom]')?.value.trim() || '';
  ['adulte', 'enfant'].forEach((type) => {
    const cartes = [...$('#liste-' + type + 's').children];
    cartes.forEach((c, i) => {
      c.querySelector('.personne-titre').textContent = t(type + 'N', { n: i + 1 });
      c.querySelectorAll('[data-t]').forEach((el) => { el.textContent = t(el.dataset.t); });
      const retirer = c.querySelector('.retirer');
      retirer.textContent = t('retirer');
      retirer.hidden = type === 'adulte' && cartes.length === 1; // il faut au moins un adulte
      if (type === 'enfant') c.querySelector('[data-champ=nom]').placeholder = nomAdulte;
    });
    $('#ajout-' + type).hidden = cartes.length >= (type === 'adulte' ? MAX_ADULTES : MAX_ENFANTS);
  });
}

/* ---------- Lecture et vérification ---------- */
function lirePersonnes(type) {
  return [...$('#liste-' + type + 's').children].map((c) => ({
    prenom: c.querySelector('[data-champ=prenom]').value.trim(),
    nom: c.querySelector('[data-champ=nom]').value.trim(),
  }));
}

function lireFormulaire() {
  const adultes = lirePersonnes('adulte');
  // Enfant sans nom : celui du premier adulte (comme le fait le serveur).
  const enfants = lirePersonnes('enfant').filter((e) => e.prenom || e.nom)
    .map((e) => ({ prenom: e.prenom, nom: e.nom || adultes[0]?.nom || '' }));
  return {
    langue: etat.langue,
    adultes,
    enfants,
    email: $('#email').value.trim(),
    whatsapp: $('#whatsapp').value.trim(),
    site: $('#site').value,
  };
}

function marquer(champ, message) {
  const msg = champ.parentElement.querySelector('.msg-erreur') || $('#erreur-contact');
  champ.setAttribute('aria-invalid', 'true');
  if (msg) {
    if (!msg.id) msg.id = champ.id + '-erreur';
    const liens = new Set((champ.getAttribute('aria-describedby') || '').split(' ').filter(Boolean)).add(msg.id);
    champ.setAttribute('aria-describedby', [...liens].join(' '));
    // Email et WhatsApp partagent le même message : on n'écrase pas une erreur déjà affichée.
    msg.textContent = !msg.hidden && msg.id === 'erreur-contact' ? msg.textContent + ' ' + message : message;
    msg.hidden = false;
  }
}

function effacerErreur(champ) {
  if (!champ.matches?.('.champ')) return;
  if (champ.dataset.champ === 'nom') traduireCartes();
  const ids = champ.id === 'email' || champ.id === 'whatsapp' ? ['email', 'whatsapp'] : [champ.id];
  ids.forEach((id) => {
    const c = document.getElementById(id);
    c.removeAttribute('aria-invalid');
    const msg = c.parentElement.querySelector('.msg-erreur');
    if (msg) msg.hidden = true;
  });
  if (ids.length === 2) $('#erreur-contact').hidden = true;
  $('#erreur-envoi').hidden = true;
}

function verifier() {
  document.querySelectorAll('#form-inscription [aria-invalid]').forEach((c) => c.removeAttribute('aria-invalid'));
  document.querySelectorAll('#form-inscription .msg-erreur').forEach((m) => { m.hidden = true; });
  const erreurs = [];
  document.querySelectorAll('#liste-adultes .personne, #liste-enfants .personne').forEach((carte) => {
    const prenom = carte.querySelector('[data-champ=prenom]');
    const nom = carte.querySelector('[data-champ=nom]');
    if (!prenom.value.trim()) erreurs.push([prenom, t('errPrenom')]);
    if (carte.dataset.type === 'adulte' && !nom.value.trim()) erreurs.push([nom, t('errNom')]);
  });
  const email = $('#email'), tel = $('#whatsapp');
  if (!email.value.trim() && !tel.value.trim()) erreurs.push([email, t('errContact')]);
  if (email.value.trim() && !emailValide(email.value.trim())) erreurs.push([email, t('errEmail')]);
  if (tel.value.trim() && !telephoneValide(tel.value)) erreurs.push([tel, t('errWhatsapp')]);
  erreurs.forEach(([champ, message]) => marquer(champ, message));
  return erreurs;
}

/* ---------- Envoi ---------- */
async function soumettre(e) {
  e.preventDefault();
  if (etat.envoiEnCours) return;
  const erreurs = verifier();
  const msgEnvoi = $('#erreur-envoi');
  if (erreurs.length) {
    msgEnvoi.textContent = t('errCorriger');
    msgEnvoi.hidden = false;
    erreurs[0][0].focus();
    return;
  }
  const donnees = lireFormulaire();
  const bouton = $('#envoyer');
  etat.envoiEnCours = true;
  bouton.disabled = true;
  bouton.textContent = t('envoi');
  try {
    const r = await envoyerInscription(donnees);
    if (r.erreur === 'cle') return afficherErreur(t('lienInvalide'), false);
    const messages = { noms: 'errNom', email: 'errEmail', whatsapp: 'errWhatsapp', contact: 'errContact' };
    if (r.erreur) {
      msgEnvoi.textContent = t(messages[r.erreur] || 'errEnvoi');
      msgEnvoi.hidden = false;
      return;
    }
    etat.dernier = donnees;
    afficherMerci(donnees);
  } catch (err) {
    msgEnvoi.textContent = t('errEnvoi');
    msgEnvoi.hidden = false;
  } finally {
    etat.envoiEnCours = false;
    bouton.disabled = false;
    bouton.textContent = t('envoyer');
  }
}

function afficherMerci(d) {
  const prenoms = d.adultes.concat(d.enfants).map((p) => p.prenom);
  $('#merci-titre').textContent = t('merciTitre', { prenoms: listePrenoms(prenoms) });
  const lignes = [
    [t('adultes'), d.adultes.map((p) => p.prenom + ' ' + p.nom).join(', ')],
    [t('enfants'), d.enfants.map((p) => p.prenom + ' ' + p.nom).join(', ')],
    [t('email'), d.email],
    [t('whatsapp'), d.whatsapp],
  ].filter((l) => l[1]);
  $('#recap').innerHTML = lignes.map(([qui, quoi]) =>
    `<li><span class="qui">${esc(qui)}</span><span class="quoi">${esc(quoi)}</span></li>`).join('');
  $('#form-inscription').hidden = true;
  $('#merci').hidden = false;
  $('#merci-titre').focus();
  window.scrollTo({ top: $('#contenu').offsetTop - 8, behavior: 'instant' });
}

function recommencer() {
  $('#form-inscription').reset();
  $('#liste-adultes').innerHTML = '';
  $('#liste-enfants').innerHTML = '';
  ajouterPersonne('adulte');
  $('#merci').hidden = true;
  $('#form-inscription').hidden = false;
  focusDernier('adulte');
}

demarrer();
