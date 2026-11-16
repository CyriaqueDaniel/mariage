# Appli RSVP du mariage (21/08/2027)

Formulaire de réponse pour les invités. L'utilisateur débute en code : expliquer simplement, en français.

## Architecture
- Google Apps Script lié à un Google Sheet. Pas de build, pas de npm : les fichiers sont copiés-collés dans l'éditeur Apps Script.
- `apps-script/Code.gs` : serveur (doGet, getInvitation, enregistrerReponse, menu Mariage, création des onglets).
- `apps-script/Index.html` : toute la page (HTML, CSS, JS dans un seul fichier). Elle a un mode démo hors Google (code `DEMO01`) pour tester en local.
- `docs/` : le site invités (GitHub Pages sert ce dossier). `index.html` + `style.css` + `app.js`, sans build. Textes de l'interface dans `TEXTES` (fr, es) de `app.js`, clé absente = français. Codes démo fictifs `DEMO01` (fr) et `DEMO02` (es), utilisés aussi tant que `API_URL` est vide. Direction visuelle « fête de village d'été » : vert = demoiselles d'honneur, bleu = garçons d'honneur (provisoire, variable `--bleu`). Décor = bouteilles suspendues par une ficelle de jute, guirlande lumineuse enroulée dedans et bouquet qui sort du goulot (inspiration : photo Pinterest « déco guinguette » fournie par l'utilisateur, non reprise sur le site), verres rouge, orange vif, violet. Plus tard : remplacer par une photo de leur vraie bouteille. Mariés : Morgane & Cyriaque.
- `PLAN-SITE.md` : plan validé du site invités (GitHub Pages, FR/ES). Apps Script y sert d'API : `doGet?action=invitation&code=` et `doPost` (corps texte JSON `{action:'enregistrer'}`). Sans code valide, l'API ne renvoie que `{erreur:'code'}` : aucune vraie info (lieu, adresses) ne doit être écrite dans le dépôt, qui sera public.
- `GUIDE.md` : procédure de mise en ligne pour l'utilisateur. La tenir à jour.

## Règles
- Un foyer = une ligne dans « Foyers », avec un code de 6 caractères. Une ligne par personne dans « Réponses ».
- Les colonnes de « Réponses » sont lues par position (`ENTETES_REPONSES`) et par les formules de « Synthèse » (lettres A à S). Ajouter une colonne = l'ajouter à la fin et mettre à jour `lireReponse_` et les formules.
- Les listes (allergènes, régimes, transports, covoiturage) sont définies dans Code.gs et envoyées à la page. Le serveur revalide tout dans `nettoyer_`.
- Après une modification, rappeler à l'utilisateur de recopier le fichier dans Apps Script et de publier une nouvelle version du déploiement.
