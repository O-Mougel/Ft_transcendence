import ViewTemplate from "./ViewTemplate.js";	

export default class extends ViewTemplate {
	constructor()
	{
		super();
		this.setTitle("Create account");
	}

	async getHTML() {
		return `
			
			<div class="absolute inset-[3%] rounded-xl outline-none border border-blue-300 bg-[url(/img/stars.gif)] bg-cover bg-center flex flex-col shadow-[0_0_20px_rgba(158,202,237,0.9)]">
				<form class="py-[3%] px-[3%]">
					<h2 class="flex items-start">► Choose your username :</h2>
					<div class="flex items-start w-[50%] py-5">
						<input id="newUsernameNewUser" tabindex="1" class=" ml-4 hover:text-[#98c6f8] text-ellipsis focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8] md:w-1/2 h-[35px] text-sm md:text-base rounded-sm border border-[#c2dbf6] pt-2 pb-[5px] pr-5 pl-5 mb-[25px]" name="unameNew" value="" type="text" autofocus autocomplete="off" placeholder="Enter an username" >
					</div>
					<h2 class="flex items-start">► Enter your email:</h2>
					<div class="flex items-start w-[50%] pt-5">
						<input id="newUserEmail" tabindex="2" class="  ml-4 hover:text-[#98c6f8] text-ellipsis focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8] md:w-1/2 h-[35px] text-sm md:text-base rounded-sm border border-[#c2dbf6] pt-2 pb-[5px] pr-5 pl-5 mb-[35px]" name="newUserEmailField" value="" type="text" autocomplete="off" placeholder="Enter your email" >
					</div>
					<h2 class="flex items-start pt-5">► Add a password :</h2>
					<div class="flex items-start w-[50%] pt-5">
						<input id="firstPasswordNewUser" tabindex="2" class="  ml-4 hover:text-[#98c6f8] text-ellipsis focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8] md:w-1/2 h-[35px] text-sm md:text-base rounded-sm border border-[#c2dbf6] pt-2 pb-[5px] pr-5 pl-5 mb-[35px]" name="confirmPassword" value="" type="password" autocomplete="off" placeholder="Enter your password" >
					</div>
					<h2 class="flex items-start">► Confirm your password :</h2>
					<div class="flex items-start w-[50%] pt-5">
						<input id="confirmPasswordNewUser" tabindex="2" class="  ml-4 hover:text-[#98c6f8] text-ellipsis focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8] md:w-1/2 h-[35px] text-sm md:text-base rounded-sm border border-[#c2dbf6] pt-2 pb-[5px] pr-5 pl-5 mb-[35px]" name="confirmPassword" value="" type="password" autocomplete="off" placeholder="Confirm your password" >
					</div>
					<div class="flex items-start w-[50%] pt-5">
						<input tabindex="3" class="uppercase text-sm md:text-base xl:text-2xl focus:outline-none focus:border-[#98c6f8] hover:text-[#98c6f8] text-ellipsis md:w-1/2 border hover:border-[#98c6f8] border-white pt-2 pb-2 rounded-lg" onclick="handleNewUserCreate(event)" name="updateChanges" type="submit" value="Create account">
						<a tabindex="4" class="uppercase text-sm md:text-base xl:text-2xl focus:outline-none focus:border-[#98c6f8] hover:text-[#98c6f8] text-ellipsis md:w-1/2 border hover:border-[#98c6f8] border-white pt-2 pb-2 rounded-lg ml-5" name="gotoMainMenu" href="/" data-link>Back to menu</a>
					</div>
					<div class="flex items-start w-[50%] pt-5">
						<p id="saveNewUserInfo" class="mt-4 text-base text-ellipsis"></p>
					</div>
				</form>
			</div>`
	}
}