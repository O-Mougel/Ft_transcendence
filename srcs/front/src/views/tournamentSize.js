import ViewTemplate from "./ViewTemplate.js";	

export default class extends ViewTemplate {
	constructor()
	{
		super();
		this.setTitle("Select Tournament Size");
	}

	async getHTML() {
		return `
		<div id="profilePanel" class="flex absolute right-0 top-0 h-full w-[20%] bg-[url(/img/stars.gif)] z-50 shadow-[0_0_20px_rgba(158,202,237,0.9)] border border-[#98c6f8]">
					<div class="flex flex-col text-center w-full h-full">
						<div class="grid h-[30%] place-items-center">
  							<div class="bg-[url(/img/sillyDog.gif)] bg-cover w-[50%] h-[50%] p-4 rounded-[50%] shadow"></div>
						</div>
						<h1 class="text-white text-bold mx-4 mb-15 text-2xl ">[player username]</h1>
						<a href="/profileOverview" class="mx-4 text-2xl mb-15 border p-4 text-[#798490]" name="profileLink" data-link>Update profile</a>
						<div class="self-start">
							<input class="sr-only peer" id="friendCheck" type="checkbox"/>
							<label for="friendCheck" class="text-2xl cursor-pointer px-3 py-2 select-none">► Online friends</label>
							<ul class="select-none peer-checked:block hidden mt-3 self-start text-left" id="friendlist">
							<li><a class="text-xl pl-2">• Goug ?</a></li>
							<li><a class="text-xl pl-2">• Gougou ?</a></li>
							<li><a class="text-xl pl-2">• Gougougaga ?</a></li>
							</ul>
						</div>
					</div>
			</div>
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