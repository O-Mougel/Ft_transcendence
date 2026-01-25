import ViewTemplate from "./ViewTemplate.js";

export default class ChangePasswordView extends ViewTemplate {
	constructor() {
		super();
		this.setTitle("Change Password");
	}

	async getHTML(): Promise<string> {
		return `
			<div id="profilePanel" class="hidden absolute animate-slide-in-left right-0 top-0 h-full min-w-80 w-[20%] bg-[url(/img/assets/stars.gif)] z-50 shadow-[0_0_20px_rgba(158,202,237,0.9)] border border-[#98c6f8] overflow-auto">
				<div class="flex flex-col text-center w-full h-full">
					<div class="grid h-[30%] place-items-center">
						<div id="sidePannelPfp" class="bg-[url('/img/userPfp/default.png')] bg-cover p-4 rounded-[50%] opacity-0 shadow object-cover w-[170px] h-[170px]"></div>
					</div>
					<h1 id="playerGrabbedUsername" class="text-black text-bold underline mx-4 mb-10 text-2xl "></h1>
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
								<input id="friendSearchInput" type="text" placeholder="Add friend" maxlength="13" class="h-8 px-2 rounded-l-md border border-white bg-transparent focus:outline-none text-sm" />
								<button id="friendSearchButton" class=" h-8 bg-[#98c6f8] text-black rounded-r-md text-sm" onclick=sendNewFriendRequest()>🔍</button>
							</div>
							<p id="friendSearchResults" class="mt-4 text-base text-ellipsis"></p>
						</div>
					</div>
				</div>
			</div>

			<div class="pt-[3%] mt-[3%] flex flex-col gap-y-4 items-center mx-[3%] px-4 rounded-xl outline-none border border-blue-300 bg-[url(/img/assets/stars.gif)] bg-cover bg-center shadow-[0_0_20px_rgba(158,202,237,0.9)]">
				<h1 class="pb-4">Change your password</h1>
				<form class="flex flex-col items-center">
					<label class="mb-2">Current Password :</label>
					<input autofocus tabindex="1" class="w-full text-center border border-white rounded-lg hover:text-[#98c6f8] hover:border-[#98c6f8]" type="password" id="currentPasswordInput" autocomplete="off" placeholder="Current password" maxlength="32" oninput="this.value = this.value.slice(0,32)">

					<label class="mt-4 mb-2">New Password :</label>
					<input autofocus tabindex="2" class="w-full text-center border border-white rounded-lg hover:text-[#98c6f8] hover:border-[#98c6f8]" type="password" id="newPasswordInput" autocomplete="off" placeholder="New password" maxlength="32" oninput="this.value = this.value.slice(0,32)">

					<label class="mt-4 mb-2">Confirm New Password :</label>
					<input autofocus tabindex="3" class="w-full text-center border border-white rounded-lg hover:text-[#98c6f8] hover:border-[#98c6f8]" type="password" id="confirmNewPasswordInput" autocomplete="off" placeholder="Confirm new password" maxlength="32" oninput="this.value = this.value.slice(0,32)">
					<input id="changePasswordButton" class="mt-4 p-4 sm:p-5 focus:outline-none focus:border-[#98c6f8] hover:text-[#98c6f8] text-ellipsis border hover:border-[#98c6f8] border-white rounded-lg cursor-pointer" type="submit" value="Change Password" onclick="updateUserPassword(event)">
				</form>
				<p id="changePasswordResult" class="pt-4"></p>
				<div class="pt-10">
					<a id="backToMenuButton" href="/" class="inline uppercase text-sm md:text-base xl:text-2xl focus:outline-none focus:border-[#98c6f8] hover:text-[#98c6f8] text-ellipsis w-1/2 md:w-1/4 border hover:border-[#98c6f8] border-white py-2 px-4 rounded-lg shadow-[0_0_20px_rgba(158,202,237,0.9)]" name="backtomenuButton" data-link> 🚀 Back to menu </a>
				</div>
				<div class="pb-7">
				</div>
			</div>`;
	}
}
