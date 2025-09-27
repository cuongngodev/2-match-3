I chose to implement Time addition and Disallow no-match swaps

After reading the instructions and skimming though some important codes, I started by implement Time addition features, I quickly done and move on to Disallow No-match swaps features. I figured that creating a function revertTiles after a swap if there is no match. Similar to swapTiles function, but this time I encounter the issue where It needs to update the tiles correctly array after swap, After sometime testing and found out I have both tiles (original and swapped) end up with the same cordinates, so they are placed at the same spot. I know that I didn't update the array correctly because I didn't save the position before swapping. 

Generating parttern
- I read the code to understand how sprites, pattern and tiles are generated
- Create function to create tiles with specific pattern. Takes a TileColour emum as a parameter

Challenges:
- After revert the tile for disallow no-match swaps, the revert is still trigger even though there is match. I thought I need a condition to not let it revert eveytime this.board.calculateMatches() is called. I found out that it exist the property isSwapping in the Board, that's what I need. Eventually, I just re-correct the status of isSwapping to true after it reverts, so that the next loop the game won't call SelectFile (line 66,67 PlayState.js) as the result swapFile won't get called.
