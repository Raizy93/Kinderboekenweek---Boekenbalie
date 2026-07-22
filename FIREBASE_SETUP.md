# Firebase-highscores activeren

De game gebruikt zonder configuratie automatisch lokale highscores. Na onderstaande stappen schakelt dezelfde interface over op Cloud Firestore.

## 1. Project en webapp maken

1. Maak een project in de [Firebase-console](https://console.firebase.google.com/).
2. Voeg in het project een webapp toe via het `</>`-icoon.
3. Bewaar het configuratieobject dat Firebase toont.
4. Open **Build → Firestore Database** en maak een database aan.

## 2. Lokale configuratie invullen

1. Kopieer `.env.example` naar `.env.local`.
2. Vul de waarden uit het Firebase-configuratieobject in:

```dotenv
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

3. Herstart `npm run dev`. In het highscorevenster verandert `LOKALE TOP 10` dan in `ONLINE TOP 10`.

`.env.local` staat in `.gitignore`. De webconfiguratie van Firebase is geen beheerderssleutel; de beveiliging wordt geregeld door Firestore Rules.

## 3. Beveiligingsregels publiceren

De meegeleverde `firestore.rules` staat alleen lezen en gecontroleerde nieuwe scores toe. Bestaande scores kunnen vanuit de game niet worden aangepast of verwijderd.

```powershell
npm install --global firebase-tools
firebase login
firebase use --add
firebase deploy --only firestore:rules
```

Kies bij `firebase use --add` het zojuist gemaakte project. Er zijn geen handmatig aangemaakte Firestore-indexen nodig.

## 4. Configuratie bij GitHub-deployment

De `VITE_FIREBASE_*`-waarden moeten tijdens `npm run build` beschikbaar zijn. Voeg ze daarom als repository secrets of variables toe aan de GitHub Actions-workflow die de site bouwt. Vite verwerkt deze publieke webconfiguratie in de browserbundle.

## Gegevensmodel

De game maakt bij gebruik automatisch deze collecties:

- `highscores_level_1`
- `highscores_level_2`
- `highscores_level_3`

Een score bevat alleen de korte spelersnaam, het niveau, score, nauwkeurigheid, geholpen bezoekers, beste reeks en serverdatum. Gemengde rondes worden niet opgeslagen.
