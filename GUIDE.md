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
3. Revenez sur la feuille : les onglets Paramètres, Foyers, Réponses, Synthèse, Programme et Hébergements sont créés.
   Un menu **Mariage** apparaît aussi (rechargez la page s'il n'est pas là).

## 4. Remplir vos informations

- **Paramètres** : vos prénoms, le lieu, la date limite, et surtout les **vrais noms des lieux de couchage** (séparés par `;`).
- **Foyers** : un foyer par ligne (un couple, une famille, une personne seule).
  - Colonne « Adultes » : les prénoms et noms séparés par `;`, par exemple `Marie Dupont ; Paul Dupont`.
  - Colonne « Enfants » : pareil, ou vide. Les invités peuvent aussi ajouter un enfant eux-mêmes.
  - Laissez la colonne « Code » vide, elle se remplit toute seule.
  - Colonne « Langue » : `fr` pour le français, `es` pour l'espagnol. Vide = français.
- **Programme** : une ligne par moment de la journée (cérémonie, vin d'honneur, repas du lendemain…).
  - La date s'écrit `2027-08-21` (année-mois-jour), l'heure `15:00`.
  - Les colonnes « ES » sont la traduction espagnole. Si vous les laissez vides, le texte français s'affiche.
- **Hébergements** : une ligne par lieu où dormir (nom, adresse, téléphone, lien de réservation, prix, infos).
- Remplacez les lignes « (exemple) » par vos vraies infos. Elles restent dans votre Sheet : seuls les invités qui ont un code valide les verront.

> Vous aviez déjà installé les onglets avant ? Relancez simplement **Mariage > 1. Installer les onglets** : les onglets Programme et Hébergements et la colonne Langue sont ajoutés, et vos données existantes ne sont pas touchées.

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
- Aperçu sans Google : ouvrez `apps-script/Index.html` dans votre navigateur et tapez le code `DEMO01`. Rien n'est enregistré.
