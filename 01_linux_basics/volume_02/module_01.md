## 1. What You Will Learn

- What a package manager is and why it exists
- How the apt package system works
- How to search for, install, update, and remove software
- How to manage software repositories
- How to hold packages at specific versions
- How to audit what is installed on a server
- How to use `dpkg` for low-level package operations

## 2. Why This Matters

On a production server you never install software by downloading an installer and clicking Next. Everything is managed through the package manager — because the package manager handles dependencies, security updates, version tracking, and clean removal. In DevOps, you will write package installation commands into automation scripts, Dockerfiles, and configuration management tools every single day.

## 3. How Package Management Works

### The Problem Package Managers Solve

Imagine you want to install a web server. The web server depends on a specific version of a library. That library depends on another library. That other library conflicts with something already installed.

Without a package manager, you would resolve this manually — a nightmare at scale. The package manager resolves the entire dependency tree for you automatically.

### The apt Ecosystem

Ubuntu uses the **APT** (Advanced Package Tool) ecosystem. It has several layers:

```
┌─────────────────────────────────────────┐
│  apt  — The command you type           │
│  (high-level, friendly interface)      │
├─────────────────────────────────────────┤
│  apt-get / apt-cache                   │
│  (older tools, still widely used       │
│   in scripts for compatibility)        │
├─────────────────────────────────────────┤
│  dpkg                                  │
│  (low-level: installs .deb files       │
│   directly, no dependency resolution) │
├─────────────────────────────────────────┤
│  Package Repositories                  │
│  (servers where .deb files live)       │
└─────────────────────────────────────────┘
```

### What is a Repository?

A **repository** is a server that hosts packages. When you run `apt install nginx`, Ubuntu connects to its configured repositories, finds the nginx package and all its dependencies, downloads them, and installs everything.

Repository configuration lives in:
- `/etc/apt/sources.list` — the main list
- `/etc/apt/sources.list.d/` — additional repository files (one per source)

```bash
cat /etc/apt/sources.list
ls /etc/apt/sources.list.d/
```

## 4. The Core apt Commands

### Update the Package Index

```bash
sudo apt update
```

This does **not** install anything. It downloads the latest list of available packages from your configured repositories. Always run this before installing anything.

```
Get:1 http://archive.ubuntu.com/ubuntu noble InRelease [256 kB]
Get:2 http://archive.ubuntu.com/ubuntu noble-updates InRelease [126 kB]
Fetched 1,204 kB in 3s
Reading package lists... Done
Building dependency tree... Done
```

### Install a Package

```bash
sudo apt install nginx
sudo apt install nginx curl git tree   # Install multiple at once
sudo apt install -y nginx              # -y = yes to all prompts (for scripts)
```

### Remove a Package

```bash
sudo apt remove nginx         # Remove the package, keep config files
sudo apt purge nginx          # Remove the package AND its config files
sudo apt autoremove           # Remove packages no longer needed by anything
```

> **remove vs purge:** Use `remove` when you might reinstall and want to keep your configuration. Use `purge` when you want a completely clean removal — important when troubleshooting a broken installation.

### Upgrade Packages

```bash
sudo apt upgrade              # Upgrade all installed packages
sudo apt full-upgrade         # Upgrade + handle dependency changes
sudo apt upgrade nginx        # Upgrade only nginx
```

### Search for Packages

```bash
apt search nginx              # Search by name or description
apt search "web server"       # Search by keyword
```

### Get Package Information

```bash
apt show nginx                # Show details: version, dependencies, description
apt-cache policy nginx        # Show installed version vs available version
```

Output of `apt-cache policy nginx`:
```
nginx:
  Installed: 1.24.0-2ubuntu7
  Candidate: 1.24.0-2ubuntu7
  Version table:
 *** 1.24.0-2ubuntu7 500
        500 http://archive.ubuntu.com/ubuntu noble/main amd64 Packages
```

### List Installed Packages

```bash
apt list --installed                        # All installed packages
apt list --installed | grep nginx           # Is nginx installed?
apt list --installed | wc -l               # Count installed packages
dpkg -l                                     # Detailed list via dpkg
dpkg -l | grep ^ii                         # Only fully installed
```

## 5. dpkg — Low-Level Package Operations

`dpkg` is the underlying tool that actually installs `.deb` files. You use it for:

```bash
# Install a .deb file you downloaded manually
sudo dpkg -i package.deb

# List all installed packages
dpkg -l

# Check if a specific package is installed
dpkg -l nginx

# See which files a package installed
dpkg -L nginx

# Find which package owns a file
dpkg -S /usr/sbin/nginx
```

Output of `dpkg -S /usr/sbin/nginx`:
```
nginx-core: /usr/sbin/nginx
```

## 6. Managing Repositories

### Adding a Repository (PPA)

PPAs (Personal Package Archives) let you install software not in Ubuntu's default repositories — like newer versions of tools.

```bash
# General pattern
sudo add-apt-repository ppa:name/repo
sudo apt update
sudo apt install package-name

# Example: Add git PPA for latest version
sudo add-apt-repository ppa:git-core/ppa
sudo apt update
sudo apt install git
```

### Adding Third-Party Repos (Modern Method)

Many tools like Docker, Node.js, and PostgreSQL use signed repository keys:

```bash
# Step 1: Download and store the signing key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Step 2: Add the repository
echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list

# Step 3: Update and install
sudo apt update
sudo apt install docker-ce
```

### Removing a Repository

```bash
sudo add-apt-repository --remove ppa:name/repo
sudo rm /etc/apt/sources.list.d/docker.list
sudo apt update
```

## 7. Package Version Management

### Holding a Package at a Specific Version

In production, you often need to prevent a package from being upgraded automatically — because an upgrade might break a running application.

```bash
# Hold a package (prevent upgrades)
sudo apt-mark hold nginx

# Unhold a package (allow upgrades again)
sudo apt-mark unhold nginx

# See all held packages
apt-mark showhold
```

### Installing a Specific Version

```bash
# See available versions
apt-cache madison nginx

# Install a specific version
sudo apt install nginx=1.24.0-2ubuntu7
```

## 8. Keeping the System Updated

### Unattended Security Updates

Ubuntu has a mechanism to automatically apply security updates:

```bash
sudo apt install unattended-upgrades
sudo dpkg-reconfigure unattended-upgrades
```

### The Full Update Workflow

This is the sequence every DevOps engineer runs on a server:

```bash
sudo apt update              # Refresh package index
sudo apt upgrade             # Apply available upgrades
sudo apt autoremove          # Clean up orphaned packages
sudo apt autoclean           # Remove cached package files
```

---

## Hands-On Labs

### 🔵 Lab 1.1 — Install the NovaMart Toolset (Guided)

**Objective:** Install the tools NovaMart's infrastructure team needs.

```bash
# Step 1: Update the package index
sudo apt update

# Step 2: Install essential tools
sudo apt install -y \
  curl \
  wget \
  tree \
  htop \
  net-tools \
  unzip \
  jq \
  git \
  vim

# Step 3: Verify each tool was installed
which curl
which tree
which htop
which jq

# Step 4: Check versions
curl --version | head -1
git --version
vim --version | head -1
```

---

### 🔵 Lab 1.2 — Explore Package Information (Guided)

**Objective:** Use apt to investigate packages before installing them.

```bash
# Search for a web server
apt search "web server" | head -20

# Get info about nginx before installing
apt show nginx

# Check policy (what version is available)
apt-cache policy nginx

# See nginx's dependencies
apt-cache depends nginx

# What would be installed alongside nginx?
apt-get install --dry-run nginx
# --dry-run shows what WOULD happen without doing it
```

---

### 🟢 Lab 1.3 — Install, Inspect, and Remove nginx (Practice)

**Objective:** Full package lifecycle management.

```bash
# Step 1: Install nginx
sudo apt install -y nginx

# Step 2: Verify installation
dpkg -l nginx
which nginx
nginx -v

# Step 3: See what files were installed
dpkg -L nginx | head -20

# Step 4: Find out which package owns /usr/sbin/nginx
dpkg -S /usr/sbin/nginx

# Step 5: Remove nginx cleanly
sudo apt purge nginx nginx-common

# Step 6: Clean up leftovers
sudo apt autoremove

# Step 7: Verify it is gone
dpkg -l nginx
which nginx
```

---

### 🟢 Lab 1.4 — Audit Installed Packages (Practice)

**Objective:** Inventory a server's software — a real-world task when inheriting a system.

```bash
# Count total installed packages
dpkg -l | grep ^ii | wc -l

# List all manually installed packages (not auto-installed)
apt-mark showmanual

# Find recently installed packages
grep " install " /var/log/dpkg.log | tail -20

# Find all packages installed today
grep "$(date +%Y-%m-%d)" /var/log/dpkg.log | grep " install " | \
  awk '{print $5}' | sort | uniq

# Save a full package audit report
dpkg -l > ~/novamart/logs/package-audit-$(date +%Y%m%d).txt
echo "Package audit saved."
```

---

### 🟡 Lab 1.5 — Challenge: Hold and Manage Versions

**Scenario:** NovaMart's application requires a specific version of curl and it must not be upgraded during routine maintenance.

```bash
# Step 1: Check what version of curl is installed
curl --version
apt-cache policy curl

# Step 2: Hold curl at its current version
sudo apt-mark hold curl

# Step 3: Verify the hold is in place
apt-mark showhold

# Step 4: Try to upgrade (it should skip curl)
sudo apt upgrade --dry-run 2>&1 | grep curl

# Step 5: Unhold when the application supports the newer version
sudo apt-mark unhold curl
apt-mark showhold
```

---

### 🔴 Lab 1.6 — Troubleshooting Lab: Broken Package State

**Scenario:** An interrupted installation left the package system in a broken state.

```bash
# Simulate a common problem scenario
# (do not actually break anything — just learn the fix commands)

# Fix 1: If apt reports broken packages
sudo apt --fix-broken install

# Fix 2: If dpkg is in an interrupted state
sudo dpkg --configure -a

# Fix 3: If the package index is corrupted
sudo rm -rf /var/lib/apt/lists/*
sudo apt update

# Fix 4: If a package fails with dependency errors
sudo apt install -f    # -f = fix dependencies

# Fix 5: Clear the apt cache
sudo apt clean
sudo apt update
```

---

## Common Mistakes

| Mistake | Problem | Solution |
|---|---|---|
| Forgetting `sudo apt update` before install | Installing old package versions | Always `apt update` first |
| Using `remove` when you need `purge` | Config files remain, can cause issues on reinstall | Use `purge` for a clean slate |
| Installing packages without reading dependencies | Unexpected software installed | Use `--dry-run` to preview first |
| Never running `autoremove` | Disk fills with orphaned packages | Add `autoremove` to your update routine |
| Mixing PPAs carelessly | Package conflicts, broken system | Only use trusted, well-maintained PPAs |

---

## 💼 Interview Corner

**Q: What is the difference between `apt update` and `apt upgrade`?**
A: `apt update` refreshes the local package index — it downloads information about what packages are available and their current versions, but installs nothing. `apt upgrade` uses that index to upgrade installed packages to their latest available versions. You always run `update` before `upgrade`.

**Q: What is the difference between `apt remove` and `apt purge`?**
A: `apt remove` uninstalls the package but leaves configuration files behind. `apt purge` removes the package and all its configuration files. Use `purge` when you want a completely clean removal, especially when troubleshooting a misconfigured service.

**Q: How do you prevent a package from being upgraded?**
A: `sudo apt-mark hold package-name`. This is important in production when you need to pin a specific version for compatibility reasons. Use `apt-mark showhold` to see all held packages.

**Q: What is dpkg and how does it relate to apt?**
A: `dpkg` is the low-level Debian package manager that actually installs `.deb` files. `apt` is a higher-level tool that uses `dpkg` under the hood but adds dependency resolution, repository management, and a friendlier interface. When `apt install` runs, it ultimately calls `dpkg` to do the actual installation.

---

## Quick Recap

- `sudo apt update` refreshes the package index — always run this first
- `sudo apt install package` installs software with all dependencies
- `sudo apt remove` removes a package. `sudo apt purge` removes it and its config files
- `sudo apt upgrade` upgrades all installed packages
- `sudo apt autoremove` cleans up packages no longer needed
- `dpkg -l` lists all installed packages. `dpkg -S /path` finds which package owns a file
- `apt-mark hold package` prevents a package from being upgraded
- Repository configuration lives in `/etc/apt/sources.list` and `/etc/apt/sources.list.d/`

## 🎯 Mini Challenge

1. Find and install a package that displays system information in a visually appealing way (search for `neofetch` or `screenfetch`)
2. Use `dpkg -L` to find every file it installed
3. Check the package's version with `apt-cache policy`
4. Hold it at its current version, verify the hold, then release it
5. Purge it completely and verify no config files remain

## 🐙 GitHub Progress Checkpoint

```
Folder:          enterprise-linux-operations-platform/module-22
Files to commit: package-audit.txt, toolset-install-notes.md
Commit message:  "Module 22: Package management mastered — NovaMart toolset installed"
```

## Knowledge Check

**Review Questions:**
1. What does `sudo apt update` actually do?
2. What is the difference between `apt remove` and `apt purge`?
3. Where is repository configuration stored?
4. What does `dpkg -S /usr/bin/curl` tell you?
5. What command shows which packages have been held back from upgrading?

**Practical Questions:**
- Write the commands to install, verify, hold, and then cleanly remove a package.
- Check the package log to find every package installed in the last 24 hours.

**Reflection Question:**
*Package managers exist because software has dependencies. What would the world look like if every Linux user had to manually find and install every dependency of every program they wanted? How does apt change that reality?*

