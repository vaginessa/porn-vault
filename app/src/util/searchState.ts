import Vue from "vue";
import { Dictionary } from "vue-router/types/router";

export interface PropConfig<F extends { [prop: string]: unknown } = {}> {
  localStorageKey?: string;
  default?: () => unknown;
  serialize?: (value: any) => string;
  deserialize?: (str: string, state: Partial<F>) => unknown;
}

const hasConfig = (config: unknown): config is PropConfig =>
  typeof config === "object" && !!config && !Array.isArray(config);

export interface StateOptions<F extends { [prop: string]: unknown } = {}> {
  localStorageNamer?: (key: string) => string;
  props: { [key: string]: boolean | PropConfig<F> };
}

export class SearchState<F extends { [prop: string]: unknown } = {}> {
  private _state: F = Vue.observable({ refreshed: false }) as any;
  private _config: StateOptions<F> = {
    props: {},
  };

  public refreshed = Vue.observable(true);

  public constructor(config: StateOptions<F>) {
    this._config = config;
  }

  private getLocalStorageName = (key: string): string => {
    const propConfig = this._config.props[key];
    const name =
      typeof propConfig !== "boolean" && propConfig.localStorageKey
        ? propConfig.localStorageKey
        : key;

    if (typeof this._config.localStorageNamer === "function") {
      return this._config.localStorageNamer(name);
    }
    return name;
  };

  public init(query: Dictionary<string>): void {
    Object.entries(this._config.props).forEach(([key, propConfig]) => {
      let initialValue: unknown = null;

      if (propConfig || (hasConfig(propConfig) && propConfig.localStorageKey)) {
        const strValue = localStorage.getItem(this.getLocalStorageName(key));
        if (strValue !== null) {
          try {
            initialValue = this.deserialize(key, strValue);
          } catch (err) {
            // ignore json error
          }
        }
      }

      initialValue =
        initialValue ??
        this.deserialize(key, query[key]) ??
        (typeof propConfig !== "boolean" ? propConfig.default?.() : null) ??
        null;

      Vue.set(this._state, key, initialValue);
    });
  }

  private serialize(key: string, deserializedValue: unknown): string {
    let serializedValue: string;

    const propConfig = this._config.props[key];

    if (typeof propConfig !== "boolean" && propConfig?.serialize) {
      serializedValue = propConfig.serialize(deserializedValue);
    } else {
      serializedValue = JSON.stringify(deserializedValue);
    }

    return serializedValue;
  }

  private deserialize(key: string, serializedValue: string): unknown {
    let deserializedValue: unknown | null = null;

    const propConfig = this._config.props[key];

    if (typeof propConfig !== "boolean" && propConfig?.deserialize) {
      deserializedValue = propConfig.deserialize(serializedValue, this._state);
    } else {
      try {
        deserializedValue = JSON.parse(serializedValue);
      } catch (err) {
        // ignore
      }
    }
    return deserializedValue;
  }

  public toQuery(): Record<string, string> {
    const query: Record<string, string> = {};
    Object.entries(this._state).forEach(([key, value]) => {
      const serializedValue = this.serialize(key, value);
      query[key] = serializedValue;
    });

    return query;
  }

  public parseFromQuery(query: Dictionary<string>): void {
    Object.entries(query).forEach(([key, value]) => {
      const deserializedValue = this.deserialize(key, value);
      Vue.set(this._state, key, deserializedValue);
      localStorage.setItem(key, value);
    });
  }

  public onValueChanged(key: string, value: unknown): void {
    this.refreshed = false;

    Vue.set(this._state, key, value);

    const strValue = this.serialize(key, value);
    localStorage.setItem(this.getLocalStorageName(key), strValue);
  }

  public get state() {
    return this._state;
  }
}
