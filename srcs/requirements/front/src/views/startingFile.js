import ViewTemplate from "./ViewTemplate.js";	

export default class extends ViewTemplate {
	constructor()
	{
		super();
		this.setTitle("Welcome !");
	}

	async getHTML() {
		return `
			<div class="min-h-screen w-screen bg-[url(/img/starField.gif)] bg-cover bg-center backdrop-blur-[10px] pt-35 text-center ml-auto mr-auto">
				<img class ="mx-auto mb-[75px]" id="logo" src="./img/sillyDog.gif">
				<form>
					<div class="content-center">
						<input tabindex="1" class="mx-auto text-white hover:text-[#98c6f8] text-ellipsis focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8] w-1/2 md:w-1/4 h-[35px] text-sm md:text-base rounded-sm border border-[#c2dbf6] pt-2 pb-[5px] pr-5 pl-5 mb-[25px]" name="playerUsername" value="" type="text" autofocus autocomplete="off" placeholder="Enter your login" aria-invalid>
					</div>
					<div class="content-center">
						<input tabindex="2" class="mx-auto text-white hover:text-[#98c6f8] text-ellipsis focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8] w-1/2 md:w-1/4 h-[35px] text-sm md:text-base rounded-sm border border-[#c2dbf6] pt-2 pb-[5px] pr-5 pl-5 mb-[35px]" name="playerPassword" value="" type="text" autocomplete="off" placeholder="Enter your password" aria-invalid>
					</div>
					<div class="">
						<input tabindex="3" class="uppercase text-sm md:text-base xl:text-2xl text-white focus:outline-none focus:border-[#98c6f8] hover:text-[#98c6f8] text-ellipsis w-1/2 md:w-1/4 font-bold border hover:border-[#98c6f8] border-white pt-2 pb-2 rounded-lg " name="login" type="submit" value="Sign In">
					</div>
					<a href="/modes" data-link>Click for modes !</a>
					<a href="/nav" data-link>Click for nav !</a>
				</form>
			</div>`
	}
}