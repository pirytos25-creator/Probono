# Zapieczętowane archiwum

Scena przeglądarkowa HTML/CSS/JavaScript + Three.js. Interfejs znajduje się w świecie gry: kliknięcie obiektu uruchamia kolejną czynność postaci. Bez ekranu powitalnego, panelu akcji i zewnętrznych usług.

## Uruchomienie

Otwórz `index.html` dwuklikiem w aktualnej przeglądarce. Zachowaj oba pliki MP4 i folder `assets` obok pliku HTML. Nie jest potrzebna instalacja ani serwer.

Opcjonalnie: `node server.cjs`, następnie http://localhost:4187.

## Sterowanie

1. Kliknij wejście w budynku, aby podejść.
2. Kliknij kopertę na ścianie, aby podejść bliżej.
3. Kliknij kopertę ponownie, aby postać po nią sięgnęła.
4. Kliknij trzymaną kopertę, aby ją otworzyć. Możesz też przeciągnąć ją, aby obejrzeć w 3D.
5. Kliknij odsłonięty list, aby postać go wyciągnęła.
6. Kliknij lub przeciągnij wyjęty list, aby obracać go w 3D. Kółko myszy, szczypanie oraz +/− zmieniają przybliżenie.

R prostuje przedmiot. M przełącza dźwięk. Esc otwiera pauzę z instrukcją i opcją ponownego rozpoczęcia. Enter aktywuje dostępne działanie; strzałki obracają obiekt 3D.

Pierwszy film dostarcza ruch podejścia i podniesienia, a drugi film otwieranie koperty i wyciąganie listu. Między czynnościami film zatrzymuje się na aktualnej klatce. Obracanie przedmiotu przełącza widok na rekonstrukcję Three.js na tle miejsca akcji. To interaktywna sekwencja filmowa z oglądaniem obiektów 3D; nie zawiera swobodnego chodzenia ani szkieletowych modeli dłoni.

## Publikacja

GitHub Pages: dodaj projekt do repozytorium, a w Settings → Pages wybierz publikację z gałęzi i katalog `/ (root)`.

Vercel: zaimportuj repozytorium, wybierz preset Other, bez polecenia budowania, katalog wyjściowy `.`.

Wszystkie ścieżki są względne. Nie potrzeba kluczy API ani zmiennych środowiskowych.

## Pliki

- `index.html`, `style.css`, `diegetic.css`: dokument i wygląd.
- `app.js`: model koperty i listu, tekstury papieru, obracanie i zoom.
- `game.js`: miejsca klikania, odcinki filmów, pauza i postęp sceny.
- `assets/three.local.js`, `assets/seal-data.js`: biblioteka i tekstura umożliwiające także uruchomienie przez file://.
- `assets/arrival.jpg`, `assets/environment.jpg`: tło początkowe i tło oglądania obiektu.
- Oba oryginalne pliki MP4 są wymagane w tej wersji.

Tekst listu można zmienić w funkcji `paperTexture()` w `app.js`. Czasy zatrzymania i współrzędne miejsc klikania znajdują się w `game.js`.

Three.js r170: licencja MIT w `assets/THREE-LICENSE.txt`. Oryginalny moduł zachowano w `assets/three.module.js`; polecenie `node tools/build-local.cjs` odtwarza wersję klasyczną i osadzoną teksturę pieczęci. Nie trzeba tego wykonywać, żeby uruchomić gotową grę.

## Testy

Opcjonalnie zainstaluj Playwright: `npm install --no-save playwright`, potem `npx playwright install chromium`. Przy uruchomionym serwerze wykonaj `node tools/test-diegetic.cjs`.

`TEST_URL` pozwala testować również adres `file:///.../index.html`; `TEST_BROWSER_CHANNEL=msedge` wybiera zainstalowanego Edge. Test obejmuje zatrzymywanie filmów, kolejne kliknięcia, obracanie, zoom, pauzę, restart oraz wąski ekran. Zrzuty `assets/test-*` i narzędzia deweloperskie nie są potrzebne do publikacji.
