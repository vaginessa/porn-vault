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
    views: "{numItems, plural, one {scene view} other {scene views} }",
    labels: "{numItems, plural, one {label} other {labels} }",
    settings: "Settings",

    foundScenes:
      "{numItems, plural, =0 {No scenes found} one {Found 1 scene} other {Found {numItems} scenes} }",
    foundActors:
      "{numItems, plural, =0 {No actors found} one {Found 1 actor} other {{numItems} actors found} }",
    foundMovies:
      "{numItems, plural, =0 {No movies found} one {Found 1 movie} other {{numItems} movies found} }",
    foundImages:
      "{numItems, plural, =0 {No images found} one {Found 1 image} other {{numItems} images found} }",

    title: "Title",
    path: "Path",
    with: "With",
    fileSize: "File size",
    videoDimensions: "Dimensions",
    duration: "Duration",
    videoDuration: "Duration",
    fps: "Frames per second",
    bitrate: "Bitrate",

    rating: "Rating",
    avgRating: "Average rating",
    pvScore: "PV score",
    yearsOld: "{age} years old",
    aliases: "aliases",
    description: "Description",
    collabs: "Scene collaborations with...",

    releaseDate: "Release date",
    starring: "Starring",
    movieFeatures: "Featured in movies",

    findContent: "Find content",

    general: "General",

    favorite: "Favorite",
    bookmark: "Bookmark",
    bookmarked: "Bookmarked",
    yourFavorites: "Your favorites",
    showMore: "Show more",

    relevance: "Relevance",
    addedToCollection: "Added to collection",

    asc: "Ascending",
    desc: "Descending",

    refresh: "Refresh",

    birthDate: "Birth date",
    numScenes: "# scenes",
    numViews: "# views",
  },
  de: {
    language: "Sprache",
    currentLanguage: "Deutsch",

    stats: "Statistiken",
    overview: "Übersicht",
    libraryTime: "Gesehene Videos",
    videoProcessingQueue: "Videoverarbeitung",

    viewsInDays:
      "{numViews, plural, one {gesehene Szene} other {{numViews} gesehene Szenen} } in {numDays, plural, one {Tag} other {{numDays} Tagen} }",
    percentWatched: "{percent} aller Szenen gesehen",
    contentLeft: "~{years} Jahre an Inhalt übrig",
    runningOut: "Alle Szenen gesehen am {date}",

    video: "{numItems, plural, one {Video} other {{numItems} Videos} }",
    scene: "{numItems, plural, one {Szene} other {Szenen} }",
    actor: "Darsteller",
    movie: "{numItems, plural, one {Film} other {Filme} }",
    studio: "{numItems, plural, one {Studio} other {Studios} }",
    image: "{numItems, plural, one {Bild} other {Bilder} }",
    marker: "Kapitel",
    views: "{numItems, plural, one {gesehene Szene} other {gesehene Szenen} }",
    labels: "{numItems, plural, one {Label} other {Labels} }",
    settings: "Einstellungen",

    foundScenes:
      "{numItems, plural, =0 {Keine Szenen gefunden} one {1 Szene gefunden} other {{numItems} Szenen gefunden} }",
    foundActors:
      "{numItems, plural, =0 {Keine Darsteller gefunden} one {1 Darsteller gefunden} other {{numItems} Darsteller gefunden} }",
    foundMovies:
      "{numItems, plural, =0 {Keine Filme gefunden} one {1 Film gefunden} other {{numItems} Filme gefunden} }",
    foundImages:
      "{numItems, plural, =0 {Keine Bilder gefunden} one {1 Bild gefunden} other {{numItems} Bilder gefunden} }",

    title: "Titel",
    path: "Dateipfad",
    with: "Mit",
    fileSize: "Dateigröße",
    videoDimensions: "Videogröße",
    duration: "Dauer",
    videoDuration: "Videolänge",
    fps: "Bilder pro Sekunde",
    bitrate: "Bitrate",

    rating: "Bewertung",
    avgRating: "Durchschnittswertung",
    pvScore: "PV Wertung",
    yearsOld: "{age} Jahre alt",
    aliases: "Alt. Namen",
    description: "Beschreibung",
    collabs: "TODO:...",

    releaseDate: "Veröffentlicht",
    starring: "Darsteller",
    movieFeatures: "Filme",

    findContent: "Suchen",

    general: "Allgemein",

    favorite: "Favorit",
    bookmark: "Merkliste",
    bookmarked: "Gemerkt",
    yourFavorites: "Deine Favoriten",
    showMore: "Mehr anzeigen",

    relevance: "Relevanz",
    addedToCollection: "Erstellungsdatum",

    asc: "Aufsteigend",
    desc: "Absteigend",

    refresh: "Aktualisieren",

    birthDate: "Geburtsdatum",
    numScenes: "Szenenanzahl",
    numViews: "Anzahl gesehener Szenen",
  },
};
export default messages;
