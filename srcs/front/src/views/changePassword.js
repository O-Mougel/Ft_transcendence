import ViewTemplate from "./ViewTemplate.js";	

export default class extends ViewTemplate {
	constructor()
	{
		super();
		this.setTitle("Change Password");
	}

	async getHTML() {
		return `
			<div class="pt-[3%]">
			</div>
			<div class="pt-[3%] flex flex-col gap-y-4 items-center mx-[3%] px-4 rounded-xl outline-none border border-blue-300 bg-[url(/img/assets/stars.gif)] bg-cover bg-center shadow-[0_0_20px_rgba(158,202,237,0.9)]">
				<h1 class="pb-4">Change your password</h1>
				<form class="flex flex-col items-center">
					<label class="mb-2">Current Password :</label>
					<input autofocus tabindex="1" class="w-full text-center border border-white rounded-lg hover:text-[#98c6f8] hover:border-[#98c6f8]" type="password" id="currentPasswordInput" value="" placeholder="Current password">
					
					<label class="mt-4 mb-2">New Password :</label>
					<input autofocus tabindex="2" class="w-full text-center border border-white rounded-lg hover:text-[#98c6f8] hover:border-[#98c6f8]" type="password" id="newPasswordInput" value="" placeholder="New password">
					
					<label class="mt-4 mb-2">Confirm New Password :</label>
					<input autofocus tabindex="3" class="w-full text-center border border-white rounded-lg hover:text-[#98c6f8] hover:border-[#98c6f8]" type="password" id="confirmNewPasswordInput" value="" placeholder="Confirm new password">
					<input id="changePasswordButton" class="mt-4 px-5 pb-1 sm:pb-2 focus:outline-none focus:border-[#98c6f8] hover:text-[#98c6f8] text-ellipsis border hover:border-[#98c6f8] border-white rounded-lg cursor-pointer" type="submit" value="Change Password" onclick="updateUserPassword(event)">
				</form>
				<div class="pt-5">
					<a id="backToMenuButton" href="/" class="inline uppercase text-sm md:text-base xl:text-2xl focus:outline-none focus:border-[#98c6f8] hover:text-[#98c6f8] text-ellipsis w-1/2 md:w-1/4 border hover:border-[#98c6f8] border-white py-2 px-4 rounded-lg shadow-[0_0_20px_rgba(158,202,237,0.9)]" name="backtomenuButton" data-link> 🚀 Back to menu </a>
				</div>
				<div class="pb-7">
				</div>
			</div>`
	}
}