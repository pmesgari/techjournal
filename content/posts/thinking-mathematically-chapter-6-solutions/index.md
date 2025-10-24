---
title: "Thinking Mathematically: Chapter 6 Solutions"
date: 2025-10-20
draft: false
tags:
  - math
  - problem-solving
keywords:
---

## Cut-away

>[!info] Cut-away
>Two diagonally opposite corners of a chessboard are removed. Can you cover the remaining board with dominoes each of which covers two squares?

### Entry

I looked into the problem and did a few examples (**Specializing**). I had several questions:

- Why can I not cover the last two?    
- Why the problem is asking for diagonal corners? Is it position? Is it being same coloured?
- Do we always end up with two tiles uncovered? _Initially thought opposite colors of removed, need to check this._
- Feels like there is some sort of carry over effect.

#### What do I KNOW?
- An 8x8 chessboard has 64 squares, 32 white (W) and 32 black (B). 
- Diagonally opposite corners have the same color. 
- Removing two diagonally opposite corners leaves 62 squares.
- If 2W corners are removed, 30W and 32B remain. 
- If 2B corners are removed, 32W and 30B remain. 
- A domino covers two adjacent squares. 
- Adjacent squares have opposite colors.

#### What do I WANT?

To determine if the 62 remaining squares can be perfectly covered by 31 dominoes.
### Attack

My examples always left two squares uncovered, and they were non-adjacent. I couldn't see how to connect non-adjacency to why it was impossible. **STUCK!**

Let's re-examine the colors.

- The key insight is: **A domino will always cover two cells of opposite colors** (one white, one black).
- Removing two corners changes the balance of colors. Since they are the _same_ color, we have an imbalance: 30 of one color, 32 of the other. Let's assume black corners were removed, leaving 32W and 30B.

**AHA!**

- To cover 62 squares requires 31 dominoes (62 / 2 = 31).
- Each domino _must_ cover 1W and 1B square.
- Therefore, 31 dominoes _must_ cover exactly 31W and 31B squares.
- But the remaining board _doesn't have_ 31 of each color. It has 32W and 30B (or vice versa).
- The number of squares of each color needed by the dominoes doesn't match the number available.
- **Conjecture:** It's impossible to cover the remaining board.

**Justification:**

1. A standard 8x8 board has 32 white and 32 black squares. Diagonally opposite corners are the same color.
2. Removing two diagonally opposite corners leaves 62 squares, consisting of 30 squares of one color and 32 of the other.
3. Each domino covers exactly two adjacent squares, which must be one white and one black.
4. To cover the 62 squares would require 31 dominoes.
5. These 31 dominoes must cover exactly 31 white squares and 31 black squares.
6. This contradicts point 2, as the board does not have 31 squares of each color remaining.
7. Therefore, covering the board is impossible.

### Review

The **key idea** was realizing the importance of the color imbalance caused by removing two squares of the _same_ color, combined with the fact that each domino _must_ cover squares of _opposite_ colors. My initial focus on the position of the leftover squares was misleading. The **key moment** was connecting the color requirement of _one_ domino to the total color requirement of _all_ dominoes needed and comparing it to the actual colors available on the modified board.