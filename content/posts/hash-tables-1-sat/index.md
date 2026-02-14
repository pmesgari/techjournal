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
