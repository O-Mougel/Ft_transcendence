import ViewTemplate from "./ViewTemplate.js";	

export default class extends ViewTemplate {
	constructor()
	{
		super();
		this.setTitle("Welcome !");
	}

	async getHTML() {
		return `
			<div class="pt-[3%]">
			</div>
			<div class="pt-[3%] flex flex-col gap-y-4 items-center mx-[3%]  rounded-xl outline-none border border-blue-300 bg-[url(/img/stars.gif)] bg-cover bg-center flex flex-col shadow-[0_0_20px_rgba(158,202,237,0.9)]">
				<h1>Profile Stats Page</h1>
				<div class="flex items-center">
					<h2 class="text-center">[username]</h2>
					<img src="./img/userPfp/default.png" alt="userPfpImg" class="pt-4 w-20 h-20 sm:w-[120px] sm:h-[120px] object-cover shrink-0" />
				</div>
				<div>
					<h2>Select a user to see his stats:</h2>
					<div class="flex w-full">
						<ul class="flex flex-wrap justify-between gap-4 w-full pt-4">
							<li class="w-[45%] sm:w-[30%] flex items-center justify-center border border-white rounded-lg">My stats</li>
							<li class="w-[45%] sm:w-[30%] flex items-center justify-center border border-white rounded-lg">Friend 1</li>
							<li class="w-[45%] sm:w-[30%] flex items-center justify-center border border-white rounded-lg">Friend 2</li>
							<li class="w-[45%] sm:w-[30%] flex items-center justify-center border border-white rounded-lg">Friend 3</li>
							<li class="w-[45%] sm:w-[30%] flex items-center justify-center border border-white rounded-lg">Friend 4</li>
							<li class="w-[45%] sm:w-[30%] flex items-center justify-center border border-white rounded-lg">Friend 5</li>
							<li class="w-[45%] sm:w-[30%] flex items-center justify-center border border-white rounded-lg">Friend 6</li>
							<li class="w-[45%] sm:w-[30%] flex items-center justify-center border border-white rounded-lg">My stats</li>
							<li class="w-[45%] sm:w-[30%] flex items-center justify-center border border-white rounded-lg">Friend 1</li>
							<li class="w-[45%] sm:w-[30%] flex items-center justify-center border border-white rounded-lg">Friend 2</li>
							<li class="w-[45%] sm:w-[30%] flex items-center justify-center border border-white rounded-lg">Friend 3</li>
						</ul>
					</div>
				</div>
				<div class="flex border border-white rounded-lg w-full p-4 gap-4 flex-wrap justify-between">
					<div class="flex flex-col flex-wrap">
						<p>Match played</p>
						<p>0</p>
					</div>
					<div class="flex flex-col flex-wrap">
						<p>Win ratio</p>
						<p>0%</p>
					</div>
					<div class="flex flex-col flex-wrap">
						<p>Highest score</p>
						<p>0</p>
					</div>
					<div class="flex flex-col flex-wrap">
						<p>Average score</p>
						<p>0</p>
					</div>
				</div>


				
			
			</div>`
	}
}