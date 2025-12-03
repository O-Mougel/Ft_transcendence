import ViewTemplate from "./ViewTemplate.js";	

export default class extends ViewTemplate {
	constructor()
	{
		super();
		this.setTitle("Welcome !");
	}

	async getHTML() {
		return `
			<div class="text-center opacity-0 h-full hover:opacity-100 transition duration-4000 ease-in-out ml-auto mr-auto pt-[5%]">
				<h1 class="text-base  sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl">FT-Transcendence</h1>
				<p>Start</p>
			</div>`
	}
}