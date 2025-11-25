import ViewTemplate from "./ViewTemplate.js";	

export default class extends ViewTemplate {
	constructor()
	{
		super();
		this.setTitle("Welcome !");
	}

	async getHTML() {
		return `
			<div id="profilePanel" class="flex absolute right-0 top-0 h-full w-[15%] bg-[url(/img/stars.gif)] z-50 shadow-md border border-[#98c6f8] border border-[#98c6f8]">
					<div class="flex flex-col text-center w-full">
						<div class="grid h-[30%] place-items-center">
  							<div class="bg-[url(/img/sillyDog.gif)] bg-cover w-[50%] h-[50%] p-4 rounded-[50%] shadow"></div>
						</div>
						<h1 class="text-white text-bold h-1/5 text-4xl">Goofy ahh player</h1>
						<p class="text-white">Plaisantin</p>
						<p class="text-white">Wow what a great person</p>
						<button class="text-white">Click for stats !</button>
					</div>
			</div>
			<div class="text-center ml-auto mr-auto pt-[5%]">
			
				<img class ="mx-auto mb-[75px]" id="logo" src="./img/sillyDog.gif">
				<form>
					<div class="content-center">
						<input tabindex="1" class="mx-auto text-white hover:text-[#98c6f8] text-ellipsis focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8] w-1/2 md:w-1/4 h-[35px] text-sm md:text-base rounded-sm border border-[#c2dbf6] pt-2 pb-[5px] pr-5 pl-5 mb-[25px]" name="playerUsername" value="" type="text" autofocus autocomplete="off" placeholder="Enter your login" aria-invalid>
					</div>
					<div class="content-center">
						<input tabindex="2" class="mx-auto text-white hover:text-[#98c6f8] text-ellipsis focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8] w-1/2 md:w-1/4 h-[35px] text-sm md:text-base rounded-sm border border-[#c2dbf6] pt-2 pb-[5px] pr-5 pl-5 mb-[35px]" name="playerPassword" value="" type="text" autocomplete="off" placeholder="Enter your password" aria-invalid>
					</div>
					<div class="">
						<input tabindex="3" class="uppercase text-sm md:text-base xl:text-2xl text-white focus:outline-none focus:border-[#98c6f8] hover:text-[#98c6f8] text-ellipsis w-1/2 md:w-1/4 border hover:border-[#98c6f8] border-white pt-2 pb-2 rounded-lg " name="login" type="submit" value="Sign In">
					</div>
				</form>
			</div>`
	}
}