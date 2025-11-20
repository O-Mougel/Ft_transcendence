import ViewTemplate from "./ViewTemplate.js";	

export default class extends ViewTemplate {
	constructor()
	{
		super();
		this.setTitle("Welcome !");
	}

	async getHTML() {
		return `
		<div class="h-screen w-screen flex flex-col">
			<div class="relative h-[93%] w-full bg-gray-700 grow basis-full">
				<div id="profilePanel" class="hidden flex absolute right-0 top-0 h-full w-[15%] bg-[#897777] z-50 items-center justify-center">
                    GougouGaga ?
                </div>
                <div class="p-4">

                </div>
			</div>
		</div>`
	}
}