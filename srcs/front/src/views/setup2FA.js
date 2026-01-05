import ViewTemplate from "./ViewTemplate.js";	

export default class extends ViewTemplate {
	constructor()
	{
		super();
		this.setTitle("2FA Setup !");
	}

	async getHTML() {
		return `
			
			<div class="absolute inset-[3%] rounded-xl outline-none border border-blue-300 bg-[url(/img/stars.gif)] bg-cover bg-center flex flex-col shadow-[0_0_20px_rgba(158,202,237,0.9)]">
				<div class="pt-[3%] flex justify-center flex-col items-center gap-5">
					<h1>Two authentication factor setup</h1>
					<div id="2FAActivated" class="hidden flex-col">
						<h1>status :</h1>
						<p class="pl-2 text-green-500">[enabled]</p>
						<div class="pt-4">
							<p>If you want to disable 2FA, please click the button below :</p>
							<input onclick="disable2FA()" type="button" value="Button to disable 2FA">
						</div>
					</div>
					
					<div id="2FADisabled" class="hidden flex-col">
						<h1>status :</h1>
						<p class="pl-2 text-red-500">[disabled]</p>
						<div class="pt-4 flex flex-col items-center">
							<h2 class="flex items-start w-full text-left">Scan this QR code with your authenticator app :</h2>
							<input type="button" value="Enable 2FA" onclick="showQRCode(event)">
							<img id="qrCodeImage" class="pt-4 hidden" src="" alt="QR Code will appear here">
							<form class="" onsubmit="">
								<input type="number" id="2FACodeInput" value="" placeholder="Enter 2FA Code">
								<p id="codeResult"></p>
								<input type="submit" value="Validate 2FA Code" onclick="validate2FACode(event)">

							</form>
						</div>
					</div>
				</div>
			</div>`
	}
}