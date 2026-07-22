import type { GenreId } from "./genres";

export interface GenreRequest {
  id: string;
  genreId: GenreId;
  level: 1 | 2 | 3;
  request: string;
  hint: string;
  explanation: string;
}

const item = (
  id: string,
  genreId: GenreId,
  level: 1 | 2 | 3,
  request: string,
  hint: string,
  explanation: string,
): GenreRequest => ({ id, genreId, level, request, hint, explanation });

export const requests: readonly GenreRequest[] = [
  // Avontuur
  item("avontuur-01", "avontuur", 1, "Ik zoek een verhaal over een gevaarlijke reis vol actie en moed.", "Let op de reis, gevaren en dappere keuzes.", "Een gevaarlijke tocht vol actie en moed hoort bij avontuur."),
  item("avontuur-02", "avontuur", 1, "Ik wil een spannend avontuur waarin iemand een onbewoond eiland probeert te verlaten.", "De hoofdpersoon moet hindernissen overwinnen tijdens een reis.", "Overleven en ontsnappen van een onbekende plek passen bij avontuur."),
  item("avontuur-03", "avontuur", 1, "Geef me een verhaal met een expeditie door de jungle en onverwachte gevaren.", "Denk aan ontdekken, reizen en gevaar.", "Een expeditie met hindernissen is kenmerkend voor avontuur."),
  item("avontuur-04", "avontuur", 2, "Twee vrienden varen in een kleine boot achter een verborgen schat aan.", "De zoektocht en de riskante tocht staan centraal.", "Een riskante schattenjacht is vooral een avonturenverhaal."),
  item("avontuur-05", "avontuur", 2, "Een meisje beklimt alleen een hoge berg om haar verdwaalde broer te vinden.", "Let op de lichamelijke uitdaging en moedige reddingsactie.", "De gevaarlijke klim en reddingsactie maken dit avontuur."),
  item("avontuur-06", "avontuur", 2, "Na een schipbreuk moet een groep kinderen samen voedsel en een veilige route vinden.", "Ze moeten overleven en hindernissen overwinnen.", "Overleven na een schipbreuk draait om avontuur."),
  item("avontuur-07", "avontuur", 3, "Een koerier moet vóór zonsondergang een belangrijk pakket door vijandelijk gebied brengen.", "De tocht en obstakels zijn belangrijker dan het geheim van het pakket.", "De gevaarlijke opdracht en reis staan centraal, dus dit is avontuur."),
  item("avontuur-08", "avontuur", 3, "Een jongen vindt een oude kaart en trekt door grotten, rivieren en woestijngebieden.", "De kaart leidt tot een lange tocht met hindernissen.", "De ontdekkingsreis langs gevaarlijke plekken past bij avontuur."),
  item("avontuur-09", "avontuur", 3, "Tijdens een schoolreis raakt een groep verdwaald en moet vóór een storm de kust bereiken.", "Het verhaal draait om handelen, reizen en veilig thuiskomen.", "De race tegen de storm en de tocht maken dit avontuur."),
  item("avontuur-10", "avontuur", 3, "Een jonge piloot maakt een noodlanding en zoekt dagenlang een weg door onbekend gebied.", "De overlevingstocht is het belangrijkste kenmerk.", "Een tocht door onbekend gebied na een noodlanding hoort bij avontuur."),

  // Fantasy
  item("fantasy-01", "fantasy", 1, "Ik zoek een verhaal met magie, draken en een verborgen tovenaarsrijk.", "Let op magie en wezens die niet echt bestaan.", "Magie en verzonnen wezens zijn belangrijke kenmerken van fantasy."),
  item("fantasy-02", "fantasy", 1, "Geef me een verhaal waarin elfen en reuzen samen een betoverd bos beschermen.", "De wereld bevat magische volken en betovering.", "Elfen, reuzen en betovering horen duidelijk bij fantasy."),
  item("fantasy-03", "fantasy", 1, "Ik wil lezen over een leerling die ontdekt dat zij spreuken kan gebruiken.", "Spreuken kunnen niet in de gewone werkelijkheid.", "Bovennatuurlijke krachten en spreuken passen bij fantasy."),
  item("fantasy-04", "fantasy", 2, "Een jongen stapt door een spiegel en komt terecht in een rijk waar bomen praten.", "Een onmogelijke wereld ligt achter een magische doorgang.", "Een andere wereld met pratende bomen maakt dit fantasy."),
  item("fantasy-05", "fantasy", 2, "Elke volle maan verandert een stil dorp in een vliegende stad.", "De belangrijkste gebeurtenis is onmogelijk en magisch.", "Een vliegende stad door betovering hoort bij fantasy."),
  item("fantasy-06", "fantasy", 2, "Een kroon kiest zelf wie het koninkrijk mag redden van een eeuwenoude vloek.", "Let op het betoverde voorwerp en de vloek.", "Magische voorwerpen en vloeken zijn kenmerken van fantasy."),
  item("fantasy-07", "fantasy", 3, "Een meisje reist door gevaarlijke bergen om de laatste feniks om hulp te vragen.", "De reis is avontuurlijk, maar het magische wezen bepaalt de wereld.", "De feniks en magische wereld maken fantasy het belangrijkste genre."),
  item("fantasy-08", "fantasy", 3, "Een detective onderzoekt wie de dromen van kinderen steelt met een betoverde sleutel.", "Er is een raadsel, maar de oorzaak en regels zijn magisch.", "De betoverde sleutel en gestolen dromen maken dit vooral fantasy."),
  item("fantasy-09", "fantasy", 3, "In een oud kasteel komt ieder geschilderd dier na middernacht tot leven.", "Onmogelijke magie vormt de kern van het verhaal.", "Levende schilderijen door magie horen bij fantasy."),
  item("fantasy-10", "fantasy", 3, "Een grappige kabouter moet leren hoe hij een onzichtbaarheidsvloek kan verbreken.", "Humor kan voorkomen, maar magie veroorzaakt het probleem.", "De kabouter en onzichtbaarheidsvloek maken dit vooral fantasy."),

  // Humor
  item("humor-01", "humor", 1, "Ik zoek een grappig verhaal waar ik hard om kan lachen.", "Het belangrijkste doel is de lezer laten lachen.", "Grappige gebeurtenissen en grappen horen bij humor."),
  item("humor-02", "humor", 1, "Geef me een boek vol gekke misverstanden en onhandige blunders.", "Let op situaties die expres komisch zijn.", "Misverstanden en blunders zijn typische middelen in humor."),
  item("humor-03", "humor", 1, "Ik wil lezen over een klas waarin elke schooldag iets lachwekkends misgaat.", "De gebeurtenissen zijn vooral bedoeld om grappig te zijn.", "Een reeks lachwekkende schoolmomenten hoort bij humor."),
  item("humor-04", "humor", 2, "Een jongen doet alsof hij kan koken en serveert per ongeluk blauwe soep aan de burgemeester.", "De fout leidt tot een komische situatie.", "De onhandige vergissing en rare gevolgen maken dit humor."),
  item("humor-05", "humor", 2, "Twee vriendinnen verwisselen hun spreekbeurten en proberen dit ongemerkt op te lossen.", "Het misverstand zorgt voor grappige problemen.", "De verwisseling en komische reddingspogingen passen bij humor."),
  item("humor-06", "humor", 2, "Een strenge meester blijkt tijdens het schoolfeest verschrikkelijk slecht te kunnen goochelen.", "De tegenstelling en mislukkingen moeten je laten lachen.", "Mislukte trucs van een streng personage zorgen voor humor."),
  item("humor-07", "humor", 3, "Een familie gaat kamperen, maar door hun slechte voorbereiding loopt ieder plan anders.", "Er zijn tegenslagen, maar ze worden luchtig en grappig verteld.", "De komische opeenstapeling van mislukkingen maakt dit humor."),
  item("humor-08", "humor", 3, "Een leerling schrijft per ongeluk een liefdesbrief op de achterkant van zijn huiswerk.", "De gênante vergissing staat centraal, niet romantiek.", "De ongemakkelijke verwisseling is bedoeld als humor."),
  item("humor-09", "humor", 3, "Een hond vertelt hoe onbegrijpelijk en onhandig zijn mensen zich iedere dag gedragen.", "Het bijzondere perspectief wordt gebruikt om alledaagse dingen grappig te maken.", "De spottende blik van de hond maakt dit humor."),
  item("humor-10", "humor", 3, "Een voetbalteam bedenkt steeds vreemdere smoesjes voor een reeks knullige nederlagen.", "Sport is het onderwerp, maar lachen is het doel.", "De overdreven smoesjes en blunders maken humor het hoofdgenre."),

  // Spanning
  item("spanning-01", "spanning", 1, "Ik zoek een verhaal waarin voortdurend gevaar dreigt en je snel wilt doorlezen.", "Dreiging en onzekerheid staan centraal.", "Voortdurende dreiging en onzekerheid horen bij spanning."),
  item("spanning-02", "spanning", 1, "Een kind zit 's nachts opgesloten en hoort iemand steeds dichterbij komen.", "Je weet niet wie eraan komt of wat er zal gebeuren.", "De dreiging en onzekerheid maken dit een spannend verhaal."),
  item("spanning-03", "spanning", 1, "Geef me een verhaal over ontsnappen uit een gebouw voordat de tijd voorbij is.", "De tijdsdruk en het gevaar zorgen voor spanning.", "Ontsnappen onder tijdsdruk hoort bij spanning."),
  item("spanning-04", "spanning", 2, "Elke nacht verschijnt er een onbekende schaduw voor hetzelfde slaapkamerraam.", "Het wachten en niet weten wie er staat is belangrijk.", "De onbekende dreiging zorgt dat dit spanning is."),
  item("spanning-05", "spanning", 2, "Tijdens een stroomstoring merkt een meisje dat alle buitendeuren op slot zitten.", "De onveilige situatie en onzekerheid staan centraal.", "Opgesloten zijn tijdens een storing creëert spanning."),
  item("spanning-06", "spanning", 2, "Een anoniem bericht voorspelt precies wat er een uur later misgaat.", "De hoofdpersoon vreest wat de volgende voorspelling brengt.", "Dreigende berichten en afwachting maken dit spanning."),
  item("spanning-07", "spanning", 3, "Een jongen vindt aanwijzingen dat iemand hem volgt, maar niemand gelooft hem.", "Er zijn aanwijzingen, maar ontsnappen aan de dreiging is belangrijker dan een zaak oplossen.", "De achtervolging en dreiging maken dit vooral spanning."),
  item("spanning-08", "spanning", 3, "Een klas overnacht in een museum waar plots alle beveiligingsdeuren sluiten.", "De afgesloten plek en onduidelijk gevaar bepalen de sfeer.", "De dreigende opsluiting maakt spanning het hoofdgenre."),
  item("spanning-09", "spanning", 3, "Een oude telefoon gaat alleen over wanneer er direct gevaar in de buurt is.", "Het onverklaarde element waarschuwt steeds voor dreiging.", "De voortdurende verwachting van gevaar zorgt voor spanning."),
  item("spanning-10", "spanning", 3, "Tijdens een bergtocht ontdekt een groep dat iemand hun routebordjes verplaatst.", "Ze moeten veilig blijven terwijl een onbekende hen tegenwerkt.", "De onbekende tegenstander en het gevaar maken dit spanning."),

  // Detective
  item("detective-01", "detective", 1, "Ik zoek een verhaal waarin een speurder aanwijzingen verzamelt en een dader ontmaskert.", "Een raadsel wordt stap voor stap opgelost.", "Speuren, aanwijzingen en een dader horen bij detective."),
  item("detective-02", "detective", 1, "Iemand heeft een medaille gestolen. Ik wil ontdekken wie het heeft gedaan.", "Zoek het genre waarin een misdaad wordt opgelost.", "Een diefstal onderzoeken en de dader vinden past bij detective."),
  item("detective-03", "detective", 1, "Geef me een boek vol verdachten, bewijs en slimme conclusies.", "De oplossing komt door logisch speurwerk.", "Verdachten en bewijs zijn duidelijke kenmerken van detective."),
  item("detective-04", "detective", 2, "Elke ochtend verdwijnt één fiets. Twee vrienden vergelijken bandensporen en getuigen.", "Ze gebruiken bewijs om een reeks diefstallen op te lossen.", "Bandensporen en getuigen onderzoeken hoort bij detective."),
  item("detective-05", "detective", 2, "Een geheime brief bevat cijfers die leiden naar een verdwenen schilderij.", "De code is een aanwijzing naar de oplossing.", "Een code ontcijferen om een verdwijning op te lossen is detective."),
  item("detective-06", "detective", 2, "Na sabotage van de schoolmusical ondervraagt een leerling iedereen die backstage was.", "Verdachten worden ondervraagd om de schuldige te vinden.", "Onderzoek naar sabotage en verdachten past bij detective."),
  item("detective-07", "detective", 3, "Een meisje volgt een gevaarlijke route om te bewijzen wie zeldzame dieren laat verdwijnen.", "De reis is riskant, maar bewijs en schuldige vinden staan centraal.", "Het oplossen van de verdwijningen maakt dit vooral detective."),
  item("detective-08", "detective", 3, "In een oud dagboek staan raadsels die onthullen wie jarenlang over een erfenis loog.", "De raadsels leveren bewijs voor een verborgen waarheid.", "Bewijs verzamelen om een leugenaar te ontmaskeren hoort bij detective."),
  item("detective-09", "detective", 3, "Een computerclub onderzoekt welk lid geheime bestanden heeft gewist en waarom.", "Techniek is aanwezig, maar de dader en het motief zijn de kern.", "Het digitale onderzoek naar dader en motief maakt dit detective."),
  item("detective-10", "detective", 3, "Een grappige buurman verdenkt iedereen, terwijl zijn dochter met echte aanwijzingen de zaak oplost.", "Humor is bijzaak; het speurwerk levert de oplossing.", "Echte aanwijzingen gebruiken om een zaak op te lossen is detective."),

  // Sciencefiction
  item("sciencefiction-01", "sciencefiction", 1, "Ik wil lezen over robots, ruimtevaart en techniek uit de toekomst.", "Denk aan toekomstige uitvindingen en wetenschap.", "Robots en toekomstige ruimtetechniek horen bij sciencefiction."),
  item("sciencefiction-02", "sciencefiction", 1, "Geef me een verhaal over een reis naar een verre planeet.", "De ruimte en toekomstige mogelijkheden staan centraal.", "Reizen naar andere planeten is kenmerkend voor sciencefiction."),
  item("sciencefiction-03", "sciencefiction", 1, "Een slimme computer bestuurt in het jaar 2150 een hele stad.", "Het verhaal onderzoekt toekomstige technologie.", "Een toekomstige stad bestuurd door kunstmatige intelligentie hoort bij sciencefiction."),
  item("sciencefiction-04", "sciencefiction", 2, "Een meisje ontvangt berichten van haar eigen zelf uit de toekomst.", "Tijd en technologie doorbreken wat nu mogelijk is.", "Contact met de toekomst past bij sciencefiction."),
  item("sciencefiction-05", "sciencefiction", 2, "Wetenschappers maken een onderwaterstad waar mensen jarenlang kunnen wonen.", "Een wetenschappelijke uitvinding verandert hoe mensen leven.", "Een technisch mogelijke toekomstwereld is sciencefiction."),
  item("sciencefiction-06", "sciencefiction", 2, "Een huishoudrobot begint onverwacht eigen keuzes te maken en weigert opdrachten.", "De vraag draait om slimme machines en zelfstandigheid.", "Een zelfdenkende robot is een klassiek sciencefictiononderwerp."),
  item("sciencefiction-07", "sciencefiction", 3, "Op Mars zoekt een onderzoeker uit waarom alle communicatiesystemen tegelijk uitvallen.", "Er is een raadsel, maar ruimtekolonie en techniek bepalen de wereld.", "De technologische Marswereld maakt dit vooral sciencefiction."),
  item("sciencefiction-08", "sciencefiction", 3, "Een avontuurlijke bemanning reist door een kunstmatig wormgat naar een onbekend sterrenstelsel.", "De reis is spannend, maar toekomstige ruimtetechniek maakt haar mogelijk.", "Het wormgat en de ruimtevaart maken dit sciencefiction."),
  item("sciencefiction-09", "sciencefiction", 3, "Kinderen krijgen geheugenchips voor school, maar één leerling weigert de update.", "Het verhaal onderzoekt gevolgen van toekomstige technologie.", "Geheugenchips en hun invloed op mensen horen bij sciencefiction."),
  item("sciencefiction-10", "sciencefiction", 3, "Na een klimaatcrisis bouwt een stad zwevende boerderijen met zelflerende machines.", "Toekomstige wetenschap biedt een oplossing voor een echt probleem.", "De toekomstige technische samenleving maakt dit sciencefiction."),

  // Historisch
  item("historisch-01", "historisch", 1, "Ik zoek een verhaal dat zich honderden jaren geleden afspeelt.", "De tijd en leefwijze uit het verleden zijn belangrijk.", "Een verhaal in een duidelijk vroegere tijd is historisch."),
  item("historisch-02", "historisch", 1, "Een kind leeft in de middeleeuwen tussen ridders, markten en stadsmuren.", "De historische periode bepaalt het dagelijks leven.", "Het middeleeuwse leven maakt dit een historisch verhaal."),
  item("historisch-03", "historisch", 1, "Geef me een verhaal over het dagelijks leven tijdens de Tweede Wereldoorlog.", "Het speelt tijdens een echte periode uit het verleden.", "Een verhaal tijdens de Tweede Wereldoorlog is historisch."),
  item("historisch-04", "historisch", 2, "Een jongen werkt tweehonderd jaar geleden op een zeilschip en schrijft naar huis.", "Let vooral op wanneer en hoe hij leeft.", "Het leven op een oud zeilschip maakt dit historisch."),
  item("historisch-05", "historisch", 2, "Een meisje helpt in 1900 stiekem mee in de eerste fietsenwinkel van haar vader.", "Het jaartal en de gebruiken uit die tijd zijn belangrijk.", "Het verhaal laat het leven rond 1900 zien en is daarom historisch."),
  item("historisch-06", "historisch", 2, "Tijdens een strenge winter vervoert een koetsier brieven tussen dorpen zonder elektriciteit.", "De leefomstandigheden horen bij een vroegere tijd.", "Koetsen en leven zonder elektriciteit plaatsen dit in het verleden."),
  item("historisch-07", "historisch", 3, "Een meisje probeert in 1820 naar school te gaan, hoewel dat voor haar niet gebruikelijk is.", "De strijd ontstaat door regels en gewoonten van die periode.", "De historische maatschappelijke regels maken dit een historisch verhaal."),
  item("historisch-08", "historisch", 3, "Een jonge drukker ontdekt een geheim pamflet tijdens een echte opstand uit het verleden.", "Er is een geheim, maar de historische gebeurtenis bepaalt alles.", "De echte opstand en het beroep uit die tijd maken dit historisch."),
  item("historisch-09", "historisch", 3, "Twee kinderen beleven de opening van de eerste spoorlijn en vrezen de nieuwe stoomtrein.", "Een echte ontwikkeling uit het verleden staat centraal.", "De komst van de eerste spoorlijn maakt dit historisch."),
  item("historisch-10", "historisch", 3, "Een leerling-apotheker moet tijdens een oude epidemie medicijnen door de stad brengen.", "Het avontuur speelt binnen historische kennis en omstandigheden.", "De oude medische praktijk en epidemie maken dit vooral historisch."),

  // Informatie
  item("informatie-01", "informatie", 1, "Ik wil echte feiten en duidelijke uitleg over hoe vulkanen ontstaan.", "Je zoekt geen verzonnen verhaal, maar betrouwbare uitleg.", "Feiten en uitleg over een echt onderwerp horen in een informatieboek."),
  item("informatie-02", "informatie", 1, "Geef me een boek waarin ik alles kan leren over walvissen.", "Het doel is kennis opdoen over echte dieren.", "Een boek met feiten over walvissen is een informatieboek."),
  item("informatie-03", "informatie", 1, "Ik zoek stap-voor-stapuitleg voor het bouwen van een vogelhuisje.", "Het boek moet uitleggen hoe je iets uitvoert.", "Praktische stappen en instructies horen bij een informatieboek."),
  item("informatie-04", "informatie", 2, "Ik wil weten waarom de seizoenen bestaan en hoe de aarde om de zon beweegt.", "Je zoekt controleerbare wetenschappelijke uitleg.", "Wetenschappelijke feiten over aarde en seizoenen horen bij informatie."),
  item("informatie-05", "informatie", 2, "Een boek moet uitleggen welke planten in Nederlandse duinen groeien.", "Het gaat om echte soorten en betrouwbare herkenning.", "Feiten over bestaande planten maken dit een informatieboek."),
  item("informatie-06", "informatie", 2, "Ik zoek kaarten, tijdlijnen en feiten over de geschiedenis van treinen.", "Het boek ordent echte kennis met hulpmiddelen.", "Kaarten, tijdlijnen en feiten horen bij een informatieboek."),
  item("informatie-07", "informatie", 3, "Ik wil interviews en schema's die uitleggen hoe een ziekenhuis werkt.", "De mensen zijn echt en het doel is uitleg, niet een verzonnen verhaal.", "Interviews en schema's met feitelijke uitleg maken dit informatie."),
  item("informatie-08", "informatie", 3, "Een astronaut beschrijft echte ruimtemissies en legt uit hoe gewichtloosheid voelt.", "Ruimte betekent niet automatisch sciencefiction; let op echte ervaringen en feiten.", "Echte missies en uitleg over gewichtloosheid horen bij informatie."),
  item("informatie-09", "informatie", 3, "Ik zoek recepten met uitleg over wat warmte met verschillende ingrediënten doet.", "Het combineert instructies met controleerbare kennis.", "Recepten en feitelijke uitleg over koken maken dit een informatieboek."),
  item("informatie-10", "informatie", 3, "Een boek vergelijkt verkiezingen in verschillende landen met tabellen en voorbeelden.", "Het doel is een echt maatschappelijk onderwerp begrijpen.", "Vergelijkingen en feiten over verkiezingen horen bij informatie."),
] as const;
