
# Developer Log: Time Addition & Disallowing No-Match Swaps

## Features Implemented

**1. Time Addition**  
After reading the instructions and reviewing key parts of the codebase, I started by implementing the time addition feature. This was completed quickly and without major issues.

**2. Disallow No-Match Swaps**  
Next, I focused on preventing swaps that do not result in a match. I created a `revertTiles` function to revert a swap if no match is found, similar to the existing `swapTiles` function. During testing, I encountered an issue where both tiles (original and swapped) ended up with the same coordinates, causing them to overlap. I realized this was due to not updating the tile array correctly—I needed to save the positions before swapping to ensure proper placement.

## Pattern Generation

- Reviewed the code to understand how sprites, patterns, and tiles are generated.
- Created a function to generate tiles with a specific pattern, accepting a `TileColour` enum as a parameter.

## Challenges & Solutions

- **Reverting Tiles for No-Match Swaps:**  
Initially, the revert was triggered even when a match existed. I realized I needed to add else block after reverting if there is no match, so that it won't get calculatematch. Because even if there is match, and matching tile get destroy, then not adding else would result line 204,205 triggered in the next calculation.

- **Destroying Entire Row/Column for Star Matches:**  
When a match contained a star tile, I aimed to destroy the entire row or column. My initial implementation was inconsistent, especially when the match occurred at the end of a row or column. After further investigation, I realized I was checking for the star tile in the wrong part of the logic. The check should occur after confirming a full match of three tiles, not before.
