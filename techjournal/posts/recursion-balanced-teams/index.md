---
title: "Recursion: Balanced Teams"
date: 2026-01-17
draft: false
categories:
  - thinking_algorithmically
  - programming, algorithms
  - recursion
keywords:
---
## Balanced Teams
❓[Problem](https://usaco.org/index.php?page=viewproblem2&cpid=378)
💡[My Solution](https://github.com/pmesgari/thinking-algorithmically/blob/main/recursion/balanced_teams.c)

### The Problem

In team formation, order usually doesn't matter, which creates two types of accidental duplicates:

1. **Within a Team:** `(1, 2, 3)` is the same team as `(2, 1, 3)`.
2. **Across Teams:** Picking `Team A = (1, 2, 3)` and `Team B = (4, 5, 6)` is the exact same scenario as picking `Team A = (4, 5, 6)` and `Team B = (1, 2, 3)`.

Solving type #1 is standard: just force the loop to pick members in increasing order (e.g., if you pick 1, the next loop starts at 2).

Solving type #2—permutations of the teams themselves—is the tricky part.
### The Logic: The "First Member" Rule

To prevent teams from swapping places in our count, we need a canonical ordering. We enforce a strict rule: **The first member of a new team must be the first available person in the line.**

Let’s look at a simplified example. We have members `A, B, C, D` and want to form teams of 2.

**Without the Rule:**
- **Scenario 1:** Team 1 is `(A, B)`, Team 2 is `(C, D)`.
- **Scenario 2:** Team 1 is `(C, D)`, Team 2 is `(A, B)`.
- _Result:_ We counted the same grouping twice.

**With the Rule (Order):** The first available person is `A`. Therefore, `A` **must** be in Team 1.

- Team 1 starts with `A`. It can pair with anyone: `(A, B)`, `(A, C)`, or `(A, D)`.
- We never generate `(C, D)` as Team 1, because `A` was still available and `A` comes before `C`.

### The Analogy: The Shared Ledger

This algorithm relies on **Backtracking**. To understand how the computer keeps track of who is "available" across deep levels of recursion, I use the **Shared Ledger** analogy.

> ### 📋 The Clipboard in the Room
> 
> Imagine the `seen` array is a single **clipboard** hanging on the wall of a room.
> 
> - **The Rule:** There is only one clipboard for everyone.
> - **The Recursion:** Every time we recurse (move to the next team), a **new person** walks into the room.
> 
> **1. Person A (Team 0) enters.**
> - They pick members 1, 2, 3.
> - **Action:** They walk to the clipboard and check off boxes 1, 2, and 3.
> - _The Clipboard:_ `[1, 1, 1, 0, 0, 0...]`
> 
> **2. Person A calls Person B (Team 1).**
> - Person B enters and looks at the **very same clipboard**. They see 1, 2, 3 are taken.
> - Person B picks 4, 5, 6.
> - **Action:** They check off boxes 4, 5, and 6.
> - _The Clipboard:_ `[1, 1, 1, 1, 1, 1...]`
> 
> **3. The Clean Up (Backtracking).**
> - Person B finishes calculating the team score. Before leaving the room, they **must erase** their marks.
> - **Action:** Person B erases checks for 4, 5, 6.
> 
> **4. Person A wakes up.**
> - Person B is gone. Person A looks at the clipboard. It looks exactly as it did before Person B arrived!
> - Person A can now safely uncheck 1, 2, 3 and try a totally new combination.

### The Code

Here is the C implementation. Notice how the loop searches for the first `seen[n] == 0` to enforce the "First Member Rule," and how we manipulate the `seen` array before and after the recursive call.


```C
int calc_min_diff(int* members, int* seen, int* team_sums, int group) {
    if (group == 4) {
        return calc_skill_level(team_sums);
    }
    int n, i, j, k, ret;
    int min_diff = INT_MAX;

    // The First Member Rule: Find the first available person
    for (n = 0; n < SIZE; n++) {
        if (seen[n] == 0) {
            i = n;
            break;
        }
    }

    // Pick the remaining 2 members (j and k)
    for (j = i + 1; j < SIZE - 1; j++) {
        for (k = j + 1; k < SIZE; k++) {
            if (seen[i] || seen[j] || seen[k]) {
                continue;
            }
            
            // MARK (Commit)
            seen[i] = 1; seen[j] = 1; seen[k] = 1;
            team_sums[group] = members[i] + members[j] + members[k];
            
            // RECURSE (Explore)
            ret = calc_min_diff(members, seen, team_sums, group + 1);
            if (ret < min_diff) {
                min_diff = ret;
            }
            
            // UNMARK (Undo / Backtrack)
            seen[i] = 0; seen[j] = 0; seen[k] = 0;
            team_sums[group] = 0;
        }
    }
    return min_diff;
}
```

### The Pattern

We can extract a universal pattern for Backtracking from this:
1. **MARK (Commit):** I am choosing this path (`seen[i] = 1`).
2. **RECURSE (Explore):** Let's see where this path leads (`calc_min_dif`).
3. **UNMARK (Undo):** I am done with this path. Let's restore the world so we can try a different one (`seen[i] = 0`).

Without the **Unmark** step, the clipboard would stay full, and Person A would never be able to try a second combination!
