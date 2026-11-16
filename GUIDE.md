# Mettre l'appli du mariage en ligne (pas à pas)

Comptez environ 20 minutes. Il vous faut seulement un compte Google.
Les invités, eux, n'ont besoin d'aucun compte : ils ouvrent leur lien et répondent.

## 1. Créer le Google Sheet

1. Allez sur https://sheets.google.com et créez une feuille vierge.
2. Nommez-la, par exemple « Mariage – Réponses ».

## 2. Coller le code

1. Dans la feuille : menu **Extensions > Apps Script**. Un éditeur s'ouvre.
2. Dans le fichier `Code.gs` déjà présent, effacez tout et collez le contenu de [apps-script/Code.gs](apps-script/Code.gs).
3. Cliquez sur le **+** à côté de « Fichiers », puis **HTML**, et nommez le fichier exactement `Index` (sans `.html`).
4. Effacez son contenu et collez celui de [apps-script/Index.html](apps-script/Index.html).
5. Cliquez sur l'icône disquette pour enregistrer.

## 3. Installer les onglets

1. Dans l'éditeur, en haut, choisissez la fonction `installer` dans la liste, puis cliquez sur **Exécuter**.
2. Google demande une autorisation. C'est normal, c'est votre propre script :
   **Examiner les autorisations** > votre compte > **Paramètres avancés** > **Accéder à … (non sécurisé)** > **Autoriser**.
3. Revenez sur la feuille : les onglets Paramètres, Foyers, Réponses, Synthèse, Infos pratiques, Hébergements et Tarifs sont créés.
   Un menu **Mariage** apparaît aussi (rechargez la page s'il n'est pas là).

## 4. Remplir vos informations

- **Paramètres** : vos prénoms, le lieu, la date limite.
  - « Lieux de couchage » : la question « Où dormirez-vous ? » propose automatiquement chaque hébergement de l'onglet Hébergements, puis les choix écrits ici (séparés par `;`), par exemple `Sur place ; Chez de la famille ou des amis ; Je rentre chez moi ; Autre`.
  - Remplissez aussi « Date limite de réponse (AAAA-MM-JJ) », par exemple `2027-06-01` : le site l'écrit alors tout seul en français (« 1er juin 2027 ») ou en espagnol (« 1 de junio de 2027 »). Même chose pour la date du mariage.
- **Foyers** : un foyer par ligne (un couple, une famille, une personne seule).
  - Colonne « Adultes » : les prénoms et noms séparés par `;`, par exemple `Marie Dupont ; Paul Dupont`.
  - Colonne « Enfants » : pareil, ou vide. Les invités peuvent aussi ajouter un enfant eux-mêmes.
  - Laissez la colonne « Code » vide, elle se remplit toute seule.
  - Colonne « Langue » : `fr` pour le français, `es` pour l'espagnol. Vide = français.
- **Infos pratiques** : une ligne par question que les invités se posent (tenue, parking, qui appeler…). Le programme n'est pas sur le site : il est sur le faire-part.
  - Une question n'apparaît sur le site que si sa colonne « Réponse FR » est remplie. Pas de réponse = question cachée. Supprimez les lignes inutiles, ajoutez-en autant que vous voulez.
  - Un lien (qui commence par `https://`, par exemple un plan d'accès) et un numéro de téléphone (`06 12 34 56 78` ou `+33 6 12 34 56 78`) deviennent cliquables.
  - Chaque ligne de la réponse s'affiche comme un paragraphe ; un début court suivi de « : » (`En voiture :`, `Lorys :`) est mis en gras. Pour aller à la ligne dans une cellule : `Ctrl + Entrée`.
  - Les numéros de téléphone : écrivez-les seulement dans le Sheet (le code est public sur GitHub).
  - Les colonnes « ES » sont la traduction espagnole. Si vous les laissez vides, le texte français s'affiche.
- **Hébergements** : une ligne par lieu où dormir (nom, adresse, téléphone, lien de réservation, prix, infos).
  - Le prix n'a pas de colonne espagnole : écrivez-le sans mots, par exemple `90 €`, ou laissez-le vide si l'onglet Tarifs est rempli.
- **Tarifs** : une ligne par formule (chambre double, chambre familiale, emplacement de camping…). Le site s'en sert pour dire à chaque foyer combien coûte une nuit pour lui, du moins cher au plus cher.
  - « Hébergement » : exactement le même nom que dans l'onglet Hébergements.
  - « Personnes max » : au-delà, la formule n'est pas proposée à ce foyer.
  - Hôtel : prix de la chambre, et « Personnes comprises » = toutes (ex. chambre triple : max 3, prix 90, comprises 3).
  - Camping : prix pour 1 adulte, « Personnes comprises » = 1, puis le prix par adulte et par enfant en plus.
  - Le calcul compte les adultes et les enfants de l'onglet Foyers. C'est une estimation (sans petit-déjeuner ni taxe de séjour), le site le précise.
- **Langue du site** : chaque invité voit le site dans la langue de son foyer, et peut changer avec le lien « Ver en español / Voir en français » en bas de page. Son choix est retenu sur son téléphone.
- Remplacez les lignes « (exemple) » par vos vraies infos. Elles restent dans votre Sheet : seuls les invités qui ont un code valide les verront.

> Vous aviez déjà installé les onglets avant ? Relancez simplement **Mariage > 1. Installer les onglets** : les onglets manquants (Infos pratiques, Hébergements, Tarifs) et la colonne Langue sont ajoutés, et vos données existantes ne sont pas touchées. L'ancien onglet « Programme » ne sert plus : vous pouvez le supprimer (clic droit sur l'onglet > Supprimer).

Gardez la ligne « Famille Exemple » pour l'instant, elle servira au test.

## 5. Publier l'appli

1. Dans l'éditeur Apps Script : **Déployer > Nouveau déploiement**.
2. Roue dentée > **Application Web**.
3. **Exécuter en tant que : Moi**. **Qui a accès : Tout le monde**.
4. Cliquez sur **Déployer** et copiez l'**URL de l'application Web** (elle finit par `/exec`).
5. Collez cette URL dans l'onglet **Paramètres**, ligne « Adresse de l'appli ».

## 6. Générer les liens personnels

Menu **Mariage > 2. Générer les codes et liens**.
Chaque foyer reçoit un code (colonne A) et un lien personnel (colonne E). C'est ce lien que vous enverrez.
Vous pouvez relancer ce menu à chaque nouvel invité : les codes existants ne changent pas.

## 7. Tester, puis nettoyer

1. Ouvrez le lien de « Famille Exemple » sur votre téléphone et répondez.
2. Vérifiez la ligne dans **Réponses** et les totaux dans **Synthèse**.
3. Supprimez la ligne « Famille Exemple » dans **Foyers** et ses lignes dans **Réponses**.

## 8. Vérifier le « serveur » du futur site

Le futur site (sur GitHub Pages) demandera les infos à Apps Script. Pour vérifier que ça marche, ouvrez dans votre navigateur l'adresse de l'appli (celle qui finit par `/exec`) en ajoutant à la fin :

- `?action=invitation&code=VOTRECODE` (avec le code de « Famille Exemple ») : vous devez voir un texte qui commence par `{"params":` et contient le nom du foyer.
- `?action=invitation&code=XXXXXX` : vous devez voir seulement `{"erreur":"code"}`. Aucune info n'est donnée sans un bon code.

## Bon à savoir

- **Après chaque modification du code**, il faut republier, sinon les invités voient l'ancienne version :
  **Déployer > Gérer les déploiements** > crayon > Version : **Nouvelle version** > **Déployer**. L'adresse ne change pas.
- Google affiche un petit bandeau gris en haut de la page (« Cette application a été créée par un utilisateur… »). On ne peut pas l'enlever avec cette solution gratuite.
- Un invité peut revenir sur son lien et **modifier sa réponse** à tout moment. Sa nouvelle réponse remplace l'ancienne.
- Ne modifiez pas les titres de colonnes des onglets Réponses et Foyers : l'appli s'en sert.
- Aperçu du nouveau site : double-cliquez sur `docs/index.html` et tapez le code `DEMO01` (version française) ou `DEMO02` (foyer réglé en espagnol). Les infos sont fictives et rien n'est enregistré : vous pouvez remplir le formulaire de l'onglet « Répondre » pour l'essayer.
- Aperçu sans Google : ouvrez `apps-script/Index.html` dans votre navigateur et tapez le code `DEMO01`. Rien n'est enregistré.
