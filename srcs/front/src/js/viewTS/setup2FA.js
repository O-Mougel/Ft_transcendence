import ViewTemplate from "./ViewTemplate.js";
export default class Setup2FAView extends ViewTemplate {
    constructor() {
        super();
        this.setTitle("2FA Setup !");
    }
    async getHTML() {
        return `

			<div class="absolute inset-[3%] rounded-xl outline-none border border-blue-300 bg-[url(/img/assets/stars.gif)] bg-cover bg-center flex flex-col shadow-[0_0_20px_rgba(158,202,237,0.9)]">
				<div class="pt-[3%] flex justify-center flex-col items-center gap-5">
					<h1>Two authentication factor setup</h1>
					<div id="2FAActivated" class="hidden flex-col">
						<h1>status :</h1>
						<p class="pl-2 text-green-500">[enabled]</p>
						<div class="pt-4 flex flex-col items-center">
							<p class="pb-5">If you want to disable 2FA, please click the button below :</p>
							<input onclick="disable2FA()" type="button" value="disable 2FA" class="px-5 pb-1 sm:pb-2 focus:outline-none focus:border-[#98c6f8] hover:text-[#98c6f8] text-ellipsis border hover:border-[#98c6f8] border-white rounded-lg cursor-pointer">
							<a class="uppercase p-5 my-5 focus:outline-none focus:border-[#98c6f8] hover:text-[#98c6f8] text-ellipsis border hover:border-[#98c6f8] border-white rounded-lg" name="gotoMainMenu" href="/" data-link>🚀 Back to menu</a>
						</div>
					</div>

					<div id="2FADisabled" class="hidden flex-col">
						<h1>status :</h1>
						<p class="pl-2 text-red-500">[disabled]</p>
						<div class="pt-4 flex flex-col items-center">
							<h2 class="flex w-full text-center">Scan a generated QR code below with your authenticator app :</h2>
							<div class="pt-4">
								<input class="px-5 pb-1 sm:pb-2 focus:outline-none focus:border-[#98c6f8] hover:text-[#98c6f8] text-ellipsis border hover:border-[#98c6f8] border-white rounded-lg cursor-pointer disabled:cursor-not-allowed" type="button" id="showQRCodeButton" value="Generate QR code" onclick="showQRCode(event)">
							</div>
							<div id="qrCodeSection" class="hidden flex-col align-center items-center pt-4 mb-5">
								<img id="qrCodeImage" class="hidden aspect-square w-60" src="" alt="QR Code will appear here select-none" draggable="false" />
								<input class="text-center my-5 px-5 pb-1 sm:pb-2 focus:outline-none focus:border-[#98c6f8] hover:text-[#98c6f8] text-ellipsis border hover:border-[#98c6f8] border-white rounded-lg cursor-pointer disabled:cursor-not-allowed" type="text" id="2FACodeInput" value="" placeholder="Enter 2FA Code" pattern="[0-9]{6}" maxlength="6" oninput="this.value = this.value.replace(/\\D/g,'').slice(0,6)">
								<input class="px-5 pb-1 sm:pb-2 focus:outline-none focus:border-[#98c6f8] hover:text-[#98c6f8] text-ellipsis border hover:border-[#98c6f8] border-white rounded-lg cursor-pointer disabled:cursor-not-allowed" type="submit" value="Submit 2FA Code" onclick="validate2FACode(event)">
							</div>
							<a class="uppercase p-5 my-5 focus:outline-none focus:border-[#98c6f8] hover:text-[#98c6f8] text-ellipsis border hover:border-[#98c6f8] border-white rounded-lg" name="gotoMainMenu" href="/" data-link>🚀 Back to menu</a>
						</div>
					</div>
				</div>
			</div>`;
    }
}
