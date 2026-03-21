#!/bin/bash

# The directory containing your posts
POSTS_DIR="techjournal/posts"

# The output file
OUTPUT_FILE="all_posts.md"

# Clear the output file if it exists
> "$OUTPUT_FILE"

# Find all markdown files, and for each file, append its content to the output file
find "$POSTS_DIR" -type f -name "*.md" | while read -r file
do
  echo -e "\n\n--- New Post: $file ---\n\n" >> "$OUTPUT_FILE"
  cat "$file" >> "$OUTPUT_FILE"
done

echo "All posts have been combined into $OUTPUT_FILE"
