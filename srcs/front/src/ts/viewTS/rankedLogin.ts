import ViewTemplate from "./ViewTemplate.js";

export default class RankedLoginView extends ViewTemplate {
	constructor() {
		super();
		this.setTitle("Ranked");
	}

	async init(): Promise<void> {
		await window.loadProfileData();
		const player2UserName = document.getElementById('player2UserName');
		if (player2UserName) player2UserName.focus();
		if (sessionStorage.getItem("player2_token")) {
			console.log("Player2 logout cleanup");
			window.sessionStorage.removeItem('player2_token');
		}
	}

	async getHTML(): Promise<string> {
		return `
			<div id="profilePanel" class="hidden absolute animate-slide-in-left right-0 top-0 h-full min-w-80 w-[35%] max-w-[640px] bg-[url(/img/assets/stars.gif)] z-50 shadow-[0_0_20px_rgba(158,202,237,0.9)] border border-[#98c6f8] overflow-auto">
				<div class="flex flex-col text-center w-full h-full">
					<div class="grid h-[30%] place-items-center">
						<div id="sidePannelPfp" class="bg-[url('/img/userPfp/default.png')] bg-cover bg-center p-4 rounded-[50%] opacity-0 shadow object-cover sm:w-[170px] sm:h-[170px] md:w-[18vh] md:h-[18vh]"></div>
					</div>
					<h1 id="playerGrabbedUsername" class="text-black text-bold underline mx-4 mb-10 text-2xl lg:text-4xl "></h1>
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

			<div class="pt-[3%] mt-[3%] pb-4 mx-[3%] gap-y-4 flex flex-col rounded-xl outline-none border border-blue-300 bg-[url(/img/assets/stars.gif)] bg-cover bg-center shadow-[0_0_20px_rgba(158,202,237,0.9)]">
				<div class="flex flex-col sm:flex-row items-start px-4">
					<div class="w-full h-full sm:w-[45%] flex flex-col items-center gap-y-4">
						<h1 class="text-blue-300">Player 1</h1>
						<h1 id="Player1Name"> </h1>
						<img id="player1Pfp" src="" alt="userPfpImg" class="min-w-5 max-w-120 w-[20vw] aspect-square rounded-full object-cover shrink-0 select-none" draggable="false" />
					</div>
					<div class="w-full h-full sm:w-[10%] flex flex-col items-center justify-center self-center">
						<div class="w-full h-full flex flex-col items-center justify-items-stretch">
							<img src="./img/assets/vs.png" alt="vsImg" class="pt-4 min-w-4 max-w-60 w-[30vw] sm:w-[10vw] aspect-square object-contain shrink-0 select-none" draggable="false" />
						</div>
					</div>
					<form class="w-full h-full sm:w-[45%] flex flex-col items-center gap-y-4" id="profile2Login" >
							<h1 class="text-red-300">Player 2</h1>
							<h1 class="mb-4">Need to sign in</h1>
							<input id="player2UserName" tabindex="1"	class="m-auto px-4 w-full sm:w-[90%] hover:text-[#98c6f8] focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8] border border-white rounded-lg uppercase" name="playerUsername" value="" type="text" autofocus autocomplete="off" placeholder="Enter your login" maxlength="13" oninput="this.value = this.value.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 13);">
							<input id="player2Password" tabindex="2"	class="m-auto px-4 w-full sm:w-[90%] hover:text-[#98c6f8] focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8] border border-white rounded-lg" name="playerPassword" value="" type="password" autocomplete="off" placeholder="Enter your password" maxlength="32" oninput="this.value = this.value.slice(0,32)">
							<input id="player2Validation" tabindex="3"	class="m-auto px-4 w-full sm:w-[90%] hover:text-[#98c6f8] focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8] border border-white rounded-lg shadow-[0_0_20px_rgba(158,202,237,0.9)] hover:cursor-pointer pb-1 sm:pb-2" onclick="loginPlayer2(event)" name="login" type="submit" value="Sign In">
							<p id="Player2Result" class="mt-4 text-base"></p>
					</form>
					<form class="w-full h-full sm:w-[45%] hidden flex-col items-center gap-y-4" id="profile2Login2FA" >
						<h1 class="text-red-300">Player 2</h1>
						<h1 class="mb-4">Require 2FA</h1>
						<input id="player2TwoFAInput" tabindex="1"	class="m-auto px-4 w-full hover:text-[#98c6f8] focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8] border border-white rounded-lg text-center" name="player2TwoFAInput" value="" type="text" autofocus autocomplete="off" placeholder="Enter your 2FA code" maxlength="6" oninput="this.value = this.value.replace(/[^0-9]/g, '').slice(0, 6);">
						<input id="player2TwoFAValidationField" tabindex="2"	class="m-auto px-4 w-full hover:text-[#98c6f8] focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8] border border-white rounded-lg shadow-[0_0_20px_rgba(158,202,237,0.9)] hover:cursor-pointer pb-1 sm:pb-2" onclick="player2TwoFAValidation(event)" name="validate2FA" type="submit" value="Validate 2FA">
					</form>
					<div class="w-full h-full sm:w-[45%] hidden flex-col items-center gap-y-4" id="profile2Overview">
						<h1 class="text-red-300">Player 2</h1>
						<h1 id="Player2Name">[Player2Name]</h1>
						<img id="player2Pfp" src="./img/userPfp/default.png" alt="userPfpImg" class="min-w-5 max-w-120 w-[20vw] aspect-square rounded-full object-cover shrink-0 select-none" draggable="false" />
					</div>

				</div>
				<div id="goToGameButtonDiv" class="w-full h-full flex-col hidden items-center">
					<a href="/pongRanked" class="px-6 w-[50%] py-3 sm:py-4 bg-[#98c6f8] font-bold rounded-lg hover:bg-[#7aaedc]" data-link>Go to game</a>
				</div>
			</div>`;
	}
}
