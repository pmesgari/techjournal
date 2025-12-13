---
title: "Thinking Mathematically: Chapter 7 Solutions"
date: 2025-10-20
draft: false
tags:
  - math
  - problem-solving
keywords:
---

## Number Spirals

>[!info] Number Spirals
>Numbers are written consecutively in a spiral as follows:
> ![](posts/thinking-mathematically-chapter-7-solutions/images/1.png)
>Extend the spiral and write down any questions that occur to you.

I had several questions:

- Can I find a direct formula for the numbers on the top-left diagonal (1, 7, 21, 43, ...)?
- Given a row and column can I calculate the number?
- How can I determine the position of square numbers?

I decided to focus on the first question.


The first path I took got very messy, but it _provoked_ the **insight**  I needed for a much simpler, more beautiful solution.

### Entry: The First Approach (The Winding Path)

My first instinct was to **specialize**  and get a feel for the problem's structure. I noticed the spiral was built on expanding squares of side lengths 1x1, 3x3, 5x5, and so on.

I tried to find a formula by counting the "edges" I had to traverse to get from one diagonal number to the next. For example, to get from 1 to 7:

1. **Traverse 3 sides** of the inner 1x1 square's "shell" (the path 2-3-4). (3 edges)
2. **"Escape"** to the next square (the path 4 to 5). (1 edge)
3. **Traverse a partial side** of the 3x3 square to get to 7 (the path 5-6-7). (2 edges)
4. **Total difference:** 3+1+2=6. And sure enough, 1+6=7.

This seemed to work! I tried it for the jump from 7 to 21 (on the 3x3 square) and got a difference of 14, which was also correct (7+14=21).

This led me down a long algebraic path. I **introduced**  notation:

- k = The "step number" (k=1 for the 1x1 square, k=2 for the 3x3, etc.)
- Dk​ = The k-th diagonal number (D1​=1,D2​=7,…)
- Nstart​ = The side length of the square we start on.

After a lot of algebra, I found that the _difference_ between terms was Δ=8k−10. This gave me a recursive formula: Dk​=Dk−1​+8k−10

By using summation formulas, I eventually found a "closed" formula: $D_k​=4k^2−6k+3$

### Attack: The Second Approach (The Geometric "Why")

I had an answer, but I was **STUCK!** . The formula worked, but it felt messy and not harmonious. It didn't give me an intuitive _sense of_  the "why." Why was it quadratic?

**AHA!** Instead of tracing the winding path, what if I just looked at the _completed squares_?

| k (Step) | Square Size(N) | Largest Number (Cmax​) | Diagonal Number (Dk​) | Offset (Cmax​−Dk​) |
| -------- | -------------- | ---------------------- | --------------------- | ------------------ |
| 1        | 1x1            | 1                      | 1                     | 0                  |
| 2        | 3x3            | 9                      | 7                     | 2                  |
| 3        | 5x5            | 25                     | 21                    | 4                  |
| 4        | 7x7            | 49                     | 43                    | 6                  |

Suddenly, the structure was perfectly clear!

1. **The Square Size:** The side length is just the sequence of odd numbers: 1, 3, 5, 7, ... The formula for the k-th odd number is m=2k−1.
2. **The Largest Number (Cmax​):** The largest number in each square is just its total number of cells, which is the area. So, $C_{max} ​= N^2 = (2k−1)^2$.
3. **The Offset:** The offset (the number of steps back from the largest number to my diagonal number) was just the sequence of even numbers: 0, 2, 4, 6, ... The formula for this is $O_k​= 2(k−1) = 2k−2$.

This gave me a new conjecture: $D_k​=(Largest Number)−(Offset) D_k​=(2k−1)^2−(2k−2)$

Now, the final test. I simplified this new formula: $D_k​=(4k^2−4k+1)−(2k−2)​ = 4k^2−4k+1−2k+2 ​=4k^2−6k+3$

It was the exact same formula!

### Review: What I Learned

This was a perfect lesson in mathematical thinking.

- **The "Why" is Key:** The algebraic solution from the first approach was correct, but it wasn't satisfying. It didn't explain _why_ the formula was quadratic. 
- **Don't Fear the Mess:** My first "messy" attempt wasn't a failure. It was the **Entry**  phase. Getting **stuck** and feeling that the solution wasn't "right" is what forced me to **change my perspective** and find the more elegant **Attack**.
- **Trust Your Intuition:** I found two ways to understand this intuitively:
    1. **The "Neighbor" Idea:** An even number is 2k. Its neighbor, one step _before_ it, is always 2k−1. This works perfectly for k=1, which gives 2(1)−1=1.
    2. **The "Leftover" Idea:** An odd number is a set of pairs plus one "leftover" (2k+1). This is also a valid formula for odd numbers, but it's "out of sync" with our k=1 starting point (it gives 3). Both are correct, but 2k−1 was the right one for this problem.