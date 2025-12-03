import ViewTemplate from "./ViewTemplate.js";	

export default class extends ViewTemplate {
	constructor()
	{
		super();
		this.setTitle("Welcome !");
	}

	async getHTML() {
		return `
			
			<div class="absolute inset-[3%] rounded-xl outline-none border border-blue-300 bg-[url(/img/stars.gif)] bg-cover bg-center flex flex-col shadow-[0_0_20px_rgba(158,202,237,0.9)]">
				<form class="py-[3%] px-[3%] ">
					<h2 class="flex items-start text-amber-50">► Choose your new username :</h2>
					<div class="flex items-start w-[50%] py-5">
						<input tabindex="1" class=" ml-4 text-white hover:text-[#98c6f8] text-ellipsis focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8] md:w-1/2 h-[35px] text-sm md:text-base rounded-sm border border-[#c2dbf6] pt-2 pb-[5px] pr-5 pl-5 mb-[25px]" name="newUsername" value="" type="text" autofocus autocomplete="off" placeholder="[old username]" aria-invalid>
					</div>
					<h2 class="flex items-start text-amber-50">► Choose your new profile picture :</h2>
					<div class="overflow-hidden h-[30%] flex items-center gap-4">
  						<img id="logo" src="./img/pipotam.gif" alt="logo" class="ml-5 mb-0" />
 						<input type="file" id="myfileSelector" name="fileSelector" class="hidden" />
						<label for="myfileSelector" class="border border-amber-50 ml-2 py-2 px-3 cursor-pointer">🗁 Select file</label>
					</div>
					<h2 class="flex items-start text-amber-50 pt-5">► Confirm your password :</h2>
					<div class="flex items-start w-[50%] pt-5">
						<input tabindex="2" class="  ml-4 text-white hover:text-[#98c6f8] text-ellipsis focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8] md:w-1/2 h-[35px] text-sm md:text-base rounded-sm border border-[#c2dbf6] pt-2 pb-[5px] pr-5 pl-5 mb-[35px]" name="confirmPassword" value="" type="text" autocomplete="off" placeholder="Enter your password" aria-invalid>
					</div>
					<div class="flex items-start w-[50%] pt-5">
						<input tabindex="3" class="uppercase text-sm md:text-base xl:text-2xl text-white focus:outline-none focus:border-[#98c6f8] hover:text-[#98c6f8] text-ellipsis md:w-1/2 border hover:border-[#98c6f8] border-white pt-2 pb-2 rounded-lg " name="updateChanges" type="submit" value=" 💾 Apply changes">
					</div>
				</form>
			</div>`
	}
}