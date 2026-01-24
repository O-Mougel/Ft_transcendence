import ViewTemplate from "./ViewTemplate.js";

export default class GougoumView extends ViewTemplate {
	constructor() {
		super();
		this.setTitle("Pafghfhfghfggfhfghfhfgfghfghd !");
	}

	async getHTML(): Promise<string> {
		return `
			<div class="pt-[5vw] h-full w-full">
				<h1 class="text-[5vw] sm:text-[5vw] 2xl:text-[4vw] my-6">Error : 404</h1>
			</div>`;
	}
}
