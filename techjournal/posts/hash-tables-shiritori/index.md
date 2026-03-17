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
