---
title: Threads vs Processes
date: 2026-01-06
draft: false
type: posts
categories:
  - til
keywords: til
---

## Process

A completely separate restaurant kitchen.

- Has its own stove, utensils, ingredients, chef
- Can't access another kitchen's ingredients
- If it caches fire, only that kitchen burns down
- More expensive to setup and tear down

## Thread

Multiple chefs working in the **SAME** kitchen.

- Share the same stove, utensils, ingredients
- Can access each other's workspace
- If one chef makes a mess, everyone sees it
- Cheap to add/remove chefs

## Process vs Thread

| Aspect        | Process                   | Thread                        |
| ------------- | ------------------------- | ----------------------------- |
| Memory        | Separate memory space     | Shared memory space           |
| Variables     | Each has its own copy     | All share same variables      |
| Isolation     | Completely isolated       | Can interfere with each other |
| Creation Cost | Expensive (fork/spawn)    | Cheap (just a new call stack) |
| Communication | IPC (pipes, sockets)      | Direct (shared memory)        |
| Crash impact  | Isolated (others survive) | Can corrupt shared state      |
| Python GIL    | Each has own GIL          | All share one GIL             |
