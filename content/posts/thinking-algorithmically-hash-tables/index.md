---
title: "Thinking Algorithmically: Hash Tables"
date: 2025-07-02
draft: false
categories: thinking_algorithmically
keywords: 
tags:
  - problem-solving
  - algorithms
---
## Hash Tables

I learned about hash tables and their power. Their main benefit is shrinking the search space. This also means every time a problem is asking to search in a large input, I should think about hash tables.

Designing a good hash table relies on a performant hash function that distributes the items as evenly as possible. This reduces collisions which means improves performance.

In this post I present my learnings and solutions for:
- [CD](https://open.kattis.com/problems/cd)
- [Shiritori](https://open.kattis.com/problems/shiritori)
- [1-SAT](https://atcoder.jp/contests/abc187/tasks/abc187_c)

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
