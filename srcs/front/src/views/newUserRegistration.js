import ViewTemplate from "./ViewTemplate.js";	

export default class extends ViewTemplate {
	constructor()
	{
		super();
		this.setTitle("Create account");
	}

	async getHTML() {
		return `
			<div class="pt-[1vh] h-full w-full">
				<div class="mx-[3%] rounded-xl outline-none border border-blue-300 bg-[url(/img/assets/stars.gif)] bg-cover bg-center flex flex-col shadow-[0_0_20px_rgba(158,202,237,0.9)]">
					<form class="py-[3%] px-[3%]">
						<h2 class="flex items-start">► Choose your username :</h2>
						<div class="flex items-start pt-5">
							<input id="newUsernameNewUser" tabindex="1" class=" w-[60vw] ml-4 hover:text-[#98c6f8] text-ellipsis focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8] h-[3vh] rounded-sm border border-[#c2dbf6] py-[2vw] pr-5 pl-5 mb-[35px]" name="unameNew" value="" type="text" autofocus autocomplete="off" placeholder="Username" maxlength="13" oninput="this.value = this.value.replace(/[^A-Za-z0-9_]/g,'').slice(0,13)" >
						</div>
						<h2 class="flex items-start">► Enter your email:</h2>
						<div class="flex items-start pt-5 ">
							<input id="newUserEmail" tabindex="2" class="w-[60vw] ml-4 hover:text-[#98c6f8] text-ellipsis focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8] h-[3vh] rounded-sm border border-[#c2dbf6] py-[2vw] pr-5 pl-5 mb-[35px]" name="newUserEmailField" value="" type="text" autocomplete="off" placeholder="Email" >
						</div>
						<h2 class="flex items-start">► Add a password :</h2>
						<div class="flex items-start pt-5">
							<input id="firstPasswordNewUser" tabindex="2" class=" w-[60vw] ml-4 hover:text-[#98c6f8] text-ellipsis focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8] h-[3vh] rounded-sm border border-[#c2dbf6] py-[2vw] pr-5 pl-5 mb-[35px]" name="confirmPassword" value="" type="password" autocomplete="off" placeholder="Password" maxlength="32" oninput="this.value = this.value.slice(0,32)" >
						</div>
						<h2 class="flex items-start">► Confirm your password :</h2>
						<div class="flex items-start pt-5">
							<input id="confirmPasswordNewUser" tabindex="2" class="w-[60vw] ml-4 hover:text-[#98c6f8] text-ellipsis focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8] h-[3vh] rounded-sm border border-[#c2dbf6] py-[2vw] pr-5 pl-5 mb-[35px]" name="confirmPassword" value="" type="password" autocomplete="off" placeholder="Confirm password" maxlength="32" oninput="this.value = this.value.slice(0,32)" >
						</div>
						<div class="flex items-start pt-5">
							<input tabindex="3" class="w-[60vw] uppercase text-sm md:text-base xl:text-2xl focus:outline-none focus:border-[#98c6f8] hover:text-[#98c6f8] text-ellipsis border hover:border-[#98c6f8] border-white pt-2 pb-2 rounded-lg" onclick="handleNewUserCreate(event)" name="updateChanges" type="submit" value="Create account">
						</div>
						<div class="flex items-start pt-5">
							<a tabindex="4" class="w-[60vw] uppercase text-sm md:text-base xl:text-2xl focus:outline-none focus:border-[#98c6f8] hover:text-[#98c6f8] text-ellipsis border hover:border-[#98c6f8] border-white pt-2 pb-2 rounded-lg" name="gotoMainMenu" href="/" data-link>🚀 Back to menu</a>
						</div>
						<div class="flex items-start pt-5">
							<p id="saveNewUserInfo" class=" w-[60vw] mt-4 text-base text-ellipsis"></p>
						</div>
					</form>
				</div>
			</div>`
	}
}