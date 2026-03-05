# Total Voltage Manager - Build Guide

## Building with Local Electron (No GitHub Download)

This guide shows how to build the app using a **local Electron binary** to avoid external GitHub authentication issues.

---

## Prerequisites

Your company uses a local Electron binary instead of downloading from GitHub. The project is configured to support this.

---

## Configuration Files

### **`.npmrc`** (Already configured)
```
ELECTRON_SKIP_BINARY_DOWNLOAD=1
```
Prevents npm from trying to download Electron from GitHub.

### **`electron-builder.yml`** (Already configured)
```yaml
electronDownload:
  mirror: ""
  customDir: ""
```
Tells electron-builder to use the installed Electron instead of downloading.

---

## Using Your Local Electron Binary

### **Method 1: Install from Local Archive**

If your company provides a local Electron .tgz archive:

```bash
# Install from local file
npm install /path/to/electron-v33.3.0.tgz

# Or from local npm registry
npm config set registry http://your-internal-npm-registry
npm install electron
```

### **Method 2: Use Already Installed Electron**

If Electron is already in `node_modules`:

```bash
# Skip download during install
ELECTRON_SKIP_BINARY_DOWNLOAD=1 npm install

# Build the app
npm run build

# Create distributable
npm run dist
```

### **Method 3: Point to Local Binary**

If you have Electron binary at a specific path:

```bash
# Set environment variable
export ELECTRON_OVERRIDE_DIST_PATH=/path/to/electron/dist

# Then build
npm run dist
```

---

## Build Scripts

### **Development Build**
```bash
npm run dev
```
Uses the local Electron from `node_modules/electron`

### **Production Build**
```bash
# Build source files only (no packaging)
npm run build
```

### **Create Distributable**
```bash
# Build for your current platform
npm run dist

# Or specific platform:
npm run dist:linux   # Creates AppImage and .deb
npm run dist:win     # Creates installer and portable .exe
npm run dist:mac     # Creates .dmg and .zip
```

---

## Troubleshooting

### "Electron download failed" or "GitHub authentication required"

**Solution 1**: Use `.npmrc` configuration (already set)
```
ELECTRON_SKIP_BINARY_DOWNLOAD=1
```

**Solution 2**: Install Electron manually first
```bash
# If you have a local .tgz
npm install ./electron-v33.3.0.tgz --save-dev

# Then install other deps
npm install
```

**Solution 3**: Use internal npm registry
```bash
npm config set registry http://your-company-registry
npm install
```

### "Electron binary not found"

**Check if Electron is installed**:
```bash
ls -la node_modules/electron/dist/electron
```

If missing, install from your local source:
```bash
npm install /path/to/electron-package --save-dev
```

### "electron-builder can't find Electron"

**Set explicit path**:
```bash
export ELECTRON_OVERRIDE_DIST_PATH=/home/joohan/dev/bh-support/node_modules/electron/dist
npm run dist
```

---

## Build Output

Distributables will be created in the `dist/` directory:

**Linux**:
- `dist/Total Voltage Manager-0.1.0.AppImage`
- `dist/total-voltage-manager_0.1.0_amd64.deb`

**Windows**:
- `dist/Total Voltage Manager Setup 0.1.0.exe` (installer)
- `dist/Total Voltage Manager 0.1.0.exe` (portable)

**macOS**:
- `dist/Total Voltage Manager-0.1.0.dmg`
- `dist/Total Voltage Manager-0.1.0-mac.zip`

---

## Company-Specific Setup

### **Option A: Internal NPM Registry**

If your company has an internal npm registry with Electron:

```bash
# Configure npm to use internal registry
npm config set registry http://npm.company.internal

# Install all dependencies (including Electron)
npm install
```

### **Option B: Vendored Electron**

If you vendor Electron in your repository:

1. Place Electron .tgz in `vendor/electron-v33.3.0.tgz`

2. Install:
```bash
npm install ./vendor/electron-v33.3.0.tgz --save-dev
```

3. Commit package-lock.json (pins the version)

### **Option C: Shared Binary Path**

If Electron is installed system-wide:

```bash
# Create symlink
ln -s /opt/electron/v33.3.0 node_modules/electron

# Build
npm run dist
```

---

## Continuous Integration

For CI/CD pipelines without GitHub access:

```yaml
# Example: GitLab CI
build:
  script:
    - npm config set registry http://internal-registry
    - ELECTRON_SKIP_BINARY_DOWNLOAD=1 npm ci
    - npm run build
    - npm run dist
  artifacts:
    paths:
      - dist/
```

---

## Verifying Local Electron

```bash
# Check Electron version
npx electron --version

# Should show: v33.3.0 (or your installed version)

# Test app runs
npm run dev
```

---

## Security Note

Using a local Electron binary from your company's trusted source is **more secure** than downloading from external GitHub, especially in corporate environments with restricted network access.

---

**Next Steps**:
1. Ensure Electron is installed from your company's source
2. Run `npm run build` to compile
3. Run `npm run dist` to create distributable
4. Distribute the app in `dist/` folder

For questions about your company's Electron distribution, consult your internal IT/DevOps team.
