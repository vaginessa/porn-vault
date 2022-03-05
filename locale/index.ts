const messages: Record<string, any> = {
  en: {
    language: "Language",
    currentLanguage: "English",

    stats: "Stats",
    overview: "Overview",

    scene: "{numItems, plural, one {scene} other {scenes}  }",
    actor: "{numItems, plural, one {actor} other {actors}  }",
    movie: "{numItems, plural, one {movie} other {movies}  }",
    studio: "{numItems, plural, one {studio} other {studios}  }",
    image: "{numItems, plural, one {image} other {images}  }",
    marker: "{numItems, plural, one {marker} other {markers}  }",

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
    overview: "Übersicht",

    scene: "{numItems, plural, one {Szene} other {Szenen}  }",
    actor: "Darsteller",
    movie: "{numItems, plural, one {Film} other {Filme}  }",
    studio: "{numItems, plural, one {Studio} other {Studios}  }",
    image: "{numItems, plural, one {Bild} other {Bilder}  }",
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
