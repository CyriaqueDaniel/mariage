# Appli RSVP du mariage (21/08/2027)

Formulaire de réponse pour les invités. L'utilisateur débute en code : expliquer simplement, en français.

## Architecture
- Google Apps Script lié à un Google Sheet. Pas de build, pas de npm : les fichiers sont copiés-collés dans l'éditeur Apps Script.
- `apps-script/Code.gs` : serveur (doGet, getInvitation, enregistrerReponse, menu Mariage, création des onglets).
- `apps-script/Index.html` : toute la page (HTML, CSS, JS dans un seul fichier). Elle a un mode démo hors Google (code `DEMO01`) pour tester en local.
- `GUIDE.md` : procédure de mise en ligne pour l'utilisateur. La tenir à jour.

## Règles
- Un foyer = une ligne dans « Foyers », avec un code de 6 caractères. Une ligne par personne dans « Réponses ».
- Les colonnes de « Réponses » sont lues par position (`ENTETES_REPONSES`) et par les formules de « Synthèse » (lettres A à S). Ajouter une colonne = l'ajouter à la fin et mettre à jour `lireReponse_` et les formules.
- Les listes (allergènes, régimes, transports, covoiturage) sont définies dans Code.gs et envoyées à la page. Le serveur revalide tout dans `nettoyer_`.
- Après une modification, rappeler à l'utilisateur de recopier le fichier dans Apps Script et de publier une nouvelle version du déploiement.
