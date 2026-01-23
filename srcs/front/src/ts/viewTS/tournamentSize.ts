import ViewTemplate from "./ViewTemplate.js";

export default class TournamentSizeView extends ViewTemplate {
	constructor() {
		super();
		this.setTitle("Select Tournament Size");
	}

	async getHTML(): Promise<string> {
		return `
			<div id="profilePanel" class="hidden absolute animate-slide-in-left right-0 top-0 h-full min-w-80 w-[20%] bg-[url(/img/assets/stars.gif)] z-50 shadow-[0_0_20px_rgba(158,202,237,0.9)] border border-[#98c6f8] overflow-auto">
				<div class="flex flex-col text-center w-full h-full">
					<div class="grid h-[30%] place-items-center">
						<div id="sidePannelPfp" class="bg-[url('/img/userPfp/default.png')] bg-cover p-4 rounded-[50%] opacity-0 shadow object-cover w-[170px] h-[170px]"></div>
					</div>
					<h1 id="playerGrabbedUsername" class="text-black text-bold mx-4 mb-10 text-2xl ">[username]</h1>
					<a href="/profileStats" class="mx-4 text-2xl mb-5 border p-4 text-[#798490] hover:text-[#98c6f8]" name="profileLink" data-link>View profile</a>
					<a href="/customizeProfile" class="mx-4 text-2xl mb-5 border p-4 text-[#798490] hover:text-[#98c6f8]" name="profileLink" data-link>Update profile</a>
					<a id="logoutButton" class="mx-4 text-2xl mb-8 border p-4 cursor-pointer hover:text-[#dee9f4] hover:bg-[#882639] text-[#882639]" onclick=logoutUser() name="logoutButtonName">➜] Log out</a>
					<div class="self-start px-4">
						<input class="sr-only peer" id="friendCheck" type="checkbox"/>
						<label for="friendCheck" class="text-2xl cursor-pointer py-2 mb-10 select-none hover:text-[#98c6f8]">➤ Friend list</label>
						<ul class="select-none peer-checked:block hidden mt-3 ml-2 self-start text-left animate-slide-fade-up" id="friendlist"></ul>
					</div>
					<div id="pendingRequestBlock" class="w-full mt-8 px-4 hidden">
							<input class="sr-only peer" id="requestCheck" type="checkbox" />
							<label for="requestCheck" id="requestCheckLabel" class="text-xl cursor-pointer mt-10 px-3 py-2 select-none hover:text-[#98c6f8] ">
								► Requests
							</label>
							<ul id="requestList" class="select-none peer-checked:block hidden mt-3 self-start text-left animate-slide-fade-up"></ul>
					</div>
					<div class="w-full mt-3 px-4 flex">
						<div class="w-[85%] max-w-60">
							<div class="flex items-center py-2 w-full mt-5">
								<input id="friendSearchInput" type="text" placeholder="Add friend" maxlength="13" class="h-8 px-2 rounded-l-md border border-white bg-transparent text-white focus:outline-none text-sm" />
								<button id="friendSearchButton" class=" h-8 bg-[#98c6f8] text-black rounded-r-md text-sm" onclick=sendNewFriendRequest()>🔍</button>
							</div>
							<p id="friendSearchResults" class="mt-4 text-base text-ellipsis"></p>
						</div>
					</div>
				</div>
			</div>
			<div class="h-full w-full flex flex-col">
				<div class="h-[93%] w-full pt-[5%] text-center ml-auto mr-auto">
					<div id="tournamentNbPlayerSelect">
						<h1 class="">Select the number of players in the tournament</h1>
						<div class=" text-[4vw] flex gap-5 px-[40%] justify-around mt-8 mx-auto flex-col sm:flex-row sm:px-[5%] sm:text-[5vw]">
							<div class="flex-1 flex items-center justify-center aspect-square hover:text-[#98c6f8] rounded-[10%] font-bold border-[1vw]">
								<a class="flex items-center justify-center h-full w-full" onclick="createCustomTournamentPage(4)">4</a>
							</div>
							<div class="flex-1 flex items-center justify-center aspect-square hover:text-[#98c6f8] rounded-[10%] font-bold border-[1vw]">
								<a class="flex items-center justify-center h-full w-full" onclick="createCustomTournamentPage(8)">8</a>
							</div>
							<div class="flex-1 flex items-center justify-center aspect-square hover:text-[#98c6f8] rounded-[10%] font-bold border-[1vw]">
								<a class="flex items-center justify-center h-full w-full" onclick="createCustomTournamentPage(16)">16</a>
							</div>
						</div>
					</div>
					<!-- Tournament creation form -->
					<div id="tournamentBuiltBlock" class="hidden w-[80%] mx-auto">
						<form id="tournamentForm" class="mt-[5vw]">
						</form>
					</div>
				</div>
			</div>`;
	}
}
