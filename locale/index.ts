const messages: Record<string, any> = {
  en: {
    language: "Language",
    currentLanguage: "English",

    stats: "Stats",
    overview: "Overview",
    libraryTime: "Remaining library time",
    videoProcessingQueue: "Video processing queue",

    viewsInDays:
      "{numViews, plural, one {scene view} other {{numViews} scene views} } in {numDays, plural, one {day} other {{numDays} days} }",
    percentWatched: "{percent} of scenes watched",
    contentLeft: "~{years} years of content left",
    runningOut: "Running out on {date}",

    video: "{numItems, plural, one {video} other {{numItems} videos} }",
    scene: "{numItems, plural, one {scene} other {scenes} }",
    actor: "{numItems, plural, one {actor} other {actors} }",
    movie: "{numItems, plural, one {movie} other {movies} }",
    studio: "{numItems, plural, one {studio} other {studios} }",
    image: "{numItems, plural, one {image} other {images} }",
    marker: "{numItems, plural, one {marker} other {markers} }",

    foundScenes:
      "{numItems, plural, =0 {No scenes found} one {Found 1 scene} other {Found {numItems} scenes} }",
    foundActors:
      "{numItems, plural, =0 {No actors found} one {Found 1 actor} other {{numItems} actors found} }",
    foundMovies:
      "{numItems, plural, =0 {No movies found} one {Found 1 movie} other {{numItems} movies found} }",

    with: "With",
    fileSize: "File size",
    videoDimensions: "Dimensions",

    findContent: "Find content",

    yourFavorites: "Your favorites",
  },
  de: {
    language: "Sprache",
    currentLanguage: "Deutsch",

    stats: "Statistiken",
    overview: "Übersicht",
    libraryTime: "TODO: ...",
    videoProcessingQueue: "TODO: ...",

    viewsInDays:
      "{numViews, plural, one {gesehene Szene} other {{numViews} gesehene Szenen} } in {numDays, plural, one {Tag} other {{numDays} Tagen} }",
    percentWatched: "{percent} aller Szenen gesehen",
    contentLeft: "~{years} TODO: ...",
    runningOut: "TODO: ... {date}",

    video: "{numItems, plural, one {Video} other {{numItems} Videos} }",
    scene: "{numItems, plural, one {Szene} other {Szenen} }",
    actor: "Darsteller",
    movie: "{numItems, plural, one {Film} other {Filme} }",
    studio: "{numItems, plural, one {Studio} other {Studios} }",
    image: "{numItems, plural, one {Bild} other {Bilder} }",
    marker: "Kapitel",

    foundScenes:
      "{numItems, plural, =0 {Keine Szenen gefunden} one {1 Szene gefunden} other {{numItems} Szenen gefunden} }",
    foundActors:
      "{numItems, plural, =0 {Keine Darsteller gefunden} one {1 Darsteller gefunden} other {{numItems} Darsteller gefunden} }",
    foundMovies:
      "{numItems, plural, =0 {Keine Filme gefunden} one {1 Film gefunden} other {{numItems} Filme gefunden} }",

    with: "Mit",
    fileSize: "Dateigröße",
    videoDimensions: "Videogröße",

    findContent: "Suchen",

    yourFavorites: "Deine Favoriten",
  },
};
export default messages;
