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