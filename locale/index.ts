const messages: Record<string, any> = {
  en: {
    language: "Language",
    currentLanguage: "English",

    stats: "Stats",

    scene: "{numItems, plural, one {Scene}  other {Scenes}  }",
    actor: "{numItems, plural, one {Actor}  other {Actors}  }",
    movie: "{numItems, plural, one {Movie}  other {Movies}  }",
    studio: "{numItems, plural, one {Studio}  other {Studios}  }",
    image: "{numItems, plural, one {Image}  other {Images}  }",
    marker: "{numItems, plural, one {Marker}  other {Markers}  }",

    foundScenes:
      "{numItems, plural, =0 {No scenes found} one {Found 1 scene} other {Found {numItems} scenes}}",
    foundActors:
      "{numItems, plural, =0 {No actors found} one {Found 1 actor} other {{numItems} actors found}}",
    foundMovies:
      "{numItems, plural, =0 {No movies found} one {Found 1 movie} other {{numItems} movies found}}",

    with: "With",
    fileSize: "File size",
    videoDimensions: "Dimensions",

    findContent: "Find content",

    your_favorites: "Your favorites",
  },
  de: {
    language: "Sprache",
    currentLanguage: "Deutsch",

    stats: "Statistiken",

    scene: "{numItems, plural, one {Szene}  other {Szenen}  }",
    actor: "Darsteller",
    movie: "{numItems, plural, one {Film}  other {Filme}  }",
    studio: "{numItems, plural, one {Studio}  other {Studios}  }",
    image: "{numItems, plural, one {Bild}  other {Bilder}  }",
    marker: "Kapitel",

    foundScenes:
      "{numItems, plural, =0 {Keine Szenen gefunden} one {1 Szene gefunden} other {{numItems} Szenen gefunden}}",
    foundActors:
      "{numItems, plural, =0 {Keine Darsteller gefunden} one {1 Darsteller gefunden} other {{numItems} Darsteller gefunden}}",
    foundMovies:
      "{numItems, plural, =0 {Keine Filme gefunden} one {1 Film gefunden} other {{numItems} Filme gefunden}}",

    with: "Mit",
    fileSize: "Dateigröße",
    videoDimensions: "Videogröße",

    findContent: "Suchen",

    your_favorites: "Deine Favoriten",
  },
};
export default messages;
