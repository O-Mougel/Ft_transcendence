import ViewTemplate from "./ViewTemplate.js";

export default class UserMatchHistoryView extends ViewTemplate {
	constructor() {
		super();
		this.setTitle("Match History");
	}

	async getHTML(): Promise<string> {
		return `
			<div id="profilePanel" class="hidden absolute animate-slide-in-left right-0 top-0 h-full min-w-80 w-[20%] bg-[url(/img/assets/stars.gif)] z-50 shadow-[0_0_20px_rgba(158,202,237,0.9)] border border-[#98c6f8] overflow-auto">
				<div class="flex flex-col text-center w-full h-full">
					<div class="grid h-[30%] place-items-center">
						<div id="sidePannelPfp" class="bg-[url('/img/userPfp/default.png')] bg-cover p-4 rounded-[50%] opacity-0 shadow object-cover sm:w-[170px] sm:h-[170px] md:w-[18vh] md:h-[18vh]"></div>
					</div>
					<h1 id="playerGrabbedUsername" class="text-black text-bold underline mx-4 mb-10 text-2xl lg:text-5xl "></h1>
					<a href="/profileStats" class="mx-4 text-2xl lg:text-4xl mb-5 border p-4 text-[#798490] hover:text-[#98c6f8]" name="profileLink" data-link>View profile</a>
					<a href="/customizeProfile" class="mx-4 text-2xl lg:text-4xl mb-5 border p-4 text-[#798490] hover:text-[#98c6f8]" name="profileLink" data-link>Update profile</a>
					<a id="logoutButton" class="mx-4 text-2xl lg:text-4xl mb-8 border p-4 cursor-pointer hover:text-[#dee9f4] hover:bg-[#882639] text-[#882639]" onclick=logoutUser() name="logoutButtonName">➜] Log out</a>
					<div class="self-start px-4 w-full">
						<input class="sr-only peer" id="friendCheck" type="checkbox"/>
						<label for="friendCheck" class="text-2xl lg:text-3xl cursor-pointer py-2 mb-10 select-none hover:text-[#98c6f8]">➤ Friend list</label>
						<ul class="select-none peer-checked:block hidden mt-3 ml-2 self-start text-left animate-slide-fade-up" id="friendlist"></ul>
					</div>
					<div id="pendingRequestBlock" class="w-full mt-8 lg:mt-15 px-4 hidden">
							<input class="sr-only peer" id="requestCheck" type="checkbox" />
							<label for="requestCheck" id="requestCheckLabel" class="text-xl lg:text-3xl cursor-pointer mt-10 px-3 py-2 select-none hover:text-[#98c6f8] ">
								► Requests
							</label>
							<ul id="requestList" class="select-none peer-checked:block hidden mt-3 self-start text-left animate-slide-fade-up"></ul>
					</div>
					<div class="w-full mt-3 px-4 flex">
						<div class="w-full ">
							<form class="flex items-center py-2 h-full w-full mt-5">
								<input id="friendSearchInput" type="text" placeholder="Add friend" maxlength="13" class="h-[70%] w-[80%] lg:text-3xl px-2 rounded-l-md border border-white bg-transparent focus:outline-none text-sm" />
								<button id="friendSearchButton" class=" h-[70%] w-[10%] bg-[#98c6f8] text-black rounded-r-md text-sm lg:text-3xl type="submit" onclick="sendNewFriendRequest(event)" >🔍</button>
							</form>
							<p id="friendSearchResults" class="mt-4 text-2xl text-red-500 text-ellipsis"></p>
						</div>
					</div>
				</div>
			</div>

			<h1 class="pb-4 mt-[1%] ">Match History :</h1>
			<div class="pt-[1%] mt-[1%] relative flex flex-col gap-y-4 pb-[1%] items-center mx-[3%] px-4 rounded-xl outline-none overflow-scroll overflow-x-hidden h-[60%] border border-blue-300 bg-[url(/img/assets/stars.gif)] bg-cover bg-center shadow-[0_0_20px_rgba(158,202,237,0.9)]">
				<div id="matchHistoryDiv" class="flex flex-col w-[95%] justify-center items-center gap-4 pb-4">

				</div>
			</div>
			<div class="mt-5 xl:h-[5%] flex justify-center items-center">
				<a id="backToProfileButton" href="/profileStats" class="flex justify-center items-center text-center uppercase text-sm md:text-base xl:text-2xl h-full focus:outline-none focus:border-[#98c6f8] hover:text-[#98c6f8] text-ellipsis w-1/2 md:w-1/4 border hover:border-[#98c6f8] border-white py-2 px-4 rounded-lg" name="backtoProfileButton" data-link>
					👤 Back to profile
				</a>
			</div>`;
	}

	async init(): Promise<void> {
		await window.buildMatchHistoryPage();
	}
}
