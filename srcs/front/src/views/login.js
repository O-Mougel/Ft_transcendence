import ViewTemplate from "./ViewTemplate.js";	

export default class extends ViewTemplate {
	constructor()
	{
		super();
		this.setTitle("Login page");
	}

	async getHTML() {
		return `
			<div id="profilePanel" class="hidden absolute animate-slide-in-left right-0 top-0 h-full min-w-80 w-[20%] bg-[url(/img/assets/stars.gif)] z-50 shadow-[0_0_20px_rgba(158,202,237,0.9)] border border-[#98c6f8] overflow-auto">
				<div class="flex flex-col text-center w-full h-full">
					<div class="grid h-[30%] place-items-center">
						<div id="sidePannelPfp" class="bg-[url(/img/assets/sillyDog.gif)] bg-cover p-4 rounded-[50%] opacity-0 shadow object-cover w-[170px] h-[170px]"></div>
					</div>
					<h1 id="playerGrabbedUsername" class="text-black text-bold mx-4 mb-10 text-2xl ">[username]</h1>
					<a href="/profileStats" class="mx-4 text-2xl mb-5 border p-4 text-[#798490] hover:text-[#98c6f8]" name="profileLink" data-link>View my profile</a>
					<a href="/customizeProfile" class="mx-4 text-2xl mb-5 border p-4 text-[#798490] hover:text-[#98c6f8]" name="profileLink" data-link>Update profile</a>
					<a id="logoutButton" class="mx-4 text-2xl mb-15 border p-4 cursor-pointer hover:text-[#dee9f4] hover:bg-[#882639] text-[#882639]" onclick=logoutUser() name="logoutButtonName">➜] Log out</a>
					<div class="self-start px-4">
						<input class="sr-only peer" id="friendCheck" type="checkbox"/>
						<label for="friendCheck" class="text-2xl cursor-pointer py-2 select-none hover:text-[#98c6f8]">➤ Friend list</label>
						<ul class="select-none peer-checked:block hidden mt-3 ml-2 self-start text-left" id="friendlist"></ul>
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
							<div class="flex items-center py-2 w-full">
								<input id="friendSearchInput" type="text" placeholder="Add friend" class="h-8 px-2 rounded-l-md border border-white bg-transparent text-white focus:outline-none text-sm" />
								<button id="friendSearchButton" class=" h-8 bg-[#98c6f8] text-black rounded-r-md text-sm" onclick=sendNewFriendRequest()>🔍</button>
							</div>
							<p id="friendSearchResults" class="mt-4 text-base text-ellipsis"></p>
						</div>
					</div>
				</div>
			</div>
			<div class="text-center ml-auto mr-auto pt-[5%]">
				<img class ="mx-auto mb-[75px]" id="logo" src="./img/assets/sillyDog.gif">
				<form id="loginFormUser">
					<div class="content-center">
						<input id="clientUsername" tabindex="1" class="mx-auto text-white hover:text-[#98c6f8] text-ellipsis focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8] w-1/2 md:w-1/4 h-[35px] text-sm md:text-base rounded-sm border border-[#c2dbf6] pt-2 pb-[5px] pr-5 pl-5 mb-[25px]" name="playerUsername" value="" type="text" autofocus autocomplete="off" placeholder="Enter your login">
					</div>
					<div class="content-center">
						<input id="clientPassword" tabindex="2" class="mx-auto text-white hover:text-[#98c6f8] text-ellipsis focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8] w-1/2 md:w-1/4 h-[35px] text-sm md:text-base rounded-sm border border-[#c2dbf6] pt-2 pb-[5px] pr-5 pl-5 mb-[35px]" name="playerPassword" value="" type="password" autocomplete="off" placeholder="Enter your password">
					</div>
					<div class="">
						<input id="loginValidation" tabindex="3" class="uppercase text-sm md:text-base xl:text-2xl focus:outline-none focus:border-[#98c6f8] hover:text-[#98c6f8] text-ellipsis w-1/2 md:w-1/4 border hover:border-[#98c6f8] border-white pt-2 pb-2 rounded-lg shadow-[0_0_20px_rgba(158,202,237,0.9)] hover:cursor-pointer" onclick="handleLoginClick(event)" name="login" type="submit" value="Sign In">
					</div>
					<a class="flex items-center justify-center px-5 h-full w-full text-sm mt-4 hover:text-[#98c6f8]" href="/newUserRegistration" data-link>New ? Create account</a>
					<p id="signInResult" class="mt-4 text-base"></p>
				</form>
			</div>`
	}
}