import ViewTemplate from "./ViewTemplate.js";	

export default class extends ViewTemplate {
	constructor()
	{
		super();
		this.setTitle("Welcome !");
	}

	async getHTML() {
		return `
			
			<div class="absolute inset-[3%] rounded-xl outline-none border border-blue-300 bg-[url(/img/stars.gif)] bg-cover bg-center flex flex-col shadow-[0_0_20px_rgba(158,202,237,0.9)]">
				<p>2FA under construction...</p>
			</div>`
	}
}