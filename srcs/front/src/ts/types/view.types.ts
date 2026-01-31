export interface IViewTemplate {
  setTitle(title: string): void;
  getHTML(): Promise<string>;
  init?(): Promise<void>;
}

export interface Route {
  path: string;
  view: new () => IViewTemplate;
}

export interface RouteMatch {
  mapElement: Route;
  isMatch: boolean;
}
