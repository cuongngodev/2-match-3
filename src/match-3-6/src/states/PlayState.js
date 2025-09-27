import { SoundName, StateName } from '../enums.js';
import { context, input, sounds, stateMachine, timer } from '../globals.js';
import { roundedRectangle } from '../../lib/Drawing.js';
import State from '../../lib/State.js';
import Board from '../objects/Board.js';
import Tile from '../objects/Tile.js';
import Input from '../../lib/Input.js';
import { getRandomPositiveInteger } from '../../lib/Random.js';

export default class PlayState extends State {
	constructor() {
		super();

		// Position in the grid which we're currently highlighting.
		this.cursor = { boardX: 0, boardY: 0 };

		// Tile we're currently highlighting (preparing to swap).
		this.selectedTile = null;

		this.level = 1;

		// Increases as the player makes matches.
		this.score = 0;

		// Score we have to reach to get to the next level.
		this.scoreGoal = 250;

		// How much score will be incremented by per match tile.
		this.baseScore = 5;
		this.scoreWhenHasStar = 65;
		// How much scoreGoal will be scaled by per level.
		this.scoreGoalScale = 1.25;
		this.hintCount = 3; // number of hints available
		/**
		 * The timer will countdown and the player must try and
		 * reach the scoreGoal before time runs out. The timer
		 * is reset when entering a new level.
		 */
		this.maxTimer = 6000;
		this.timer = this.maxTimer;
		this.secondIncrement = 2; // seconds added per match
		this.matchesInvisible = []
		this.isShowHint = false; // flag to indicate if hint need to show or not
		this.nextHint=0
		this.randomHintIndex;
	}

	enter(parameters) {
		this.board = parameters.board;
		this.score = parameters.score;
		this.level = parameters.level;
		this.scene = parameters.scene;
		this.timer = this.maxTimer;
		this.scoreGoal *= Math.floor(this.level * this.scoreGoalScale);

		this.startTimer();
		
	}

	exit() {
		timer.clear();
		sounds.pause(SoundName.Music3);
	}

	async update(dt) {
		this.scene.update(dt);
		this.checkGameOver();
		this.checkVictory();
		this.updateCursor();
		// If we've pressed enter, select or deselect the currently highlighted tile.
		if (input.isKeyPressed(Input.KEYS.ENTER) && !this.board.isSwapping) {
			this.selectTile();
		}
		
		if (input.isKeyPressed(Input.KEYS.H) && this.hintCount > 0) {// only allow hint when there is hint available
			this.randomHintIndex = getRandomPositiveInteger(0, this.matchesInvisible.length - 1);
			this.matchesInvisible = [] // reset previous hint
			this.isShowHint = true;
			await this.findMatch();
			this.hintCount <= 0 ? this.hintCount = 0 : this.hintCount--;
			// this.renderHint();

		}
		timer.update(dt);
	}
	
	render() {
		this.scene.render();
		this.board.render();

		if (this.selectedTile) {
			this.renderSelectedTile();
		}
		if (this.isShowHint && this.matchesInvisible.length > 0) {
			if(this.randomHintIndex){
			this.renderHint(this.randomHintIndex);
		}

		this.renderCursor();
		this.renderUserInterface();
		}
	}

	updateCursor() {
		let x = this.cursor.boardX;
		let y = this.cursor.boardY;

		if (input.isKeyPressed(Input.KEYS.W)) {
			y = Math.max(0, y - 1);
			sounds.play(SoundName.Select);
		} else if (input.isKeyPressed(Input.KEYS.S)) {
			y = Math.min(Board.SIZE - 1, y + 1);
			sounds.play(SoundName.Select);
		} else if (input.isKeyPressed(Input.KEYS.A)) {
			x = Math.max(0, x - 1);
			sounds.play(SoundName.Select);
		} else if (input.isKeyPressed(Input.KEYS.D)) {
			x = Math.min(Board.SIZE - 1, x + 1);
			sounds.play(SoundName.Select);
		}

		this.cursor.boardX = x;
		this.cursor.boardY = y;
	}
	
	
	selectTile() {
		const highlightedTile =
			this.board.tiles[this.cursor.boardY][this.cursor.boardX];

		/**
		 * The `?.` syntax is called "optional chaining" which allows you to check
		 * a property on an object even if that object is `null` at the time.
		 *
		 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining
		 */
		const tileDistance =
			Math.abs(this.selectedTile?.boardX - highlightedTile.boardX) +
			Math.abs(this.selectedTile?.boardY - highlightedTile.boardY);

		// If nothing is selected, select current tile.
		if (!this.selectedTile) {
			this.selectedTile = highlightedTile;
		}
		// Remove highlight if already selected.
		else if (this.selectedTile === highlightedTile) {
			this.selectedTile = null;
		} else if (tileDistance > 1) {
			/**
			 * If the difference between X and Y combined of this selected
			 * tile vs the previous is not equal to 1, also remove highlight.
			 */
			sounds.play(SoundName.Error);
			this.selectedTile = null;
		}
		// Otherwise, do the swap, and check for matches.
		else {
			this.isShowHint = false;
			this.swapTiles(highlightedTile);
		}
	}
async findMatch(){
		// start from the first tile and check all the board
		// x -> row increment y -> column increment
		// swap right (x+1)/down (y+1)
		// if match found return true -> save the position of the 2 tiles, and add to an array
		// else revert swap
		// when x>0, x < board.size - 1, y>0, y < board.size -1
		
		// start implementing here
		
		for (let x = 0; x < Board.SIZE; x++) {
			for (let y = 0; y < Board.SIZE; y++) {
				// swap right
				if (x < Board.SIZE - 1) {
					await this.board.swapTilesNoTween(
						this.board.tiles[y][x],
						this.board.tiles[y][x + 1]
					);
					this.board.calculateMatches();
					if (this.isMatch()) {
						this.matchesInvisible.push([this.board.tiles[y][x], this.board.tiles[y][x + 1]]);
					}
					await this.board.revertSwapNoTween(
						this.board.tiles[y][x + 1],
						this.board.tiles[y][x]
					);
				}
				// swap down
				if (y < Board.SIZE - 1) {
					await this.board.swapTilesNoTween(
						this.board.tiles[y][x],
						this.board.tiles[y + 1][x]
					);
					this.board.calculateMatches();
					if (this.isMatch()) {
						this.matchesInvisible.push([this.board.tiles[y][x], this.board.tiles[y + 1][x]]);
					}
					await this.board.revertSwapNoTween(
						this.board.tiles[y + 1][x],
						this.board.tiles[y][x]
					);
				}
			}
		}
	}
	async swapTiles(highlightedTile) {
		await this.board.swapTiles(this.selectedTile, highlightedTile);
		this.board.calculateMatches();

		if (!this.isMatch()) {
			// if there is no match , swap back
			await this.board.revertSwap(highlightedTile, this.selectedTile);
			sounds.play(SoundName.Error);
		} else {
			// process matches and falling tiles
			await this.calculateMatches();
		}
		this.selectedTile = null;
	}
	renderHint(hintIndex){
		context.save();
		context.fillStyle = 'rgb(255, 255, 255, 0.5)';
		const HINT_COUNT = 1; // number of hint to show
		let counter = 1;
		// get 2 hint at a time
		let hint = this.matchesInvisible[hintIndex]
			if(counter<=HINT_COUNT)	{
				roundedRectangle(
					context,
					hint[0].x + this.board.x,
					hint[0].y + this.board.y,
					Tile.SIZE,
					Tile.SIZE,
					10,
					true,
					false
				);
				roundedRectangle(
					context,
					hint[1].x + this.board.x,
					hint[1].y + this.board.y,
					Tile.SIZE,
					Tile.SIZE,
					10,
					true,
					false
				);
			}
			counter++;
				
		
	}
	renderSelectedTile() {
		context.save();
		context.fillStyle = 'rgb(255, 255, 255, 0.5)';
		roundedRectangle(
			context,
			this.selectedTile.x + this.board.x,
			this.selectedTile.y + this.board.y,
			Tile.SIZE,
			Tile.SIZE,
			10,
			true,
			false
		);
		context.restore();
	}

	renderCursor() {
		context.save();
		context.strokeStyle = 'white';
		context.lineWidth = 4;

		// Use board position * Tile.SIZE so that the cursor doesn't get tweened during a swap.
		roundedRectangle(
			context,
			this.cursor.boardX * Tile.SIZE + this.board.x,
			this.cursor.boardY * Tile.SIZE + this.board.y,
			Tile.SIZE,
			Tile.SIZE
		);
		context.restore();
	}

	renderUserInterface() {
		context.fillStyle = 'rgb(56, 56, 56, 0.9)';
		roundedRectangle(
			context,
			50,
			this.board.y,
			225,
			Board.SIZE * Tile.SIZE,
			5,
			true,
			false
		);

		context.fillStyle = 'white';
		context.font = '25px Joystix';
		context.textAlign = 'left';
		context.fillText(`Level:`, 70, this.board.y + 30);
		context.fillText(`Score:`, 70, this.board.y + 80);
		context.fillText(`Goal:`, 70, this.board.y + 130);
		context.fillText(`Timer:`, 70, this.board.y + 180);
		context.fillText(`Hint:`, 70, this.board.y + 230);
		context.textAlign = 'right';
		context.fillText(`${this.level}`, 250, this.board.y + 30);
		context.fillText(`${this.score}`, 250, this.board.y + 80);
		context.fillText(`${this.scoreGoal}`, 250, this.board.y + 130);
		context.fillText(`${this.timer}`, 250, this.board.y + 180);
		context.fillText(`${this.hintCount}`, 250, this.board.y + 230);
	}
	/**
	 * Checks if there is a match on the board.
	 * @returns boolean if there is any match on the board
	 */
	isMatch() {
		return this.board.matches.length != 0
	}
	/**
	 * Calculates whether any matches were found on the board and tweens the needed
	 * tiles to their new destinations if so. Also removes tiles from the board that
	 * have matched and replaces them with new randomized tiles, deferring most of this
	 * to the Board class.
	 */
	async calculateMatches() {
		// Get all matches for the current board.
		this.board.calculateMatches();

		// If no matches, then no need to proceed with the function.
		if (!this.isMatch()) {
			return null;
		}

		this.calculateScore();

		// Remove any matches from the board to create empty spaces.
		this.board.removeMatches();

		await this.placeNewTiles();

		/**
		 * Recursively call function in case new matches have been created
		 * as a result of falling blocks once new blocks have finished falling.
		 */
		await this.calculateMatches();
	}

	calculateScore() {

		this.board.matches.forEach((match) => {
			if(match.length > 5){
				this.score += this.scoreWhenHasStar;
			}else{
				this.score += match.length * this.baseScore;
			}
		});
	
		
		this.timer= this.timer+this.secondIncrement;
	}

	async placeNewTiles() {
		// Get an array with tween values for tiles that should now fall as a result of the removal.
		const tilesToFall = this.board.getFallingTiles();

		// Tween all the falling blocks simultaneously.
		await Promise.all(
			tilesToFall.map((tile) => {
				timer.tweenAsync(tile.tile, tile.endValues, 0.25);
			})
		);

		// Get an array with tween values for tiles that should replace the removed tiles.
		const newTiles = this.board.getNewTiles();

		// Tween the new tiles falling one by one for a more interesting animation.
		for (const tile of newTiles) {
			await timer.tweenAsync(tile.tile, tile.endValues, 0.1);
		}
	}

	startTimer() {
		// Decrement the timer every second.
		timer.addTask(() => {
			this.timer--;

			if (this.timer <= 5) {
				sounds.play(SoundName.Clock);
			}
		}, 1);
	}

	checkVictory() {
		if (this.score < this.scoreGoal) {
			return;
		}
		this.selectedTile = null;
		sounds.play(SoundName.NextLevel);

		stateMachine.change(StateName.LevelTransition, {
			level: this.level + 1,
			score: this.scoreGoal,
			scene: this.scene,
		});
	}

	checkGameOver() {
		if (this.timer > 0) {
			return;
		}

		sounds.play(SoundName.GameOver);

		stateMachine.change(StateName.GameOver, {
			score: this.score,
			scene: this.scene,
		});
	}
}
