// View-related type definitions

// Abstract view template interface
export interface IViewTemplate {
  setTitle(title: string): void;
  getHTML(): Promise<string>;
  init?(): Promise<void>;
}

// Route definition
export interface Route {
  path: string;
  view: new () => IViewTemplate;
}

// Route match result
export interface RouteMatch {
  mapElement: Route;
  isMatch: boolean;
}
