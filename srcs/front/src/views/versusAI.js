import ViewTemplate from "./ViewTemplate.js";	

export default class extends ViewTemplate {
	constructor()
	{
		super();
		this.setTitle("BEEP BOOP");
	}

	async getHTML() {
		return `
		<div id="profilePanel" class="flex absolute right-0 top-0 h-full w-[20%] bg-[url(/img/stars.gif)] z-50 shadow-[0_0_20px_rgba(158,202,237,0.9)] border border-[#98c6f8]">
					<div class="flex flex-col text-center w-full h-full">
						<div class="grid h-[30%] place-items-center">
  							<div class="bg-[url(/img/sillyDog.gif)] bg-cover w-[50%] h-[50%] p-4 rounded-[50%] shadow"></div>
						</div>
						<h1 class="text-white text-bold mx-4 mb-15 text-2xl ">[player username]</h1>
						<a href="/profileOverview" class="mx-4 text-2xl mb-5 border p-4 text-[#798490]" name="profileLink" data-link>Update profile</a>
						<a id="logoutButton" class="mx-4 text-2xl mb-15 border p-4 cursor-pointer hover:text-[#dee9f4] hover:bg-[#882639] text-[#882639]" onclick=logoutUser() name="logoutButtonName">➜] Log out</a>						<div class="self-start">
							<input class="sr-only peer" id="friendCheck" type="checkbox"/>
							<label for="friendCheck" class="text-2xl cursor-pointer px-3 py-2 select-none hover:text-[#98c6f8]">► Online friends</label>
							<ul class="select-none peer-checked:block hidden mt-3 self-start text-left" id="friendlist">
							<li><a class="text-xl pl-2">• Goug ?</a></li>
							<li><a class="text-xl pl-2">• Gougou ?</a></li>
							<li><a class="text-xl pl-2">• Gougougaga ?</a></li>
							</ul>
						</div>
					</div>
			</div>
		<div class="h-full w-screen flex flex-col">
			<div class="h-[93%] w-full grow basis-full bg-amber-700">
			</div>
		</div>`
	}
}