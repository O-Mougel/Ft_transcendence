import ViewTemplate from "./ViewTemplate.js";	

export default class extends ViewTemplate {
	constructor()
	{
		super();
		this.setTitle("Select Modes");
	}

	async getHTML() {
		return `

		<div class="h-screen w-screen flex flex-col">
			<div class="h-[93%] w-full grow basis-full">
				<div class="h-full w-full flex">
					<div class="flex-1 rounded-xl box-border border-10 bg-[url(/img/vsIAClean.jpg)] bg-cover grayscale-85 hover:grayscale-0 blur-[5px] hover:blur-[0px] transition duration-400 ease-in-out   flex items-center justify-center ">
						<!-- <div class="w-1/3 h-1/4 bg-[#4d408f] flex items-center justify-center border border-black">Versus AI</div>  --> </div>
					<div class="flex-1 rounded-xl">
						<div class="flex-1 h-1/2 rounded-xl box-border border-10 bg-[url(/img/vsLogged.jpg)] bg-cover grayscale-85 hover:grayscale-0 blur-[5px] hover:blur-[0px] transition duration-400 ease-in-out  flex items-center justify-center"></div>
						<div class="flex-1 h-1/2 rounded-xl box-border border-10 bg-[url(/img/vsUnlogged2.png)] bg-cover grayscale-85 hover:grayscale-0 blur-[5px] hover:blur-[0px] transition duration-400 ease-in-out  flex items-center justify-center"></div>
					</div>
				</div>
			</div>
		</div>`
	}
}