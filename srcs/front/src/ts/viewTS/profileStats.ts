import ViewTemplate from "./ViewTemplate.js";

export default class ProfileStatsView extends ViewTemplate {
	constructor() {
		super();
		this.setTitle("Profile");
	}

	async getHTML(): Promise<string> {
		return `
			<div id="profilePanel" class="hidden absolute animate-slide-in-left right-0 top-0 h-full min-w-80 w-[20%] bg-[url(/img/assets/stars.gif)] z-50 shadow-[0_0_20px_rgba(158,202,237,0.9)] border border-[#98c6f8] overflow-auto">
				<div class="flex flex-col text-center w-full h-full">
					<div class="grid h-[30%] place-items-center">
						<div id="sidePannelPfp" class="bg-[url('/img/userPfp/default.png')] bg-cover bg-center p-4 rounded-[50%] opacity-0 shadow object-cover sm:w-[170px] sm:h-[170px] md:w-[18vh] md:h-[18vh]"></div>
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
			
			<div class="pt-[3%] mt-[3%] relative flex flex-col gap-y-4 items-center mx-[3%] px-4 rounded-xl outline-none border border-blue-300 bg-[url(/img/assets/stars.gif)] bg-cover bg-center shadow-[0_0_20px_rgba(158,202,237,0.9)]">
			<h1 class="m-0">Statistics :</h1>
			<div class="flex flex-col sm:flex-row w-full justify-around items-center gap-4">
				<div class="flex flex-col items-center">
						<h2 id="playerUsernameProfile" class="hidden text-center pr-2 underline"></h2>
						<img id="userPfpProfile" src="./img/userPfp/default.png" alt="userPfpImg" class="hidden pl-2 pt-4 w-20 h-20 sm:w-[120px] sm:h-[120px] md:w-[10vw] md:h-[10vw] object-cover shrink-0 select-none" draggable="false" />
					</div>
					<a class="uppercase px-5 py-1 z-20 focus:outline-none focus:border-[#98c6f8] hover:text-[#98c6f8] text-ellipsis border hover:border-[#98c6f8] border-white rounded-lg" name="gotoMatchHistory" href="/UserMatchHistory" data-link>View match history</a>
				</div>
				<div class="flex border border-blue-300 shadow-[0_0_20px_rgba(158,202,237,0.9)] rounded-lg  p-4 gap-4 flex-wrap justify-around w-[90%] mb-2">		
					<canvas id="winLossDoughnutChart" class="hidden aspect-square w-full max-w-60 max-h-60 min-w-20" ></canvas>
					<canvas id="winRatioBar" class="hidden aspect-square w-full max-w-60 max-h-60 min-w-20" ></canvas>
					<canvas id="multiChart" class="hidden aspect-square w-full max-w-60 max-h-60 min-w-20" ></canvas>
					<p id="noMatchesMessage" class="hidden w-full text-center">There is no match statistics to display</p>
				</div>

				<div class="w-[90%] my-2 rounded-xl outline-none border border-blue-300 shadow-[0_0_20px_rgba(158,202,237,0.9)]" >
					<div>
						<h2 class="py-2" >Select a friend to see his stats :</h2>
						<div class="flex w-full">
							<ul id="friendlistProfileParent" class="flex flex-wrap justify-center gap-4 w-full pt-4 hover:cursor-pointer ">
							</ul>
						</div>
					</div>
					<h2 id="selectedPlayerUsernameHeader" class="hidden overflow-hidden text-center pr-2 py-2 text-blue-900 mt-3">[--]</h2>
					
					<div id="friendStatDisplayBox" class="hidden m-auto border border-blue-300 shadow-[0_0_20px_rgba(158,202,237,0.9)] rounded-lg  p-4 gap-4 flex-wrap justify-around w-[90%] mb-2">
						<canvas id="winLossDoughnutChartFriend" class="hidden aspect-square w-full max-w-60 max-h-60 min-w-20" ></canvas>
						<canvas id="winRatioBarFriend" class="hidden aspect-square w-full max-w-60 max-h-60 min-w-20" ></canvas>
						<canvas id="multiChartFriend" class="hidden aspect-square w-full max-w-60 max-h-60 min-w-20" ></canvas>
						<p id="noMatchesMessageFriend" class="hidden w-full text-center">There is no match statistics to display</p>
					</div>
					<div id="removeFriendBoxDiv">
						<h3 class="py-2 overflow-hidden">Remove a friend :</h3>
						<div class="flex flex-col sm:flex-row items-center justify-center gap-4">
							<select id="selectBoxFriendRemover" class="h-full border bg-black hover:cursor-pointer sm:mb-2">
								<option value="dummyvalue">--Select a friend--</option>
							</select>
							<a class="uppercase p-4 focus:outline-none bg-red-500 text-ellipsis border rounded-lg hover:cursor-pointer hover:bg-[#d41626]" onclick="confirmFriendRemoval()" name="confirmFriendRemoval" >Remove</a>
						</div>
					</div>
					<div class="pb-2 sm:pt-10">
					</div>
				</div>
					<div class="py-5 mt-2" >
						<a tabindex="5" class="uppercase px-5 focus:outline-none focus:border-[#98c6f8] hover:text-[#98c6f8] text-ellipsis border hover:border-[#98c6f8] border-white rounded-lg" name="gotoMainMenu" href="/" data-link>🚀 Back to menu</a>
					</div>
				<div class="pb-2 sm:pb-12">
				</div>
			</div>`;
	}
}
