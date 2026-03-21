---
title: "Recursion: Geppetto"
date: 2026-02-07
draft: false
categories:
  - thinking_algorithmically
  - programming, algorithms
  - recursion
keywords:
---
## Geppetto
❓[Problem](https://dmoj.ca/problem/coci15c2p2)
💡[My Solution](https://github.com/pmesgari/thinking-algorithmically/blob/main/recursion/geppetto.c)

In the previous article we showed the algorithm for assigning items to specific slots using backtracking. Now, we try to find the total number of valid subsets and drop the requirement that every item must be assigned.

### The Problem

Given $N$ ingredients and $M$ constraints, find the total number of valid pizzas that can be created. A constraint is a pair of ingredients $u$ and $v$ that cannot be placed on the same pizza. A valid pizza is any subset of the $N$ ingredients where no two ingredients violate a constraint. An empty pizza is considered valid.

### The Approach: Include or Exclude

We must transition from a "slot-filling" approach to an "include or exclude" approach, altering how we manage state.

1. **Subset Selection:** The recursive function must evaluate every ingredient sequentially. For any given `ingredient_id`, there are exactly two choices: skip it, or take it.
    - For the "skip" branch, we move to `ingredient_id + 1` and accumulate the count. This is always a valid move.
    - For the "take" branch, we must first verify if adding the current ingredient violates any constraints with the ingredients we have already selected.
        
2. **Explicit Cleanup:** The reset term within the "take" branch provides strict state isolation. When we commit to an ingredient (`taken[ingredient_id] = 1`), we pass this shared array state down the recursive tree. After the recursive call returns, the `taken` array must be reverted back to `0`. This ensures that parallel branches in the recursion tree do not contaminate each other, as subsets containing the ingredient are evaluated separately from subsets excluding it.
    
3. **Bidirectional Constraints:** The combination of a 2D matrix and bidirectional storage ensures that the validation function can perform an $O(1)$ check. By setting both `constraints[u][v] = 1` and `constraints[v][u] = 1` during input reading, the order of the pairs becomes irrelevant.
    
4. **Bounded Validation:** The validation logic only checks the current `iid` against previously evaluated ingredients. Iterating `i` strictly up to `iid` prevents the code from reading uninitialized or irrelevant memory further down the `taken` array.

### The Solution

Here is the implementation of the validation and recursive functions demonstrating these mechanics.

```C
#define MAX_M 400

int is_valid(int iid, int* taken, int constraints[][MAX_M]) {
    int valid = 1;
    for (int i = 0; i < iid; i++) {
        // No constraints
        if (constraints[i][iid] == 0) {
            continue;
        }
        // Prohibited
        if (constraints[i][iid] == 1 && taken[i] == 1 && taken[iid] == 1) {
            valid = 0;
            break;
        }
    }

    return valid;
}

int solve(int ingredient_id, int N, int* taken, int constraints[][MAX_M]) {
    if (ingredient_id > N) {
        return 1;
    }
    int count = 0;

    // Skip it
    count += solve(ingredient_id + 1, N, taken, constraints);

    // Take it if valid
    taken[ingredient_id] = 1;

    if (is_valid(ingredient_id, taken, constraints)) {
        count += solve(ingredient_id + 1, N, taken, constraints);
    }

    taken[ingredient_id] = 0;

    return count;
}
```

### Conclusion

By combining a subset selection tree, explicit array cleanup, and a bidirectional adjacency matrix, we exhaustively calculate all valid combinations while maintaining stable memory state.