
# Developer Log: Time Addition & Disallowing No-Match Swaps & Star Tile & Show Hint

## AI Involvement
I use AI as an Reviewer for this assignment after having figured out the solution and implement by myself.

## Features Implemented

**1. Time Addition**  
After reading the instructions and reviewing key parts of the codebase, I started by implementing the time addition feature. This was completed quickly and without major issues.

**2. Disallow No-Match Swaps**  
Next, I focused on preventing swaps that do not result in a match. I created a `revertTiles` function to revert a swap if no match is found, similar to the existing `swapTiles` function. During testing, I encountered an issue where both tiles (original and swapped) ended up with the same coordinates, causing them to overlap. I realized this was due to not updating the tile array correctly—I needed to save the positions before swapping to ensure proper placement.

## 3 Pattern Generation & Star Tile

- Reviewed the code to understand how sprites, patterns, and tiles are generated.
- Created a function to generate tiles with a specific pattern, accepting a `TileColour` enum as a parameter.

## Challenges & Solutions

- **Reverting Tiles for No-Match Swaps:**  
Initially, the revert was triggered even when a match existed. I realized I needed to add else block after reverting if there is no match, so that it won't get calculatematch. Because even if there is match, and matching tile get destroy, then not adding else would result line 204,205 triggered in the next calculation.


**Destroying Entire Row/Column for Star Matches:**  
**Thoughts:**
To implement this feature, I started by iterating through the board to check for matches. For each tile, I considered both horizontal (right) and vertical (down) swaps. If a match was found, I checked if any tile in the match contained a star. If so, I marked the entire row or column for destruction.

**Implementation:**
- Loop through all tiles on the board.
- For each tile, attempt to swap right and down, then check for matches.
- If a match is found, check if any tile in the match contains a star.
- If a star is present, add all tiles in the corresponding row or column to the destruction list.
- Revert the swap if no match is found.

**Challenges:**
- My initial implementation did not consistently destroy the correct row or column, especially when the match occurred at the edge of the board.
- I realized the star check must happen after confirming a full match (at least three tiles), not before.
- Edge cases required careful handling to avoid out-of-bounds errors and ensure all relevant tiles were destroyed.

## 4. Show Hint
It was not the tricky one but it takes a lot of carefulness. I was going to implement to see animation of each tiles tweening but I am was not patient to implement that so I just implement the logic associate to the psudocode. 
I created another 2-functions (swapTileNoTween, revertTileNoTween) for the function findMatchesOnTheAir() (PlayState.js).

The steps are:
- I loop through all adjacent tile pair, and check its right and down neighbor (to avoid duplicate checks)
- Temporarily swap the tiles in memory to check if match exists.
- Then Revert the swap back to the original positions
- I save all the tile pair resulting a match in an array for later use.

After testing using everything and recieve the array with the right pair tiles in `matchesInvisible`. I easily implement the highlight and show it to user when pressing `H`. 
