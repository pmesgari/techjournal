---
title: "Recursion: Secret Code"
date: 2026-01-24
draft: false
categories:
  - thinking_algorithmically
  - programming, algorithms
  - recursion
keywords:
---
## Secret Code
❓[Problem](https://usaco.org/index.php?page=viewproblem2&cpid=396)
💡[My Solution](https://github.com/pmesgari/thinking-algorithmically/blob/main/hash_tables/cd.c)

Recursive counting problems can be deceptive. They often look like simple brute-force exercises, but efficient solutions require finding the hidden structure. In this section, I'll break down the 'Secret Code' problem and the specific insight that helped me understand the recursive counting logic.
### The Problem

We are given an encrypted string and need to determine how many ways it could have been produced. The encryption rules are specific: a string is transformed by removing either its first or last character, and then attaching the original string to either the beginning or the end.

For example, `ABA` can produce `ABABA` in two ways:
1. Drop first (`BA`) + Append Original (`ABA`) $\rightarrow$ `BA` + `ABA`
2. Drop last (`AB`) + Prepend Original (`ABA`) $\rightarrow$ `ABA` + `AB`

### The Approach: Forward vs Backward

There are two ways to attack this.

1. **Forward (Generative):** Start with all possible seeds and try to generate the target. This is inefficient because we have to guess every possible starting point.
2. **Backward (Deconstructive):** Since every operation adds the original string to a shortened version of itself, the length of the child string is always $2n - 1$ (where $n$ is the parent length).

This gives us a rigid mathematical constraint: **We know exactly how long the parent must be.**
### The Logic: Parents & Residues

For a string of length $L$, the parent length must be $n = (L+1)/2$. This implies the parent can only exist in two specific locations within the encrypted string:

1. **At the Start:** `Parent | Residue`
2. **At the End:** `Residue | Parent`

I call the leftover part the **Residue**. This concept simplifies the logic. Instead of searching blindly, we just check if the Residue is a valid prefix or suffix of the Parent.

- If `Parent` is at the start, the `Residue` must match the `Parent` minus its first or last letter.    
- If `Parent` is at the end, the same rule applies.

### The "Aha" moment: The Counting Formula

We need to count _every_ possible way the string could exist. This involves two factors:

1. **The Current Split:** The specific operation Farmer John used right now (e.g., Prefix vs. Suffix match).
2. **The History:** The number of ways the Parent string itself could have been formed.

Combining these into a recursive formula was tricky until I stopped thinking about strings and started thinking about **logistics**.

> ### 📦 The Package Analogy
> 
> Imagine we are tracking a package that just arrived at your house. We want to know how many unique  paths that package could have taken to get to you.
> 
> **1. The "Last Mile" (`num_matches`)** These are the roads from the Distribution Center (the Parent) to your house.
> 
> - Maybe the driver took the **Highway** (Match 1).
> - Maybe the driver took the **Backroad** (Match 2).
> - _Constraint:_ The driver must pick exactly one road.
>    
> **2. The "Origin Story" (`1 + solve(parent)`)** Before the package could travel that last mile, it had to exist at the Distribution Center. How did it get there?
> 
> - **The `1`:** It was manufactured _at_ the Center (it is the Source).
> - **The `solve(parent)`:** It arrived at the Center from a previous factory (History).
>    
> To find the **Total Number of Ways**, we have to pair every possible **Origin** with every possible **Road**.

### The Solution

This analogy maps directly to the code. We multiply the local possibilities (Roads) by the historical possibilities (Origins).

```
// Total Paths = (Number of Roads) * (Number of Origins)
count += num_matches * (1 + solve(parent, parent_length));
```

- `num_matches`: The number of valid operations (splits) we found for this specific parent.
- `1`: Accounts for the parent being the original source string.
- `solve(...)`: Accounts for all the ways the parent itself could have been formed.

```C
int solve(char *s, int len) {
    int count = 0;
    if (len % 2 == 0 || len == 1) {
        return 0;
    }
    int sublen = (len + 1) / 2;
    int num_matches = 0;
    // S = parent + residue
    // Residue is prefix of parent
    if (strncmp(s, s + sublen, sublen - 1) == 0) {
        num_matches += 1;
    }
    // Residue is suffix of parent
    if (strncmp(s + 1, s + sublen, sublen - 1) == 0) {
        num_matches += 1;
    }
    // Count the parent
    if (num_matches > 0) {
        count += num_matches * (1 + solve(s, sublen));
    }

    num_matches = 0;
    // S = residue + parent
    // Residue is prefix of parent
    if (strncmp(s, s + sublen - 1, sublen - 1) == 0) {
        num_matches += 1;
    }
    // Residue is suffix of parent
    if (strncmp(s, s + sublen, sublen - 1) == 0) {
        num_matches += 1;
    }
    // Count the parent
    if (num_matches > 0) {
        count += num_matches * (1 + solve(s + sublen - 1, sublen));
    }

    return count;
}
```

### Conclusion
By shifting from a brute-force mindset to a combinatorial one, the recursive step became clear. We aren't just counting strings; we are multiplying timelines. This approach ensures we count every valid history without getting lost in the recursion.
