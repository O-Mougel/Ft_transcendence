import ViewTemplate from "./ViewTemplate.js";	

export default class extends ViewTemplate {
	constructor()
	{
		super();
		this.setTitle("Select Tournament Size");
	}

	async getHTML() {
		return `

		<div class="h-full w-full flex flex-col">
			<div class="h-[93%] w-full pt-[5%] text-center ml-auto mr-auto">
				<h1 class="">Select the number of players in the tournament</h1>
				<div class=" text-[5vw] flex gap-5 px-[5%] justify-around mt-8 mx-auto flex-col sm:flex-row">
					<div class="flex-1 flex items-center justify-center aspect-square px-4 py-2 hover:text-[#98c6f8] rounded-[10%] font-bold border-[1vw]">4</div>
					<div class="flex-1 flex items-center justify-center aspect-square px-4 py-2 hover:text-[#98c6f8] rounded-[10%] font-bold border-[1vw]">8</div>
					<div class="flex-1 flex items-center justify-center aspect-square px-4 py-2 hover:text-[#98c6f8] rounded-[10%] font-bold border-[1vw]">16</div>
				</div>
			</div>
		</div>`
	}
}