import ViewTemplate from "./ViewTemplate.js";	

export default class extends ViewTemplate {
	constructor()
	{
		super();
		this.setTitle("Select Modes");
	}

	async getHTML() {
		return `
	<div class="h-full flex w-full justify-center text-white">
		<div class="pt-5 flex flex-col gap-4 items-center">
			<canvas id="canvas" class="border-4 rounded-[2%] border-[#98c6f8] w-[64dvw] aspect-[16/10]"></canvas>
			<div id="GameOver" class="hidden absolute border-4 rounded-[10%] border-[#98c6f8] justify-center items-center p-4 mt-4">
				<div class="flex items-center">
					<span>Game Over</span>
				</div>
				<div class="flex justify-center items-center">					
					<span id="GameOverScore">0 - 0</span>
				</div>
			</div>
			<button id="startButton" class="px-6 py-3 bg-[#98c6f8] text-white font-bold rounded-lg hover:bg-[#7aaedc]">Start Game</button>
			
			<!-- Score row under the canvas -->
			<div id="Scores" class="flex justify-center items-center text-white font-bold hidden">
				<div class="flex items-center">
					<span>Left</span>
					<h3 class="p-4" id="ScoreLeft" value="0">0</h3>
				</div>
				<span></span>
				<div class="flex items-center">
					<h3 class="p-4" id="ScoreRight" value="0">0</h3>
					<span>Right</span>
				</div>
			</div>
		</div>

	</div>
	<script src="/game/main.js" type="module"></script>
			`
	}

	async init() {
		const module = await import("/game2/main.js");
		if (typeof module.initPong === "function") {
			module.initPong();
	}
  }
}