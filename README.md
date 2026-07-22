# De Boekenbalie

Een speelbaar fase-1-prototype van een Nederlandstalige top-down browsergame voor groep 7 en 8. De speler leest een boekwens, loopt door de bibliotheek, pakt een boek uit een genrekast en levert dit bij de actieve bezoeker af.

## Starten

### Makkelijkste manier op Windows

Dubbelklik op **`START_GAME.bat`**. Het bestand bouwt de game, start een kleine lokale HTML-server en opent automatisch de browser. Laat het zwarte venster open zolang je speelt. Met `Ctrl+C` stop je de server.

De game staat dan op <http://127.0.0.1:4180/>.

### Via de terminal

```bash
npm install
npm run dev
```

Open daarna het lokale adres dat Vite toont. Productiebouw en tests:

```bash
npm run build
npm test
```

## Besturing

- Lopen: WASD of pijltjestoetsen
- Interactie: E of spatie
- Pauze: Escape

De game gebruikt geen externe assets, backend, accounts of persoonsgegevens. Alle pixel-placeholdergraphics worden in Phaser getekend en kunnen later door spritesheets worden vervangen.

## GitHub Pages en iframe

De repository bevat `.github/workflows/deploy-pages.yml`. Zet na het pushen op GitHub onder **Settings → Pages → Build and deployment** de bron op **GitHub Actions**. Iedere push naar `main` bouwt en publiceert daarna automatisch de map `dist`.

Gebruik de gepubliceerde Pages-URL vervolgens bijvoorbeeld zo:

```html
<iframe
  src="https://GEBRUIKERSNAAM.github.io/REPOSITORYNAAM/"
  title="De Boekenbalie"
  width="100%"
  height="760"
  style="border: 0; max-width: 1280px;"
  allowfullscreen
></iframe>
```

De game schaalt binnen het iframe mee. Gebruik bij voorkeur minimaal 720 pixels iframehoogte; op kleinere schermen blijft de volledige game zichtbaar maar wordt tekst kleiner.
