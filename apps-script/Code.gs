/**
 * Application de réponse aux invitations (RSVP) du mariage.
 * Côté serveur : Google Apps Script, données stockées dans le Google Sheet.
 *
 * Onglets utilisés :
 *  - Paramètres : textes affichés aux invités (prénoms, date, lieux de couchage…)
 *  - Foyers     : la liste des invités, un foyer par ligne, avec son code personnel
 *  - Réponses   : une ligne par personne, remplie automatiquement par l'appli
 *  - Synthèse   : les totaux utiles (présents, allergies, couchage, lendemain…)
 *  - Infos pratiques, Hébergements : contenu affiché sur le site des invités
 */

const FEUILLE = {
  PARAMS: 'Paramètres',
  FOYERS: 'Foyers',
  REPONSES: 'Réponses',
  SYNTHESE: 'Synthèse',
  INFOS: 'Infos pratiques',
  HEBERGEMENTS: 'Hébergements',
  TARIFS: 'Tarifs',
};

const P = {
  MARIES: 'Prénoms des mariés',
  DATE: 'Date du mariage (texte affiché)',
  ISO: 'Date du mariage (AAAA-MM-JJ)',
  LIEU: 'Lieu du mariage',
  LIMITE: 'Date limite de réponse',
  LIMITE_ISO: 'Date limite de réponse (AAAA-MM-JJ)',
  // Les hébergements de l'onglet Hébergements sont proposés automatiquement ; ce paramètre ajoute les autres choix.
  COUCHAGE: 'Lieux de couchage (séparés par ;)',
  LENDEMAIN: 'Repas du lendemain',
  URL: 'Adresse du site des invités',
};

const PARAMS_DEFAUT = [
  [P.MARIES, 'Morgane & Cyriaque'],
  [P.DATE, 'Samedi 21 août 2027'],
  [P.ISO, '2027-08-21'],
  [P.LIEU, 'Village de Kerpenhir, Locmariaquer'],
  [P.LIMITE, '1er juin 2027'],
  [P.LIMITE_ISO, '2027-06-01'],
  [P.COUCHAGE, 'Sur place ; Chez de la famille ou des amis ; Je rentre chez moi ; Autre'],
  [P.LENDEMAIN, 'Dimanche 22 août 2027, le midi'],
  [P.URL, 'https://cyriaquedaniel.github.io/mariage/'],
];

const ENTETES_FOYERS = ['Code', 'Nom du foyer', 'Adultes (séparés par ;)', 'Enfants (séparés par ;)', 'Lien personnel', 'A répondu', 'Langue (fr ou es)'];
const LANGUES = ['fr', 'es'];

// Onglets de contenu du site. Les colonnes « … ES » sont la traduction espagnole ;
// si elles sont vides, le site affiche le texte français.
// Le programme n'est pas sur le site : il est sur le faire-part.
const ENTETES_INFOS = ['Question FR', 'Réponse FR', 'Question ES', 'Réponse ES'];
const ENTETES_HEBERGEMENTS = ['Nom', 'Adresse', 'Téléphone', 'Site ou lien de réservation', 'Prix', 'Infos FR', 'Infos ES'];
// Une ligne par formule (chambre double, emplacement…) : le site calcule le prix d'une nuit pour chaque foyer.
const ENTETES_TARIFS = ['Hébergement (même nom que dans Hébergements)', 'Formule FR', 'Formule ES', 'Personnes max',
  'Prix par nuit (€)', 'Personnes comprises dans ce prix', 'Par adulte en plus (€)', 'Par enfant en plus (€)'];

const ENTETES_REPONSES = [
  'Mis à jour le', 'Code', 'Foyer', 'Personne', 'Adulte / Enfant', 'Âge enfant', 'Présent',
  'Allergie', 'Allergènes', 'Autre allergie', 'Régime', 'Lieu de couchage', 'Reste le lendemain',
  'Apporte à manger', 'Quoi', 'Transport', 'Covoiturage', 'Places proposées', 'Message',
];

// Les 14 allergènes à déclaration obligatoire (réglementation européenne INCO).
const ALLERGENES = [
  'Gluten', 'Crustacés', 'Œufs', 'Poissons', 'Arachides', 'Soja', 'Lait',
  'Fruits à coque', 'Céleri', 'Moutarde', 'Sésame', 'Sulfites', 'Lupin', 'Mollusques',
];
const REGIMES = ['Aucun', 'Végétarien', 'Végan', 'Sans porc', 'Halal', 'Casher', 'Sans gluten (non allergique)', 'Femme enceinte', 'Autre (préciser en message)'];
const TRANSPORTS = ['Voiture', 'Train', 'Avion', 'Autre'];
const COVOITURAGES = ['Non merci', 'Je propose des places', 'Je cherche une place'];

const MAX_ENFANTS = 10;

/* ------------------------------------------------------------------ */
/* Menu et installation                                                */
/* ------------------------------------------------------------------ */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Mariage')
    .addItem('1. Installer les onglets', 'installer')
    .addItem('2. Générer les codes et liens', 'genererCodesEtLiens')
    .addSeparator()
    .addItem('M\'envoyer un email de test (FR + ES)', 'envoyerEmailTest')
    .addToUi();
}

function installer() {
  const ss = SpreadsheetApp.getActive();

  const params = obtenirOuCreer_(ss, FEUILLE.PARAMS);
  if (params.getLastRow() === 0) {
    params.getRange('B:B').setNumberFormat('@'); // texte brut : pas de conversion en date
    params.getRange(1, 1, 1, 2).setValues([['Paramètre', 'Valeur']]);
    params.getRange(2, 1, PARAMS_DEFAUT.length, 2).setValues(PARAMS_DEFAUT);
    styleEntete_(params, 2);
    params.setColumnWidth(1, 320).setColumnWidth(2, 520);
  } else {
    // Onglet créé avec une ancienne version : on ajoute seulement les paramètres manquants.
    const existants = params.getRange(1, 1, params.getLastRow(), 1).getDisplayValues().map(function (r) { return r[0].trim(); });
    PARAMS_DEFAUT.forEach(function (ligne) {
      if (existants.indexOf(ligne[0]) < 0) params.getRange(params.getLastRow() + 1, 1, 1, 2).setValues([ligne]);
    });
  }

  const foyers = obtenirOuCreer_(ss, FEUILLE.FOYERS);
  if (foyers.getLastRow() === 0) {
    foyers.getRange('A:A').setNumberFormat('@');
    foyers.getRange(1, 1, 1, ENTETES_FOYERS.length).setValues([ENTETES_FOYERS]);
    foyers.getRange(2, 1, 1, ENTETES_FOYERS.length).setValues([
      ['', 'Famille Exemple (à supprimer)', 'Marie Exemple ; Paul Exemple', 'Léa Exemple', '', '', 'fr'],
    ]);
    styleEntete_(foyers, ENTETES_FOYERS.length);
    foyers.setColumnWidth(2, 240).setColumnWidth(3, 300).setColumnWidth(4, 240).setColumnWidth(5, 420);
  } else if (!foyers.getRange(1, 7).getDisplayValue()) {
    // Onglet créé avant l'ajout des langues : on ajoute juste le titre de la colonne G.
    foyers.getRange(1, 7).setValue(ENTETES_FOYERS[6]);
    styleEntete_(foyers, ENTETES_FOYERS.length);
  }

  const infos = obtenirOuCreer_(ss, FEUILLE.INFOS);
  if (infos.getLastRow() === 0) {
    infos.getRange(1, 1, 1, ENTETES_INFOS.length).setValues([ENTETES_INFOS]);
    // Questions de départ. Le site n'affiche une question que si sa « Réponse FR » est remplie.
    const carte = 'https://www.google.com/maps/search/?api=1&query=';
    infos.getRange(2, 1, 4, ENTETES_INFOS.length).setValues([
      ['Comment venir ?',
        'Le mariage a lieu à Locmariaquer (Morbihan), au village de Kerpenhir.\n' +
        'En voiture : environ 35 minutes depuis Vannes, 20 minutes depuis Auray.\n' +
        'En train : gare d\'Auray, puis 20 minutes en voiture (proposez ou demandez du covoiturage dans « Répondre »).\n' +
        'En avion : aéroports de Lorient (1 h de route) ou de Nantes (1 h 45).\n' +
        'Carte : ' + carte + 'Kerpenhir+Locmariaquer',
        '¿Cómo llego?',
        'La boda es en Locmariaquer (Morbihan, Bretaña), en el pueblo de Kerpenhir.\n' +
        'En coche: unos 35 minutos desde Vannes y 20 minutos desde Auray.\n' +
        'En tren: estación de Auray y luego 20 minutos en coche (puedes ofrecer o pedir coche compartido en «Responder»).\n' +
        'En avión: aeropuertos de Lorient (1 h en coche) o Nantes (1 h 45).\n' +
        'Mapa: ' + carte + 'Kerpenhir+Locmariaquer'],
      ['Comment s\'habiller ?', '', '¿Cómo me visto?', ''],
      ['Où se garer ?',
        'Au parking de l\'entreprise Ker Nautik, à Locmariaquer.\nCarte : ' + carte + 'Ker+Nautik+Locmariaquer',
        '¿Dónde se puede aparcar?',
        'En el aparcamiento de la empresa Ker Nautik, en Locmariaquer.\nMapa: ' + carte + 'Ker+Nautik+Locmariaquer'],
      ['Qui contacter le jour J ?', '', '¿A quién llamo el día de la boda?', ''],
    ]);
    styleEntete_(infos, ENTETES_INFOS.length);
    infos.setColumnWidth(1, 260).setColumnWidth(2, 420).setColumnWidth(3, 260).setColumnWidth(4, 420);
    infos.getRange('B:B').setWrap(true);
    infos.getRange('D:D').setWrap(true);
  }

  const hebergements = obtenirOuCreer_(ss, FEUILLE.HEBERGEMENTS);
  if (hebergements.getLastRow() === 0) {
    hebergements.getRange('C:C').setNumberFormat('@'); // garde le 0 du début des numéros
    hebergements.getRange(1, 1, 1, ENTETES_HEBERGEMENTS.length).setValues([ENTETES_HEBERGEMENTS]);
    hebergements.getRange(2, 1, 1, ENTETES_HEBERGEMENTS.length).setValues([
      ['Gîte (exemple)', 'Adresse à compléter', '', '', 'Prix à compléter', 'À réserver vous-même.', 'Resérvalo tú mismo.'],
    ]);
    styleEntete_(hebergements, ENTETES_HEBERGEMENTS.length);
    hebergements.setColumnWidth(1, 220).setColumnWidth(2, 300).setColumnWidth(4, 300).setColumnWidth(6, 280).setColumnWidth(7, 280);
  }

  const tarifs = obtenirOuCreer_(ss, FEUILLE.TARIFS);
  if (tarifs.getLastRow() === 0) {
    tarifs.getRange(1, 1, 1, ENTETES_TARIFS.length).setValues([ENTETES_TARIFS]);
    tarifs.getRange(2, 1, 1, ENTETES_TARIFS.length).setValues([
      ['Gîte (exemple)', 'Chambre pour 2 (exemple)', 'Habitación para 2 (ejemplo)', 2, 60, 2, '', ''],
    ]);
    styleEntete_(tarifs, ENTETES_TARIFS.length);
    tarifs.setColumnWidth(1, 300).setColumnWidth(2, 240).setColumnWidth(3, 240);
    tarifs.getRange(1, 1, 1, ENTETES_TARIFS.length).setWrap(true);
  }

  const reponses = obtenirOuCreer_(ss, FEUILLE.REPONSES);
  if (reponses.getLastRow() === 0) {
    reponses.getRange('B:B').setNumberFormat('@');
    reponses.getRange(1, 1, 1, ENTETES_REPONSES.length).setValues([ENTETES_REPONSES]);
    styleEntete_(reponses, ENTETES_REPONSES.length);
  }

  // La Synthèse ne contient que des formules : on la reconstruit à chaque installation.
  construireSynthese_(obtenirOuCreer_(ss, FEUILLE.SYNTHESE));

  // Supprime l'onglet vide créé par défaut avec le classeur.
  ['Feuille 1', 'Sheet1', 'Feuille1'].forEach(function (nom) {
    const f = ss.getSheetByName(nom);
    if (f && f.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(f);
  });

  const message =
    'Installation terminée.\n\n' +
    '1. Complétez l\'onglet « Paramètres ».\n' +
    '2. Saisissez vos invités dans « Foyers » (un foyer par ligne, langue fr ou es).\n' +
    '   Répondez aux questions de « Infos pratiques », remplacez les exemples de « Hébergements » et « Tarifs ».\n' +
    '3. Déployez l\'appli (voir le guide), puis menu Mariage > Générer les codes et liens.';
  try {
    SpreadsheetApp.getUi().alert(message);
  } catch (err) {
    // Lancé depuis l'éditeur sans le Sheet ouvert : pas de fenêtre possible, on l'écrit dans le journal.
    Logger.log(message);
  }
}

function construireSynthese_(sh) {
  const R = "'" + FEUILLE.REPONSES + "'!";
  const F = "'" + FEUILLE.FOYERS + "'!";
  const Q = R + 'A1:S';

  const totaux = [
    ['Totaux (mise à jour automatique)', ''],
    ['Foyers ayant répondu', '=COUNTIF(' + F + 'F2:F,"Oui")&" / "&COUNTA(' + F + 'B2:B)'],
    ['Adultes présents', '=COUNTIFS(' + R + 'E2:E,"Adulte",' + R + 'G2:G,"Oui")'],
    ['Enfants présents', '=COUNTIFS(' + R + 'E2:E,"Enfant",' + R + 'G2:G,"Oui")'],
    ['Personnes absentes', '=COUNTIF(' + R + 'G2:G,"Non")'],
    ['Personnes avec allergie', '=COUNTIFS(' + R + 'G2:G,"Oui",' + R + 'H2:H,"Oui")'],
    ['Restent le lendemain', '=COUNTIF(' + R + 'M2:M,"Oui")'],
  ];
  sh.clear();
  const sep = separateur_(sh);
  totaux.forEach(function (t, i) {
    sh.getRange(i + 1, 1).setValue(t[0]);
    if (t[1]) sh.getRange(i + 1, 2).setFormula(formule_(t[1], sep));
  });

  const tableaux = [
    ['D', 'Couchage (personnes présentes)', '=IFERROR(QUERY(' + Q + ',"select L, count(D) where G=\'Oui\' group by L label count(D) \'Personnes\'",1),"Aucune réponse")'],
    ['G', 'Allergies à transmettre au traiteur', '=IFERROR(QUERY(' + Q + ',"select C, D, E, I, J where G=\'Oui\' and H=\'Oui\'",1),"Aucune allergie signalée")'],
    ['M', 'Régimes particuliers', '=IFERROR(QUERY(' + Q + ',"select K, count(D) where G=\'Oui\' and K!=\'Aucun\' and K!=\'\' group by K label count(D) \'Personnes\'",1),"Aucun")'],
    ['P', 'Apports pour le repas du lendemain', '=IFERROR(UNIQUE(QUERY(' + Q + ',"select C, O where N=\'Oui\'",1)),"Rien pour l\'instant")'],
    ['S', 'Covoiturage', '=IFERROR(UNIQUE(QUERY(' + Q + ',"select C, Q, R where Q=\'Je propose des places\' or Q=\'Je cherche une place\'",1)),"Personne")'],
    ['W', "Foyers qui n'ont pas encore répondu", '=IFERROR(FILTER(' + F + 'B2:B,' + F + 'B2:B<>"",' + F + 'F2:F<>"Oui"),"Tout le monde a répondu")'],
  ];
  tableaux.forEach(function (t) {
    sh.getRange(t[0] + '1').setValue(t[1]).setFontWeight('bold');
    sh.getRange(t[0] + '2').setFormula(formule_(t[2], sep));
  });
  sh.getRange('A1').setFontWeight('bold');
  sh.setColumnWidth(1, 220);
  sh.setFrozenRows(1);
}

/**
 * Dans un Sheet réglé en français, la virgule est la virgule décimale et les formules
 * séparent leurs arguments par « ; ». On teste ce que le Sheet comprend au lieu de deviner.
 */
function separateur_(sh) {
  const essai = sh.getRange('Z1');
  essai.setFormula('=SUM(1;2)');
  SpreadsheetApp.flush();
  const pointVirgule = essai.getValue() === 3;
  essai.clear();
  return pointVirgule ? ';' : ',';
}

/** Remplace les virgules séparatrices par le bon séparateur, sans toucher aux textes entre guillemets. */
function formule_(f, sep) {
  if (sep === ',') return f;
  let dansTexte = false, r = '';
  for (let i = 0; i < f.length; i++) {
    const c = f.charAt(i);
    if (c === '"') dansTexte = !dansTexte;
    r += !dansTexte && c === ',' ? sep : c;
  }
  return r;
}

/* ------------------------------------------------------------------ */
/* Codes et liens personnels                                           */
/* ------------------------------------------------------------------ */

function genererCodesEtLiens() {
  const ui = SpreadsheetApp.getUi();
  const sh = feuille_(FEUILLE.FOYERS);
  const n = sh.getLastRow() - 1;
  if (n < 1) {
    ui.alert('Ajoutez d\'abord vos foyers dans l\'onglet « Foyers ».');
    return;
  }

  const valeurs = sh.getRange(2, 1, n, 2).getDisplayValues();
  const existants = new Set(valeurs.map(function (r) { return r[0].trim().toUpperCase(); }).filter(String));
  // Les liens personnels mènent au site des invités (GitHub Pages), qui demande ensuite les infos à ce script.
  const url = (lireParams_().url || '').trim();

  const codes = [];
  const liens = [];
  valeurs.forEach(function (r) {
    let code = r[0].trim().toUpperCase();
    const nom = r[1].trim();
    if (nom && !code) {
      do { code = codeAleatoire_(); } while (existants.has(code));
      existants.add(code);
    }
    codes.push([code]);
    liens.push([nom && code && url ? url + '?code=' + code : '']);
  });
  sh.getRange(2, 1, n, 1).setValues(codes);
  sh.getRange(2, 5, n, 1).setValues(liens);

  ui.alert(url
    ? 'Codes et liens générés. Envoyez à chaque foyer son lien personnel (colonne E).'
    : 'Codes générés. Les liens apparaîtront quand vous aurez écrit l\'adresse du site dans « Paramètres » (voir le guide). Relancez alors ce menu.');
}

/* ------------------------------------------------------------------ */
/* Emails d'invitation                                                 */
/* ------------------------------------------------------------------ */

// Texte des emails. Français en « vous », espagnol en « tú » comme sur le site (à faire relire).
// {nom}, {maries}, {date}, {lieu}, {limite} sont remplacés automatiquement.
const EMAIL = {
  fr: {
    objet: 'Invitation au mariage de {maries}',
    bonjour: 'Bonjour {nom},',
    texte: [
      'Nous avons la joie de vous inviter à notre mariage, le {date}.',
      'Sur notre site, vous trouverez les infos pratiques, des idées pour dormir sur place et le formulaire pour nous répondre.',
    ],
    bouton: 'Ouvrir mon invitation',
    limite: 'Merci de nous répondre avant le {limite}.',
    secours: 'Si le bouton ne marche pas, copiez ce lien dans votre navigateur :',
    signature: 'À très bientôt,',
  },
  es: {
    objet: 'Invitación a la boda de {maries}',
    bonjour: 'Hola, {nom}:',
    texte: [
      'Tenemos la alegría de invitarte a nuestra boda, el {date}.',
      'En nuestra web encontrarás la información práctica, ideas para alojarte cerca y el formulario para respondernos.',
    ],
    bouton: 'Abrir mi invitación',
    limite: 'Por favor, respóndenos antes del {limite}.',
    secours: 'Si el botón no funciona, copia este enlace en tu navegador:',
    signature: '¡Hasta muy pronto!',
  },
};

/** Menu Mariage : envoie à votre adresse un email en français et un en espagnol, avec les liens démo. */
function envoyerEmailTest() {
  const ui = SpreadsheetApp.getUi();
  const moi = Session.getActiveUser().getEmail();
  const rep = ui.prompt('Email de test',
    'À quelle adresse envoyer les 2 emails de test (un en français, un en espagnol) ?' +
    (moi ? '\nLaissez vide pour les recevoir sur ' + moi + '.' : ''),
    ui.ButtonSet.OK_CANCEL);
  if (rep.getSelectedButton() !== ui.Button.OK) return;
  const adresse = rep.getResponseText().trim() || moi;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adresse)) {
    ui.alert('Cette adresse email ne semble pas valide.');
    return;
  }

  const params = lireParams_();
  // Les codes démo ouvrent le site avec des infos fictives : aucun vrai invité n'est utilisé.
  [['fr', 'Famille Exemple', 'DEMO01'], ['es', 'Familia Ejemplo', 'DEMO02']].forEach(function (t) {
    envoyerInvitation_(adresse, t[1], params.url + '?code=' + t[2], t[0], params, '[TEST] ');
  });
  ui.alert('2 emails de test envoyés à ' + adresse + '.\n' +
    'Regardez aussi dans les spams. Envois encore possibles aujourd\'hui : ' + MailApp.getRemainingDailyQuota() + '.');
}

/** Envoie l'email d'invitation d'un foyer dans sa langue, avec un bouton vers son lien personnel. */
function envoyerInvitation_(adresse, nom, lien, langue, params, prefixeObjet) {
  const m = EMAIL[langue] || EMAIL.fr;
  const valeurs = {
    nom: nom,
    maries: params.maries,
    lieu: params.lieu,
    // Minuscule au début (« le samedi 21 août ») ; l'en-tête de l'email remet la majuscule.
    date: (function (d) { return d.charAt(0).toLowerCase() + d.slice(1); })(langue === 'es' && params.iso ? dateEs_(params.iso, true) : params.date),
    limite: langue === 'es' && params.limiteIso ? dateEs_(params.limiteIso, false) : params.limite,
  };
  const remplir = function (s) {
    return s.replace(/\{(\w+)\}/g, function (tout, cle) { return valeurs[cle] !== undefined ? valeurs[cle] : tout; });
  };
  const h = function (s) { return echapperHtml_(remplir(s)); };

  const paragraphe = 'margin:0 0 16px;font-size:16px;line-height:1.5;color:#1b2330';
  const html =
    '<div style="background:#f7f6f0;padding:24px 12px;font-family:Arial,Helvetica,sans-serif">' +
    '<div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;padding:28px 24px;border-top:6px solid #1f7a4d">' +
    '<p style="margin:0 0 8px;font-size:26px;font-weight:bold;color:#1f7a4d">' + echapperHtml_(params.maries) + '</p>' +
    '<p style="margin:0 0 24px;font-size:15px;color:#4f5866">' + echapperHtml_(valeurs.date.charAt(0).toUpperCase() + valeurs.date.slice(1)) +
    (params.lieu ? '<br>' + echapperHtml_(params.lieu) : '') + '</p>' +
    '<p style="' + paragraphe + '">' + h(m.bonjour) + '</p>' +
    m.texte.map(function (t) { return '<p style="' + paragraphe + '">' + h(t) + '</p>'; }).join('') +
    '<p style="margin:24px 0;text-align:center"><a href="' + echapperHtml_(lien) + '" ' +
    'style="display:inline-block;background:#1f7a4d;color:#ffffff;text-decoration:none;font-size:17px;font-weight:bold;padding:14px 28px;border-radius:999px">' +
    h(m.bouton) + '</a></p>' +
    (valeurs.limite ? '<p style="' + paragraphe + '">' + h(m.limite) + '</p>' : '') +
    '<p style="' + paragraphe + '">' + h(m.signature) + '<br>' + echapperHtml_(params.maries) + '</p>' +
    '<p style="margin:24px 0 0;font-size:13px;color:#4f5866">' + h(m.secours) + '<br>' +
    '<a href="' + echapperHtml_(lien) + '" style="color:#2347c5;word-break:break-all">' + echapperHtml_(lien) + '</a></p>' +
    '</div></div>';

  // Version texte seul, pour les messageries qui n'affichent pas le HTML.
  const texte = [remplir(m.bonjour), ''].concat(m.texte.map(remplir)).concat([
    '', params.lieu, '', remplir(m.bouton) + ' : ' + lien, '',
    valeurs.limite ? remplir(m.limite) : '', '', remplir(m.signature), params.maries,
  ]).join('\n');

  MailApp.sendEmail({
    to: adresse,
    subject: (prefixeObjet || '') + remplir(m.objet),
    body: texte,
    htmlBody: html,
    name: params.maries,
  });
}

/** « 2027-08-21 » → « sábado 21 de agosto de 2027 » (avec le jour) ou « 21 de agosto de 2027 ». */
function dateEs_(iso, avecJour) {
  const p = String(iso).split('-').map(Number);
  if (p.length !== 3 || !p[0] || !p[1] || !p[2]) return iso;
  const mois = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const jours = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const d = new Date(Date.UTC(p[0], p[1] - 1, p[2]));
  return (avecJour ? jours[d.getUTCDay()] + ' ' : '') + p[2] + ' de ' + mois[p[1] - 1] + ' de ' + p[0];
}

function echapperHtml_(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function codeAleatoire_() {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // sans 0/O, 1/I/L pour éviter les confusions
  let code = '';
  for (let i = 0; i < 6; i++) code += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  return code;
}

/* ------------------------------------------------------------------ */
/* Application web                                                     */
/* ------------------------------------------------------------------ */

function doGet(e) {
  const q = (e && e.parameter) || {};
  if (q.action === 'invitation') return repondreJson_(function () { return apiInvitation_(q.code); });

  // Quelqu'un ouvre l'adresse du script directement : on le renvoie vers le site des invités.
  const site = lireParams_().url.replace(/[<>"']/g, '');
  return HtmlService.createHtmlOutput(
    '<p style="font:18px sans-serif">Le site du mariage est ici : <a target="_top" href="' + site + '">' + site + '</a></p>')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/** Appelé par la page : renvoie les paramètres, le foyer et sa réponse éventuelle. */
function getInvitation(code) {
  const params = lireParams_();
  const resultat = {
    params: {
      maries: params.maries,
      date: params.date,
      iso: params.iso,
      lieu: params.lieu,
      limite: params.limite,
      limiteIso: params.limiteIso,
      lendemain: params.lendemain,
      couchages: params.couchages,
      allergenes: ALLERGENES,
      regimes: REGIMES,
      transports: TRANSPORTS,
      covoiturages: COVOITURAGES,
    },
  };
  code = normaliserCode_(code);
  if (!code) return resultat;

  const foyer = trouverFoyer_(code);
  if (!foyer) {
    resultat.erreur = 'code';
    return resultat;
  }
  resultat.foyer = { code: code, nom: foyer.nom, adultes: foyer.adultes, enfants: foyer.enfants, langue: foyer.langue };
  resultat.reponse = lireReponse_(code);
  resultat.infos = lireTableau_(FEUILLE.INFOS, ['questionFr', 'reponseFr', 'questionEs', 'reponseEs']);
  resultat.hebergements = lireTableau_(FEUILLE.HEBERGEMENTS, ['nom', 'adresse', 'telephone', 'lien', 'prix', 'infosFr', 'infosEs']);
  resultat.tarifs = lireTableau_(FEUILLE.TARIFS, ['hebergement', 'formuleFr', 'formuleEs', 'max', 'prix', 'inclus', 'adulte', 'enfant']);
  return resultat;
}

/**
 * Lit un onglet de contenu (Infos pratiques, Hébergements) : une ligne = un objet.
 * Les lignes vides sont ignorées. Si l'onglet n'existe pas encore, renvoie une liste vide.
 */
function lireTableau_(nom, cles) {
  const sh = SpreadsheetApp.getActive().getSheetByName(nom);
  if (!sh || sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, cles.length).getDisplayValues()
    .filter(function (r) { return r.some(function (v) { return String(v).trim(); }); })
    .map(function (r) {
      const o = {};
      cles.forEach(function (cle, i) { o[cle] = String(r[i]).trim(); });
      return o;
    });
}

/** Appelé par la page : enregistre (ou remplace) la réponse d'un foyer. */
function enregistrerReponse(code, data) {
  code = normaliserCode_(code);
  const foyer = trouverFoyer_(code);
  if (!foyer) throw new Error('Code d\'invitation inconnu.');
  const d = nettoyer_(data, foyer, lireParams_());

  const verrou = LockService.getScriptLock();
  verrou.waitLock(20000);
  try {
    const sh = feuille_(FEUILLE.REPONSES);
    supprimerLignesCode_(sh, code);
    const maintenant = new Date();
    const lignes = d.personnes.map(function (p) {
      const la = p.present === 'Oui';
      return [
        maintenant, code, foyer.nom, p.nom, p.type, la && p.type === 'Enfant' ? p.age : '', p.present,
        la ? p.allergie : '', la ? p.allergenes.join(', ') : '', la ? p.autreAllergie : '', la ? p.regime : '',
        la ? d.lieu : '', la ? p.resteLendemain : '',
        d.apporte, d.apporteQuoi, d.transport, d.covoit, d.places, d.message,
      ];
    });
    sh.getRange(sh.getLastRow() + 1, 1, lignes.length, ENTETES_REPONSES.length).setValues(lignes);
    feuille_(FEUILLE.FOYERS).getRange(foyer.ligne, 6).setValue('Oui');
    SpreadsheetApp.flush();
  } finally {
    verrou.releaseLock();
  }
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* API pour le site GitHub Pages                                       */
/* Le site public ne contient aucune info : il les demande ici, et on  */
/* ne répond qu'à un code de foyer valide.                             */
/* ------------------------------------------------------------------ */

/**
 * Le site envoie un POST en texte brut (pas en JSON) : c'est ce qui évite
 * le blocage « CORS » du navigateur avec Apps Script.
 * Corps attendu : {"action":"enregistrer","code":"AB12CD","data":{...}}
 */
function doPost(e) {
  return repondreJson_(function () {
    let corps;
    try {
      corps = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    } catch (err) {
      return { erreur: 'requete' };
    }
    if (corps.action !== 'enregistrer') return { erreur: 'requete' };
    if (!trouverFoyer_(normaliserCode_(corps.code))) return { erreur: 'code' };
    return enregistrerReponse(corps.code, corps.data);
  });
}

/** Comme getInvitation, mais sans rien dévoiler tant que le code n'est pas bon. */
function apiInvitation_(code) {
  if (!normaliserCode_(code)) return { erreur: 'code' };
  const r = getInvitation(code);
  return r.foyer ? r : { erreur: 'code' };
}

function repondreJson_(fn) {
  let resultat;
  try {
    resultat = fn();
  } catch (err) {
    resultat = { erreur: 'serveur', message: String(err && err.message || err) };
  }
  return ContentService.createTextOutput(JSON.stringify(resultat))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ------------------------------------------------------------------ */
/* Lecture / écriture                                                  */
/* ------------------------------------------------------------------ */

function lireParams_() {
  const sh = feuille_(FEUILLE.PARAMS);
  const dico = {};
  if (sh.getLastRow() > 1) {
    sh.getRange(2, 1, sh.getLastRow() - 1, 2).getDisplayValues().forEach(function (r) {
      dico[r[0].trim()] = r[1].trim();
    });
  }
  const val = function (cle) {
    if (dico[cle] !== undefined) return dico[cle];
    const defaut = PARAMS_DEFAUT.filter(function (r) { return r[0] === cle; })[0];
    return defaut ? defaut[1] : '';
  };
  return {
    maries: val(P.MARIES),
    date: val(P.DATE),
    iso: val(P.ISO),
    lieu: val(P.LIEU),
    limite: val(P.LIMITE),
    // Pas de valeur par défaut ici : sur un ancien Sheet sans cette ligne, le site garde le texte ci-dessus.
    limiteIso: dico[P.LIMITE_ISO] || '',
    lendemain: val(P.LENDEMAIN),
    couchages: choixCouchage_(val(P.COUCHAGE)),
    url: val(P.URL),
  };
}

/**
 * Choix « Où dormirez-vous ? » : d'abord les hébergements de l'onglet Hébergements (hors exemples),
 * puis les autres choix du paramètre. Les noms provisoires « (à renommer) » sont ignorés.
 */
function choixCouchage_(autres) {
  const noms = lireTableau_(FEUILLE.HEBERGEMENTS, ['nom']).map(function (h) { return h.nom; })
    .filter(function (n) { return n && n.indexOf('(exemple)') < 0; });
  const liste = noms.concat(decouper_(autres).filter(function (c) { return c.indexOf('(à renommer)') < 0; }));
  return liste.filter(function (c, i) { return liste.indexOf(c) === i; });
}

function trouverFoyer_(code) {
  const sh = feuille_(FEUILLE.FOYERS);
  if (sh.getLastRow() < 2) return null;
  const lignes = sh.getRange(2, 1, sh.getLastRow() - 1, ENTETES_FOYERS.length).getDisplayValues();
  for (let i = 0; i < lignes.length; i++) {
    if (lignes[i][0].trim().toUpperCase() === code && lignes[i][1].trim()) {
      const langue = String(lignes[i][6] || '').trim().toLowerCase().slice(0, 2);
      return {
        ligne: i + 2,
        nom: lignes[i][1].trim(),
        adultes: decouper_(lignes[i][2]),
        enfants: decouper_(lignes[i][3]),
        langue: LANGUES.indexOf(langue) >= 0 ? langue : 'fr',
      };
    }
  }
  return null;
}

function lireReponse_(code) {
  const sh = feuille_(FEUILLE.REPONSES);
  if (sh.getLastRow() < 2) return null;
  const lignes = sh.getRange(2, 1, sh.getLastRow() - 1, ENTETES_REPONSES.length).getDisplayValues()
    .filter(function (r) { return r[1].trim().toUpperCase() === code; });
  if (!lignes.length) return null;

  const premiere = lignes[0];
  const lieu = lignes.map(function (r) { return r[11]; }).filter(String)[0] || '';
  return {
    personnes: lignes.map(function (r) {
      return {
        nom: r[3], type: r[4], age: r[5], present: r[6], allergie: r[7],
        allergenes: r[8] ? r[8].split(', ') : [], autreAllergie: r[9], regime: r[10],
        resteLendemain: r[12],
      };
    }),
    lieu: lieu,
    apporte: premiere[13], apporteQuoi: premiere[14], transport: premiere[15],
    covoit: premiere[16], places: premiere[17], message: premiere[18],
  };
}

function supprimerLignesCode_(sh, code) {
  const n = sh.getLastRow() - 1;
  if (n < 1) return;
  const codes = sh.getRange(2, 2, n, 1).getDisplayValues();
  for (let i = codes.length - 1; i >= 0; i--) {
    if (codes[i][0].trim().toUpperCase() === code) sh.deleteRow(i + 2);
  }
}

/** Ne garde que des valeurs attendues : on ne fait jamais confiance à ce qu'envoie le navigateur. */
function nettoyer_(data, foyer, params) {
  data = data || {};
  const ouiNon = function (v) { return v === 'Oui' || v === 'Non' ? v : ''; };
  const parmi = function (v, liste, defaut) { return liste.indexOf(v) >= 0 ? v : defaut; };

  const vus = {};
  let nbEnfants = 0;
  const personnes = [];
  (Array.isArray(data.personnes) ? data.personnes : []).forEach(function (p) {
    p = p || {};
    const type = p.type === 'Enfant' ? 'Enfant' : 'Adulte';
    const nom = texte_(p.nom, 60);
    if (!nom) return;
    if (type === 'Adulte' && foyer.adultes.indexOf(nom) < 0) return; // les adultes viennent de votre liste
    if (type === 'Enfant' && ++nbEnfants > MAX_ENFANTS) return;
    if (vus[type + nom]) return;
    vus[type + nom] = true;
    const age = parseInt(p.age, 10);
    personnes.push({
      nom: nom,
      type: type,
      age: age >= 0 && age < 18 ? age : '',
      present: ouiNon(p.present) || 'Non',
      allergie: ouiNon(p.allergie) || 'Non',
      allergenes: (Array.isArray(p.allergenes) ? p.allergenes : []).filter(function (a) { return ALLERGENES.indexOf(a) >= 0; }),
      autreAllergie: texte_(p.autreAllergie, 200),
      regime: parmi(p.regime, REGIMES, 'Aucun'),
      resteLendemain: ouiNon(p.resteLendemain) || 'Non',
    });
  });
  if (!personnes.length) throw new Error('Aucune personne dans la réponse.');

  const places = parseInt(data.places, 10);
  return {
    personnes: personnes,
    lieu: parmi(data.lieu, params.couchages, ''),
    apporte: ouiNon(data.apporte),
    apporteQuoi: data.apporte === 'Oui' ? texte_(data.apporteQuoi, 300) : '',
    transport: parmi(data.transport, TRANSPORTS, ''),
    covoit: parmi(data.covoit, COVOITURAGES, ''),
    places: data.covoit === 'Je propose des places' && places > 0 && places < 10 ? places : '',
    message: texte_(data.message, 1000),
  };
}

/* ------------------------------------------------------------------ */
/* Utilitaires                                                         */
/* ------------------------------------------------------------------ */

/** Coupe le texte et neutralise les formules (=, +, -, @) qu'un invité pourrait taper. */
function texte_(v, max) {
  let s = String(v == null ? '' : v).trim().slice(0, max);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function decouper_(s) {
  return String(s || '').split(';').map(function (x) { return x.trim(); }).filter(String);
}

function normaliserCode_(code) {
  return String(code || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
}

function feuille_(nom) {
  const sh = SpreadsheetApp.getActive().getSheetByName(nom);
  if (!sh) throw new Error('Onglet « ' + nom + ' » introuvable : lancez le menu Mariage > Installer les onglets.');
  return sh;
}

function obtenirOuCreer_(ss, nom) {
  return ss.getSheetByName(nom) || ss.insertSheet(nom);
}

function styleEntete_(sh, nbColonnes) {
  sh.getRange(1, 1, 1, nbColonnes).setFontWeight('bold').setBackground('#e8efe9');
  sh.setFrozenRows(1);
}
