const CONTENT = {
  title: "Akta sprawy 1904",
  subtitle: "Innowacyjne gry miejskie · Hub Kulturalny 2027",
  videos: {
    intro: "https://pirytos25-creator.github.io/Probono/generated_video%20(1).mp4",
    letter: "https://pirytos25-creator.github.io/Probono/generated_video%20(2).mp4",
    hub: "https://pirytos25-creator.github.io/GraMiejskaDemo/assets/video/generated_video%20(1).mp4"
  },
  locations: [
    {
      id: "hub",
      name: "Kulturalny Hub",
      place: "Bydgoska 50 · Dom Konrada Schwartza",
      pin: { x: 38, y: 42 },
      tag: "Wyprawa I · postacie",
      hasVideo: true,
      imageHint: "fachwerk, noc, latarnie",
      blurb: "Opis wyprawy pojawi się tutaj. Na razie: Hub jako punkt startu — tu spotykają się prowadzący i uczestnicy, tu odtwarzany jest film z postaciami."
    },
    {
      id: "park",
      name: "Park na Bydgoskim",
      place: "Przy Hubie Kulturalnym",
      pin: { x: 28, y: 36 },
      tag: "Wyprawa II · natura",
      hasVideo: false,
      imageHint: "park nocą, rośliny",
      blurb: "Opis wyprawy pojawi się tutaj. Klimat roślinny: w parku przy Hubie zaczynają pojawiać się gatunki, których nie było w miejskim inwentarzu."
    },
    {
      id: "dybow",
      name: "Zamek Dybowski",
      place: "Lewobrzeże · za Wisłą",
      pin: { x: 62, y: 72 },
      tag: "Wyprawa III · ruina",
      hasVideo: false,
      imageHint: "ruiny zamku, postapo",
      blurb: "Opis wyprawy pojawi się tutaj. Ruiny po drugiej stronie rzeki. Wersja robocza: klimat postapokaliptyczny na prawdziwej bryle zamku."
    }
  ],
  project: {
    heading: "O projekcie",
    lead: "Trzy trasy terenowe wokół Hubu Kulturalnego i Zamku Dybowskiego. Demo dla dyrektora — teksty i zdjęcia podmienimy przed pokazem.",
    benefits: [
      "Wsparcie techniczne w pierwszych dniach uruchomienia gry",
      "Bieżące statystyki uczestnictwa",
      "Raport pod koniec działalności",
      "Konkurs dla mieszkańców"
    ]
  },
  achievements: [
    { id: "akta", name: "Pierwszy trop", hint: "Otwórz akta po filmie z wieżą" },
    { id: "hub", name: "Spotkanie w Hubie", hint: "Odwiedź Kulturalny Hub" },
    { id: "park", name: "Zielony trop", hint: "Odwiedź Park na Bydgoskim" },
    { id: "dybow", name: "Za rzeką", hint: "Odwiedź Zamek Dybowski" },
    { id: "trzy", name: "Trzy wyprawy", hint: "Otwórz wszystkie trzy lokacje" },
    { id: "team", name: "Teamplay", hint: "Ukończone wspólnie ze znajomymi (makieta)" }
  ]
};
