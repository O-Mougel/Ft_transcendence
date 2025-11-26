import ViewTemplate from "./ViewTemplate.js";	

export default class extends ViewTemplate {
	constructor()
	{
		super();
		this.setTitle("Welcome !");
	}

	async getHTML() {
		return `
			
			<div class="w-full h-full bg-[url(/img/stars.gif)] bg-cover bg-center flex flex-col focus:outline-none focus:border-[#9ecaed] focus:ring-4 focus:ring-[#9ecaed]">
				<form class="pt-20 ">
					<h2 class="flex items-start">Current username : Goug</h2>
					<div class="flex items-start w-[50%] pt-5">
						<input tabindex="1" class=" text-white hover:text-[#98c6f8] text-ellipsis focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8] md:w-1/2 h-[35px] text-sm md:text-base rounded-sm border border-[#c2dbf6] pt-2 pb-[5px] pr-5 pl-5 mb-[25px]" name="newUsername" value="" type="text" autofocus autocomplete="off" placeholder="Enter new username" aria-invalid>
					</div>
					<h2 class="flex items-start">Current profile picture :</h2>
					<label for="myfile">Select a file:</label>
						<input type="file" id="myfile" name="myfile">
					<div class="flex items-start w-[50%] pt-5">
						<input tabindex="2" class=" text-white hover:text-[#98c6f8] text-ellipsis focus:outline-none focus:border-[#98c6f8] hover:border-[#98c6f8] md:w-1/2 h-[35px] text-sm md:text-base rounded-sm border border-[#c2dbf6] pt-2 pb-[5px] pr-5 pl-5 mb-[35px]" name="confirmPassword" value="" type="text" autocomplete="off" placeholder="Enter your password" aria-invalid>
					</div>
					<div class="flex items-start w-[50%] pt-5">
						<input tabindex="3" class="uppercase text-sm md:text-base xl:text-2xl text-white focus:outline-none focus:border-[#98c6f8] hover:text-[#98c6f8] text-ellipsis md:w-1/2 border hover:border-[#98c6f8] border-white pt-2 pb-2 rounded-lg " name="updateChanges" type="submit" value="Save changes">
					</div>
				</form>
			</div>`
	}
}