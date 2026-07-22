# Voortgang

## 21 juli 2026 — fase 1 gebouwd

Toegevoegd:

- Vite/TypeScript/Phaser-projectstructuur.
- Speelbare top-down bibliotheek op een vast canvas van 1152 × 720.
- Acht kleurgecodeerde én benoemde genrekasten.
- Bestuurbare pixelspeler met WASD/pijltjes, botsingen en interactiebereik.
- Boek pakken, bij dezelfde kast terugzetten en bij de balie afleveren.
- Inhoudelijke correcte en verkeerde feedback; fout boek moet eerst terug.
- Vijf zichtbare bezoekers, actieve bezoeker en een eenvoudige rij-animatie.
- Score, geholpen teller, gedragen boek, chaosmeter en pauzemenu.
- Acht prototypewensen (één per genre) als losse data.
- Eerste unit tests voor genres, opdrachtkoppeling, score en chaos.

Beslissingen:

- De screenshot is alleen gebruikt als inspiratie voor een overzichtelijke top-down-indeling.
- Alle graphics worden procedureel en pixel-perfect getekend, zonder externe assets.
- Spelsystemen en data staan los van de scene om fase 2 eenvoudiger te maken.

Nog niet in fase 1:

- De volledige bank van 80 opdrachten, drie niveaus en spelmodi.
- Interactieve tutorial, uitgebreide resultaten en leerkrachtinstellingen.
- Audio, instellingenopslag en volledige toegankelijkheidsopties.

Controle uitgevoerd:

- Strikte TypeScript-productiebouw slaagt.
- Vite-productiebundel wordt correct aangemaakt in `dist/`.
- Alle 3 unit-tests slagen.
- De lokale ontwikkelserver antwoordt met HTTP 200.
- De ingebouwde testbrowser blokkeerde navigatie naar de lokale URL. Daardoor is de visuele handtest in deze omgeving nog niet afgetekend.

Eerstvolgende stap: speel lokaal één volledige goede en foute route via `npm run dev`; breid daarna in fase 2 de opdrachtenbank en spelmodi uit.

## 21 juli 2026 — eenvoudige Windows-starter

- `START_GAME.bat` toegevoegd voor starten met een dubbelklik.
- `server.mjs` toegevoegd als lokale server zonder extra afhankelijkheden.
- De starter bouwt eerst de actuele versie en opent daarna automatisch `http://127.0.0.1:4180/`.

## 21 juli 2026 — layoutcorrectie en Pages-voorbereiding

- Boekwenspaneel en bovenste kastlabels hebben nu elk een eigen verticale zone.
- Genrelabelstroken zijn hoger gemaakt zodat de tekst binnen de gekleurde balk blijft.
- Het balielabel staat nu als badge op de balie en de plant overlapt het informatiepaneel niet meer.
- GitHub Pages-workflow toegevoegd; de gebouwde `dist`-map kan automatisch worden gepubliceerd en in een iframe worden gebruikt.

## 21 juli 2026 — boekwens buiten het speelveld

- Canvas verhoogd van 720 naar 800 pixels.
- Een vaste boekwenszone tussen balie en speelveld gereserveerd.
- Vloer, physicsgrenzen, beide kastenrijen, speler en interactiebalk consequent omlaag geplaatst.
- De boekwens kan daardoor niet langer over kastlabels of looproutes vallen.

## 21 juli 2026 — informatiezone boven de wachtrij

- Definitieve schermvolgorde ingesteld: HUD, boekwens/meldingen, wachtrij, balie, speelveld.
- Wachtrij en balie naar beneden verplaatst; de boekwens staat nu boven de bezoekers.
- Alle tijdelijke feedback, waaronder `Nieuwe bezoeker`, gebruikt dezelfde bovenste informatiezone.
- Het grote feedbackvenster over de boekenkasten is verwijderd.

## 21 juli 2026 — sneller speltempo

- De algemene uitleg verschijnt alleen nog bij het starten van een ronde.
- Na het doorschuiven van de wachtrij verschijnt direct de volgende boekwens, zonder terugkerende `Nieuwe bezoeker`-melding.
- Knop `HULP ?` en sneltoets `H` toegevoegd om de uitleg op verzoek opnieuw te tonen.

## 21 juli 2026 — hoofdmenu en volledige opdrachtenbank

- Hoofdmenu uitgebreid met startknop, speluitleg en keuze uit niveau 1, 2, 3 of gemengd.
- 80 gecontroleerde boekwensen toegevoegd: tien per genre, verdeeld over drie niveaus.
- `RequestDeck` toegevoegd voor niveaufiltering, schudden en geen dubbele opdracht voordat het deck is doorlopen.
- Het gekozen niveau wordt boven de actuele boekwens getoond.
- Tests uitgebreid met aantallen, unieke ID's, genredekking, maximale wenslengte, niveaufiltering en dubbele-opdrachtencontrole.

## 21 juli 2026 — boekwenslabel gecorrigeerd

- `BOEKWENS • NIVEAU` en de eigenlijke wens staan nu op afzonderlijke regels.
- De wens gebruikt de volledige paneelbreedte en kan niet meer door het niveaulabel lopen.

## 21 juli 2026 — start visuele upgrade

- Eerste art-direction-sheet met image generation gemaakt en opgeslagen als `art/art-direction-v1.png`.
- Warme moderne pixelartstijl, 32px-raster, palet, perspectief en lichtregels vastgelegd in `ART_DIRECTION.md`.
- Assetvolgorde bepaald: omgeving, meubels, speler, bezoekers en daarna UI/effecten.

## 21 juli 2026 — visuele productieset geïntegreerd

- Nieuwe gegenereerde houten vloer, brede balie, boekenkast, plant en boekkar verwerkt tot gameklare PNG-assets.
- Twaalf personages verwerkt: één speler en elf diverse bezoekers.
- Chroma-keyachtergronden lokaal verwijderd en sprites pixel-perfect met nearest-neighbor geschaald.
- Assets worden in `BootScene` voorgeladen; bestaande procedurele textures blijven automatische fallback.
- Shelf-collisions en player-footprint aangepast aan de nieuwe visuele afmetingen.
- Bronsheets staan onder `art/generated-sources`; compacte runtime-assets onder `public/assets/pixel`.

## 21 juli 2026 — loopanimatie

- Negen consistente spelerframes gegenereerd: drie omlaag, drie zijwaarts en drie omhoog.
- Links lopen gebruikt het gespiegeld zijaanzicht.
- Phaser-animaties wisselen stap links, neutraal en stap rechts af op 9 fps.
- Bij stilstaan, pauzeren of feedback-lock stopt de animatie op het neutrale frame van de laatst gebruikte richting.
- Collision-footprint blijft vast, onafhankelijk van de zichtbare animatieframes.

## 21 juli 2026 - genrepictogrammen en houten kastborden

- Acht unieke pixelartpictogrammen toegevoegd voor avontuur, fantasy, humor, spanning, detective, sciencefiction, historisch en informatie.
- De vlakke gekleurde titelstroken vervangen door houten borden die aansluiten bij de stijl van de boekenkasten.
- Nederlandse genrenamen worden apart en scherp gerenderd; iedere kast behoudt een subtiele eigen kleuraccentlijn.
- Transparante runtime-assets staan onder `public/assets/pixel`; de gegenereerde bronafbeeldingen onder `art/generated-sources`.

## 21 juli 2026 - character select

- Character select met Sam, Lina, Milan, Aya en Noah toegevoegd aan het hoofdmenu.
- Alle vijf personages hebben een volledige negendelige loopset: omlaag, zijwaarts en omhoog.
- De gekozen speler blijft actief wanneer vanuit het pauzemenu naar het hoofdmenu wordt teruggekeerd.
- Pijltjes links/rechts en klikken ondersteunen de personagekeuze; niveaukeuze blijft onafhankelijk.

## 21 juli 2026 - lopende wachtrij

- Voor alle elf bezoekers twee herkenbare zijwaartse contactposes toegevoegd.
- De geholpen bezoeker loopt links uit beeld; de overige bezoekers lopen daarna naar hun volgende plek.
- Tijdens het lopen wisselen de been- en armstanden; bij aankomst draaien bezoekers terug naar hun frontale wachtpose.
- De nieuwe bezoeker loopt vanaf rechts de laatste wachtpositie binnen en bezoekers roteren zonder voortijdige duplicaten.

## 21 juli 2026 - vrije loopstrook voor de balie

- Speelveld verhoogd naar 860 pixels om extra vloeroppervlak te maken zonder de kastenrijen samen te drukken.
- Balie 20 pixels omhoog en beide kastenrijen 70 pixels omlaag verplaatst.
- Een zichtbare loopcorridor tussen balie en bovenste genreborden toegevoegd.
- Bovenste physicsgrens naar de voorkant van de balie verplaatst, zodat de speler niet meer over de balie kan lopen.
- Onderste decoratie, spelerstart, muren en interactiebalk consequent met de nieuwe hoogte mee verplaatst.

## 21 juli 2026 - perspectief en zichtbaarheid bij de balie

- Balie 20 pixels omlaag geplaatst, zodat de speler visueel dichter tegen de voorrand kan staan.
- Wachtrij 32 pixels omhoog geplaatst; bezoekers verdwijnen niet langer grotendeels achter het werkblad.
- Labels en het kader van `NU HELPEN` compacter gemaakt om overlap met de boekwens te voorkomen.
- Loop- en wachtanimaties gebruiken nu consequent de nieuwe bezoekershoogte.

## 21 juli 2026 - baliediepte en kastdecoratie

- Bezoekers dichter tegen de balie gezet; hun voeten en onderbenen verdwijnen nu natuurlijk achter het werkblad.
- Het actieve bezoekerskader aangepast aan de nieuwe wachtrijpositie.
- De laagvolgorde van kasten en genreborden omgedraaid, zodat planten en boeken op de kast vóór het bord staan.

## 21 juli 2026 - vaste wachtpositie achter de balie

- Bezoekers nog 6 pixels dichter tegen de balie geplaatst.
- Verticale wachtanimatie verwijderd, zodat voeten en onderbenen nooit meer kort boven de balie verschijnen.
- Zijwaartse loopanimatie bij het doorschuiven blijft behouden.

## 21 juli 2026 - hoofdmenu in bibliotheekstijl

- Paarse losse menu-opmaak vervangen door een houten bibliotheekinterieur met de bestaande vloer- en kastassets.
- Titel, personagekaarten, niveaukaarten, startknop en uitleg voorzien van donkere houten lijsten en gouden accenten.
- Kastdecoratie aan weerszijden van de speluitleg toegevoegd voor een directe visuele aansluiting op het speelveld.
- Bestaande menufuncties, sneltoetsen en keuzes ongewijzigd behouden.

## 22 juli 2026 - houten spelinterface

- Bovenste statusbalk vervangen door een donker houten frame met goudkleurige binnenrand en vakverdeling.
- Hulpknop en statusvakken opnieuw vormgegeven in dezelfde bibliotheekstijl.
- Boekwenspaneel voorzien van een houten lijst, schaduw en neutraal boekicoon zonder het juiste genre prijs te geven.
- Feedbackmeldingen gebruiken voortaan dezelfde houten paneelopbouw als de boekwens.

## 22 juli 2026 - vrije middenroute

- Decoratieve plant in het midden van het speelveld verwijderd, zodat de doorgang tussen de kasten visueel en praktisch vrij is.

## 22 juli 2026 - genrespecifieke boeksprites

- Acht nieuwe transparante pixelart-boeken toegevoegd: Avontuur, Fantasy, Humor, Spanning, Detective, Sciencefiction, Historisch en Informatie.
- Ieder boek heeft een eigen omslagkleur en herkenbaar genresymbool in dezelfde warme pixelstijl als de kasten.
- Het codegetekende, getinte boek vervangen door het juiste genreboek zodra de speler een boek pakt.
- Herbruikbaar verwerkingsscript toegevoegd voor transparant uitsnijden en verkleinen naar consistente 48×60-sprites.

## 22 juli 2026 - werkdag en boekenwormreeks

- De Onrust-meter en alle bijbehorende spellogica volledig verwijderd.
- Een werkdag van 09:00 tot 17:00 toegevoegd; één speelronde duurt vijf actieve minuten.
- De werkdag pauzeert tijdens uitleg, feedback, wachtrij-animaties en het pauzemenu.
- De reeks goede antwoorden wordt zichtbaar als een boekenworm met acht vulbare segmenten.
- Langere foutloze reeksen leveren oplopende bonuspunten op; een fout maakt de boekenworm leeg.
- Een sluitingsscherm toegevoegd met score, geholpen bezoekers, nauwkeurigheid en beste boekenwormreeks.

## 22 juli 2026 - boekenwormsprite en wachtrijlabels

- De getekende cirkels van de streakmeter vervangen door een transparante pixelart-boekenworm in de stijl van de personages.
- De acht streakstappen onthullen achtereenvolgens de kop en zeven lichaamssegmenten van de worm.
- De titel van de boekenworm vergroot voor betere leesbaarheid in de bovenbalk.
- De labels `NU HELPEN` en `WACHT 1–4` omlaag geplaatst, zodat ze niet meer tegen de boekwens aan liggen.
- De hulpknop vormgegeven als hetzelfde goudkleurige pixellabel als `BALIE` en `NU HELPEN`.

## 22 juli 2026 - samenhangende bordstijl en speluitleg

- Boekenwormtitel en worm verkleind en dichter bij elkaar geplaatst, zodat ze volledig binnen hun HUD-vak vallen.
- De labels `BALIE` en `HULP ?` vervangen door donkere houten bordjes op basis van hetzelfde asset als de genrekasttitels.
- In het hoofdmenu een knop `ALLE SPELUITLEG` toegevoegd.
- Het uitlegvenster behandelt doel, bediening, werkdag, boekenwormreeks, bonuspunten en het eindresultaat.
- De boekenworm wordt ook in het uitlegvenster als volledig gevulde sprite getoond.

## 22 juli 2026 - boekenwormverhouding

- De HUD-boekenworm smaller en hoger weergegeven, zodat de oorspronkelijke spriteverhouding behouden blijft.
- Titel en worm dichter bij elkaar gezet zonder dat ze buiten het houten statusvak vallen.

## 22 juli 2026 - eerste audiolaag

- Het kastgeluid zonder kwaliteitsverlies teruggebracht tot het fragment van seconde 1 tot 3.
- Het kastgeluid gekoppeld aan zowel pakken als terugzetten van een boek.
- Het pagina-omslaggeluid gekoppeld aan het aanbieden van een boek aan de bezoeker.
- Houten voetstappen toegevoegd voor de speler en het doorschuiven van de wachtrij.
- `Float Night Drift` als herhalende achtergrondmuziek toegevoegd en na luistercontrole teruggebracht naar 3,5% volume.
- Het pagina-omslaggeluid bij overhandigen teruggebracht naar 22% volume.
- Het pagina-omslaggeluid verder teruggebracht naar 14% volume.
- Een houten `AUDIO AAN/UIT`-knop en de sneltoets M toegevoegd om muziek en effecten samen te dempen.
- De dempkeuze blijft via het spelregister behouden tussen rondes en scènes.

## 22 juli 2026 - scannen bij de balie

- De nieuwe scannersound ontdaan van overtollige metadata; de volledige scan duurt 0,914 seconde.
- Bij ieder aangeboden boek klinkt eerst de barcodescanner en direct na voltooiing de zachte page-turn.
- De scanner op de balie verplaatst van het midden naar links van de monitor, dichter bij de bezoeker die wordt geholpen.
- Een nieuwe `counter-v2.png` toegevoegd, zodat de oorspronkelijke balieafbeelding als bron behouden blijft.

## 22 juli 2026 - audiotiming verfijnd

- Het volume van de barcodescanner sterk teruggebracht van 28% naar 7%.
- De page-turn start nu 0,18 seconde na de scan in plaats van na het volledige scanbestand.
- Het kastgeluid opnieuw uit de bron geknipt: seconde 1,45 tot 2,35, voor een directer effect van circa 0,91 seconde.

## 22 juli 2026 - verschillende afgiftefeedback

- Het scanvolume verder teruggebracht van 7% naar 3%.
- De page-turn speelt alleen nog wanneer het ingeleverde boek correct is.
- Voor een fout boek een vriendelijk dalend tweeklangs-signaal van 0,52 seconde gegenereerd.
- Na de scan wordt op hetzelfde moment óf de page-turn óf het foutsignaal afgespeeld.

## 22 juli 2026 - Firebase-klare highscores

- Drie gescheiden top-10-lijsten toegevoegd voor niveau 1, 2 en 3; Gemengd telt niet mee.
- Spelernaamkeuze van maximaal 12 tekens toegevoegd aan het hoofdmenu.
- Highscorevenster met niveautabs, score, nauwkeurigheid en beste boekenwormreeks toegevoegd.
- Scores worden na de werkdag automatisch opgeslagen en lokaal gesorteerd op score, nauwkeurigheid en beste reeks.
- Officiële modulaire Firebase SDK geïnstalleerd en een dynamisch geladen Firestore-adapter toegevoegd.
- Zonder Firebase-configuratie werkt dezelfde interface via `localStorage`; bij netwerkproblemen valt de game daarop terug.
- Firestore Rules, omgevingsvariabelvoorbeeld en een volledige `FIREBASE_SETUP.md` toegevoegd.
- Alle gebruikte audiobestanden onder `public/assets/sounds` geplaatst met korte, webvriendelijke bestandsnamen.

Starten met `npm install` en `npm run dev`. Testen met `npm test`; productiebouw met `npm run build`.
