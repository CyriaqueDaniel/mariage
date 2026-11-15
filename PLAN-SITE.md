# Plan : site internet des invités (mariage du 21 août 2027)

Aucun code ne sera écrit avant que tu aies validé ce plan.

## 1. Ce que tu as demandé

| Sujet | Choix |
|---|---|
| Pages | Programme et lieux, hébergements, réponse (le formulaire existe déjà) |
| Hébergement du site | GitHub Pages |
| Accès | Protégé par un code |
| Langues | Français et espagnol, avec une langue choisie pour chaque foyer |
| Dépôt GitHub | Validé : il passera en public au moment de la mise en ligne (étape 7) |
| Vraies infos | Validé : elles restent dans le Google Sheet, et Apps Script ne les donne qu'avec un code valide |

## 2. Trois points à savoir

1. **Un code d'accès sur GitHub Pages ne protège rien tout seul.** GitHub Pages ne fait qu'afficher des fichiers. Si l'adresse du lieu est écrite dans le site, n'importe qui peut la lire dans le code source, même sans le code. Solution : le site ne contient que la mise en page. Les vraies infos (programme, adresses, hébergements) restent dans le Google Sheet. Le site les demande à Apps Script, qui ne les donne qu'en échange d'un code valide. C'est une vraie protection, et tu modifies les infos dans le Sheet sans toucher au code.
2. **Ton dépôt GitHub est privé.** GitHub Pages n'est gratuit que pour un dépôt public (sinon, il faut l'abonnement GitHub Pro, environ 4 $/mois). Rendre le dépôt public n'est pas grave avec la solution du point 1 : on n'y trouve que du code, sans aucune info sur les invités. Par contre, `PLAN.md`, `CLAUDE.md` et ton e-mail (dans les commits) deviennent visibles. → À trancher (question A).
3. **Un seul site plutôt que deux.** Aujourd'hui, le formulaire est une page Apps Script, avec le bandeau gris de Google. Je propose de déplacer le formulaire dans le site GitHub Pages. Apps Script devient alors un simple « serveur » qui lit et écrit dans le Sheet. Les invités ont une seule adresse et une seule page de connexion, sans bandeau gris, et tout est traduit au même endroit.

## 3. Comment ça marche

```
Invité (téléphone)
   │  ouvre  https://cyriaquedaniel.github.io/mariage/?code=AB12CD
   ▼
Site GitHub Pages (mise en page, textes de l'interface en FR/ES)
   │  envoie le code
   ▼
Apps Script (vérifie le code)
   │  renvoie : nom du foyer, langue, programme, lieux, hébergements, réponse déjà donnée
   ▼
Google Sheet (onglets Paramètres, Foyers, Réponses, Synthèse + nouveaux onglets Programme, Hébergements)
```

## 4. Les pages du site

Une seule page avec des onglets en bas de l'écran, pensée pour le téléphone :

1. **Accueil** : « Bonjour Famille Dupont », la date, un compte à rebours, la date limite de réponse et un gros bouton « Répondre ».
2. **Programme et lieux** : les horaires du samedi et du dimanche. Pour chaque lieu : adresse, bouton « Itinéraire » (ouvre Google Maps ou Waze), infos parking.
3. **Hébergements** : les lieux de couchage (les mêmes que dans le formulaire), avec adresse, contact, prix et lien de réservation.
4. **Répondre** : le formulaire actuel, traduit. Il affiche « Vous avez déjà répondu, modifier ? » si c'est le cas.

## 5. Les langues

- Une nouvelle colonne **Langue** dans l'onglet Foyers (`fr` ou `es`). Un foyer hispanophone voit le site en espagnol dès l'ouverture.
- Un bouton FR / ES permet de changer de langue à tout moment.
- Les textes fixes (boutons, questions du formulaire) sont traduits dans le code. Les textes que tu écris (programme, hébergements) ont une colonne FR et une colonne ES dans le Sheet.
- Les réponses arrivent toujours en français dans le Sheet (par exemple « Oui » plutôt que « Sí »), pour que les totaux restent justes.

## 6. Étapes de réalisation

Chaque étape se termine par un test et un commit. Tu valides avant de passer à la suivante.

| # | Étape | Test |
|---|---|---|
| 1 | Apps Script en « serveur » : renvoyer les infos d'un foyer en échange de son code | Une adresse avec un bon code affiche les données, un mauvais code affiche une erreur |
| 2 | Nouveaux onglets Programme et Hébergements, colonne Langue | Ils apparaissent avec un exemple |
| 3 | Squelette du site : page de connexion, onglets, mode démo `DEMO01` | Ouvert en local, on navigue entre les onglets |
| 4 | Pages Accueil, Programme et Hébergements | Les infos du Sheet s'affichent |
| 5 | Déplacer le formulaire dans le site | Une réponse enregistrée apparaît dans Réponses, sans doublon |
| 6 | Traduction espagnole | Un foyer `es` voit tout en espagnol |
| 7 | Mise en ligne sur GitHub Pages | Le lien marche sur ton téléphone |
| 8 | Mise à jour de `GUIDE.md`, test par un proche francophone et un hispanophone | |

## 7. Questions à trancher

A. **Dépôt public ou payant ?** Rendre `mariage` public (gratuit, je propose), ou garder le dépôt privé et payer GitHub Pro ?
B. **Les textes en espagnol** : je les traduis, et quelqu'un d'hispanophone les relit. Qui ?
C. **Le programme** : quels moments (mairie, cérémonie, vin d'honneur, dîner, soirée, brunch) et à quelles heures ? Tous les invités ont-ils le même programme ?
D. **Les hébergements** : leurs noms, adresses, prix, et faut-il réserver soi-même ou passez-vous par vous ?
E. **L'apparence** : couleurs ou thème du mariage ? Une photo de vous pour l'accueil ?
F. **Adresse du site** : `cyriaquedaniel.github.io/mariage` te convient, ou veux-tu un nom de domaine à toi (par exemple `cyriaque-et-x.fr`, environ 10 €/an) ?

Les questions C, D et E n'empêchent pas de commencer : je mets des exemples, que tu remplaceras dans le Sheet.

## 8. Plus tard

- Liste de mariage, notre histoire, FAQ (tenue, enfants), galerie photo après le mariage
- Relances par e-mail aux foyers qui n'ont pas répondu
