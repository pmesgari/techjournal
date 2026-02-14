---
title: "Recursion: Breed Assignment"
date: 2026-01-31
draft: false
categories:
  - thinking_algorithmically
  - programming, algorithms
  - recursion
keywords:
---
## Breed Assignment

In this section we go over another recursive counting problem. The [[posts/recursion-balanced-teams/index]] problem is an example of partitioning in combinatorics. We understood that order didn't matter. In this problem we deal with assignment in combinatorics where each item has its own identity and order matters.

### The Problem

We need to assign breeds to cows while respecting the constraints. These constraints define a relationship between two cows and their corresponding breed types. This means given two cows:
- Their breeds must be the same
- Their breeds must be different
- There is no relation between them, so their breeds could be anything

### The Approach: Brute Force vs  Recursive Assignments

There are two ways to approach this:

1. **Brute Force:** We could generate every possible assignment and discard invalid ones. To check if an assignment is valid we will need to iterate through the `K` relations. This gives us `3^15 * 50` which is roughly 700 million. The rule of thumb is 30 million ops per second, giving us a total of 20 seconds. Its solvable, but far away from the time limit of 1 second.
2. **Recursive Assignment:** We recursively assign a breed to each cow and check if any constraints are violated. If so, we pick another breed and continue.

The reason why the recursive assignment is superior comes down to early elimination of the search space. Because we assign and immediately validate the assignment we can backtrack from invalid assignments early on, without having to generate the entire set of possible assignments.

### Fast Validations

Given a list of assignments we will need to quickly validate if the constraints are satisfied. When we assign `cow_i` any constraint involving `cow id > i` is irrelevant. Those future constraints don't affect our current solution because:

1) The future constraint might not involve `cow_i` at all so it cannot influence our current decision in any way
2) There is a future constraint where `j > i` in which case two things can happen, `S j i`  or `D j i`, in both cases the constraints affect the `jth` cow because the assignment for `ith` cow has already happened.

### 2-D Arrays and Bi-Directional Constraints

We need a way to store the constraints and quickly look up if an assignment is valid. A 2-D array can help us exactly do that. Our constraints look like this:

| Breed Type | Cow Id 1 | Cow Id 2 |
| ---------- | -------- | -------- |
| S          | c1       | c5       |
| S          | c1       | c3       |
| D          | c2       | c4       |

We can turn this into a different view that allows quick lookup given any two cows.

|     | c1  | c2  | c3  | c4  | c5  |
| --- | --- | --- | --- | --- | --- |
| c1  | -1  | -1  | 1   | -1  | 1   |
| c2  | -1  | -1  | -1  | 0   | -1  |
| c3  | 1   | -1  | -1  | -1  | -1  |
| c4  | -1  | 0   | -1  | -1  | -1  |
| c5  | 1   | -1  | -1  | -1  | -1  |
This table represents our constraints where `-1` means no relation, `0` means to be different, and `1` means to be the same.

Now, given any two cows we can quickly look up their constraint. If we look closely the constraints are bi-directional. Because the input is not sorted. It might contain a line like: `S 5 1`. If we were to store only `constraints[5][1] = 1` then our validation will never see that because we only check constraints for cows smaller than our current cow id and there is nothing in `constraints[1][5]`. To make our validations order agnostic we mirror all the constraints.

A note on C syntax. I got confused for a while about passing a 2-D array as an argument. The compiler complained about lack of second dimension. This comes down to how C handles 2-D arrays.

Computer memory is just a long row, there is no concept of a second dimension. Imagine a hotel that has all its rooms in one single, straight line on the ground floor.

- Rooms 0-9: belong to "Floor 0".
- Rooms 10-19: belong to "Floor 1".
- Rooms 20-29: belong to "Floor 2".

We are the compiler and someone gives us the **Master Key** (the pointer) to the very first room (Room 0). Then we are asked to: "Go to Floor 2, Room 5".

To get there, we need to do some math:

1. Skip all of Floor 0.
2. Skip all of Floor 1.
3. Walk 5 more rooms.

**The Equation:**

```
Target Room = Start + (2 x Rooms_Per_Floor) + 5
```

If we are not told `Rooms_Per_Floor` (the second dimension), we cannot solve that equation.

That's how a compiler sees it. When we write `constraints[row][col]` the compiler needs to turn that into a memory offset.

**1-D Array `arr[i]`:**

```
Address = Start + i
```

Only need to know the size of an integer. Easy.

**2-D Array `arr[row][col]`**:

```
Address = Start + (row x WIDTH) + col
```

Without the `WIDTH`, the compiler cannot generate the machine code to find the start of the next row. It knows where the array begins, but it doesn't know where Row 1 begins.


### The Solution

Here is our recursive solution.

```C
int is_valid(int cow_id, char* assignments, int constraints[][MAX_N]) {
    int valid = 1;
    for (int i = 0; i < cow_id; i++) {
        // No relation
        if (constraints[i][cow_id] == -1) {
            continue;
        }
        // Must be same
        if (constraints[i][cow_id] == 1 &&
            assignments[i] != assignments[cow_id]) {
            valid = 0;
            break;
        }
        // Must be different
        if (constraints[i][cow_id] == 0 &&
            assignments[i] == assignments[cow_id]) {
            valid = 0;
            break;
        }
    }
    return valid;
}

int count_assignments(char* assignments, char* breeds, int constraints[][MAX_N],
                      int cow_id, int N) {
    if (cow_id > N) {
        return 1;
    }

    int count = 0;

    for (int i = 0; i < 3; i++) {
        assignments[cow_id] = breeds[i];
        if (is_valid(cow_id, assignments, constraints)) {
            count += count_assignments(assignments, breeds, constraints,
                                       cow_id + 1, N);
        }
    }

    return count;
}
```

In backtracking problems we usually commit to a solution, see if it works, and upon return unmark what we have done. We don't need to unmark our assignment in the for loop because:

1) When we iterate, cow ID stays the same and we simply override it with a new breed.
2) When we return from let's say `cow_i = 3` back to `cow_id = 2`, the array might still have a dirty value at index 3. This is fine because our `is_valid` for cow 2 never looks at index 3. It only checks `i < cow_id`. Because we ignore the future, we don't need to waste time cleaning it up

### Conclusion

Using a recursive assignment solution with early termination of invalid assignments allowed us to significantly reduce the search space. We understood the importance of fast lookups and how 2-D arrays can model constraints. Our solution ensures we efficiently find all valid assignments.