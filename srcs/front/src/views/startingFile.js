import ViewTemplate from "./ViewTemplate.js";	

export default class extends ViewTemplate {
	constructor()
	{
		super();
		this.setTitle("Welcome !");
	}

	async getHTML() {
		return `
			<div id="profilePanel" class="flex absolute right-0 top-0 h-full w-[20%] bg-[url(/img/stars.gif)] z-50 shadow-[0_0_20px_rgba(158,202,237,0.9)] border border-[#98c6f8]">
					<div class="flex flex-col text-center w-full h-full">
						<div class="grid h-[30%] place-items-center">
  							<div class="bg-[url(/img/sillyDog.gif)] bg-cover w-[50%] h-[50%] p-4 rounded-[50%] shadow"></div>
						</div>
						<h1 class="text-white text-bold mx-4 mb-15 text-2xl ">[player username]</h1>
						<a href="/profileOverview" class="mx-4 text-2xl mb-5 border p-4 text-[#798490]" name="profileLink" data-link>Update profile</a>
						<a id="logoutButton" class="mx-4 text-2xl mb-15 border p-4 cursor-pointer hover:text-[#dee9f4] hover:bg-[#882639] text-[#882639]" onclick=logoutUser() name="logoutButtonName">➜] Log out</a>
						<div class="self-start">
							<input class="sr-only peer" id="friendCheck" type="checkbox"/>
							<label for="friendCheck" class="text-2xl cursor-pointer px-3 py-2 select-none hover:text-[#98c6f8]">► Online friends</label>
							<ul class="select-none peer-checked:block hidden mt-3 self-start text-left" id="friendlist">
							<li><a class="text-xl pl-2">• Goug ?</a></li>
							<li><a class="text-xl pl-2">• Gougou ?</a></li>
							<li><a class="text-xl pl-2">• Gougougaga ?</a></li>
							</ul>
						</div>
					</div>
			</div>
			<div class="text-center ml-auto mr-auto pt-[5%]">
				<img class ="mx-auto mb-[75px]" id="logo" src="./img/sillyDog.gif">
				<form id="loginFormUser">
					<div class="content-center">
						<input id="clientUsername" tabindex="1" class="mx-auto text-white hover:text-[#98c6f8] text-ellipsis focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8] w-1/2 md:w-1/4 h-[35px] text-sm md:text-base rounded-sm border border-[#c2dbf6] pt-2 pb-[5px] pr-5 pl-5 mb-[25px]" name="playerUsername" value="" type="text" autofocus autocomplete="off" placeholder="Enter your login">
					</div>
					<div class="content-center">
						<input id="clientPassword" tabindex="2" class="mx-auto text-white hover:text-[#98c6f8] text-ellipsis focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8] w-1/2 md:w-1/4 h-[35px] text-sm md:text-base rounded-sm border border-[#c2dbf6] pt-2 pb-[5px] pr-5 pl-5 mb-[35px]" name="playerPassword" value="" type="password" autocomplete="off" placeholder="Enter your password">
					</div>
					<div class="">
						<input id="loginValidation" tabindex="3" class="uppercase text-sm md:text-base xl:text-2xl text-white focus:outline-none focus:border-[#98c6f8] hover:text-[#98c6f8] text-ellipsis w-1/2 md:w-1/4 border hover:border-[#98c6f8] border-white pt-2 pb-2 rounded-lg shadow-[0_0_20px_rgba(158,202,237,0.9)]" onclick="handleLoginClick(event)" name="login" type="submit" value="Sign In">
					</div>
					<a class="flex items-center justify-center px-5 h-full w-full text-sm mt-4" href="/newUserRegistration" data-link>New ? Create account</a>
					<p id="signInResult" class="mt-4 text-base"></p>
				</form>
			</div>
			`
	}
}