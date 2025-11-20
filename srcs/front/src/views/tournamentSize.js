import ViewTemplate from "./ViewTemplate.js";	

export default class extends ViewTemplate {
	constructor()
	{
		super();
		this.setTitle("Select Tournament Size");
	}

	async getHTML() {
		return `

		<div class="h-screen w-screen flex flex-col">
			<div class="h-[93%] w-full grow basis-full bg-[url(/img/starField.gif)] bg-cover bg-center backdrop-blur-[10px] pt-35 text-center ml-auto mr-auto">
				<h1 class="text-white sm:text-2xl xl:text-3xl">Select the number of players in the tournament</h1>
				<div class="flex w-2/5 gap-5 justify-center mt-8 mx-auto flex-col sm:flex-row sm:w-4/5 sm:text-2xl xl:text-3xl">
					<div class="flex-1 min-w-0 flex items-center justify-center aspect-square px-4 py-2  text-white hover:text-[#98c6f8] rounded-[10%] font-bold border-5 ">4</div>
					<div class="flex-1 min-w-0 flex items-center justify-center aspect-square px-4 py-2  text-white hover:text-[#98c6f8] rounded-[10%] font-bold border-5 ">8</div>
					<div class="flex-1 min-w-0 flex items-center justify-center aspect-square px-4 py-2  text-white hover:text-[#98c6f8] rounded-[10%] font-bold border-5 ">16</div>
				</div>
			</div>
		</div>`
	}
}