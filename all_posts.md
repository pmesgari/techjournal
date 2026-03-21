

--- New Post: techjournal/posts/subsequences-part-2/index.md ---


---
title: "Part 2: The World of Subsequences, Longest Increasing Subsequence"
date: 2024-07-24
categories: programming, algorithms
keywords:
---
In the previous article we showed the algorithm for finding the longest continuously increasing subsequence. Now, we try to find the longest increasing subsequence and drop the contiguous requirement. First we begin with a formal definition of the problem.

>[!info] Algorithm Description
>
 >**Description:** Given a sequence of n elements a1 a2 a3…ana1​ a2​ a3​…an​, find the longest continuously increasing _subsequence_. A _subsequence_ is any subset of the elements taken in order, of the form ai1 ai2…aikai1​​ ai2​​…aik​​ where 1≤i1<i2<i3…ik≤n1≤i1​<i2​<i3​…ik​≤n. An _increasing subsequence_ is one in which the numbers are getting strictly larger, that is for every aiai​ in the subsequence we have ai>ai−1ai​>ai−1​.  
  >
>**Input:** A sequence of numbers in the form a1 a2 a3…ana1​ a2​ a3​…an​  
>
>**Output:** Length of the longest continuously increasing subsequence

Removing the contiguous requirement brings some interesting challenges in solving the longest increasing subsequence problem. We first begin with the mathematical preliminaries.

## Mathematical Preliminaries

One of the main papers about longest increasing and decreasing subsequences is published by C.Schensted in 19611. The paper is interesting to read although mathematically intense. The reader must understand the concept of Young tableau and its properties.

The algorithm we will use is called **Patience Sorting** which is inspired by the card game patience. The concept is straightforward.

The patience sorting algorithm can be used to determine the length of the longest increasing subsequence. This is best explained in the paper _Longest Increasing Subsequences: From Patience Sorting to the Baik-Deift-Johansson Theorem_2.

Once the patience sorting algorithm is applied we will have a certain number of piles, this number is equal to the length of the longest increasing subsequence.

>[!info] Theory
>Define l(π)l(π) to be the length of the longest increasing subsequence of a permutation ππ.  
>  
>**Lemma:** With deck ππ, patience sorting played with the greedy strategy ends with exactly l(π)l(π) piles. Furthermore, the game played with any legal strategy ends with at least l(π)l(π) piles. So the greedy strategy is optimal, and cannot be improved by any look-ahead strategy.  
>
>**Proof:** If cards a1 a2 a3…ala1​ a2​ a3​…al​ appear in increasing order, then under any legal strategy each aiai​ must be placed in some pile to the right of the pile containing ai−1ai−1​, because the card number on top of that pile can only decrease. Thus, the final number of piles is at least ll, and hence at least l(π)l(π). Conversely, using the greedy strategy, when a card cc is placed in a pile other than the first pile, put a pointer from that card to the currently top card c′<cc′<c in the pile to the left. At the end of the game, let alal​ be the card on top of the rightmost pile ll. The sequence a1←a2←⋯←al−1←ala1​←a2​←⋯←al−1​←al​ obtained by following the pointers is an increasing subsequence whose length is the number of piles.
>
>The proof and definition of patience sorting from *Longest Increasing Subsequence: From Patience Sorting to Baik-Deift-Johansson Theorem*.

The example below displays how the patience sort is applied and the resulting longest increasing subsequence. We assume Ace has a value of 1.

![](posts/subsequences-part-2/images/1.png)

We now have a solution that we can implement.

## Implementation

To find the length of the longest increasing subsequence we must implement the patience sorting algorithm. While we studies the sorting algorithm we realized a greedy strategy is required to find the leftmost legal pile. Thus, we are also going to need some sort of search algorithm to help us doing that.

To find the leftmost pile, we will implement the binary search algorithm. We also require a way to model the pile itself. For doing that we create a simple stack data structure that allows us to push and peak into it. Once our piles are formed, we readily know the length of the longest increasing subsequence. However, how do we actually determine the subsequence elements? Going back to our proof we need to store a sequence of pointers and later backtrack them in order to get the actual subsequence elements.

So, our action plan is:

- Model the piles using stack data structures
- Implement a binary search algorithm to find the leftmost pile
- Implement the patience algorithm itself
- Implement a backtrack method to print out the longest increasing subsequence

## Implementing the Stack and Pile

Implementing a stack is straightforward. The most interesting characters of stack are its **size** and **top** element. Furthermore we need to be able to push a new element to the stack as well as pop an element from it. As usual we start by writing our test cases.

```python
from stack import Stack


def test_push_to_stack():
    s = Stack()
    s.push(10)
    s.push(2)

    assert s.size == 2
    assert s.is_empty is False


def test_pop_from_stack():
    s = Stack()
    s.push(4)
    s.push(1)

    s.pop()
    assert s.size == 1
    assert s.is_empty is False

    s.pop()
    assert s.is_empty is True


def test_peek_into_stack():
    s = Stack()
    s.push(4)
    s.push(3)
    s.push(10)

    assert s.top == 10
    s.pop()
    assert s.top == 3
```

These few test cases guarantee the functionality of our stack as expected. This is the code we need to pass these tests.

```python
class Stack:
    def __init__(self):
        self.elements = []

    @property
    def size(self):
        return len(self.elements)

    @property
    def is_empty(self):
        return len(self.elements) == 0

    def push(self, e):
        self.elements.append(e)

    @property
    def top(self):
        if self.is_empty:
            return None
        return self.elements[-1]

    def pop(self):
        if self.is_empty:
            return None
        self.elements = self.elements[:-1]


```

When we are going to write our patience algorithm we must be able to compare piles. I took advantage of Python's operator overloading capabilities and decided to create a specific data structure based on the stack that allows comparisons. When we are comparing a pile to another one all we care about is the top element. So, I make a specific class to represent a pile and override its operator methods.

Starting with our test cases to define what we are trying to achieve.

```python
def test_piles_equal_operator():
    p1 = Pile()
    p1.push(1)
    p2 = Pile()
    p2.push(1)
    assert p1 == p2


def test_piles_lt_operator():
    p1 = Pile()
    p1.push(4)
    p2 = Pile()
    p2.push(2)
    assert p1 > p2


def test_piles_gt_operator():
    p1 = Pile()
    p1.push(4)
    p2 = Pile()
    p2.push(2)
    assert p2 < p1

class Pile(Stack):
    def __init__(self):
        super().__init__()

    def __eq__(self, other):
        return self.top == other

    def __gt__(self, other):
        return self.top > other

    def __lt__(self, other):
        return self.top < other

    def __repr__(self):
        return f"Pile: {self.top}"
```

The tests and the code should be self-explanatory. Most important to understand is that as long as the `other` object is implementing the same operator functions we can compare it to our object.

>[!info] Note
>This might seem strange at first, because comparing stacks per se doesn't make much sense. A stack is just a mechanism to store information. But, remember **modelling the domain** and the **problem** is **critical**. Within our context we are dealing with piles, and it is allowed and needed to compare piles in order to place the cards in the correct pile. A stack is just an easy to use and implement data structure that allows us to model a pile.

## Implementing the Binary Search

Binary search is an efficient and easy to implement searching algorithm that runs in O(log n)O(log n) since it halves the number of elements at each step. What is important is that our binary search algorithm must ensure returning the leftmost pile. That comes down to how we choose the mid point for our search. Depending on the length we might have to deal with an even or odd number, as soon as we have an odd number we will take the floor of the mid point to ensure the rightmost element is returned.

```python
def test_binary_search_leftmost():
    assert binary_search_leftmost([], 4) == 0
    assert binary_search_leftmost([1], 0) == 0
    assert binary_search_leftmost([1, 2], 3) == 2
    assert binary_search_leftmost([1], 1) == 0
    assert binary_search_leftmost([1, 2, 3, 5], 4) == 3
    assert binary_search_leftmost([2, 3, 6, 8, 10], 9) == 4
    assert binary_search_leftmost([2, 3, 6, 8, 10], 12) == 5
```

Our test cases are checking for boundary conditions such as empty list, one element list, inserting at the beginning, end, middle and anywhere else.

```python
def binary_search_leftmost(elements, target):
    left = 0
    right = len(elements)

    while left < right:
        mid = (left + right) // 2
        if elements[mid] < target:
            left = mid + 1
        else:
            right = mid
    return left
```

I like to mention a point about the division we see for determining the mid. In Python the usual divisor operator is `/` however, we also have the double `//` divisor operator. The double will only return the integer part of the number. That effectively means we always have the floor when calculating the mid point.

## Implementing the Patience Sorting

Now, we have all the elements we need to implement the actual patience sorting algorithm itself. We write a few tests to check our algorithm.

```python
def test_patience():
    assert patience([])[0] == 0
    assert patience([1])[0] == 1
    assert patience([1, 2, 3, 4, 5, 6, 7, 8, 9])[0] == 9
    assert patience([6, 3, 5, 10, 11, 2, 9, 14, 13, 7, 4, 8, 12])[0] == 5
    assert patience([7, 2, 8, 1, 3, 4, 10, 6, 9, 5])[0] == 5
```

And here comes the final implementation.

```python
def patience(values: [int]):
    piles = []
    pointers = {}
    for val in values:
        leftmost_index = binary_search_leftmost(piles, val)
        if leftmost_index > len(piles) - 1 or len(piles) == 0:
            leftmost_pile = Pile()
            piles.append(leftmost_pile)
        else:
            leftmost_pile = piles[leftmost_index]
        leftmost_pile.push(val)

        if leftmost_index != 0:
            prev = piles[leftmost_index - 1]
            curr = leftmost_pile.top
            pointers[curr] = prev.top
    return len(piles), pointers
```

The code is the implementation of the algorithm we stated in the mathematics section.

Once we run the algorithm we are given as return a tuple of length and pointers. If we are interested in finding the actual longest increasing subsequence we need to backtrack the pointers. Our pointers are stored in a dictionary data structure. Once we are done with determining the leftmost pile and inserting the value into it, we check if the leftmost pile is any other than the first pile. Then, we proceed with finding the previous pile to the pile we just inserted the value into. This is the cc and c′c′ elements in our mathematics section with the property c′<cc′<c. Then we simply add or update the top value of the current pile with the top value of the previous pile.

```python
def test_backtrack():
    assert backtrack({}, 12) == []
    assert backtrack({5: 3}, 5) == [5, 3]
    assert backtrack({5: 3, 10: 5}, 10) == [10, 5, 3]
    assert backtrack({5: 3, 10: 5, 11: 10}, 11) == [11, 10, 5, 3]
    assert backtrack({5: 3, 10: 5, 11: 10, 9: 5, 14: 11, 13: 11, 7: 5, 4: 2, 8: 7, 12: 8}, 12) == [12, 8, 7, 5, 3]
```

```python
def backtrack(pointers, last_card):
    result = []
    if not pointers:
        return result

    result.append(last_card)
    while last_card:
        prev_card = pointers.get(last_card, None)
        if prev_card:
            result.append(prev_card)
        last_card = prev_card

    return result
```

This concludes our algorithm. We are now able to find the length and the elements of the longest increasing subsequence.

## Resources

1. _Longest Increasing and Decreasing Subsequences, C.Schensted, Canadian Journal of Mathematics, Volume 13, 1961._
2. _Longest Increasing Subsequences: From Patience Sorting to the Baik-Deift-Johansson Theorem, David Aldous, Persi Diaconis, March 31, 1999._

--- New Post: techjournal/posts/advent-of-code-2025-summary/index.md ---


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

--- New Post: techjournal/posts/machine-learning-for-trading-build-a-decision-tree-learner/index.md ---


---
title: "Machine Learning for Trading: Build a Decision Tree Learner"
date: 2023-01-11
categories: programming, algorithms
keywords: 
mathjax: true
---

## Introduction

The focus of this article is building a decision tree learner and evaluate its performance in different settings and finally compare it with a linear regression learner. The main learning goals are:

- **Supervised Learning:** Understanding what is supervised learning and how to train, query and evaluate its performance
- **Decision Tree:** Learning how to build a decision tree and use it in different configurations

## Supervised Learning

Consider a series of predictor(here predictor just means inputs) measurements xi,i=1,2,…,Nxi​,i=1,2,…,N where for each predictor there is an associated response measurement yiyi​. From a statistical point of view the goal is to usually find a fit such that we can relate the predictors to the responses as accurately as possible. This is interesting because it allows to understand the relationships between the predictors and responses and also we can use such a fit to make predictions of future values for responses given historical predictor data. Such problems where there is a series of predictor measurements and an accompanying series of response measurements belong to the supervised learning problems category.

The opposite of supervised learning problems are unsupervised learning where there is no associated series of response measurements for the predictors. This makes the learning problem more challenging as we are sort of working in blind. Another way to say this is that we do not have a response variable to supervise our analysis. This is where the terms supervised and unsupervised originate from.

## CART Algorithms

Classification and Regression Trees (CARTs) algorithms are used in supervised machine learning to deduct information from large data sets for prediction purposes. In this article we will build a decision tree learner focused on regression analysis, meaning the data we will work with is numerical.

## Decision Tree Learner

Our main learner is the decision tree learner based on JR Quinlan algorithm. The pseudocode of the algorithm is shown below.

![](https://techjournal.nl/wp-content/uploads/2022/10/image.png)

The algorithm build a decision tree in a recursive manner. In the actual implementation a hyperparameter called leaf size is also introduced which determines the aggregation threshold of the learner. The decision on what is the best feature to split on is made by computing the feature with the highest correlation coefficient.

We train our learner using financial stock market data. Our predictor measurements will be the adjusted closing price of different index funds and our goal is to provide a prediction for the MSCI Emerging Markets (EM) index. We will use 60% of the data set to train the learner and the other 40% is used to evaluate the predictions.  

The implementation of our decision tree is given below.

```python
class DTLearner:
    """
    Decision Tree Learner

    This class can be instantiated to create a decision learner for numerical analysis (regression)

    Args:
        leaf_size (int):    the leaf size hyperparameter, used to decide the threshold of leaf aggregation
        verbose (bool):     toggle to allow printing to screen

    Returns:
        An instance of the class with a tree built from the data, the instance can then be used to query predictions
    """
    def __init__(self, leaf_size=1, verbose=False):
        self.leaf_size = leaf_size
        self.verbose = verbose
        self.tree = None

    def add_evidence(self, data_x, data_y):
        """
        Add training evidence

        The method combines the separate data sets into one data set, this makes building the tree easier later.
        Usually the shape of data_x is something like (r, c) and data_y is (r, ). We can combine this two data sets
        if we concatenate along the axis for which the dimensions are not necessarily equal. But it is required to
        first reshape data_y so that instead of a vector it becomes a 2-d array with a single column.

        Args:
            data_x (nd numpy array):    a multidimensional numpy array holding the factor values
            data_y  (1d numpy array):   a vector of labels (a.k.a. Y values)

        Returns:
            None, it just combines the data and invokes build_tree method
        """
        data = np.concatenate((data_x, data_y[:, None]), axis=1)
        self.tree = self.build_tree(data)
        if self.verbose:
            print(f'tree shape: {self.tree.shape}')
            print(self.tree)

    def find_best_feature(self, data):
        """
        Find the best feature to split

        It finds the best feature to split the rows using the correlation coefficient. We need to watch out
        for the situation where the standard deviation of feature_x is zero, since this will result
        in a division by zero in the calculation of the correlation coefficient and will cause a runtime error

        Args:
            data (nd numpy array):  the data set as an n-dimensional numpy array

        Returns:
            The best feature to split the data on, the returned value is an integer representing the column index.
            If there is a situation where the correlation coefficient for multiple columns are the same, it will
            deterministicly return the last column.
        """
        best_feature = None
        best_corr_coef = float('-inf')

        for col in range(data.shape[1] - 1):
            feature_x = data[:, col]
            # check std first, to prevent division by zero when numpy tries to
            # calculate the covariance matrix
            std = np.std(feature_x)
            if std > 0:
                c = np.corrcoef(feature_x, y=data[:, -1])[0, 1]
            else:
                c = 0
            if c >= best_corr_coef:
                best_corr_coef = c
                best_feature = col
        return best_feature

    def build_tree(self, data):
        """
        Builds the decision tree for numerical analysis based on the JR Quinlan algorithm

        Args:
            data (nd numpy array):  the full data set as an n-dimensional numpy array

        Returns:
            The decision tree as a nd numpy array in a tabular format where each row is
            [best_feature_idx, split_val, relative_left_tree_node_idx, relative_right_tree_node_idx]

            A leaf can be determined when a given row has its best_feature_idx set to numpy nan.
        """
        if data.shape[0] <= self.leaf_size:
            return np.atleast_2d([np.nan, np.mean(data[:, -1]), np.nan, np.nan])

        if np.all(data[:, -1] == data[0, -1]):
            return np.atleast_2d([np.nan, data[0, -1], np.nan, np.nan])

        best_feature_idx = self.find_best_feature(data)
        split_val = np.median(data[:, best_feature_idx])
        ys = data[:, best_feature_idx]

        if np.all(ys <= split_val) or np.all(ys > split_val):
            return np.atleast_2d([np.nan, np.mean(ys), np.nan, np.nan])

        true_rows = data[data[:, best_feature_idx] <= split_val]
        false_rows = data[data[:, best_feature_idx] > split_val]

        left_tree = self.build_tree(true_rows)
        right_tree = self.build_tree(false_rows)

        root = np.atleast_2d([best_feature_idx, split_val, 1, left_tree.shape[0] + 1])

        return np.vstack((root, left_tree, right_tree))

    def predict(self, point, node=0):
        """
        Predict the label for a given point

        Args:
            point (1d numpy array): 1 dimensional numpy array where each entry is the value for a feature
            node (int): the current decision node

        Returns:
            A prediction for the label of a given point from the decision tree.
        """
        if np.isnan(self.tree[node, 0]):
            return self.tree[node, 1]

        feature = int(self.tree[node, 0])
        split_val = self.tree[node, 1]

        if point[feature] <= split_val:
            node += int(self.tree[node, 2])
        else:
            node += int(self.tree[node, 3])

        return self.predict(point, node)

    def query(self, points):
        """
        Query the decision tree to get predictions for the given points

        Args:
            points (nd numpy array):    nd numpy array where each entry is the value for a feature

        Returns:
            An 1d numpy array where each entry is the prediction for a given point
        """
        predictions = np.empty([len(points), ])
        for idx, point in enumerate(points):
            predictions[idx] = self.predict(point)
        return predictions

    def print_tree(self, node=0, spacing=''):
        """
        Print the decision tree

        Args:
            node (int): current node in the tree
            spacing (str):  current spacing

        Returns:
            None, it will just print the tree to the console
        """
        if np.isnan(self.tree[node, 0]):
            print(f'{spacing} Label: {self.tree[node, 1]}')
            return

        print(f'{spacing} <= {self.tree[node, 1]}')
        print(f'{spacing} --> True:')
        self.print_tree(int(self.tree[node, 2]) + node, f'{spacing}\t')
        print(f'{spacing} --> False:')
        self.print_tree(int(self.tree[node, 3]) + node, f'{spacing}\t')
```

--- New Post: techjournal/posts/thinking-mathematically-chapter-5-solutions/index.md ---


---
title: "Thinking Mathematically: Chapter 5 Solutions"
date: 2025-09-16
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

![](posts/thinking-mathematically-chapter-5-solutions/images/1.png)

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


## Square Dissection

>[!info] Square Dissection
>A number N is called nice if a square can be dissected into N non-overlapping squares. What numbers are nice?

### Entry
The key is to use the process of **specializing** to get a feel for the problem.

- **What do I KNOW?** I'm cutting a large square into smaller, non-overlapping squares. An important clarification, as the book points out, is to check for
    
    **hidden assumptions**. The problem does _not_ say the smaller squares must be the same size. This is a crucial piece of freedom! * **What do I WANT?** I want to find the complete set of numbers, _N_, that are "nice". I want to characterize them.
    
- **What can I INTRODUCE?** Diagrams.

Specializing with small numbers:
- **N=1:** A square is already 1 square. So, **1 is nice**.
- **N=2, 3:** After a few sketches, it seems impossible to dissect a square into 2 or 3 smaller squares. Let's conjecture that **2 and 3 are not nice**.
- **N=4:** Easy! A simple 2x2 grid of identical squares works. So, **4 is nice**.
- **N=5:** This seems impossible, much like 2 and 3. Let's conjecture that **5 is not nice**.

So far, our set of nice numbers is {1, 4, ...} and our "not nice" set is {2, 3, 5, ...}.
### Attack

#### The Key Insight: The "+3 Operation"

Take any single square in the _K_-dissection and dissect it into a 2x2 grid of four smaller squares.

This action removes one square and adds four new ones, for a net gain of three squares. So, if a number _K_ is nice, then **K+3** must also be nice.

We know 1 is nice, so applying the +3 operation gives us $1+3=4, 4+3=7, 7+3=10, ...$ these are numbers in the form $3k + 1$.

Below we see how we can get 6 and 8. 

![](posts/thinking-mathematically-chapter-5-solutions/images/2.png)

So, we can form a conjecture.
- From 6, we can generate $9, 12, 15, ...$ (all numbers in the form $3k$)
- From 7, we can generate $10, 13, 16, ...$ (all numbers in the form $3k+1$)
- From 8, we can generate $11, 14, 17, ...$ (all numbers in the from $3k+2$)

These three families, taken together, generate every single integer greater than or equal to 6! Why? Because any integer, when divided by 3, must have a remainder of 0, 1, or 2
### Review

**REFLECT:** The key moments were:

1. Realizing the squares could be different sizes (avoiding a hidden assumption).
2. Discovering the recursive _K_ -> _K_+3 construction. This turned the problem from a series of special cases into a structured system.
3. Realizing we needed more than one base case and searching for them.
4. Using a number theory argument (remainders mod 3) to justify that our constructions covered all possibilities.

--- New Post: techjournal/posts/the-tale-of-migrations/index.md ---


---
title: "Clean Architecture: Migrations"
date: 2021-05-09
categories: programming, algorithms
keywords:
---
Recently I have been working on an intensive network migration project for a Dutch enterprise. This is by far one of the most exciting and yet fearsome projects I have been involved in. The migration project involves rebuilding the clients network based on standardized and automated profiles. This brings significant benefits to the service provider as well as the client. Such benefits are for example:

- Devices will run based on a standardized and harmonious configuration throughout the entire network, thus it is always possible to deduct what configuration a certain device is running. This helps tremendously for operations and troubleshooting
- Standardized profiles allows standardized and controlled changes across the network
- Configuration management becomes easier and faster

When migrating a network, we have to introduce a momentarily outage. Now, imagine telling a multi billion euro enterprise running heavily on its network that for the migration we need to cut out your networks for a few minutes!

The only way to do such thing, is to convince them of a rock solid procedure that includes well defined steps, it is secure, has an easy roll back scenario and most of all very well tested.

During this project one of the interesting problems we needed to solve was validating the client's legacy network. The clients network information is stored in a CMDB. But, over time CMDBs always go out of sync with reality. So, how can we use the information in the CMDB for migrating the networks? The answer is, we have to validate and use only the parts we are certain of. Otherwise chances of success will drop significantly.

The code for this post can be found at [https://github.com/pmesgari/the_verdict](https://github.com/pmesgari/the_verdict)

---

## The Migration Verdict

To migrate the client's network we needed to validate a few parameters such as the current network id, name, branch id and device serial number. These parameters are required in our automation pipeline to migrate a network to a new state.

On one side we have our CMDB, on the other we have the network manager which in this case is Meraki Dashboard.

Whether a network is eligible for migration depends on validity of the parameters above. To reach such conclusion I use the term migration verdict. A verdict specifies a go/no go state for a given network in the CMDB. Thus, our use case is pretty simple to define:

|   |
|---|
|**Our Use Case:** Given a CMDB network reach a migration verdict|

When building new applications I start with imagining how the software will be used, whether the user is a human being, another system or library doesn't really matter. For the purposes of this application, I assumed the user will run the program through a CLI. So, how would the interactions with the CLI look like?

The CLI would allow the user to specify input, configuration parameters and output specifications. This allows flexibility in the interactions. There are two main modes of running the CLI, a **single run** or a **CSV run**. The CSV run is helpful to validate a large number of networks at once.

## The Model

The model is simple and captures the main concepts of the domain. After all this application is used by network operators teams and the terms and concepts must be familiar to them. For example a go/no go term is used on a daily basis by operations and using such terms in our code and model allows everyone to understand the expected behavior and outcome of the application.

To further help with later parsing of the verdicts I am using a simple `Enum` structure to represent a migration color. This is nothing more than a simple statement, but it is helpful for end user and allows them to later filter out the results.

```python
from enum import Enum


class MigrationColor(Enum):
    GREEN = 'Go for migration'
    RED = 'No go for migration'


class Verdict:
    def __init__(self, network: dict, color: MigrationColor):
        self.network = network
        self.color = color
        self.errors = []

    @property
    def has_error(self):
        return len(self.errors) > 0

    @property
    def message(self):
        msg = "\n".join([f"{err.get('parameter')}: {err.get('message')}"
                         for err in self.errors])
        return msg

    @classmethod
    def go(cls, network: dict):
        return Verdict(network=network, color=MigrationColor.GREEN)

    @classmethod
    def no_go(cls, network: dict):
        return Verdict(network=network, color=MigrationColor.RED)

    def add_error(self, parameter: str, message: str):
        self.errors.append({'parameter': parameter, 'message': message})

    def to_json(self):
        return {
            'network_id': self.network.get('network_id'),
            'name': self.network.get('name'),
            'serial': self.network.get('serial'),
            'branch_id': self.network.get('branch_id'),
            'verdict': self.color.value,
            'errors': self.message
        }
```

Our model is simply one class called `Verdict`. It has a few helper methods for creating and retrieving information from verdict objects. Let's see how our model is used.

## The Use Case

Use case is the most interesting part of the application. It is here that orchestration of business logic happens. It consists of three simple steps. These steps form the core of our application, in other words this is all we care about. Everything else comes second.

1. Read the Meraki network
2. Compare the result to the given network
3. Make a migration verdict

> We care about the core of our application logic, everything else comes second. Database, UI, infrastructure etc...

So, how does our use case looks like?

```python
import meraki
from models import Verdict


def read_meraki_network(network_id: str, serial: str, client: meraki.DashboardAPI):
    try:
        network = client.networks.getNetwork(networkId=network_id)
        device = client.devices.getDevice(serial)
        return {
            'network_id': network.get('networkId'),
            'name': network.get('name'),
            'serial': device.get('serial')
        }
    except meraki.APIError:
        return None


def make_migration_verdict_for(legacy_network: dict, meraki_network: dict):
    no_go_verdict = Verdict.no_go(legacy_network)
    if meraki_network is None:
        no_go_verdict.add_error('network_id', 'does not exist in Meraki Dashboard')
        return no_go_verdict

    if legacy_network.get('name') != meraki_network.get('name'):
        no_go_verdict.add_error('network_name', 'does not match')
    if legacy_network.get('serial') != meraki_network.get('serial'):
        no_go_verdict.add_error('serial', 'does not match')

    if no_go_verdict.has_error:
        return no_go_verdict
    return Verdict.go(legacy_network)


class ValidateLegacyNetworkUseCase:
    def __init__(self, client: meraki.DashboardAPI):
        self.client = client

    def execute(self, args):
        network_id = args.get('network_id')
        serial = args.get('serial')
        name = args.get('name')
        branch_id = args.get('branch_id')
        legacy_network = {
            'network_id': network_id,
            'serial': serial,
            'name': name,
            'branch_id': branch_id
        }
        meraki_network = read_meraki_network(network_id, serial, self.client)
        verdict = make_migration_verdict_for(legacy_network, meraki_network)
        return verdict

```

We have a class modeling our use case called `ValidateLegacyNetworkUseCase`. We have chosen names that reflect our intent as well as domain. Our class defines an `execute` method that can be invoked to run the use case. We start with getting the parameters we need from the incoming arguments and then create a simple dictionary representing the legacy network. Then, we request reading a Meraki network using the parameters of the legacy network. Finally, we call our helper method `make_migration_verdict_for` by passing the two networks to make us a migration verdict.

Important points to note here:

- Our `execute` method encapsulates the business logic of our application.
- Our `read_meraki_network` method encapsulates the details of making and receiving API calls from the Meraki Dashboard API.
- Our `make_migration_verdict_for` encapsulates the details of comparing the two networks and eventually creating a verdict.

Encapsulating each of these methods allows our application to grow without spilling changes everywhere. We have gathered the logic into clusters such that each cluster has a single reason to change. For example, if Meraki API changes our use case is not bothered because we only call the `read_meraki_network` method and don't care about what happens inside as long as we get back a result to process further.

The same applies to the `make_migration_verdict_for` method. Here we are clustering all the logic needed to compare two networks. Now we are checking based on network id, name and serial but what happens if we need to check based on tags or network type parameters. Again our core logic doesn't bother because we have protected it from such changes.

## The Repository

This is a simple class that we later use in our CLI so that we don't have to deal with reading networks and CSV files directly.

```python
import csv
from pathlib import Path


class CsvRepository:
    def __init__(self, folder):
        self._networks_path = Path(folder) / 'networks.csv'

    def list_networks(self):
        networks = []
        with open(self._networks_path) as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                networks.append(row)
        return networks
```

## The Presenters

As noted above everything else comes second to our business logic. The way we present the results to the outside world is a perfect example of secondary priorities. In what format and location we return or store results changes over time and honestly has nothing to do with our core logic. Thus, we want to protect our application logic from output stuff. Here comes the `Presenter`. A presenter is a simple class that prepares the data for the desired output format. The most interesting methods are `present` and `end`.

We make use of the `present` method when running our use cases. It handles formatting the data to our desired shape. When we are done with our use case we simple call the `end` method. This performs the final act of the presentation, whether displaying the result to the standard output or saving to a file.

```python
import json
import csv
from pathlib import Path


class JsonPresenter:
    def __init__(self, pretty=True):
        self._formatted_data = []
        self.pretty = pretty

    def present(self, data):
        if self.pretty:
            self._formatted_data = json.dumps([verdict.to_json() for verdict in [data]], indent=4)
        else:
            self._formatted_data = json.dumps([verdict.to_json() for verdict in [data]])

    def end(self):
        print(self._formatted_data)

    def get_presented_data(self):
        return self._formatted_data


class CsvPresenter:
    def __init__(self, folder):
        self._output_path = Path(folder) / "output.csv"
        self._formatted_data = []

    def present(self, data):
        self._formatted_data.append(data.to_json())

    def end(self):
        fieldnames = ['network_id', 'name', 'serial', 'branch_id', 'verdict', 'errors']
        with open(self._output_path, 'w', newline='\n') as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

            writer.writeheader()
            for data in self._formatted_data:
                writer.writerow(data)

    def get_presented_data(self):
        return self._formatted_data

```

## The CLI

The final bang, putting everything together. This is the highest level of our application. It is here that we glue everything together. The magic happens in the `run_cli` method. After we receive the CLI arguments we use our custom parse method to transform the arguments into a format understandable by our use case and CLI application.

We first perform some sanity checks, for example we allow either a single or CSV run, a user can not run both at the same time. We make sure all the minimum parameters are there and decide on the output format. With all these done it is time to invoke our use case and finally present the data.

```python
def run_cli(args):
    use_case_args = parse_args(vars(args))

    config = use_case_args.get('config', {})
    data = use_case_args.get('data')
    csv = use_case_args.get('csv', None)
    output_format = use_case_args.get('output', 'json')
    output_folder = use_case_args.get('output_folder', 'data')

    # validate at least csv or data are used
    if not csv and not data:
        raise ValueError('at least csv or data parameter are needed')

    # validate csv and data are not used at the same time
    if csv and data:
        raise ValueError('csv and data parameters can not be used at the same time')

    # validate configuration parameters
    output_log = config.get('OUTPUT_LOG', False)
    api_key = config.get('API_KEY', None)
    if api_key is None:
        raise ValueError('configuration parameter API_KEY is missing')

    client = meraki.DashboardAPI(api_key=api_key, output_log=output_log)

    # decide on the output format
    presenter = JsonPresenter()
    if output_format == 'csv':
        presenter = CsvPresenter(output_folder)

    # determine single or csv run
    if csv:
        repo = CsvRepository(folder=csv)
        run_csv(client=client, repo=repo, presenter=presenter)
    else:
        # validate data parameters
        minimum_data_parameters = {'network_id', 'name', 'serial', 'branch_id'}
        if not minimum_data_parameters.issubset(set(data.keys())):
            raise ValueError('Minimum data parameters are missing, see usage')

        run_validate_legacy_network_use_case(data=data, client=client, presenter=presenter)

    presenter.end()
```

--- New Post: techjournal/posts/letting-go-of-regret-a-computational-perspective/index.md ---


---
title: "Letting Go of Regret: A Computational Perspective"
date: 2025-10-24
draft: false
categories:
keywords:
---
For a long time, regret was a heavy companion. Whenever I felt it looming, I'd get caught in an intense spiral of "what ifs." How could things have gone differently? How could I have avoided this outcome? My mind would race through seemingly infinite alternative scenarios, a frustrating and exhausting exercise.

Recently, though, a different way of thinking sparked – viewing regret through a computational lens. The conclusion I reached was startlingly simple: **Regret, in a computational sense, doesn't logically exist.** There are only decision points in life, and each choice sends us down a unique timeline, a distinct trajectory. This idea resonated deeply, and I wanted to explore it further, using computational and mathematical concepts to formalize it, both for myself and for others who might find this perspective helpful. Writing this post is part of that process. Encouragingly, since adopting this view, I find myself dwelling on regret far less often; it's genuinely helped me let go and refocus.

## Decisions as Branches: Introducing the Binary Tree

Let's start with a fundamental concept from computer science: the **tree**, specifically a **binary tree**. Trees are everywhere in computing, forming the backbone of countless algorithms and systems we use daily. In simple terms, a binary tree is a structure where each point (or **node**) can branch off into at most two other points. Think of it like a series of Yes/No questions.

Computer scientists often draw trees "upside down," with the starting point (**root**) at the top. This feels intuitive when thinking about data flow or, in our case, the flow of time and decisions.

How does this relate to life and regret? We can use a binary tree to model the decision moments in our lives. Imagine each node represents a moment where a choice is made. For simplicity, let's represent every choice as a binary Yes/No decision (though real life is more nuanced, this model captures the core idea). From the most trivial choices (chicken or fish for dinner?) to the most significant (take the job offer? propose marriage?), life is a constant stream of decisions.

Consciously or not, a choice is always made, launching us onto a specific path or **branch** of the tree. We travel along that branch until the next decision node, where another choice leads us down a _new_ branch. Our entire life, from a starting point (like turning 18) until the end, can be visualized as a unique path from the root of this decision tree to one of its endpoints (a **leaf** node).

## The Astonishing Scale of Possible Lives

Let's analyze the structure of this decision tree. A key property is its **height (H)**, which is the number of decision levels from the root to the furthest leaf.

![](posts/letting-go-of-regret-a-computational-perspective/images/1.png)

Notice a pattern: each node potentially gives rise to two new nodes at the next level down. This doubling effect means the number of nodes _at_ a specific level (L) grows exponentially. We can represent this using powers of 2:

| Level | Nodes at this Level | Calculation |
| ----- | ------------------- | ----------- |
| 0     | 1                   | $2^0$       |
| 1     | 2                   | $2^1$       |
| 2     | 4                   | $2^2$       |
| 3     | 8                   | $2^3$       |
| 4     | 16                  | $2^4$       |
| 5     | 32                  | $2^5$       |
| ...   | ...                 | ...         |
| H     | $2^H$               | $2^H$       |

The total number of nodes in a _complete_ binary tree of height H (where every level is full) is $2^{H+1} - 1$. Why? Think of building the tree level by level. Level 0 has $1$ node. Level 1 adds $2$ nodes. Level 2 adds $4$ nodes, and so on, up to level H which adds $2^H$ nodes. The total is $1 + 2 + 4 + ... + 2^H$. This is a geometric series. A quick way to see the result is to imagine adding just _one more_ node at level H+1. This would conceptually complete the _next_ level, giving a total of $2^{H+1}$ leaves at that imaginary level. The total number of nodes in the tree up to level H is always one less than the number of potential nodes at level H+1. Hence, $2^{H+1} - 1$.

Now, let's consider the **paths**. A unique path represents a complete sequence of decisions from the start (root) to a final outcome (leaf).

![](images/2.png)

In a binary tree of height H, the total number of unique paths from the root to a leaf node at that level is $2^H$. Why? At each level L (from 0 to H-1), every node presents a choice that splits into two branches. To reach a specific leaf at level H, you must make H distinct binary choices. Since there are 2 options for each of the H choices, the total number of distinct choice sequences (paths) is $2 \times 2 \times ... \times 2$ (H times), which is $2^H$. Each distinct path represents one possible unique life trajectory based on the sequence of decisions made.

## Putting It All Together: Why Regret is Computationally Unfeasible

Now, let's apply this to a hypothetical lifetime. Assume we start making decisions at age 18 and continue until age 68, spanning 50 years. Let's simplify further and assume a decision point occurs **every single hour**.

>[!info] How many decision points (nodes) does this create?
> Number of decision points *(H) = 50 years × 365 days/year × 24 hours/day = 438,000 hours*
> 
> With *H = 438,000* decision points, the total number of possible distinct life trajectories (paths from the root to a leaf) is $2^H = 2^{438,000}$. 
 >
 >This number is **astronomically large**, far exceeding the estimated number of atoms in the observable universe. It's a number so vast it's practically impossible to truly comprehend. $2^{438,000} \approx 10^{131,841}$ (This is 1 followed by over **131 thousand zeros**!)


This immense number is why I've chosen to let go of regret. When I look back at a past decision point and feel a sudden emotion of "what if," I remind myself of this tree. The path _not_ taken wasn't just one alternative; it was the entry point to an unimaginably vast tree of _other_ possible lives, $2^k$ potential futures stemming from that single point onwards (where k is the remaining decision points).

There's simply no way to know which of those countless trajectories would have been "better." We lack the information and the computational capacity to evaluate even a minuscule fraction of them. This unknowability, combined with our natural human tendency towards [counterfactual thinking](https://en.wikipedia.org/wiki/Counterfactual_thinking) (imagining alternatives, often unrealistically positive ones), makes regret a computationally unsound and emotionally draining exercise.

The past is just one path taken out of a near-infinite sea of possibilities. It cannot be changed, and its alternatives cannot be truly known. This perspective frees up mental and emotional energy. Instead of analyzing the unanalyzable past, I can focus entirely on the present node, the current decision point. Because, ultimately, **that's all that ever matters: what do I decide to do right now?**


--- New Post: techjournal/posts/hash-tables-cd/index.md ---


---
title: "Hash Tables: CD"
date: 2025-07-02
draft: false
categories: thinking_algorithmically
keywords:
tags:
  - problem-solving
  - algorithms
  - hash_tables
---
## CD
❓[Problem](https://open.kattis.com/problems/cd)
💡[My Solution](https://github.com/pmesgari/thinking-algorithmically/blob/main/hash_tables/cd.c)

First iterations I missed the point that test cases are in a single input and are separated by `0 0`.
Between each test case the hash table must be cleared out. This means iterating through the table and each linked list and freeing or setting them to NULL as needed.

```C
void clear_hash_table(Node* hash_table[]) {
    int i;
    for (i = 0; i < SIZE; i++) {
        Node* current = hash_table[i];
        while (current != NULL) {
            Node* temp = current;
            current = current->next;
            free(temp);
        }
        hash_table[i] = NULL;
    }
}
```

--- New Post: techjournal/posts/machine-learning-for-trading-portfolio-analysis/index.md ---


---
title: "Machine Learning for Trading: Portfolio Analysis"
date: 2022-09-11
categories: programming, algorithms
keywords: 
mathjax: true
---

## Introduction

This article is about using Python to analyze portfolio stocks and allocations. The primary learning goals are:

- **Portfolio Analysis**: Given a portfolio of stocks implement several metrics to evaluate the performance of a portfolio

## Portfolio Analysis

There are several metrics that can be used to evaluate the performance of a portfolio. Here we focus on the metrics below:

- **Daily Returns:** How much a price went up or down on a particular day
- **Cumulative Return:** A measure of how much the value of the portfolio has gone up from the beginning to the end
- **Average Daily Return:** Simply the mean of the daily returns
- **Standard Deviation of Daily Return:** Simply the standard deviation of the daily returns
- **Sharpe Ratio:** Risk adjusted return

**Sharpe Ratio (SR)**

A measure that adjusts returns for risk. All else being equal, lower risk is better, higher returns is better. Also, SR takes into account the risk free rate of return. This is the return one would get if they invested their capital in short term treasury or bank account. However, this value has been almost zero since 2015.

To compute the Sharpe Ratio the equation below can be used.

![](posts/machine-learning-for-trading-portfolio-analysis/images/1.png)


From statistics we know that we can calculate the expected value of a series by simply taking the mean of the series. Sharpe ratio is highly dependent on how frequently sampling is done. SR is usually an annual measure and we can normalize it by using a coefficient that depends on the sampling frequency.

**Implementation**

We start implementing the portfolio analysis metrics for a set of stock symbols. Our goal is to write the code in such a way that any number of stock symbols are supported.

To calculate anything data is needed, either as local files in a CSV format or downloading them online, manually or through a package such as yfinance. One way or another, we assume data is available and it is has the following structure.

![](posts/machine-learning-for-trading-portfolio-analysis/images/2.png)

The rows or the index are datetimes and the columns are the prices for the symbols. We use SPY (S&P 500) symbol as a sort of reference frame to make comparisons with.

First step is to calculate the portfolio daily value. We assume no changes will occur on day 1 and that there will be only changes on a daily basis. The function below calculates the portfolio daily value.

```python
def compute_portfolio_daily_value(prices, allocs, sv):  
"""  
Compute portfolio daily value

```python
Args:
    prices (DataFrame): A n*m pandas dataframe where n is an index of dates and m is a set of stock symbol prices
    allocs (list): A 1-d list of initial stock allocation, it must sum to 1
    sv (integer): Starting value of the portfolio

Returns:
    A 1-d pandas dataframe where each entry is the value of the portfolio indexed by day.
"""
normed = prices / prices.values[0]
alloced = normed.multiply(allocs)
pos_vals = alloced.multiply(sv)  # alloced * start_val
port_val = pos_vals.sum(axis=1)  # the daily value of the portfolio

return port_val
```
So, there are a couple of things happening here, the end goal is to calculate the daily value of the portfolio, and to get there several operations are performed on the data which is explained below.

![](images/3.png)

Once the portfolio daily value is computed, it is possible to determine the daily return value, a very important metric in portfolio analysis.

```python
def compute_portfolio_daily_returns(port_val):
    """
    Compute portfolio daily returns

    Args:
        port_val (DataFrame): A 1-d pandas dataframe where each entry is the value of the portfolio indexed by day

    Returns:
        A 1-d pandas dataframe where each entry is the daily return value of the portfolio indexed by day
    """
    daily_returns = (port_val / port_val.shift(1)) - 1
    daily_returns = daily_returns[1:]  # Pandas leaves the 0th row full of NaNs, read this as dropping row 0 across all columns

    return daily_returns
```


![](images/4.png)

Finally it is now possible to calculate the rest of the important metrics of the portfolio to evaluate its performance.

```python
def compute_portfolio_stats(port_val, daily_returns, sf, rfr):
    """
    Compute portfolio statistics

    Args:
        port_val (DataFrame): A 1-d pandas dataframe where each entry is the value of the portfolio indexed by day
        daily_returns (DataFrame): A 1-d pandas dataframe where each entry is the daily return value of the portfolio indexed by day
        sf (float): Sampling frequency, daily=252, weekly=52, monthly=12
        rfr (float): Risk free return rate

    Returns:
        A tuple (cum_ret, avg_daily_ret, std_daily_ret, sr) where cum_ret is the cumulative return, avg_daily_ret is the average daily return,
        std_daily_ret is the standard deviation of the daily return and sr is the sharpe ratio
    """
    cum_ret = (port_val[-1] / port_val[0]) - 1
    avg_daily_ret = daily_returns.mean()
    std_daily_ret = daily_returns.std()
    sr = math.sqrt(sf) * (daily_returns - rfr).mean() / daily_returns.std()

    return cum_ret, avg_daily_ret, std_daily_ret, sr
```

Putting it all together, the code below handles the computation and optionally generates a plot in comparison with SPY symbol.

```python
import datetime as dt
import pandas as pd
import math
import matplotlib.pyplot as plt

from util import get_data


def compute_portfolio_daily_value(prices, allocs, sv):
    """
    Compute portfolio daily value

    Args:
        prices (DataFrame): A n*m pandas dataframe where n is an index of dates and m is a set of stock symbol prices
        allocs (list): A 1-d list of initial stock allocation, it must sum to 1
        sv (integer): Starting value of the portfolio

    Returns:
        A 1-d pandas dataframe where each entry is the value of the portfolio indexed by day.
    """
    normed = prices / prices.values[0]
    alloced = normed.multiply(allocs)
    pos_vals = alloced.multiply(sv)  # alloced * start_val
    port_val = pos_vals.sum(axis=1)  # the daily value of the portfolio

    return port_val


def compute_portfolio_daily_returns(port_val):
    """
    Compute portfolio daily returns

    Args:
        port_val (DataFrame): A 1-d pandas dataframe where each entry is the value of the portfolio indexed by day

    Returns:
        A 1-d pandas dataframe where each entry is the daily return value of the portfolio indexed by day
    """
    daily_returns = (port_val / port_val.shift(1)) - 1
    daily_returns = daily_returns[1:]  # Pandas leaves the 0th row full of NaNs, read this as dropping row 0 across all columns

    return daily_returns


def compute_portfolio_stats(port_val, daily_returns, sf, rfr):
    """
    Compute portfolio statistics

    Args:
        port_val (DataFrame): A 1-d pandas dataframe where each entry is the value of the portfolio indexed by day
        daily_returns (DataFrame): A 1-d pandas dataframe where each entry is the daily return value of the portfolio indexed by day
        sf (float): Sampling frequency, daily=252, weekly=52, monthly=12
        rfr (float): Risk free return rate

    Returns:
        A tuple (cum_ret, avg_daily_ret, std_daily_ret, sr) where cum_ret is the cumulative return, avg_daily_ret is the average daily return,
        std_daily_ret is the standard deviation of the daily return and sr is the sharpe ratio
    """
    cum_ret = (port_val[-1] / port_val[0]) - 1
    avg_daily_ret = daily_returns.mean()
    std_daily_ret = daily_returns.std()
    sr = math.sqrt(sf) * (daily_returns - rfr).mean() / daily_returns.std()

    return cum_ret, avg_daily_ret, std_daily_ret, sr


def assess_portfolio(
    symbols,
    allocs,
    sd=dt.datetime(2008, 1, 1),
    ed=dt.datetime(2009, 1, 1),
    sv=1000000,
    rfr=0.0,
    sf=252.0,
    gen_plot=False
):

    """
    Calculate portfolio assessment metrics

    Args:
        symbols (list): A list of stock symbols
        allocs (list): A list of initial stock allocations, must sum to 1
        sd (datetime): Starting datetime
        ed (datetime): Ending datetime
        sv (integer): Starting value of the portfolio
        rfr (float): Risk free return rate
        sf (float): Sampling frequency, daily=252, weekly=52, monthly=12
    Returns:
        A tuple (cr, adr, sddr, sr) where cr is the cumulative return, adr is the average daily return,
        sddr is the standard deviation of the daily return and sr is the sharpe ratio
    """
    prices_all = get_data(symbols=symbols, dates=(sd, ed))
    prices = prices_all[symbols]
    prices_SPY = prices_all['SPY']
    port_val = compute_portfolio_daily_value(prices, allocs, sv)
    daily_returns = compute_portfolio_daily_returns(port_val)

    cr, adr, sddr, sr = compute_portfolio_stats(port_val, daily_returns, sf, rfr)

    if gen_plot:
        df_temp = pd.concat(
            [port_val / port_val[0], prices_SPY / prices_SPY[0]],
            keys=['Portfolio', 'SPY'],
            axis=1
        )
        df_temp.plot()
        plt.xlabel('Date')
        plt.ylabel('Normalized Value')
        plt.title('Normalized Portfolio Value vs SPY')
        plt.savefig('./analysis.png')

    return cr, adr, sddr, sr


if __name__ == '__main__':
    assess_portfolio(
        symbols=['GOOG', 'AAPL', 'GLD', 'XOM'],
        allocs=[0.2, 0.3, 0.4, 0.1],
        sd=dt.datetime(2009, 1, 1),
        ed=dt.datetime(2010, 1, 1),
        gen_plot=True
    )
```

Using the sample inputs in the code above, the generated plot would look like the following.

![](images/5.png)


--- New Post: techjournal/posts/recursion-balanced-teams/index.md ---


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


--- New Post: techjournal/posts/thinking-mathematically-chapter-4-solutions/index.md ---


---
title: "Thinking Mathematically: Chapter 4 Solutions"
date: 2025-06-15
draft: false
tags:
  - math
  - problem-solving
keywords:
---
## Furniture

> [!info] Furniture
> A very heavy armchair needs to be moved, but the only possible movement is to rotate it through 90 degrees about any of its corners. Can it be moved so that it is exactly beside its starting position and facing the same way?

### Attack

1. Checkerboard your floor
	- Tile the floor with big squares of size = 0.5 x chair-width
	- Colour them using green and yellow
2. Initial and target colours
	- Start square: suppose the four legs of the chair sits on the four tiles creating a `2x2` block.
	- Target square: one chair width to the right.

> [!info] Conjecture: Rotation preserves square colour
> 
> A 90 degree rotation around any corner moves the chair from square (x, y) to one of
>
> `(x+1, y+1), (x+1, y-1), (x-1, y-1), (x-1, y+1)`
> 
> In every case `(x + y) mod 2 = 0` which means any sequence of rotations will place the corner on the same colour.

To reach the end goal we will need to shift by 1 in the `x` direction in which case `(x + y) mod 2 != 0` . This means no sequence of rotations is possible to reach the target location.

![](posts/thinking-mathematically-chapter-4-solutions/images/1.png)

### Review
- I was confused for a while because I didn't really understand what it meant to place the chair exactly beside the starting location. I kept shifting each corner tile by exactly one location. This is wrong because placing exactly beside would mean the two right legs would occupy the same tile as the two left legs. That's where the requirement for tiles to change their colour comes from.

## Consecutive Sums

>[!info] Consecutive Sums
>
>Some numbers can be expressed as the sum of a string of consecutive positive numbers. Exactly which numbers have this property? For example, observe that
>
> ```
 >9 = 2 + 3 + 4
 >11 = 5 + 6
 >18 = 3 + 4 + 5 + 6
 >```

### Entry
### Attack

**Initial Observations:**
The numbers the cannot be expressed this way are 1, 2, 4, and 8. They are all powers of two.

**Conjecture:** A number can be expressed as a sum of consecutive positive numbers if and only if it is **not a power of two**.

How can we justify this? Why powers of two behave differently?
To answer the "why", we need to look at the structure of these terms.

Let's say a number `N` is the sum of `k` consecutive positive integers, starting with `a+1`.

```text
N = (a + 1) + (a + 2) + ... + (a + k)
```

Using the formula for arithmetic series, this sum is:

```text
N = k * (first term + last_term) / 2
N = k * ((a + 1) + (a + k)) / 2
2N = k * (2a + k + 1)
```

This tells us that `2N` can be factored into two numbers, `k` and `(2a + k + 1)`. Notice that one of these factors, `k`, represents the number of terms in our sum, and the other, `(2a + k + 1)`, is related to the starting point and length of the sum. Notice, `(2a + k + 1) = (a + 1) + (a + k)` which is the sum of the starting point and the last term.

Now, let's analyse the parity (evenness or oddness) of the factors:

- `k` and `k+1` are consecutive integers, so one must be even and one must be odd.
- Therefore, `(2a + k + 1)` has the opposite parity to `k`.
- **Conclusion:** One of our factors, `k` or `(2a + k + 1)` must be odd.

This means that `2N` must have an odd factor greater than 1. If the odd factor were 1, then either `k = 1`, meaning the sum has only one term, or `(2a + k + 1) = 1`, which is not possible for positive `a` and `k > 1`.

So, which numbers `N` have the property that `2N` has an odd factor?

>[!info] Case 1
> If N has an odd factor d > 1, then 2N also has that same odd factor d.

This sentence describes numbers like 6, 9, 10, 12, 14, 15, etc. - any number that isn't a power of two.

Let's break this down:

- `N` has an odd factor `d > 1` means we can write `N` as `d x (something)`.
- Then `2N` also has that same odd factor, if we multiply `N` by 2, the original odd factor is still there.

We conclude, any number `N` that has an odd factor satisfies our rule and therefor all these numbers can be expressed as a sum of consecutive numbers.

>[!info] Case 2
>If N has no odd factors greater than 1, it must be a power of 2 and 2N has no odd factors greater than 1.

Let's break this down:

- `N` has no odd factors greater than 1, then all of its prime factors must be the number 2.
- Then `2N = 2 x 2^m = 2^(m + 1)`, if we multiply a power of 2 by 2, we just get the next power of two.

Any number `N` that is a power of two fails our rule. The number `2N` does not have an odd factor. Therefore, powers of two cannot be expressed as a sum of consecutive numbers.



## Square Differences

>[!info] Square Differences
>Which numbers can be expressed as the difference of two perfect squares?

### Entry

**SPECIALISING:** let's try a few examples to see what kind of numbers we can get. 

```text
1 = 1² - 0²
2 = No
3 = 2² - 1²
4 = 2² - 0²
5 = 3² - 2²
6 = No
7 = 4² - 3²
8 = 3² - 1²
```

### Attack

We look for a pattern and try to understand why it holds. The expression $a^2 - b^2$ can be factored into $(a  - b)(a + b)$ .

Let's call our number `N`. So, $N = a^2 - b^2 = (a - b)(a + b)$ . For `a` and `b` to be whole numbers, $(a-b)$ and $(a+b)$ must both be whole numbers, and they must have the same parity. Let's see why:

- If both $(a - b)$ and $(a+b)$ are odd, their sum $(a-b) + (a+b) = 2a$ is even, and their difference $(a+b)-(a-b) = 2b$ is even. So, `a` and `b` are whole numbers.
- If both $(a-b)$ and $(a+b)$ are even, their sum and difference are also even, so `a` and `b` are whole numbers.
- If one is even and one is odd, their sum and difference would be odd, meaning `2a` and `2b` would be odd, which is impossible for whole numbers `a` and `b`.

So, any number that can be expressed as a difference of two squares must be the product of two numbers of the same parity.

Now let's consider the different types of numbers for `N`:

1. **Odd Numbers**

Any odd number `N` can be written as `1 x N`. Here, both factors (1 and N) are odd. So we can always find `a` and `b`:

- $a- b = 1$
- $a+b = N$ solving these gives us $a=(N+1)/2$ and $b=(N-1)/2$. Since `N` is odd, `N+1` and `N-1` are even, so `a` and `b` will be whole numbers.

**Conclusion:** All odd numbers can be expressed as the difference of two squares.

2. **Even Numbers**

For an even number `N`, it must be the product of two even numbers. The two factors $(a-b)$ and $(a+b)$ must always have the same parity. They are either both even or both odd.

Why? Let's look at their difference: $(a + b) - (a-b) = 2b$. Since $2b$ is an even number, the two factors $(a+b)$ and $(a-b)$ must either both be even or both be odd. It's impossible for an even number and an odd number to have a difference that is even.

It is impossible to have both factors odd, because $odd * odd$ will always be odd. So, the two factors must be even. So, $N = (2k)(2m) = 4km$. This means that `N` must be a multiple of 4.

We can write $N= 4k = 2(2k)$. Both factors are even:

- $(a - b) = 2$
- $(a + b) = 2k$ Solving this gives us $a = k + 1$ and $b = k - 1$. Both are whole numbers.

**Conclusion:** All multiples of 4 can be expressed as the difference of two squares.

What about even numbers that are not multiples of 4? These are numbers like 2, 6, 10, 14 and so on. They can be written in the form $4k + 2$. If we factor such a number, one factor must be 2, and the other must be an odd number $(2k + 1)$. This means the factors have different parity. Therefore, numbers of the form $4k + 2$ cannot be expressed as the difference of two squares.
### Review

A number can be expressed as the difference of two perfect squares if and only if it is an odd number or a multiple of 4.


## Fifteen

>[!info] Fifteen
>Nine counters marked with the digits 1 to 9 are placed on the table. Two players alternately take one counter from the table. The winner is the first player to obtain, amongst his or her counters, three with the sum of exactly 15.

### Entry

The first step is to figure out all the possible winning combinations. What sets of three different numbers from 1 to 9 sum to 15?

- Starting with 1: {1, 5, 9}, {1, 6, 8}
- Starting with 2: {2, 4, 9}, {2, 5, 8}, {2, 6, 7}
- Starting with 3: {3, 4, 8}, {3, 5, 7}
- Starting with 4: {4, 5, 6}

There are exactly 8 winning combinations.
### Attack

Now that we have the winning combinations, how does that help us play? Remembering every combination and tracking what you and your opponent have is difficult.

Let's try to find an analogy. A 3x3 magic square uses the numbers from 1 to 9, and every row, column, and main diagonal sums to 15.

![](posts/thinking-mathematically-chapter-4-solutions/images/2.png)

There are 8 lines that sum to 15. These are the exact same 8 winning combinations we found earlier.

The game of Fifteen is mathematically identical to the game of **Tic-Tac-Toe**.

Choosing a counter is the same as placing a mark (X or O) in the corresponding square. Getting three counters that sum to 15 is the same as getting three marks in a row, column, or diagonal.

#### The Winning Strategy

1. **Best first move:** The strongest opening move in Tic-Tac-Toe is to take the centre square. In the game of Fifteen, this corresponds to taking the counter 5.
2. **Blocking and Winning:** Your subsequent moves should be guided by the magic square. If you opponent has two numbers that lie on a line in the square (e.g. they have taken 8 and 1), you must take the third number on that line (6) to block them. At the same time, you are trying to acquire three numbers that form a line for yourself.
3. **Optimal play:** Just like in Tic-Tac-Toe, if both players know the strategy, the game will end in a draw. You win by taking advantage of an opponent who doesn't see the underlying Tic-Tac-Toe structure.
### Review

The key to solving Fifteen was not arithmetic skill, but the ability to generalise and recognise an underlying structure. We moved from a numerical problem to a positional one.

## Circles and Spots

>[!info] Circles and Spots
> Place N spots around a circle and join each pair of spots by straight lines. What is the greatest number of regions into which the circle can be divided by this means?
> 
> For example, when there are 4 spots, 8 regions is the maximum possible number of regions (in this case 8 is also the minimum).

### Entry

We specialise to get a feel for what's happening.

Let N be the number of spots and R be the maximum number of regions.

| N (Spots) | R (Regions) |
| --------- | ----------- |
| 1         | 1           |
| 2         | 2           |
| 3         | 4           |
| 4         | 8           |
| 5         | 16          |

### Attack

Looking at this table, a very strong and simple pattern emerges. The number of regions seems to be doubling each time. This leads to a conjecture.

**Conjecture:** For N spots, the greatest number of regions is $2^{N-1}$ .

Let's test the case for $N=6$. We predict 32 regions but can only produce 31 regions.

Here I struggled for a while to figure out why I could only draw 30 regions. The key point is how regions are created when three lines intersect. Putting the spots in a symmetrical manner will result in some lines to cross at the same intersections which produces less regions. To create 31 regions, I needed to ensure spots are less symmetrical and no three lines will cross at the same intersection.

![](images/3.png)

So why did the pattern break? The simple doubling pattern wasn't connected to how the regions are made. A better way to count the regions is to understand what creates them. The number of regions is determined by the number of parts the circle and the lines are divided into.

The number of regions is determined by the number of spots, lines, and interior intersection points.

- The number of lines (L) we draw is the number of ways to choose 2 spots from N, which is the binomial coefficient `C(N, 2)`.
- The number of interior intersection points (I) is created by the intersection of two lines. Each such point is uniquely defined by a set of 4 spots on the circle. So, the number of intersection points is the number of ways to choose 4 spots from N, which is `C(N, 4)`.

The maximum number of regions `R(N)`is:

```text
R(N) = 1 + L + I
R(N) = 1 + C(N, 2) + C(N, 4)
R(N) = 1 + (N(N-1)/2) + (N(N-1)(N-2)(N-3))/24
```

>[!info] Binomial Coefficient
>
>A binomial coefficient answers the question: "How many different ways can I choose k items from a larger set of n items?"
>
>The key here is that the order in which the items are chosen doesn't matter.

### Review

- It shows the power of specialising to generate data and suggest a pattern.
- It provides a warning about dangers of generalising too quickly. A conjecture requires a justification based on structure.

--- New Post: techjournal/posts/recursion-breed-assignment/index.md ---


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
❓[Problem](https://usaco.org/index.php?page=viewproblem2&cpid=261)
💡[My Solution](https://github.com/pmesgari/thinking-algorithmically/blob/main/recursion/breed_assignment.c)

In this section we go over another recursive counting problem. The [Balanced Teams](https://www.techjournal.nl/posts/recursion-balanced-teams/) problem is an example of partitioning in combinatorics. We understood that order didn't matter. In this problem we deal with assignment in combinatorics where each item has its own identity and order matters.

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

--- New Post: techjournal/posts/subsequences-part-1/index.md ---


---
title: "Part 1: The World of Subsequences, Longest Increasing Subsequence"
date: 2024-07-27
categories: programming, algorithms
keywords:
---
Awhile ago I came across an interesting programming exercise at work. There is an external system that is integrated with our application. There are several API calls being made to it, one of which requires setting a password field. The external system enforces a set of rules for acceptable passwords. There are the usual rules such as a password cannot be the user's phone number, or the reversed old password and so on. But there is a rule that caught my attention, it states:

> A password cannot contain more than 3 sequentially ascending digits or 3 sequentially descending digits.

This sounded to me very similar to the famous **longest increasing subsequence** problem. So, in this articles I will try to go through the steps and provide an algorithmic implementation.

## Variations

There are many variations of the longest increasing subsequence problem, almost all share the same basic but a few differences here and there. Since the increasing or decreasing property are almost identical, I will be focusing only on the increasing variations:

- Longest continuously increasing subsequence
- Longest increasing subsequence
- Longest sequentially increasing subsequence

I start with implementing the most simple variation, the longest continuously increasing subsequence.

## Longest Continuously Increasing Subsequence

The longest continuously increasing subsequence is a simple flavor of the general longest increasing subsequence.

>[!info] Algorithm
>**Description:** Given a sequence of n elements a1 a2 a3…ana1​ a2​ a3​…an​, find the longest continuously increasing _subsequence_. A _subsequence_ is any subset of the elements taken in order and contiguously, of the form ai1 ai2…aikai1​​ ai2​​…aik​​ where 1≤i1<i2<i3…ik≤n1≤i1​<i2​<i3​…ik​≤n. An _increasing subsequence_ is one in which the numbers are getting strictly larger, that is for every aiai​ in the subsequence we have ai>ai−1ai​>ai−1​  
>
>**Input:** A sequence of numbers in the form a1 a2 a3…ana1​ a2​ a3​…an​  
>
>**Output:** Length of the longest continuously increasing subsequence


Every time we have a problem to solve where it is a matter of maximizing or minimizing a certain property, **dynamic programming** can be an effective approach. We are going to apply dynamic programming to solve our problem.

>[!info] The Dynamic Programming Paradigm
>1. Identify a relatively small collection of subproblems.  
>2. Show how to quickly and correctly solve "larger" subproblems given the solutions to "smaller" ones. 
>3. Show how to quickly and correctly infer the final solution from the solutions to all of the subproblems.


The key to applying dynamic programming techniques lies in identifying the optimal _overlapping_ subproblems. Here _overlapping_ means we are able to solve the larger subproblem by knowing the solution to the smaller subproblems, in other words our subproblems are constructed from the smaller subproblems.

Another important note is that we need to also specify the optimal solution to our subproblems. Because without knowing the optimal solution of the smaller subproblems we are not able to construct an optimal solution to the larger subproblems.

We begin by defining our subproblems like so:

- Find the longest increasing subsequence in a1a1​ ending in a1a1​
- Find the longest increasing subsequence in a1 a2a1​ a2​ ending in a2a2​
- Find the longest increasing subsequence in a1 a2 …an−1a1​ a2​ …an−1​ ending in an−1an−1​
- Find the longest increasing subsequence in a1 a2 …an−1 ana1​ a2​ …an−1​ an​ ending in anan​

With our subproblems defined, we can now try to define a method for finding the optimal solutions. As we go along and construct our subproblems, we have a **decision to make**. Do we include the last element of the subsequence or not?

>[!note]
>
>Remember our goal at each subproblem is to **find an optimal solution**. Thus, when looking at any subsequence, we can assume the optimal solution either contains the last element of the subsequence or it doesn't. This is where the **magic happens!**

When we have our subproblems and a definition of optimal solutions, it is time to define the **recurrence relation**. Since we are aiming to solve larger subproblems from the smaller subproblems, we have to define a **recurrence relation**.

>[!info] Base Case and Recurrence
>
>To begin with finding the recurrence, it is best to start with our base case.  
>
>**Base case:** We define our base case to be the first subproblem, that is finding the largest continuously increasing subsequence for the subsequence a1a1​ ending in a1a1​. It is obvious the length of such increasing subsequence is `1` since there is only one element.  
>
>**Recurrence:** We mentioned previously at every subproblem we have a decision to make, does adding the last element of the subsequence bring us to an optimized solution or not? Now, let's formulate this in a more precise and structured fashion.  
>
>```
>LCIS(aj)={LCIS(aj−1)+1if aj>aj−11else}LCIS(aj​)={​LCIS(aj−1​)+11​if aj​>aj−1​else​}
>```


Thus, if adding the last element brings us to an optimized solution, our longest continuously increasing subsequence is what has been our longest continuously increasing subsequence excluding the last element plus 1. Look at the examples below, in the first subsequence, adding the last element increases the length of our longest continuously increasing subsequence, and so we should do that! However, in the second example, adding the last element doesn't bring us any benefit. Which also means, the length of our longest continuously increasing subsequence which ends at 3 is just 1!.
![](posts/subsequences-part-1/images/1.png)

With our definition of **subproblem, optimized solution and recurrence** in place, it is now time verify the correctness of our solution.

To prove our solution, we will be using induction, for those interested in the mathematical concepts behind induction and in general an amazing mathematics resource for computer science, the [Mathematics for Computer Science](https://ocw.mit.edu/courses/electrical-engineering-and-computer-science/6-042j-mathematics-for-computer-science-spring-2015/index.htm) course offered by Prof. Meyer at MIT is **highly recommended**. The course has a wealth of material and a comprehensive online text book.

>[!info] The Induction Principle
>
>Let PP be a predicate on nonnegative integers. If  
>
>1. P(0)P(0) is true, and  
>
>2. P(n) implies P(n+1)P(n) implies P(n+1) for all nonnegative integers then
>
>P(m)P(m) is true for all nonnegative integers


Let's apply the induction principle to our solution.

>[!info] LCIS Algorithm
>
> We use induction to proof our hypothesis that the following equation can be used to find the longest continously increasing subsequence for any nonnegative sequence of integers:  
  >
>LCIS(aj)={LCIS(aj−1)+1if aj>aj−11else}LCIS(aj​)={​LCIS(aj−1​)+11​if aj​>aj−1​else​}  
  >
>**Base case:** In our base case we will proof that for a sequence of length 11 the length of the longest continuously increasing subsequence is 11. This is obvious, if our sequence contains a single element, then our longest continuously increasing subsequence is just 11.  
  >
>**Inductive step:** We assume that LCIS(aj)LCIS(aj​) is true, then we have two cases to consider:  
  >
>1. if aj<aj+1aj​<aj+1​ then the length of the longest continuously increasing subsequence ending in aj+1aj+1​ is the length of the longest continuously increasing subsequence ending in ajaj​ plus 11. Which means LCIS(aj+1)=LCIS(aj)+1LCIS(aj+1​)=LCIS(aj​)+1.  
>  
>2. if aj>aj+1aj​>aj+1​ then the length of the longest continuously increasing subsequence ending in aj+1aj+1​ is just 11, meaning LCIS(aj+1)=1LCIS(aj+1​)=1.  
>

Thus, our recurrence relation holds and LCIS(aj)LCIS(aj​) is correct.

We are now set to write the algorithm for finding the length of the longest continuously increasing subsequence.

>[!info] Recurrence Relation
>
>```A ←emptylistA[1]←1for j from 2 to n:if aj>aj−1:A[j]←A[j−1]+1elseA[j]←1return A
>A ←emptylistA[1]←1for j from 2 to n:if aj​>aj−1​:A[j]←A[j−1]+1elseA[j]←1return A​

The algorithm should be self explanatory. We start by initializing a list and then iterate over all the elements of the subsequence. At each iteration we solve the subproblem using the answers of the previous subproblems.

We can simply implement the algorithm above in Python. For the purpose of this article, I am assuming the input of our interest is a string of digits. This is slightly different situation compared to having an input representing an actual sequence of digits. Most important difference is when we deal with a sequence of digits as a string, we only have numbers from 0…90…9, however an actual sequence can span the entire range of nonnegative integers. However, this difference won't affect our algorithm and solution.

We begin with writing our test cases.

```python
def test_lcis():
    assert lcis('') == 0
    assert lcis('1') == 1
    assert lcis('12') == 2
    assert lcis('21') == 1
    assert lcis('11111') == 1
    assert lcis('23194679') == 4  # (4, 6, 7, 9)
    assert lcis('236733213') == 4  # (2, 3, 6, 7)
    assert lcis('285247892109') == 5  # (2, 4, 7, 8, 9)
```

Our tests are verifying the behavior of the algorithm at the boundaries as well as finding the actual longest continuously increasing subsequence. Here is the implementation satisfying the above tests:

```python
def _lcis(arr):
    if not arr:
        return 0

    a = [1]
    for i in range(1, len(arr)):
        if arr[i] > arr[i-1]:
            a.append(a[i-1] + 1)
        else:
            a.append(1)
    return max(a)


def lcis(s):
    return _lcis(list([int(e) for e in s]))
```

We use a simple wrapper function `lcis` such that our users don't need to worry about transforming their string of integers to a list of integers.

So, here it is, our solution to finding the longest continuously increasing subsequence.

## Resources

1. _Algorithms Illuminated Part3: Greedy algorithms and dynamic programming, Tim Roughgarden_
2. _Mathematics for Computer Science, Eric Lehman, F.Thomson Leighton, Albert R. Meyer_



--- New Post: techjournal/posts/hash-tables-1-sat/index.md ---


---
title: "Hash Tables: 1-SAT"
date: 2025-07-02
draft: false
categories: thinking_algorithmically
keywords:
tags:
  - problem-solving
  - algorithms
  - hash_tables
---
## 1-SAT
❓[Problem](https://atcoder.jp/contests/abc187/tasks/abc187_c)
💡[My Solution](https://github.com/pmesgari/thinking-algorithmically/blob/main/hash_tables/1-sat.c)

I spent a long time struggling to get all the test cases to pass. Did several refactors and kept checking my logic. It all sounded correct. My only mistake was I kept printing the negated form of the string as output. While the question expects the base form i.e. without `!`.

To determine the negated form I began with using for loops to copy the string from desired location. But, turns out this is tricky with index offsets and null termination character. Here, I learned about `strcpy` and that both its destination and source arguments are just pointers and I can do pointer arithmetics on them.

```C
char* negate_str(char* str) {
    size_t len = strlen(str);
    char* negated_s;

    if (str[0] == '!') {
        // Remove '!' prefix: !abc -> abc
        negated_s =
            (char*)malloc(len * sizeof(char));  // len-1 actual chars + '\0'
        if (negated_s == NULL) {
            exit(EXIT_FAILURE);
        }
        strcpy(negated_s, str + 1);
    } else {
        // Add '!' prefix: abc -> !abc
        negated_s =
            (char*)malloc((len + 2) * sizeof(char));  // '!' + len chars + '\0'
        if (negated_s == NULL) {
            exit(EXIT_FAILURE);
        }
        negated_s[0] = '!';
        strcpy(negated_s + 1, str);
    }
    return negated_s;
}
```

## Main Takeaways

- Hash tables are relevant when large search space are involved.
- A good hash design reduces `O(N)` lookup times usually to `O(1)`.
- The solution steps are:
	- Determine what attribute should be hashed
	- Design a hash function
	- Use an array to store the hashed values
	- Each array item points to the beginning of a linked list


--- New Post: techjournal/posts/machine-learning-for-trading-optimize-portfolio/index.md ---


---
title: "Machine Learning for Trading: Optimize Portfolio"
date: 2022-09-11
categories: programming, algorithms
keywords: 
mathjax: true
---
## Introduction

This article builds upon Part 1 and shows how portfolio stock allocations can be optimized using Python SciPy library, the primary learning goals are:

- **Portfolio Optimization:** Starting with an initial guess, learn how to optimize stock allocations for a portfolio and compare the results with the non-optimized case.

## Problem Statement and Solution

The goal is to use an initial guess for stock allocations and then optimize the portfolio for Sharpe ratio. Starting with a few important points to frame the problem.

- For the initial guess given there are N symbols, allocate to each symbol 1/N stocks
- During optimization ensure the sum of allocations won't exceed 1 (bounds)
- When allocating stocks it is not possible to allocate more than 1 (constraints)
- For all purposes of calculations we assume a daily sampling frequency of 252, and a risk free rate of return of 0

The idea here is to write a function that given certain inputs will calculate the Sharpe ratio, then ask SciPy optimization module to call this function repeatedly until an optimal value is reached. From previous article we know maximizing Sharpe ratio is desired since it means the standard deviation of the daily value of the portfolio is minimum, thus low risk while the expected value of the returns is maximum.

The problem can then be defined as:

- Provide a function to minimize
- Provide an initial guess
- Call the optimizer

However, if we ask Python to minimize the Sharpe ratio it will try to find the maximum value by maximizing the denominator, which will be the exact opposite of our goal, since that would mean finding a minimum value for Sharpe ratio where the standard deviation is highest. To overcome this problem, instead of calling our optimizer to minimize Sharpe ratio we call it to minimize Sharpe ratio multiplied by -1.

![](images/image-5.png)


Now, the solution. We need a function to call repeatedly to compute the Sharpe ratio. Using the material from previous article, we can define such a function easily.

```python
def compute_sharpe_ratio(allocs, prices, sv=1, rfr=0., sf=252.):
    """
    Compute Sharpe ratio

    Args:
        allocs (list): A list of stock allocations, must sum to 1
        prices (DataFrame): A n*m pandas dataframe where n is an index of dates and m is a set of stock symbol prices
        sv (integer): Starting value of the portfolio, for Sharpe ratio calculations the actual value does not matter, since it gets normalized
        rfr (float): Risk free return rate
        sf (float): Sampling frequency, daily=252, weekly=52, monthly=12
    """
    port_val = compute_portfolio_daily_value(prices, allocs, sv)
    daily_returns = compute_portfolio_daily_returns(port_val)
    sr = math.sqrt(sf) * (daily_returns - rfr).mean() / daily_returns.std()

    return sr


def find_optimized_allocations(init_allocs, prices):
    """
    Find optimized allocations

    Args:
        init_allocs (list): A list of initial stock allocations, must sum to 1
        prices (DataFrame): A n*m pandas dataframe where n is an index of dates and m is a set of stock symbol prices
    """
    def _compute_sharpe_ratio(allocs, prices):
        return compute_sharpe_ratio(allocs, prices) * -1 # we multiply by -1 so that SciPy finds the maximum

    constraints = (
        {'type': 'eq', 'fun': lambda x: np.sum(x) - 1}
    )
    bounds = [(0, 1) for _ in range(len(init_allocs))]
    optimized_allocs = scpo.minimize(
        _compute_sharpe_ratio,
        init_allocs,
        args=(prices, ),
        method='SLSQP',
        constraints=constraints,
        bounds=bounds
    )

    return optimized_allocs
```

Similar to previous article we put everything together and call our optimization code.

```python
import datetime as dt
import numpy as np
import math
import matplotlib.pyplot as plt
import pandas as pd
from util import get_data
import scipy.optimize as scpo

from optimize_something.assess_portfolio import compute_portfolio_daily_returns, compute_portfolio_daily_value, compute_portfolio_stats


def compute_sharpe_ratio(allocs, prices, sv=1, rfr=0., sf=252.):
    """
    Compute Sharpe ratio

    Args:
        allocs (list): A list of stock allocations, must sum to 1
        prices (DataFrame): A n*m pandas dataframe where n is an index of dates and m is a set of stock symbol prices
        sv (integer): Starting value of the portfolio, for Sharpe ratio calculations the actual value does not matter, since it gets normalized
        rfr (float): Risk free return rate
        sf (float): Sampling frequency, daily=252, weekly=52, monthly=12
    """
    port_val = compute_portfolio_daily_value(prices, allocs, sv)
    daily_returns = compute_portfolio_daily_returns(port_val)
    sr = math.sqrt(sf) * (daily_returns - rfr).mean() / daily_returns.std()

    return sr


def find_optimized_allocations(init_allocs, prices):
    """
    Find optimized allocations

    Args:
        init_allocs (list): A list of initial stock allocations, must sum to 1
        prices (DataFrame): A n*m pandas dataframe where n is an index of dates and m is a set of stock symbol prices
    """
    def _compute_sharpe_ratio(allocs, prices):
        return compute_sharpe_ratio(allocs, prices) * -1 # we multiply by -1 so that SciPy finds the maximum

    constraints = (
        {'type': 'eq', 'fun': lambda x: np.sum(x) - 1}
    )
    bounds = [(0, 1) for _ in range(len(init_allocs))]
    optimized_allocs = scpo.minimize(
        _compute_sharpe_ratio,
        init_allocs,
        args=(prices, ),
        method='SLSQP',
        constraints=constraints,
        bounds=bounds
    )

    return optimized_allocs



def optimize_portfolio(
    symbols,
    sd=dt.datetime(2008, 1, 1),
    ed=dt.datetime(2009, 1, 1),
    gen_plot=False
):
    """
    Optimize a portfolio of stocks allocations

    Args:
        symbols (list): A list of stock symbols
        sd (datetime): Starting datetime
        ed (datetime): Ending datetime
        gen_plot (bool): Toggle to generate plot
    """
    prices_all = get_data(symbols=symbols, dates=(sd, ed))
    prices = prices_all[symbols]
    prices_SPY = prices_all['SPY']

    init_allocs = [1 / len(symbols) for _ in range(len(symbols))]
    
    # find the allocations for the optimal portfolio
    allocs = find_optimized_allocations(init_allocs, prices)
    # Get daily portfolio value and returns
    port_val = compute_portfolio_daily_value(prices, allocs.x, sv=1)
    daily_returns = compute_portfolio_daily_returns(port_val)

    # Get portfolio statistics (note: std_daily_ret = volatility)
    cr, adr, sddr, sr = compute_portfolio_stats(port_val, daily_returns, sf=252, rfr=0)

    # Compare daily portfolio value with SPY using a normalized plot
    if gen_plot:
        # add code to plot here
        df_temp = pd.concat(
            [(port_val / port_val[0]), (prices_SPY / prices_SPY[0])], keys=["Portfolio", "SPY"], axis=1
        )
        df_temp.plot()
        plt.title("Normalized Optimized Portfolio vs SPY")
        plt.xlabel("Date")
        plt.ylabel("Normalized Value")
        plt.savefig('./optimized.png')

    return allocs.x, cr, adr, sddr, sr


if __name__ == "__main__":
    start_date = dt.datetime(2008, 6, 1)
    end_date = dt.datetime(2009, 6, 1)
    symbols = ["IBM", "X", "GLD", "JPM"]

    # Assess the portfolio  		  	   		  	  		  		  		    	 		 		   		 		  
    allocations, cr, adr, sddr, sr = optimize_portfolio(
        sd=start_date, ed=end_date, symbols=symbols, gen_plot=True
    )

    # Print statistics  		  	   		  	  		  		  		    	 		 		   		 		  
    print(f"Start Date: {start_date}")
    print(f"End Date: {end_date}")
    print(f"Symbols: {symbols}")
    print(f"Allocations:{allocations}")
    print(f"Sharpe Ratio: {sr}")
    print(f"Volatility (stdev of daily returns): {sddr}")
    print(f"Average Daily Return: {adr}")
    print(f"Cumulative Return: {cr}")
```
Running the optimization for the sample data in the code above generates the following chart. We can see the effect of the optimization where the price of SPY has plunged while our Portfolio increased in value.

![](images/optimized.png)

What is even more interesting is to compare the case of an optimized stock allocation with a random stock allocation. In the code example below, the compare function does exactly that. It is clear the optimized stock allocations is performing much better compared to a random allocation of stock.

![](images/compare.png)

```python
def compare(
    symbols,
    rand_allocs,
    sd=dt.datetime(2008, 1, 1),
    ed=dt.datetime(2009, 1, 1),
    gen_plot=False
):

    prices_all = get_data(symbols=symbols, dates=(sd, ed))
    prices = prices_all[symbols]
    prices_SPY = prices_all['SPY']

    # the optimum allocations
    init_allocs = [1 / len(symbols) for _ in range(len(symbols))]
    # find the allocations for the optimal portfolio
    opt_allocs = find_optimized_allocations(init_allocs, prices)
    # Get daily portfolio value and returns
    opt_port_val = compute_portfolio_daily_value(prices, opt_allocs.x, sv=1)
    opt_daily_returns = compute_portfolio_daily_returns(opt_port_val)

    # Get portfolio statistics (note: std_daily_ret = volatility)
    opt_cr, opt_adr, opt_sddr, opt_sr = compute_portfolio_stats(opt_port_val, opt_daily_returns, sf=252, rfr=0)

    # random allocations
    # Get daily portfolio value and returns
    rand_port_val = compute_portfolio_daily_value(prices, rand_allocs, sv=1)
    rand_daily_returns = compute_portfolio_daily_returns(rand_port_val)

    # Get portfolio statistics (note: std_daily_ret = volatility)
    rand_cr, rand_adr, rand_sddr, rand_sr = compute_portfolio_stats(rand_port_val, rand_daily_returns, sf=252, rfr=0)

    if gen_plot:
        df_temp = pd.concat(
            [
                (opt_port_val / opt_port_val[0]),
                (rand_port_val / rand_port_val[0]),
                (prices_SPY / prices_SPY[0])
            ],
            keys=[
                "Portfolio with Optimized Allocations",
                "Portfolio with Random Allocations",
                "SPY"
            ],
            axis=1
        )
        df_temp.plot()
        plt.title("Optimized and Non-Optimized Portfolio Value vs SPY")
        plt.xlabel("Date")
        plt.ylabel("Normalized Value")
        plt.savefig('./compare.png')

    return {
        'random': dict(
            rand_allocs=rand_allocs,
            rand_cr=rand_cr,
            rand_adr=rand_adr,
            rand_sr=rand_sr
        ),
        'optimized': dict(
            opt_allocs=opt_allocs,
            opt_cr=opt_cr,
            opt_adr=opt_adr,
            opt_sr=opt_sr
        )
    }
```

--- New Post: techjournal/posts/recursion-secret-code/index.md ---


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
💡[My Solution](https://github.com/pmesgari/thinking-algorithmically/blob/main/recursion/secret_code.c)

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


--- New Post: techjournal/posts/recursion-geppetto/index.md ---


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

TODO

--- New Post: techjournal/posts/thinking-mathematically-chapter-7-solutions/index.md ---


---
title: "Thinking Mathematically: Chapter 7 Solutions"
date: 2025-10-21
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

--- New Post: techjournal/posts/mario/index.md ---


---
title: "Mario"
date: 2021-07-21
categories: programming, algorithms
keywords:
---
## Introduction

CS50 is one of the most well known and prestigious courses on computer science. The course is offered by Harvard University faculty and based on Edx it has already more than 2.8 millions enrolled students.

I was going through their material on the [CS50x](https://cs50.harvard.edu/x/2021/) [website](https://cs50.harvard.edu/x/2021/), and I came across an interesting Python problem. Citing from the course materials in [Problem Set 6](https://cs50.harvard.edu/x/2021/psets/6/), the students are asked the following:

>[!info] Mario
>
>Implement a program the prints out a double half-pyramid of a specified height.
>
>![](posts/mario/images/1.png)


The output of such a program will look similar to the blocks and structures in the Mario game. So, for example running the program with height set to 4 would produce the following:

Height: 4
```
      #    #
     ##    ##
    ###    ###
   ####    ####
```

The code for this article can be found at:

- [Code](https://gist.github.com/pmesgari/f085a7852d46226079d8dae3a44089e7)
- [Test](https://gist.github.com/pmesgari/aed32a732d265874b0717cbe65e30448)

## Specifications and Tests

Our solution must be compliant with the specifications asked below:

- A valid height is an integer between 1 and 8 inclusive
- The program prompts the user for the height, if an invalid value is given, the user is asked again until a valid height is entered
- The program generates and outputs the desired half-pyramids

We are also given a collection of tests to help us in writing and verifying the behavior of our code, for sake of ease so that you don't have to move back and forth between windows, I list the test specifications directly from the course website:

- Run your program as `python mario.py` and wait for a prompt for input. Type in `-1` and press enter. Your program should reject this input as invalid, as by re-prompting the user to type in another number.
- Run your program as `python mario.py` and wait for a prompt for input. Type in `0` and press enter. Your program should reject this input as invalid, as by re-prompting the user to type in another number.
- Run your program as `python mario.py` and wait for a prompt for input. Type in `1` and press enter. Your program should generate the below output. Be sure that the pyramid is aligned to the bottom-left corner of your terminal, and that there are no extra spaces at the end of each line.

#  #

- Run your program as `python mario.py` and wait for a prompt for input. Type in `2` and press enter. Your program should generate the below output. Be sure that the pyramid is aligned to the bottom-left corner of your terminal, and that there are no extra spaces at the end of each line.

```
 #  #
##  ##
```
 
- Run your program as `python mario.py` and wait for a prompt for input. Type in `8` and press enter. Your program should generate the below output. Be sure that the pyramid is aligned to the bottom-left corner of your terminal, and that there are no extra spaces at the end of each line.
```
       #  #
      ##  ##
     ###  ###
    ####  ####
   #####  #####
  ######  ######
 #######  #######
########  ########

```

- Run your program as `python mario.py` and wait for a prompt for input. Type in `9` and press enter. Your program should reject this input as invalid, as by re-prompting the user to type in another number. Then, type in `2` and press enter. Your program should generate the below output. Be sure that the pyramid is aligned to the bottom-left corner of your terminal, and that there are no extra spaces at the end of each line.

```
 #  #
##  ##
```

- Run your program as `python mario.py` and wait for a prompt for input. Type in `foo` and press enter. Your program should reject this input as invalid, as by re-prompting the user to type in another number.
- Run your program as `python mario.py` and wait for a prompt for input. Do not type anything, and press enter. Your program should reject this input as invalid, as by re-prompting the user to type in another number.

## Solution Approach

So, this is an interesting and fun program to write, how should we begin?

Taking a close look at the pyramid's the first thing that captures attention is the symmetry between left and right halves. Can we use this symmetry to our advantage? Yes!

We can think of each layer in the pyramid as a sequence of characters, for example 0s and 1s. This allows us to quickly see the pattern and help us in writing the code. For example the pyramid of height 4 can have the following string representation:

Height: 4
```
      #    #     0001001000 
     ##    ##    0011001100
    ###    ###   0111001110
   ####    ####  1111001111
```

Now, next question is how can we generate such a string representation? Before we dive into the details of the implementation lets create an action plan. Looking at the strings above it is easy to see the symmetry, that is right half is always reverse of the left half. And finally the gap connects the two halves. Thus, our most important finding is: **Right is reverse of the Left.**

>[!info] Algorithm
>
>1. Make the left half  
>2. Make the right half by reversing the left half  
>3. Merge left and right  
>4. Insert the gap


We can write a pseudo code that generates the left half as such:

```python
for i in range(height)
    if i >= pivot - height
        left = left + 1
    else
        left = left + 0
```
The loop above executes per layer of the pyramid. We have introduced a variable called `pivot`, this is simply the halfway point determining the gap location, or in other words the `pivot` determines the length of the string. But, we also want to keep the gap size flexible, so we have to keep that in mind when we write the actual implementation. In each iteration we determine the 0s and 1s in the string by comparing the iteration index `i` with the simple formula `pivot - layer`. This allows us to determine how many 0s and 1s we need at each layer. Although simple, but this is really the core of our application. So, let's go ahead and write code and tests to deliver it.

It is important to realize how we define height. To do that imagine a coordinate system with its y axis at the top of the pyramid and its positive direction towards the bottom of the pyramid. Also, note that height starts at 1.

![](posts/mario/images/2.png)

Lets begin with a writing a test and the code to make it pass.

```python
def test_make_pyramid_layer_with_valid_integer():
    assert make_pyramid_half(height=1, pivot=1) == '1'
    assert make_pyramid_half(height=1, pivot=2) == '01'
    assert make_pyramid_half(height=1, pivot=3) == '001'
    assert make_pyramid_half(height=1, pivot=4) == '0001'
    assert make_pyramid_half(height=2, pivot=4) == '0011'
    assert make_pyramid_half(height=3, pivot=4) == '0111'
    assert make_pyramid_half(height=4, pivot=4) == '1111'
```

We have a function that we can call by passing the `height` we are at and the location of the `pivot`. Writing the code to pass the test is easy.

```python
def make_pyramid_half(height, pivot):
    half = ''
    for i in range(pivot):
        if i >= pivot - height:
            half = half + '1'
        else:
            half = half + '0'
    return half
```

So, now at any given `height` we are able to determine the half string representation of the pyramid. Important to remember is **our coordinate axis**, that determines which half of the pyramid are we generating. In the code above, we are generating the **left half** of our pyramid. To complete the core of our application we need to have a way to generate all the layers at once. Again, we start with writing our test.

```python
def test_make_pyramid_with_valid_height():
    assert make_pyramid(height=1, gap_size=1) == [
        '1g1'
    ]
    assert make_pyramid(height=3, gap_size=1) == [
        '001g100',
        '011g110',
        '111g111'
    ]
    assert make_pyramid(height=4, gap_size=1) == [
        '0001g1000',
        '0011g1100',
        '0111g1110',
        '1111g1111',
    ]
```

And here is code to pass the tests.

```python
def make_pyramid(height, gap_size):
    pivot = height
    pyramid = []
    for i in range(1, height + 1):
        left_half = make_pyramid_half(height=i, pivot=pivot)
        right_half = ''.join(reversed(left_half))
        gap = 'g' * gap_size
        layer = f'{left_half}{gap}{right_half}'
        pyramid.append(layer)

    return pyramid
```

The code should be self-explanatory, we simply make two halves, the gap and then combine them all to make a full layer. Looking back at our action plan, we have completed all the steps. Now is the time to write the code that prints the output.

It is important to understand the relation between the gap size and blocks. We can't use 0s to represent the gap size, because we are already using 0s to represent the empty blocks. If we would use 0s to represent the gap size, and the empty blocks, using a gap size of 2 we would end up with something like this:

```
       #     #
     ##       ##
   ###         ###
 ####           ####
```
 ####           ####

As you can see our pyramid is sort of skewed. But using a specific symbol for the gap which is not the same as the empty block resolves this issue.

Finally, here is the code that puts everything together.

```python
def replace_multiple(string, replacements):
    result = string
    for r in replacements:
        result = result.replace(r[0], r[1])
    return result


def draw_pyramid(pyramid, block='#', gap='  '):
    for layer in pyramid:
        l = replace_multiple(layer, [('1', block), ('0', gap), ('g', gap)])
        print(l)
```

This completed the core of our application, we can now draw pyramids. However, going back to our specifications, we are asked to develop a CLI interface that takes the `height` from the user and draws the pyramid. The CLI is responsible to make sure the data going into our application is valid and clean.

>[!note]
>**Validate** and clean your data on **the edges** of your application as much as possible. This allows the core of the system to stay clean and focus only on what matters, which is the **domain logic**.

Here is the final piece of our application.

```python
def cli():
    try:
        height = int(input('Enter height: '))
        gap_size = int(input('Enter gap size: '))
        if height not in range(1, 9):
            print('height must be between 1 and 9')
        elif gap_size <= 0:
            print('gap size must be a positive integer')
        else:
            pyramid = make_pyramid(height, gap_size)
            draw_pyramid(pyramid)
    except ValueError:
        print('height and gap size must be integers')


if __name__ == '__main__':
    try:
        while True:
            cli()
    except KeyboardInterrupt:
        print('Thank you for using Mario!')
        exit()
```

Even though our code is short, and simple there are many interesting aspects of learning about it. For example, understanding character size and its relation to the gap size, or handling validation at the edges.

--- New Post: techjournal/posts/personal-collection-of-articles-and-posts/index.md ---


---
title: Personal Collection of Articles and Posts
date: 2026-01-06
draft: true
categories:
keywords:
---
# Active Learning

As a an enthusiastic learner I come across a significant amount of blogs, articles, and other resources on a daily basis. I have realized skimming through these does not elevate my own knowledge and capabilities as much as I would like to. This passive learning and absorption of resources do not create the needed links in my mind so that I can apply what I gather and enjoy the benefits.

To break this pattern, I have decided to collect the most interesting blogs, articles, and videos that I have actually read and have given a serious attempt to understand. To cement my learning, I will also explain how I am planning to use what I have learned. Once I have applied the knowledge I will close the cycle with writing a review section and reflecting upon the experience.

I hope this will improve my active learning skills and allows me to get rid of all these open tabs and bookmarks across all my devices :)
##  The Code Review Pyramid by Gunnar Morling

**🔗** Link: [The Code Review Pyramid](https://www.morling.dev/blog/the-code-review-pyramid/) 

The Pyramid illustration gives a clear and intuitive visualization of the code review process. Most questions are practical and will help improving code quality.

I am planning to use this as a guardrail for Claude when generating code. In combination with MCP tools to access internal company resources such as design standards and best practices Claude should have enough context to generate good quality code.



--- New Post: techjournal/posts/computer-networks-qa-cdns/index.md ---


---
title: "Computer Networks Q&A: CDNs"
date: 2024-04-24
categories: computer network
keywords: 
---

In this article we will post questions and answers to understand the concept of CDNs and overlay networks

### What is the drawback to using traditional approach of having a single, publicly accessible server?

1. Geographic distance: Users are located all over the globe, there is potentially vast geographic distance between the users and the data center. When packets traverse lots of links it is possible that a link has a lower throughput resulting in increased time to travel.
2. Demand spikes: Popular resources such as a video can be requested many times, having a single server to repeatedly be sending the exact same data over the same communication link over and over again wastes bandwidth and it is financially costly to the content provider.
3. Single point of failure: In case of accidents, such as natural disaster or a massive power outage the entire data center can be taken offline.

### What is a CDN?

CDNs stands for **Content Distribution Networks**. CDNs are networks of multiple, geographically distributed servers and/or data centers holding copies of content and serve users from a server or a server cluster that matches best to the user request. CDNs address the issues discussed above.

### What are the six major challenges that internet applications face?

- Peering point congestion: There is motivation to upgrade the "first mile"(e.g. web hosts) and the "last mile"(e.g. end users) but not for the "middle-mile", which ends up being a bottleneck causes an increase of packet loss and latency.
- Inefficient routing protocols: BGP protocol does not take into account factors such as **congestion** and **latencies**, it is only concerned with AS(Autonomous System) hop count, this combined with BGP's well-documented vulnerabilities to malicious actions makes an inefficient inter-domain routing protocol for **modern internet**.
- Unreliable networks: Combination of natural and malicious incidents can cause outages
- Inefficient communication protocols: Like BGP, TCP was not designed for the demands of the modern internet. TCP requires as "Ack" for each data packets sent and this could become a bottleneck. Despite all research into ways to improve TCP, enhancements are slow to actually get implemented.
- Scalability: Scaling up infrastructure is expensive and takes time and it is hard to forecast what capacity needs will be.
- Application limitations and slow rate of change adoption: Some users are still using outdated applications such as Internet Explorer 6 which does not implement newer protocols. Adoption of better protocols on the server and client side are both slow.

### What are the major shifts that have impacted the evolution of the internet ecosystem?

1. There is an increased demand for online content, especially videos. This demand has spiked the development and growth of CDNs, in place of traditional single, massive data center.
2. The second shift is a "topological flattening" meaning the hierarchical topology has transitioned to more flat. IXPs have increased in popularity due to:
    1. Services offered
    2. Lower network operation costs for the ISPs and interconnection costs

These shifts mean more traffic is generated and exchanged locally, instead of traversing the complete hierarchy.

### Compare the "enter deep" and "bring home" approach of CDN server placement.

When placing CDNs there are two approaches, deploying lots of small clusters to get as close as possible to the users, or deploying fewer but larger clusters to critical areas.

1. Enter deep: Place many smaller server clusters "deep" into the access networks, e.g. Akamai, which have clusters in over 1700 locations. Minimizing the distance = Reducing delay and increasing bandwidth. Downside is the difficulty in maintenance and management of so many clusters.
2. Bring home: Place fewer larger server clusters at key points, typically in IXPs, "bringing the ISPs home". Downside is that the users will experience higher delay and lower throughput.

### What is the role of DNS in the way CDN operates?

With CDNs, there is an extra step where somehow the CDN will need to intercept the request in order to be able to decide which server cluster should service the request. DNS plays a major role in this step. By intercepting the requests with DNS, CDNs have the opportunity to choose where to direct users based on location, load on the servers, current traffic or other conditions.

What are the two main steps in CDN server selection?

1. Mapping the client to a cluster
2. Selecting a server from the cluster

### What is the simplest approach to select a cluster? What are the limitations of this approach?

Pick the geographically closes cluster. Limitations are:

- CDNs are interacting with the LDNS(Local Domain Name Server) of clients, so picking the geographically closest cluster is really picking the cluster closest to the LDNS and not the end user.
- Geographically closest may not be the best choice in terms of actual e2e network performance.

### What metrics could be considered when using measurements to select a cluster?

There are various e2e metrics, e.g. network layer metrics such as **delay, bandwidth** or both. Or application layer metrics, e.g. in case of video **re-buffering ratio** and **average bitrate**. Similarly, for web-browsing **page load time** can be used.

How are the metrics for cluster selection obtained?

- Active measurements: LDNS could probe multiple clusters by sending a ping request for monitoring the RTT
- Passive measurements: The name server system in the CDN could keep track of the performance metrics on the current traffic conditions. This requires a centralized controller which has a real-time view of the network conditions between all client-cluster pairs.

### Explain the distributed system that uses a 2-layered system. What are the challenges of this system?

Given the scale of today's internet having a centralized controller to monitor performance of client-cluster pairs is challenging, the proposal is to use a 2-layered system:

- A coarse-grained global layer operating at larger time scales keeping a global view of client quality measurements building a data-driven prediction model of video(content) quality.
- A fine-grained per client decision layer operating at millisecond making actual decisions based on the pre-computed global model and client state.

### What are the strategies for server selection? What are the limitations of these strategies?

- Simplest strategy could be to assign a server randomly, it is simple but not optimal. Workload for different servers are not the same, random assignment might end up selecting a highly loaded server.
- Map the requests based on the content meaning requests for the same piece of content can be mapped to the same machine, e.g. using a content-based hashing. When there is a change in the cluster environment, the hash table needs to be recomputed and this is not optimal.

### What is consistent hashing? How does it work?

Consistent hashing is an example of distributed has table and requires relatively little movement when nodes join and leave the system. The main idea is that servers and the content objects are mapped to the same ID space.

![](posts/computer-networks-qa-cdns/images/1.png)

When server 41 leaves, the successor for content 28 becomes server 61.

Why would a centralized design with a single DNS server not work?

- It introduces a single point of failure
- It would be very difficult for a single server to handle all the volume of the querying traffic
- Maintenance of a huge centralized database would be a big problem, e.g. updates for every single host in the internet

### What are the main steps that a host takes to use DNS?

The client requests the IP address for a certain domain, it first contacts the root server and then the request flows down to the top level domain server and finally the authoritative server for the hostname.

![](posts/computer-networks-qa-cdns/images/2.png)

What are the services offered by DNS, apart from hostname resolution?

- Mail server/Host aliasing
- Load distribution

### What is the difference between iterative and recursive DNS queries?

- In the iterative query process, the querying host is referred to a different DNS server in the chain, until it can fully resolve the request
- In the recursive query, each DNS server in the chain queries the next server and delegates the query to it.

### What is a DNS resource record?

The DNS servers store the mappings between hostnames and IP addresses as Resource Records(RRs) and they contain four fields:

- Name
- Value
- Type
- TTL

The most common types are:

- A: (domain name, IP address of the hostname)
- NS: (domain name, authoritative DNS server that can obtain IP addresses for hosts in that domain)
- CNAM: (alias hostname, canonical name)
- MX: (alias hostname of a mail server, canonical name of the mail server)

--- New Post: techjournal/posts/thinking-mathematically-chapter-6-solutions/index.md ---


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

--- New Post: techjournal/posts/hash-tables-shiritori/index.md ---


---
title: "Hash Tables: Shiritori"
date: 2025-07-02
draft: false
categories: thinking_algorithmically
keywords:
tags:
  - problem-solving
  - algorithms
  - hash_tables
---
## Shiritori
❓[Problem](https://open.kattis.com/problems/shiritori)
💡[My Solution](https://github.com/pmesgari/thinking-algorithmically/blob/main/hash_tables/shiritori.c)

My first attempt got *Time Limit Exceeded* and failed. I didn't pay enough attention to the problem description and ended up creating a silly hash table that mapped the last character of a word to the words that matched that last character and had already appeared.

Reading the description again I realised a hash table is only useful to detect if a word is repeating. Checking the last character is just something that can be done instantly as I process the input.

This is my hash function:

```C
unsigned long hash(char* word) {
    int i;
    unsigned long hash = 0;

    for(i = 0; i < strlen(word); i++) {
        hash = hash * P * i + (int)word[i];
    }

    return hash % SIZE;
    
}
```

Key ideas that make it effective for distributing strings in a hash table:

1. **Incorporating All Characters:** By looping `for(i = 0; i < strlen(word); i++)` and using `(int)word[i]`, we are now taking every character of the word into account. This is fundamental. If even one character is different, or characters are in a different order, the hash value is likely to change.

2. **Position Dependence (The `* i` term):** The `* i` term within `hash = hash * P * i + (int)word[i];` is what gives this hash function its unique twist and provides position dependence.
	- For the first character (where `i=0`), the `hash * P * i` part becomes `0`, so `hash` is just `(int)word[0]`. The first character directly contributes its value.
    - For subsequent characters (where `i > 0`), the `hash` accumulated from previous characters is multiplied by `P * i`. This means the "weight" given to earlier characters in the word increases non-linearly based on their position.
    - This ensures that the order of characters matters. For instance, the hash for "ab" will be different from "ba" because 'a' and 'b' will be multiplied by different values of `P * i` depending on their position. This is crucial for distinguishing strings that are anagrams or have small variations.
3. **Spread of Values (Multiplication and Addition):** The combination of multiplication (`* P * i`) and addition (`+ (int)word[i]`) ensures that the `hash` variable accumulates a large and distinct value for different strings. Each character introduces a change based on its ASCII value and its position.

4. **Modulo Operation (`% SIZE`):** Finally, `return hash % SIZE;` maps this potentially large calculated hash value to a valid index within your `hash_table` array. Using `SIZE` (which is the table size) ensures the hash value fits within the array bounds.
