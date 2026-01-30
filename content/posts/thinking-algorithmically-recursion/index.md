---
title: "Thinking Algorithmically: Recursion"
date: 2026-01-15
draft: true
categories:
  - thinking_algorithmically
  - programming, algorithms
keywords:
---
## Recursion

I have noticed usually trying to trace the recursion function leads me to more confusion but its a habit I still fall into. At its core, recursion is about having clear instructions. My analogy for the Balanced Teams problem below is one I have found to be greatly helping in understanding recursion without tracing it.

In this post I present my learnings and solutions for:
- [Balanced Teams](https://usaco.org/index.php?page=viewproblem2&cpid=378)

## Balanced Teams
❓[Problem](https://usaco.org/index.php?page=viewproblem2&cpid=378)
💡[My Solution](https://github.com/pmesgari/thinking-algorithmically/blob/main/hash_tables/cd.c)

The problem is combinatorics. We need to make 4 teams of 3, but we need to ensure repetitions won't happen. Picking Team 1 to be (1, 2, 3) and Team 2 to be (4, 5, 6) is the same as Team 1 being (4, 5, 6) and Team 2 being (1, 2, 3). The same applies to repetitions within a team itself. That is (1, 2, 3) and (2, 1, 3) are identical.

Ensuring no repetitions happen within a team is straightforward, just needs the loop starting at the next position. This allows generating indices that are strictly increasing.

To avoid repetitions across teams we enforce a rule that determines how the first member of a team is selected. The first member must be the first available position. This also means we need to keep track of the team selections we have made.

To better understand this rule, let's take a look at an example.

Imagine we have four members (A, B, C, D) and we want to create teams of 2. Without enforcing any rules, we ask the members to form teams, two possible scenarios are:
- **Scenario 1:** Team 1 (A, B), Team 2 (C, D)
- **Scenario 2**: Team 1 (C, D), Team 2( A, B)

But, these are the exact some combinations. For our problem they make no difference.

Now, lets enforce our rule. The member currently at the very front of the line must belong to the team being formed now.

- A is at the front
- A must be in Team 1
- Team 1 starting with A, can be paired with any other member:
	- (A, B)
	- (A, C)
	- (A, D)

Notice we never created the (C, D) pair as team 1 while we still consider all the combinations that are required for our problem.

This is the recursive part, see the full solution on Github.

```C
int calc_min_diff(int* members, int* seen, int* team_sums, int group) {
    if (group == 4) {
        return calc_skill_level(team_sums);
    }
    int n, i, j, k, ret;
    int min_diff = INT_MAX;
    for (n = 0; n < SIZE; n++) {
        if (seen[n] == 0) {
            i = n;
            break;
        }
    }
    for (j = i + 1; j < SIZE - 1; j++) {
        for (k = j + 1; k < SIZE; k++) {
            if (seen[i] || seen[j] || seen[k]) {
                continue;
            }
            seen[i] = 1;
            seen[j] = 1;
            seen[k] = 1;
            team_sums[group] = members[i] + members[j] + members[k];
            ret = calc_min_diff(members, seen, team_sums, group + 1);
            if (ret < min_diff) {
                min_diff = ret;
            }
            seen[i] = 0;
            seen[j] = 0;
            seen[k] = 0;
            team_sums[group] = 0;
        }
    }
    return min_diff;
}
```

To understand this recursion I find it useful to imagine this scenario.

### The Shared Ledger Analogy

Imagine the `seen` array is a single **clipboard** on the wall of a room.
- **The Rule:** There is only **one** clipboard.
- **The Layers:** Every time we recurse, imagine a **new person** walks into the room.

Here is the sequence of events for a small example.

1. **Person A (Group 0) enters.**
	- They pick cows 1, 2, 3.
	- **Action:** They walk to the clipboard and check off boxes 1, 2, and 3.
	- The clipboard now reads: `[1, 1, 1, 0, 0, 0, ...]`
2. **Person A calls Person B (Group 1).**
	- Person B walks into the room.
	- Person B looks at the **very same clipboard**. They see that 1, 2, and 3 are already checked.
	- Person B picks cows 4, 5, 6.
	- **Action**: They check off boxes 4, 5 and 6.
	- The clipboard now reads: `[1, 1, 1, 1, 1, 1, ...]`
3. **Person B finishes their job.**
	- They calculate the score. Now they need to leave.
	- **The clean up (backtracking):** Before Person B walks out of the door, they must **erase** the checks they made.
	- **Action:** Person B erases checks for 4, 5, and 6.
	- The clipboard now reads: `[1, 1, 1, 0, 0, 0, ...]`
4. **Person A wakes up.**
	- Person B has left. Person A looks at the clipboard.
	- It looks exactly the way it did before Person B arrived! Checks 1, 2 and 3 are still there.
	- Person A now unchecks 1, 2, and 3 (Clean Up) and tries a new combination.

We can extract this into an abstract pattern for understanding **Backtracking**:

1. **MARK (Commit):** I am choosing this path (`seen[i] = 1`)
2. **RECURSE (Explore):** Let's see where this path leads (`calc_min_dif(...)`)
3. **UNMARK (Undo)**: I am done with this path. Let's restore the world so we can try a different one (`seen[i] = 0`)
