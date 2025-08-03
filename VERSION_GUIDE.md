# Version Management Guide

This project now has automatic version management integrated into the build process.

## How it works

- The version number is stored in `package.json`
- The UI displays the version dynamically from `package.json` in:
  - Main navigation sidebar (bottom area)
  - Login page (bottom left)

## Available Commands

### Automatic Version Increment (Recommended)
```bash
npm run build
```
This command will:
1. Automatically increment the patch version (e.g., 1.0.1 → 1.0.2)
2. Run TypeScript compilation
3. Build the production bundle

### Manual Version Control
```bash
# Increment patch version (1.0.1 → 1.0.2)
npm run version:patch

# Increment minor version (1.0.1 → 1.1.0)
npm run version:minor

# Increment major version (1.0.1 → 2.0.0)
npm run version:major
```

### Build without Version Increment
```bash
npm run build:no-version
```
Use this for testing builds without incrementing the version.

## Version Display Locations

1. **Main Layout Sidebar**: Bottom area shows "v{version}"
2. **Login Page**: Bottom left corner shows "v{version}"

## Notes

- The `--no-git-tag-version` flag prevents npm from creating git tags automatically
- Version numbers follow semantic versioning (MAJOR.MINOR.PATCH)
- Each production build should increment the version for tracking deployments
