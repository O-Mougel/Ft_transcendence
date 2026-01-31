import type { IViewTemplate } from '../types/view.types';

export default abstract class ViewTemplate implements IViewTemplate {
	constructor() {
		// Base constructor
	}

	setTitle(title: string): void {
		document.title = title;
	}

	abstract getHTML(): Promise<string>;

	async init?(): Promise<void>;
}
