// Enhance Obsidian-style callouts in Hugo after page load
document.querySelectorAll('blockquote').forEach(block => {
    const first = block.querySelector('p, div');
    if (!first) return;
    const match = first.textContent.match(/^\s*\[!(\w+)\]\s*(.*)/);
    if (match) {
      const type = match[1].toLowerCase();
      const customTitle = match[2] || type.charAt(0).toUpperCase() + type.slice(1);
      // Remove the [!type] from the text
      first.textContent = first.textContent.replace(/^\s*\[!(\w+)\]\s*(.*)/, '');
      block.classList.add('callout', `callout-${type}`);
      // Insert title
      const titleDiv = document.createElement('div');
      titleDiv.className = 'callout-title';
      titleDiv.textContent = customTitle;
      block.insertBefore(titleDiv, first);
    }
  });