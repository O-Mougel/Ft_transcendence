import ViewTemplate from "./ViewTemplate.js";	

export default class extends ViewTemplate {
	constructor()
	{
		super();
		this.setTitle("Select Modes");
	}

	async getHTML() {
		return `
			<div class="container">
			    <h1 id="heading">
			        PONG GAME
			    </h1>
			    <div class="game">
			        <canvas id="canvas" width="800" height="500"></canvas>
			        <p id="message"> </p>
			        <button id="startButton">
			            START
			        </button>
			    </div>
			    <form class="question-form">
			        <text style="font-size: 20px;">Ball color:</text>
			        <label class="checkbox-container"><input type="checkbox" name="ball-color" value="pink"><span class="checkmark"></span>pink</label>
			        <label class="checkbox-container"><input type="checkbox" name="ball-color" value="yellow"><span class="checkmark"></span>yellow</label>
			        <label class="checkbox-container"><input type="checkbox" name="ball-color" value="cyan"><span class="checkmark"></span>cyan</label>
			    </form>
			
			    <div class="ball-speed-control">
			        <label>Ball Speed</label>
			        <input type="range" id="ball-speed" name="ball-speed" min="0.5" max="2.5" value="1.0" step="0.1">
			        <span id="ball-speed-value">1.0</span>
			    </div>
			</div>
			<script src="./game/main.js" type="module"></script>
			`
	}
}