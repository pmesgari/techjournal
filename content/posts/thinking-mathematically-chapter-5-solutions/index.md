---
title: "Thinking Mathematically: Chapter 5 Solutions"
date: 2025-07-14
draft: false
tags:
  - math
  - problem-solving
keywords:
---

## Bee Genealogy

>[!info] Bee Genealogy
>Male bees hatch from unfertilized eggs and so have a mother but no father. Female bees hatch from fertilized eggs. How many ancestors does a male bee have in the twelfth generation back? How many of these are males?

### Entry

We'll specialise by drawing a sample diagram.
The red numbers indicate the ancestors.

![](images/1.png)

### Attack

Looking at the diagram, a clear pattern emerges $1, 1, 2, , 3, 5, ...$  . This is the Fibonacci sequence.

**Conjecture**: The total number of ancestors in any generation `n` is the `nth` Fibonacci number.

We now try to understand how the number of ancestors in any generation `n` relates to previous generations.

1. The total ancestors in generation $n$ which we call $A_n$ are the parents of the ancestors in generation $n-1$.
2. The ancestors in generation $n-1$ are made up of $M_{n-1}$ males and $F_{n-1}$ females.
3. Each of those $F_{n-1}$ females has two parents in generation $n$.
4. Each of those $M_{n-1}$ males has one parent in generation $n$.

From this, we can build a structural argument:

1. The number of females in generation $n$, $F_n$, is the sum of the mothers of the previous generation's males and females. That's one mother for each, so $F_n = M_{n-1} + F_{n-1}$, which is simply the total number of ancestors in the previous generation $A_{n-1}$.
2. The number of males in generation $n$, $M_n$, comes only from the female ancestors in generation $n-1$. So, $M_n = F_{n-1}$.
3. The total number of ancestors in generation $n$ is $A_n = F_n + M_n$.
4. Substituting our findings, we get: $A_n = A_{n-1} + F{n-1}$.
5. And since $F_{n-1} = A_{n-2}$ (the number of females in one generation equals the total ancestors of the generation before it), we arrive at the final structural link: $A_n = A_{n-1} + A_{n-2}$.

This formula is the definition of the Fibonacci sequence.
### Review

The distinction between a proof and a mathematical structure feels blurry.
The AHA moment was seeing the Fibonacci pattern emerge in the total number of ancestors.
