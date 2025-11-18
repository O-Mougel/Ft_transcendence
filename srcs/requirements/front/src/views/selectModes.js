import ViewTemplate from "./ViewTemplate.js";	

export default class extends ViewTemplate {
	constructor()
	{
		super();
		this.setTitle("Select Modes");
	}

	async getHTML() {
		return `
			<div class="h-screen w-full flex">
				<div class="flex-1 rounded-xl box-border border-10 bg-[url(/img/vs1.jpg)] bg-cover grayscale-85 hover:grayscale-0 blur-[5px] hover:blur-[0px] transition duration-400 ease-in-out   flex items-center justify-center ">
					<!-- <div class="w-1/3 h-1/4 bg-[#4d408f] flex items-center justify-center border border-black">Versus AI</div>  -->
				</div>
				<div class="flex-1 rounded-xl box-border border-10 bg-[url(/img/vsPlayer.png)] bg-cover grayscale-85 hover:grayscale-0 blur-[5px] hover:blur-[0px] transition duration-400 ease-in-out  flex items-center justify-center">
		
				</div>
			</div>
			<a href="/" data-link>Back to login!</a>
			<script type="module" src="/js/index.js"></script>`
	}
}