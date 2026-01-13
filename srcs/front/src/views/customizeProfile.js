import ViewTemplate from "./ViewTemplate.js";	

export default class extends ViewTemplate {
	constructor()
	{
		super();
		this.setTitle("Profile customization");
	}

	async getHTML() {
		return `
			<div class="pt-[3%]">
			</div>
			<div class="mx-[3%] rounded-xl outline-none border border-blue-300 bg-[url(/img/assets/stars.gif)] bg-cover bg-center flex flex-col shadow-[0_0_20px_rgba(158,202,237,0.9)]">
				<form class="pt-[3%] px-[3%]" onsubmit="return false">
					<h2 class="flex items-start w-full text-left">► Choose your new username :</h2>
					<div class="flex items-start w-[75%] pt-4">
						<input id="newUsername" tabindex="1" class="uppercase ml-4 px-5 w-full hover:text-[#98c6f8] text-ellipsis focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8] rounded-sm border border-[#c2dbf6]" name="unameNew" value="" type="text" autofocus autocomplete="off" placeholder="[old username]">
					</div>
					<h2 class="flex items-start pt-4 w-full text-left">► Choose your new profile picture :</h2>
					<div class="overflow-hidden flex items-center justify-center gap-4 pt-4">
 						<img id="userPfp" src="./img/userPfp/default.png" alt="userPfpImg" class="ml-5 mb-0 w-[120px] h-[120px] object-cover shrink-0" />
 						<input type="file" id="myfileSelector" name="fileSelector" onchange="onFileSelected(this)" accept="image/png, image/jpg, image/jpeg" class="hidden" />
						<label for="myfileSelector" class="border border-white ml-2 py-2 px-3 cursor-pointer">🗁 Select file</label>
						<p id="selectedFileName" class="mt-4 text-base text-ellipsis"></p>
					</div>
					<h2 class="flex items-start pt-4 w-full text-left">► Confirm your password :</h2>
					<div class="flex items-start w-[75%] pt-4">
						<input id="confirmPassword" tabindex="2" class="uppercase ml-4 px-5 w-full hover:text-[#98c6f8] text-ellipsis focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8] rounded-sm border border-[#c2dbf6]" name="confirmPassword" value="" type="password" autocomplete="off" placeholder="Enter your password" >
					</div>
					<div class="flex items-start w-[75%] pt-4">
						<input tabindex="3" class="uppercase ml-4 px-5 hover:text-[#98c6f8] text-ellipsis focus:outline-none  focus:border-[#98c6f8] hover:border-[#98c6f8] border-white rounded-lg border pb-1 sm:pb-2" onclick="saveProfileInfo()" name="updateChanges" type="submit" value="💾 Apply changes">
						<p id="confirmChangeResults" class="text-ellipsis text-center pl-3 text-[2vw]"></p>
					</div>
				</form>
				<div class="px-[3%] pb-[6%]">
					<h2 class="flex items-start w-full text-left pt-4">► Enable 2FA :</h2>
					<div class="flex items-start w-[75%] pt-4">
						<a tabindex="5" class="uppercase px-5 ml-4 pb-1 sm:pb-2 focus:outline-none focus:border-[#98c6f8] hover:text-[#98c6f8] text-ellipsis border hover:border-[#98c6f8] border-white rounded-lg" name="gotoMainMenu" href="/setup2FA" data-link>🔒 2FA setup</a>
					</div>
					<div class="pt-6">
						<a tabindex="5" class="uppercase px-5 focus:outline-none focus:border-[#98c6f8] hover:text-[#98c6f8] text-ellipsis border hover:border-[#98c6f8] border-white rounded-lg" name="gotoMainMenu" href="/" data-link>🚀 Back to menu</a>
					</div>
				</div>
			</div>`
	}
}