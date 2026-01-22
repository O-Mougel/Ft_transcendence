import ViewTemplate from "./ViewTemplate.js";
export default class extends ViewTemplate {
    constructor() {
        super();
        this.setTitle("Login 2FA page");
    }
    async getHTML() {
        return `
			<div class="text-center ml-auto mr-auto pt-[5%] ">
				<h1 class="pb-4">Enter your 2FA code below</h1>
				<form id="2FAFormUser" class="flex flex-col items-center">
					<input autofocus tabindex="1" class="text-center border border-white rounded-lg hover:text-[#98c6f8] hover:border-[#98c6f8]" type="text" id="2FACodeInput" value="" placeholder="Enter 2FA Code" pattern="[0-9]{6}" maxlength="6" oninput="this.value = this.value.replace(/\\D/g,'').slice(0,6)">
					
					<input class="mt-4 px-5 pb-1 sm:pb-2 focus:outline-none focus:border-[#98c6f8] hover:text-[#98c6f8] text-ellipsis border hover:border-[#98c6f8] border-white rounded-lg cursor-pointer" type="submit" value="Submit 2FA Code" onclick="loginWith2FACode(event)">
				</form>
				<div class="pt-14">
					<a id="backToMenuButton" href="/" class="inline uppercase text-sm md:text-base xl:text-2xl focus:outline-none focus:border-[#98c6f8] hover:text-[#98c6f8] text-ellipsis w-1/2 md:w-1/4 border hover:border-[#98c6f8] border-white py-2 px-4 rounded-lg shadow-[0_0_20px_rgba(158,202,237,0.9)]" name="backtomenuButton" data-link> 🚀 Back to menu </a>
				</div>
			</div>`;
    }
}
