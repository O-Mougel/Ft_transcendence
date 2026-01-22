import ViewTemplate from "./ViewTemplate.js";

export default class extends ViewTemplate {

	constructor() {
		super();
		this.setTitle("Tournament");
	}

	async getHTML() {
	return `
		<div class="h-full w-full flex justify-center text-white">
		<div class="pt-10 w-[70%] flex flex-col gap-6">
			<h1 class="text-3xl font-bold text-center">Tournament</h1>
			<div class="flex justify-between items-center border border-[#98c6f8] rounded-lg p-4 bg-black/30">
				<div class="flex gap-3">
					<button id="nextMatchBtn" class="px-6 py-3 bg-[#98c6f8] text-white font-bold rounded-lg hover:bg-[#7aaedc]">Start next match</button>
					<button id="quitButton" class="px-6 py-3 bg-transparent border border-red-500 text-red-500 font-bold rounded-lg hover:bg-white/10">Quit</button>
				</div>
			</div>
			<div id="statusBox" class="border border-[#98c6f8] rounded-lg p-4 bg-black/30">
			<div class="text-sm text-[#98c6f8]">Status</div>
			<div id="tournamentStatus" class="text-lg">Waiting for tournament state...</div>
			<div id="currentMatch" class="mt-2 text-lg"></div>
			<div id="winnerLine" class="mt-2 text-xl font-bold hidden"></div>
			</div>

          <div class="border border-[#98c6f8] rounded-lg p-4 bg-black/30">
            <div class="text-sm text-[#98c6f8] mb-3">Bracket</div>
            <div id="bracket" class="grid gap-4"></div>
          </div>
        </div>
      </div>
    `;
  }

	async init() {
	 	const module = await import("/game/tournament.js");
   	if (typeof module.initTournament === "function") {
    	module.initTournament();
   	}
  }
}
