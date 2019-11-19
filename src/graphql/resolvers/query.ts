import Actor from "../../types/actor";
import Label from "../../types/label";
import Scene from "../../types/scene";
import Image from "../../types/image";
import Movie from "../../types/movie";
import extractQueryOptions, { SortTarget } from "../../query_extractor";
import Fuse from "fuse.js";
import * as logger from "../../logger/index";
import { Dictionary } from "../../types/utility";

const PAGE_SIZE = 20;

export default {
  getScenes(_, { query }: { query: string | undefined }) {
    const timeNow = +new Date();
    logger.log("Searching...");

    const options = extractQueryOptions(query);

    let searchDocs = Scene.getAll().map(scene => ({
      id: scene.id,
      name: scene.name,
      releaseDate: scene.releaseDate,
      favorite: scene.favorite,
      bookmark: scene.bookmark,
      rating: scene.rating,
      labels: (<Label[]>(
        scene.labels.map(id => Label.getById(id)).filter(Boolean)
      )).map(l => ({ id: l.id, name: l.name, aliases: l.aliases })),
      actors: (<Actor[]>(
        scene.actors.map(id => Actor.getById(id)).filter(Boolean)
      )).map(l => ({ id: l.id, name: l.name, aliases: l.aliases })),
      addedOn: scene.addedOn
    }));

    if (options.favorite === true)
      searchDocs = searchDocs.filter(scene => scene.favorite);

    if (options.bookmark === true)
      searchDocs = searchDocs.filter(scene => scene.bookmark);

    if (options.rating > 0)
      searchDocs = searchDocs.filter(scene => scene.rating >= options.rating);

    if (options.include.length) {
      searchDocs = searchDocs.filter(scene =>
        options.include.every(id => scene.labels.map(l => l.id).includes(id))
      );
    }

    if (options.exclude.length) {
      searchDocs = searchDocs.filter(scene =>
        options.exclude.every(id => !scene.labels.map(l => l.id).includes(id))
      );
    }

    if (options.actors.length) {
      searchDocs = searchDocs.filter(scene =>
        options.actors.every(id => scene.actors.map(a => a.id).includes(id))
      );
    }

    if (options.query) {
      const searcher = new Fuse(searchDocs, {
        shouldSort: options.sortBy == SortTarget.RELEVANCE,
        tokenize: true,
        threshold: 0,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: [
          "name",
          "labels.name",
          "labels.aliases",
          "actors.name",
          "actors.labels",
          "actors.aliases"
        ]
      });

      searchDocs = searcher.search(options.query);
    }

    switch (options.sortBy) {
      case SortTarget.ADDED_ON:
        if (options.sortDir == "asc")
          searchDocs.sort((a, b) => a.addedOn - b.addedOn);
        else searchDocs.sort((a, b) => b.addedOn - a.addedOn);
        break;
      case SortTarget.RATING:
        if (options.sortDir == "asc")
          searchDocs.sort((a, b) => a.rating - b.rating);
        else searchDocs.sort((a, b) => b.rating - a.rating);
        break;
      case SortTarget.DATE:
        if (options.sortDir == "asc")
          searchDocs.sort(
            (a, b) => (a.releaseDate || 0) - (b.releaseDate || 0)
          );
        else
          searchDocs.sort(
            (a, b) => (b.releaseDate || 0) - (a.releaseDate || 0)
          );
        break;
    }

    const slice = searchDocs
      .slice(options.page * PAGE_SIZE, options.page * PAGE_SIZE + PAGE_SIZE)
      .map(image => Scene.getById(image.id));

    logger.log(`Search done in ${(Date.now() - timeNow) / 1000}s.`);

    return slice;
  },

  getImages(_, { query }: { query: string | undefined }) {
    const timeNow = +new Date();
    logger.log("Searching...");

    const options = extractQueryOptions(query);

    let searchDocs = Image.getAll().map(image => ({
      id: image.id,
      name: image.name,
      favorite: image.favorite,
      bookmark: image.bookmark,
      rating: image.rating,
      labels: (<Label[]>(
        image.labels.map(id => Label.getById(id)).filter(Boolean)
      )).map(l => ({ id: l.id, name: l.name, aliases: l.aliases })),
      actors: (<Actor[]>(
        image.actors.map(id => Actor.getById(id)).filter(Boolean)
      )).map(l => ({ id: l.id, name: l.name, aliases: l.aliases })),
      addedOn: image.addedOn
    }));

    if (options.favorite === true)
      searchDocs = searchDocs.filter(image => image.favorite);

    if (options.bookmark === true)
      searchDocs = searchDocs.filter(image => image.bookmark);

    if (options.rating > 0)
      searchDocs = searchDocs.filter(image => image.rating >= options.rating);

    if (options.include.length) {
      searchDocs = searchDocs.filter(image =>
        options.include.every(id => image.labels.map(l => l.id).includes(id))
      );
    }

    if (options.exclude.length) {
      searchDocs = searchDocs.filter(image =>
        options.exclude.every(id => !image.labels.map(l => l.id).includes(id))
      );
    }

    if (options.actors.length) {
      searchDocs = searchDocs.filter(image =>
        options.actors.every(id => image.actors.map(a => a.id).includes(id))
      );
    }

    if (options.query) {
      const searcher = new Fuse(searchDocs, {
        shouldSort: options.sortBy == SortTarget.RELEVANCE,
        tokenize: true,
        threshold: 0,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: [
          "name",
          "labels.name",
          "labels.aliases",
          "actors.name",
          "actors.labels",
          "actors.aliases"
        ]
      });

      searchDocs = searcher.search(options.query);
    }

    switch (options.sortBy) {
      case SortTarget.ADDED_ON:
        if (options.sortDir == "asc")
          searchDocs.sort((a, b) => a.addedOn - b.addedOn);
        else searchDocs.sort((a, b) => b.addedOn - a.addedOn);
        break;
      case SortTarget.RATING:
        if (options.sortDir == "asc")
          searchDocs.sort((a, b) => a.rating - b.rating);
        else searchDocs.sort((a, b) => b.rating - a.rating);
        break;
    }

    const slice = searchDocs
      .slice(options.page * PAGE_SIZE, options.page * PAGE_SIZE + PAGE_SIZE)
      .map(image => Image.getById(image.id));

    logger.log(`Search done in ${(Date.now() - timeNow) / 1000}s.`);

    return slice;
  },

  getSceneById(_, args: Dictionary<any>) {
    return Scene.getById(args.id);
  },

  getActorById(_, args: Dictionary<any>) {
    return Actor.getById(args.id);
  },
  getActors() {
    return Actor.getAll();
  },
  findActors(_, args: Dictionary<any>) {
    return Actor.find(args.name);
  },

  getLabelById(_, args: Dictionary<any>) {
    return Label.getById(args.id);
  },
  getLabels() {
    return Label.getAll().sort((a, b) => a.name.localeCompare(b.name));
  },
  findLabel(_, args: Dictionary<any>) {
    return Label.find(args.name);
  },

  getMovies() {
    return Movie.getAll();
  }
};
