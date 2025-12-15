import ViewTemplate from "./ViewTemplate.js";	

export default class extends ViewTemplate {
	constructor()
	{
		super();
		this.setTitle("Welcome !");
	}

	async getHTML() {
		return `
			<div class="pt-[5vw]">
				<h1 class="text-[4vw] 2xl:text-6xl">FT_Transcendence</h1>
				<img src="/img/moyai.gif">
			</div>`
			
	}
}