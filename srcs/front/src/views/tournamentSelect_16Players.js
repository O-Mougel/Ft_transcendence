import ViewTemplate from "./ViewTemplate.js";	

export default class extends ViewTemplate {
	constructor()
	{
		super();
		this.setTitle("Select Tournament Size");
	}

	async getHTML() {
		return `
			<div id="profilePanel" class="hidden absolute animate-slide-in-left right-0 top-0 h-full min-w-80 w-[20%] bg-[url(/img/assets/stars.gif)] z-50 shadow-[0_0_20px_rgba(158,202,237,0.9)] border border-[#98c6f8] overflow-auto">
				<div class="flex flex-col text-center w-full h-full">
					<div class="grid h-[30%] place-items-center">
						<div id="sidePannelPfp" class="bg-[url(/img/assets/sillyDog.gif)] bg-cover p-4 rounded-[50%] opacity-0 shadow object-cover w-[170px] h-[170px]"></div>
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
			<div class="h-full w-full">
				<form id="tournamentForm8Players" class="pt-[5vw]">
					<div class="flex flex-row justify-around">
						<div class="flex flex-col w-[40vw] gap-4">
							<input id="player1" tabindex="1" class="pb-2 w-full pl-5 mx-auto hover:text-[#98c6f8]  focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8]-[35px] rounded-sm border border-[#c2dbf6]" type="text" autofocus autocomplete="off" placeholder="Player 1">
							<input id="player2" tabindex="2" class="pb-2 w-full pl-5 mx-auto hover:text-[#98c6f8]  focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8]-[35px] rounded-sm border border-[#c2dbf6]" type="text" autocomplete="off" placeholder="Player 2">
							<input id="player3" tabindex="3" class="pb-2 w-full pl-5 mx-auto hover:text-[#98c6f8]  focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8]-[35px] rounded-sm border border-[#c2dbf6]" type="text" autocomplete="off" placeholder="Player 3">
							<input id="player4" tabindex="4" class="pb-2 w-full pl-5 mx-auto hover:text-[#98c6f8]  focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8]-[35px] rounded-sm border border-[#c2dbf6]" type="text" autocomplete="off" placeholder="Player 4">
							<input id="player5" tabindex="5" class="pb-2 w-full pl-5 mx-auto hover:text-[#98c6f8]  focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8]-[35px] rounded-sm border border-[#c2dbf6]" type="text" autocomplete="off" placeholder="Player 5">
							<input id="player6" tabindex="6" class="pb-2 w-full pl-5 mx-auto hover:text-[#98c6f8]  focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8]-[35px] rounded-sm border border-[#c2dbf6]" type="text" autocomplete="off" placeholder="Player 6">
							<input id="player7" tabindex="7" class="pb-2 w-full pl-5 mx-auto hover:text-[#98c6f8]  focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8]-[35px] rounded-sm border border-[#c2dbf6]" type="text" autocomplete="off" placeholder="Player 7">
							<input id="player8" tabindex="8" class="pb-2 w-full pl-5 mx-auto hover:text-[#98c6f8]  focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8]-[35px] rounded-sm border border-[#c2dbf6]" type="text" autocomplete="off" placeholder="Player 8">
						</div>
						<div class="flex flex-col w-[40vw] gap-4">
							<input id="player9" tabindex="9" class="w-full pl-5 mx-auto hover:text-[#98c6f8]  focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8]-[35px] rounded-sm border border-[#c2dbf6]" type="text" autocomplete="off" placeholder="Player 9">
							<input id="player10" tabindex="10" class="pb-2 w-full pl-5 mx-auto hover:text-[#98c6f8]  focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8]-[35px] rounded-sm border border-[#c2dbf6]" type="text" autocomplete="off" placeholder="Player 10">
							<input id="player11" tabindex="11" class="pb-2 w-full pl-5 mx-auto hover:text-[#98c6f8]  focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8]-[35px] rounded-sm border border-[#c2dbf6]" type="text" autocomplete="off" placeholder="Player 11">
							<input id="player12" tabindex="12" class="pb-2 w-full pl-5 mx-auto hover:text-[#98c6f8]  focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8]-[35px] rounded-sm border border-[#c2dbf6]" type="text" autocomplete="off" placeholder="Player 12">
							<input id="player13" tabindex="13" class="pb-2 w-full pl-5 mx-auto hover:text-[#98c6f8]  focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8]-[35px] rounded-sm border border-[#c2dbf6]" type="text" autocomplete="off" placeholder="Player 13">
							<input id="player14" tabindex="14" class="pb-2 w-full pl-5 mx-auto hover:text-[#98c6f8]  focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8]-[35px] rounded-sm border border-[#c2dbf6]" type="text" autocomplete="off" placeholder="Player 14">
							<input id="player15" tabindex="15" class="pb-2 w-full pl-5 mx-auto hover:text-[#98c6f8]  focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8]-[35px] rounded-sm border border-[#c2dbf6]" type="text" autocomplete="off" placeholder="Player 15">
							<input id="player16" tabindex="16" class="pb-2 w-full pl-5 mx-auto hover:text-[#98c6f8]  focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8]-[35px] rounded-sm border border-[#c2dbf6]" type="text" autocomplete="off" placeholder="Player 16">
						</div>
					</div>
					<div class="">
							<input tabindex="17" class="shadow-[0_0_20px_rgba(158,202,237,0.9)] w-[20vw] mt-[1vw] h-[4vw] focus:outline-none focus:border-[#98c6f8] hover:text-[#98c6f8] border hover:border-[#98c6f8] border-white rounded-lg " name="start4Players" type="submit" value="Start" onclick="get16PlayerName(event)">
					</div>
				</form>
			</div>`
	}
}