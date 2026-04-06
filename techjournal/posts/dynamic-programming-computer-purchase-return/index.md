---
title: "Dynamic Programming: Computer Purchase Return"
date: 2026-04-06
draft: false
categories:
  - thinking_algorithmically
  - dynamic_programming
keywords:
---
## Computer Purchase Return
- ❓[Problem](https://dmoj.ca/problem/cco10p4)
- 💡[My Solution - Recursion](https://github.com/pmesgari/thinking-algorithmically/blob/main/dynamic_programming/computer_purchase_return.c)
- 💡[My Solution - Dynamic Programming](https://github.com/pmesgari/thinking-algorithmically/blob/main/dynamic_programming/computer_purchase_return_dp.c)

This is a constrained Knapsack problem. Given a budget $B$, we must assemble a computer using exactly one component of each type $T$ to maximize the total generated value.

### The Mental Model: Recursion vs. Iteration

Recursion brute-forces the problem by evaluating all combinations. Translating this directly to an iterative approach is mathematically difficult: you need a dynamic number of `for` loops based on the number of component types. 

Think of recursion as a combination lock. You fix the first slot, spin the second, then the third. Each slot is a nested loop in an iterative solution, or a level in the recursion tree. Dynamic programming bypasses this combinatorial explosion by building solutions incrementally.

### The Code Transition

A naive recursive approach tests every part and moves to the next type. Memoization speeds this up by caching results. Dynamic programming flips the script entirely, building a 2D table `dp[budget][type]` from the bottom up.

```c
for (int i = 1; i <= B; i++) {
    for (int j = 1; j <= T; j++) {
        int best_val = -1;
        for (Node* part = parts[j]; part != NULL; part = part->next) {
            // Ensure we have budget, and the previous sub-computer is valid
            if (i - part->cost >= 0 && dp[i - part->cost][j - 1] >= 0) {
                int val = dp[i - part->cost][j - 1] + part->val;
                if (val > best_val) best_val = val;
            }
        }
        dp[i][j] = best_val;
    }
}
```

Two critical checks happen during the transition:
1. **Budget Check:** We cannot spend money we don't have (`i - part->cost >= 0`).
2. **Validity Check:** The previous state must be valid (`dp >= 0`), meaning a complete sub-computer was successfully built with the remaining budget.

### The "Aha!" Moment: Tree vs. Table

When transitioning from recursion to dynamic programming, the intermediate values seem to swap places. Let's trace a winning path where a starting budget of `16` yields a maximum total value of `18`.

**In the Recursion Tree (Top-Down):**
You start with `16` budget. You buy a Component 1 part costing `5` (value `7`).
You ask the tree: *"What is the best value I can get with my remaining `11` budget?"*
The tree evaluates the remaining components and returns `11`.
Total Value = 7 (locked in) + 11 (from the child) = 18.

**In the DP Table (Bottom-Up):**
You have `16` budget. You are evaluating a Component 2 part costing `11` (value `11`).
You ask the table: *"What was my best value when I had only spent `5`?"*
The table looks back at `dp[5][1]` and returns `7`.
Total Value = 7 (from the past) + 11 (current part) = 18.

The reason the numbers feel disconnected is directionality. The recursion tree node tells you **what is left to gain**. The DP cell tells you **what has already been gained**. 

They execute the exact same mathematical steps, just walking in opposite directions on the timeline.