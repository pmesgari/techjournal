# Techjournal

A place to write, explore and share about computer science and mathematics.

## Development Workflow

The theme is coming from a different repository managed here via git submodules.

An example workflow:

```bash
# Make and commit changes in the submodule
cd path/to/submodule
git add .
git commit -m "Update in submodule"
git push

# Go back to parent repo and commit the submodule pointer update
cd ../..
git add path/to/submodule
git commit -m "Bump submodule to latest commit"
git push
```

On commit, the github action should trigger and deploy a new version.