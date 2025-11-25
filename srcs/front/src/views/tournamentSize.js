import ViewTemplate from "./ViewTemplate.js";	

export default class extends ViewTemplate {
	constructor()
	{
		super();
		this.setTitle("Select Tournament Size");
	}

	async getHTML() {
		return `
		<div id="profilePanel" class="flex absolute right-0 top-0 h-full w-[15%] bg-[url(/img/stars.gif)] z-50 shadow-md border border-[#98c6f8]">
					<div class="flex flex-col text-center w-full">
						<div class="grid h-[30%] place-items-center">
  							<div class="bg-[url(/img/sillyDog.gif)] bg-cover w-[50%] h-[50%] p-4 rounded-[50%] shadow"></div>
						</div>
						<h1 class="text-white text-bold h-1/5 text-4xl">Goofy ahh player</h1>
						<p class="text-white">Plaisantin</p>
						<p class="text-white">Wow what a great person</p>
						<button class="text-white">Click for stats !</button>
					</div>
			</div>
		<div class="h-full w-screen flex flex-col">
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