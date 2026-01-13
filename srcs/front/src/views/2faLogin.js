import ViewTemplate from "./ViewTemplate.js";	

export default class extends ViewTemplate {
	constructor()
	{
		super();
		this.setTitle("Login 2FA page");
	}

	async getHTML() {
		return `
			<div class="text-center ml-auto mr-auto pt-[5%] ">
				<h1 class="pb-4">2FA code below<h1>
				<form id="2FAFormUser flex flex-col items-center">
					<input class="text-center border border-white rounded-lg hover:text-[#98c6f8] hover:border-[#98c6f8]" type="text" id="2FACodeInput" value="" placeholder="Enter 2FA Code" pattern="[0-9]{6}" maxlength="6" oninput="this.value = this.value.replace(/\\D/g,'').slice(0,6)">
					<p id="codeResult"></p>
					<input class="pt-4" type="submit" value="Submit 2FA Code" onclick="loginWith2FACode(event)">
				</form>
			</div>`
	}
}