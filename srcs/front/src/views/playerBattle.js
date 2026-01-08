import ViewTemplate from "./ViewTemplate.js";	

export default class extends ViewTemplate {
	constructor()
	{
		super();
		this.setTitle("PVP");
	}

	async getHTML() {
		return `
			<div id="profilePanel" class="flex absolute right-0 top-0 h-full min-w-80 w-[20%] bg-[url(/img/assets/stars.gif)] z-50 shadow-[0_0_20px_rgba(158,202,237,0.9)] border border-[#98c6f8] overflow-auto">
				<div class="flex flex-col text-center w-full h-full">
					<div class="grid h-[30%] place-items-center">
  						<div id="sidePannelPfp" class="bg-[url(/img/assets/sillyDog.gif)] bg-cover p-4 rounded-[50%] opacity-0 shadow object-cover w-[170px] h-[170px]"></div>
					</div>
					<h1 id="playerGrabbedUsername" class="text-black text-bold mx-4 mb-15 text-2xl ">[username]</h1>
					<a href="/profileStats" class="mx-4 text-2xl mb-5 border p-4 text-[#798490] hover:text-[#98c6f8]" name="profileLink" data-link>View my profile</a>
					<a href="/customizeProfile" class="mx-4 text-2xl mb-5 border p-4 text-[#798490] hover:text-[#98c6f8]" name="profileLink" data-link>Update profile</a>
					<a id="logoutButton" class="mx-4 text-2xl mb-15 border p-4 cursor-pointer hover:text-[#dee9f4] hover:bg-[#882639] text-[#882639]" onclick=logoutUser() name="logoutButtonName">➜] Log out</a>
					<div class="self-start">
						<input class="sr-only peer" id="friendCheck" type="checkbox"/>
						<label for="friendCheck" class="text-2xl cursor-pointer px-3 py-2 select-none hover:text-[#98c6f8]">► Friend list</label>
						<ul class="select-none peer-checked:block hidden mt-3 self-start text-left" id="friendlist"></ul>
					</div>
					<div id="pendingRequestBlock" class="w-full mt-3 px-4 hidden">
							<input class="sr-only peer" id="requestCheck" type="checkbox" />
							<label for="requestCheck" id="requestCheckLabel" class="text-xl cursor-pointer px-3 py-2 select-none hover:text-[#98c6f8] ">
								► Requests
							</label>
							<ul id="requestList" class="select-none peer-checked:block hidden mt-3 self-start text-left"></ul>
					</div>
					<div class="w-full mt-3 px-4 flex">
						<div class="w-[85%] max-w-60">
							<div class="flex items-center">
								<input id="friendSearchInput" type="text" placeholder="Add friend" class="w-1/4 h-8 px-2 rounded-l-md border border-white bg-transparent text-white focus:outline-none text-sm" />
								<button id="friendSearchButton" class="w-1/4 h-8 bg-[#98c6f8] text-black rounded-r-md text-sm" onclick=sendNewFriendRequest()>🔍</button>
							</div>
							<p id="friendSearchResults" class="mt-4 text-base text-ellipsis"></p>
						</div>
					</div>
				</div>
			</div>
			<div class="h-full w-screen flex flex-col">
				<div class="h-[93%] w-full grow basis-full bg-cyan-800">
				</div>
			</div>`
	}
}