# Plan : appli de réponse aux invitations du mariage (21 août 2027)

Aucun code ne sera écrit avant validation de ce plan.

## 1. Objectif

Les invités indiquent eux-mêmes, depuis leur téléphone :

| Sujet | Demandé au départ | Ajouté après échange |
|---|---|---|
| Présence | Oui / non | Par personne, pas par foyer |
| Allergies | Si oui, lesquelles, enfants compris | 14 allergènes officiels + champ libre, régimes alimentaires |
| Couchage | Lieu où ils dorment | Liste fixe de lieux |
| Lendemain | Restent-ils pour le repas ? | Par personne |
| Nourriture du lendemain | Apportent-ils quelque chose ? Quoi ? | |
| Enfants | | Âge (menu enfant, chaise haute) |
| Transport | | Mode de transport, covoiturage |
| Divers | | Date limite affichée, message libre |

Vous, les mariés, consultez tout dans un Google Sheet, avec un onglet de totaux.

## 2. Décisions déjà prises

- **Hébergement** : Google Sheets + Google Apps Script. C'est gratuit, et les invités n'ont aucun compte à créer.
- **Identification** : vous saisissez la liste des foyers, et chaque foyer reçoit un lien personnel avec un code.
- **Modification** : un invité peut revenir sur son lien et changer sa réponse jusqu'à la date limite.

## 3. Questions à trancher avant de coder

1. **Lieux de couchage** : leurs vrais noms ? Ont-ils une capacité limitée (faut-il fermer un lieu quand il est plein) ? Qui paie ?
2. **Les « +1 »** : un invité seul peut-il venir accompagné ? Si oui, pour tout le monde ou seulement certains ?
3. **Les moments** : y a-t-il plusieurs temps (mairie, cérémonie, vin d'honneur, dîner, soirée) avec des invités différents ?
4. **Le ton** : tutoiement ou vouvoiement ?
5. **La date limite de réponse** : laquelle ? Faut-il bloquer les modifications ensuite ?
6. **L'accès au Sheet** : qui d'autre que vous doit voir les réponses (conjoint·e, témoins, traiteur) ?
7. **Les données personnelles** : les allergies sont des données de santé. Proposition : ne collecter que le nécessaire et supprimer le Sheet quelques semaines après le mariage.

## 4. Données (dans le Google Sheet)

- **Paramètres** : vos prénoms, la date, le lieu, la date limite, les lieux de couchage. Vous les modifiez sans toucher au code.
- **Foyers** : une ligne par foyer, avec code, nom, adultes, enfants, lien personnel et « a répondu ».
- **Réponses** : une ligne par personne, remplie par l'appli. Une nouvelle réponse remplace l'ancienne.
- **Synthèse** : les totaux (présents, allergies pour le traiteur, couchage, lendemain, apports, covoiturage, foyers sans réponse).

## 5. Parcours de l'invité

1. Il ouvre son lien. S'il n'a pas de lien, il saisit son code.
2. Il voit une carte par personne du foyer : présence, puis allergies, régime et âge si la personne vient.
3. Viennent ensuite les questions du foyer, affichées seulement si quelqu'un vient : couchage, lendemain (qui reste, ce qu'il apporte), transport.
4. Il peut laisser un message, puis il envoie.
5. Il voit un récapitulatif avec un bouton « Modifier ma réponse ».

Contraintes : pensé d'abord pour le téléphone, lisible par des personnes âgées, messages d'erreur clairs.

## 6. Étapes de réalisation

Chaque étape se termine par un test et un commit Git. Vous validez avant de passer à la suivante.

| # | Étape | Test |
|---|---|---|
| 0 | Installer Git, créer le dépôt, premier commit | `git log` montre le commit |
| 1 | Squelette Apps Script : menu, création des onglets | Les 4 onglets apparaissent |
| 2 | Lecture d'un foyer à partir de son code | Un bon code affiche le foyer, un mauvais code affiche une erreur |
| 3 | Cartes par personne (présence, allergies, régime, âge) | Aperçu local avec le code `DEMO01` |
| 4 | Questions du foyer (couchage, lendemain, transport, message) | Elles s'affichent seulement quand il le faut |
| 5 | Enregistrement et modification de la réponse | Une ligne par personne, sans doublon après une modification |
| 6 | Onglet Synthèse | Les totaux sont justes sur 3 foyers de test |
| 7 | Finitions visuelles et mobile | Test sur votre téléphone |
| 8 | Mise en ligne, liens personnels, test réel, nettoyage | Un proche teste avec son lien |

Remarque : une première version existe déjà (`apps-script/`) et couvre les étapes 1 à 7. Je propose de la garder dans Git comme référence, puis de reprendre chaque étape en la relisant et en l'ajustant à vos réponses de la section 3. C'est plus rapide et moins risqué que de tout réécrire.

## 7. Plus tard (hors première version)

- Relances automatiques par e-mail aux foyers sans réponse
- Liste des plats déjà prévus pour le lendemain, pour éviter les doublons
- Page d'infos pratiques (adresses, horaires, plan, hébergements, liste de mariage)
- Version anglaise si vous avez des invités étrangers
