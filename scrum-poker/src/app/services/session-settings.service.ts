import { Injectable } from "@angular/core";

const LOCAL_STORAGE_CREATE_INPUTS = "create-join-session-inputs";

export type SessionSettings = {
  userName: string | null;
  create: {
    sessionName: string | null;
    lastSessionId: string | null;
  } | null;
  join: {
    role: "guesser" | "observer" | null;
  } | null;
  active: "created" | "joined" | null;
  presentation: {
    chart: "bar" | "radial";
  };
};

@Injectable()
export class SessionSettingsService {
  private _settings: SessionSettings = {
    userName: null,
    create: null,
    join: null,
    active: null,
    presentation: {
      chart: "bar",
    },
  };

  constructor() {
    const prevInputs = localStorage.getItem(LOCAL_STORAGE_CREATE_INPUTS);
    if (prevInputs) {
      try {
        this._settings = { ...this._settings, ...JSON.parse(prevInputs) };
        this._settings.active = null;
      } catch (err) {
        console.warn("Unable to restore previous inputs", err);
      }
    }
  }

  public get settings() {
    return this._settings;
  }

  public remember(settings: Partial<SessionSettings>) {
    this._settings = {
      ...this._settings,
      ...settings,
    };
    localStorage.setItem(LOCAL_STORAGE_CREATE_INPUTS, JSON.stringify(this.settings));
  }
}
