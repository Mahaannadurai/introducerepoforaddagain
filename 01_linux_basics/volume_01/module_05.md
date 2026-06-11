# MODULE 5 — Navigation Mastery

*Practice makes permanent. This module is almost entirely hands-on. You will navigate the Linux filesystem with speed and confidence using `pwd`, `ls`, `cd`, `tree`, and `realpath`.*

## 1. What You Will Learn

- Mastering `cd` with advanced techniques
- Using `ls` with multiple flags for different views
- The `tree` command for visual directory maps
- `realpath` to get the full absolute path of any file
- Efficient navigation patterns used by professionals

## 2. The tree Command

`tree` displays your folder structure as a visual tree — much cleaner than running `ls` multiple times.

```bash
sudo apt install tree -y
tree novamart/
```
Output:
```
novamart/
├── backups
├── departments
│   ├── engineering
│   │   └── team-notes.txt
│   ├── finance
│   ├── hr
│   └── marketing
├── logs
│   └── system.log
├── projects
│   ├── internal-tools
│   └── website
└── README.txt
```

| Command | What It Does |
|---|---|
| `tree` | Show tree of current directory |
| `tree novamart/` | Show tree of specific folder |
| `tree -L 2` | Limit depth to 2 levels |
| `tree -d` | Show directories only, not files |
| `tree -a` | Show hidden files too |

## 3. realpath — Get the Full Path

`realpath` resolves any relative path and gives you the complete absolute path.

```bash
cd novamart/departments/engineering
realpath team-notes.txt
```
Output:
```
/home/john/novamart/departments/engineering/team-notes.txt
```

## 4. Advanced ls Techniques

```bash
ls -lt    # sorted by modification time — newest first
ls -lS    # sorted by size — largest first
ls -lR    # recursive — shows contents of all subdirectories
```

---

## Hands-On Labs

### 🔵 Lab 5.1 — Speed Navigation Drill (Guided)

**Objective:** Navigate to 5 destinations and back to home, as fast as possible.

Time yourself doing this sequence:

```bash
cd /etc && pwd
cd /var/log && pwd
cd /usr/bin && pwd
cd /tmp && pwd
cd ~ && pwd
```

The `&&` operator runs the second command only if the first succeeds.

Now do the same sequence again using only absolute paths. Then do it again using the `cd -` technique wherever possible.

---

### 🟢 Lab 5.2 — Map the NovaMart Workspace (Practice)

**Objective:** Use `tree` to document the full NovaMart structure.

```bash
tree novamart/
tree -d novamart/
tree -L 2 novamart/

# Save the output to a file
tree novamart/ > novamart-structure.txt

cat novamart-structure.txt
```

The `>` symbol redirects output to a file instead of the screen. We will cover this in detail in a later module.

---

## Quick Recap

- `tree` displays folder structure visually — great for documentation
- `realpath` converts a relative path to its full absolute path
- `ls -lt` sorts by time, `ls -lS` sorts by size
- `&&` runs the next command only if the previous one succeeded
- Redirect output to a file with `>` (replaces) or `>>` (appends)

## 🐙 GitHub Progress Checkpoint

```
Folder:          enterprise-linux-operations-platform/module-05
Files to commit: novamart-structure.txt
Commit message:  "Module 05: Navigation mastered, structure documented"
```