---
title: Advent of Code 2025 Summary
date: 2025-12-13
draft: false
tags:
  - math
  - problem-solving
  - algorithms
keywords:
---
# Advent of Code 2025: A Developer's Recap

Advent of Code 2025 brought a fresh batch of algorithmic challenges, ranging from simple list manipulations to complex constraint satisfaction problems.

This year, I focused  on optimizing runtime and learning new techniques like Bitmasking and Constraint Solvers. Here is a recap of my solutions, approaches, and the key lessons learned from the first half of the event.

You can find my solutions at [Advent of Code 2025](https://github.com/pmesgari/adventofcodde/blob/main/2025/README.md)

## The Optimization Journey

One of the most satisfying parts of AoC is taking a solution that "works" and making it "fast".

### Day 2: The Gift Shop

Day 2 was a classic example of "generating vs. checking". The problem asked us to identify numbers with repeating patterns within large ranges. My initial approach for Part 2 reused the logic from Part 1: iterating through every number in the range and checking if it had a repeating pattern. It worked, but it took **8 seconds**.

I realized that instead of checking millions of numbers, I could just **generate** the valid patterns. Since I knew the maximum value in the ranges, I generated "atomic seeds" (e.g., `1`, `12`) and repeated them to form valid IDs (`11`, `1111`, `1212`). This inverted the problem and brought the runtime down to **0.20 seconds**.

### Day 4: Printing Department

This was a grid problem involving removing items based on neighbor counts.

- **Part 1**: Simple iteration over the grid. $O(NM)$.
- **Part 2**: Required removing items until stability. A naive approach would scan the whole grid repeatedly ($O(NMK)$). I optimized this by using a **Queue**. I performed an initial scan to find removable items, added them to a queue, and then only processed the neighbors of removed items. This kept the runtime linear relative to the grid size ($O(NM)$).

## Algorithmic Highlights

### Day 5: Merging Intervals (Cafeteria)

Part 2 required finding "fresh ingredients" based on ranges. Instead of iterating through individual IDs (which would be slow for large ranges), I treated this as an **Interval Merging** problem. By sorting the ranges by their start point, I could iterate through them once, merging overlapping intervals or identifying gaps. This is a classic $O(N \log N)$ approach (due to sorting) that makes range-based problems trivial.

### Day 8: Union-Find (Playground)

We needed to merge junction boxes into circuits. Whenever I see "grouping" or "connected components," I immediately reach for the **Union-Find (Disjoint Set Union)** data structure. I implemented a `UF` class to manage the sets. For Part 2, I simply ran the union operations until the number of disjoint sets dropped to 1, guaranteeing everything was connected.

### Day 11: Caching & Graph Traversal (Reactor)

This was a path-counting problem. Part 1 was small enough for a simple recursive DFS. However, Part 2 exploded the search space. I used Python's `functools.cache` to memoize the results of my recursive function `_count_paths`. This turned an exponential $O(2^V)$ problem into a linear $O(V+E)$ traversal.

## The Heavy Hitters

### Day 9: Computational Geometry (Movie Theater)

Part 2 asked us to find valid rectangles defined by red tiles that didn't contain other specific tiles. I initially considered a Dynamic Programming approach with a 2D prefix sum table. However, the coordinate space was massive ($100,000 \times 100,000$), which would have consumed ~10GB of RAM.

I pivoted to a **pure geometric solution**. I defined rules to validate a rectangle:

1. Does it cross any boundary segments?
2. Is it trapped inside a boundary (hollow shape)?
3. Are there boundary segments inside it?

By normalizing segments and using a "point + 0.5" trick for inside/outside checks, I avoided floating-point precision issues and memory limits.

### Day 10: Constraint Solving with Z3 (Factory)

This puzzle involved toggling lights to reach a target state—essentially a system of linear equations. While Gaussian Elimination is the standard mathematical approach, I decided to use **Z3**, a theorem prover from Microsoft Research.

I defined the button presses as integer variables and added constraints for the target states.

Z3 handled the heavy lifting for both Part 1 (modulo 2 arithmetic) and Part 2 (exact integer matching).

### Day 12: Learning Bitmasking (Christmas Tree Farm)

This was my biggest learning moment of 2025. It was my first encounter with bitmasking technique and I do not take credits for the solution. Because I used Gemini as a helper to teach me bitmasking and help me reach a final solution.

The problem involved fitting shapes into a region (Polyomino tiling). I used **Bitmasking** to represent the grid and the shapes as integers. This allows checking for collisions or placing pieces using CPU-level bitwise operations, which are incredibly fast.

- **Collision**: `(grid & piece) != 0`
- **Place**: `grid | piece`
- **Remove**: `grid ^ piece`

This technique, combined with a recursive backtracking solver, made the solution elegant and highly performant.

## Summary

Advent of Code 2025 has been a fantastic exercise in choosing the right tool for the job. Whether it was swapping a brute-force loop for a generator, using a specialized library like Z3, or learning low-level bit manipulation, each day offered a unique lesson.

You can find the full code for these solutions on my [GitHub repository](https://github.com/pmesgari/adventofcodde/blob/main/2025/README.md).

Happy Coding!