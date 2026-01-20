import ViewTemplate from "./ViewTemplate.js";	

export default class extends ViewTemplate {
	constructor()
	{
		super();
		this.setTitle("Page not found !");
	}

	async getHTML() {
		return `
			<div class="pt-[5vw] h-full w-full">
				<h1 class="text-[5vw] sm:text-[5vw] 2xl:text-[4vw] my-6">Error : 404</h1>
				<h3 class="text-[2vw] sm:text-[2vw] 2xl:text-[2vw] my-6">The page you requested got blackholed ...</h1>
				<div class=" w-full my-15 content-center m-auto">
					<img src="/img/assets/bh.gif" class="block max-w-5xl m-auto mb-15 select-none" draggable="false" />
					<a id="backToMenuButton" href="/" class="inline uppercase text-sm md:text-base xl:text-2xl focus:outline-none focus:border-[#98c6f8] hover:text-[#98c6f8] text-ellipsis w-1/2 md:w-1/4 border hover:border-[#98c6f8] border-white py-2 px-4 rounded-lg shadow-[0_0_20px_rgba(158,202,237,0.9)]" name="backtomenuButton" data-link> 🚀 Back to menu </a>
				</div>
			</div>`
	}
}