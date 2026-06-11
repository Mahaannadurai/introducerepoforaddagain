# MODULE 2 — Working With Files And Folders

*Linux is built around files. Everything — your settings, your programs, your data — is stored as a file. In this module, you learn to navigate Linux and build your first real folder structure.*

## 1. What You Will Learn

- How to see where you are: `pwd`
- How to list files and folders: `ls`
- How to move between folders: `cd`
- How to create folders: `mkdir`
- How to create empty files: `touch`
- How Linux paths work
- The difference between absolute and relative paths
- How to build the NovaMart company workspace

## 2. Why This Matters

Navigation is the single most important skill in Linux. Before you can do anything — configure a server, read a log, edit a file — you need to know how to get there.

In your DevOps career, you will spend a huge amount of time navigating server filesystems, finding configuration files, and organizing project structures. This module teaches you that foundation.

## 3. Understanding Linux Paths

### The Filesystem is a Tree

Imagine the Linux filesystem as an upside-down tree. At the very top — the **root** — is a single directory represented by a forward slash: `/`

Everything in Linux hangs below that single root. Every file, every folder, every device.

```
/                    ← The root (top of the tree)
├── home/            ← Where user folders live
│   ├── john/        ← John's home folder
│   └── sarah/       ← Sarah's home folder
├── etc/             ← Configuration files
├── var/             ← Logs and variable data
├── usr/             ← Programs and applications
└── tmp/             ← Temporary files
```

### Absolute vs Relative Paths

This is one of the most important concepts in Linux navigation.

An **absolute path** starts from the root and gives the complete address to a file. It always starts with `/`:
```
/home/john/documents/report.txt
```

A **relative path** gives directions from where you currently are. It does NOT start with `/`:
```
documents/report.txt
```

If you are currently in `/home/john`, both paths above lead to the same file.

### Special Path Shortcuts

| Shortcut | What It Means |
|---|---|
| `~` | Your home directory (`/home/yourusername`) |
| `.` | The current directory you are in right now |
| `..` | The parent directory (one level up) |
| `-` | The previous directory you were just in |

## 4. The Commands

### pwd — Where Am I?

```bash
pwd
```
Output:
```
/home/john
```

`pwd` stands for **Print Working Directory**. Your working directory is the folder you are currently inside.

### ls — What Is Here?

```bash
ls
```
Output:
```
Desktop  Documents  Downloads  Music  Pictures
```

`ls` lists all the files and folders in your current directory. It is the most-used command in Linux.

| Command | What It Does |
|---|---|
| `ls` | Basic list of files and folders |
| `ls -l` | Long format: shows permissions, size, date |
| `ls -a` | Shows ALL files including hidden ones (starting with `.`) |
| `ls -la` | Long format AND hidden files combined |
| `ls -lh` | Long format with human-readable file sizes (KB, MB) |
| `ls /etc` | Lists the contents of the /etc folder |

```bash
ls -la
```
Output:
```
total 32
drwxr-xr-x 5 john john 4096 Jun  9 10:00 .
drwxr-xr-x 3 root root 4096 Jun  9 09:00 ..
-rw-r--r-- 1 john john  220 Jun  9 09:00 .bash_logout
-rw-r--r-- 1 john john 3526 Jun  9 09:00 .bashrc
drwxr-xr-x 2 john john 4096 Jun  9 10:00 Documents
```

The `d` at the beginning means it is a directory. The `-` means it is a file.

### cd — Move Between Folders

```bash
cd Documents
```

`cd` stands for **Change Directory**. It moves you from your current location to a new one.

| Command | What It Does |
|---|---|
| `cd Documents` | Move into the Documents folder (relative path) |
| `cd /home/john/Documents` | Move to Documents using absolute path |
| `cd ..` | Move up one level to the parent folder |
| `cd ~` | Go straight to your home directory from anywhere |
| `cd -` | Go back to the previous directory you were in |
| `cd /` | Go to the root of the filesystem |

### mkdir — Create Folders

```bash
mkdir projects
```

`mkdir` stands for **Make Directory**. It creates a new folder.

| Command | What It Does |
|---|---|
| `mkdir projects` | Create one folder called projects |
| `mkdir -p projects/web/frontend` | Create nested folders in one command |
| `mkdir docs logs backups` | Create three folders at once |

The `-p` flag creates all parent folders needed. Without it, mkdir would fail if the parent folder does not exist yet.

### touch — Create Empty Files

```bash
touch readme.txt
```

`touch` creates an empty file. If the file already exists, it updates the file's last-modified timestamp without changing its content.

```bash
touch file1.txt file2.txt file3.txt
```

You can create multiple files at once by listing them separated by spaces.

## 5. Building the NovaMart Workspace

NovaMart Global needs an organized folder structure on the Linux server. Your job is to create it.

```
novamart/
├── departments/
│   ├── engineering/
│   ├── marketing/
│   ├── finance/
│   └── hr/
├── projects/
│   ├── website/
│   └── internal-tools/
├── logs/
└── backups/
```

---

## Hands-On Labs

### 🔵 Lab 2.1 — Navigate Like a Pro (Guided)

**Objective:** Practice moving around the Linux filesystem confidently.

```bash
cd ~
pwd

cd /
pwd
ls

cd /etc
ls

cd ..
pwd

cd ~
pwd

cd -
pwd
```

---

### 🔵 Lab 2.2 — Build the NovaMart Workspace (Guided)

**Objective:** Create the company folder structure.

```bash
cd ~

mkdir -p novamart/departments/engineering
mkdir -p novamart/departments/marketing
mkdir -p novamart/departments/finance
mkdir -p novamart/departments/hr
mkdir -p novamart/projects/website
mkdir -p novamart/projects/internal-tools
mkdir novamart/logs
mkdir novamart/backups

ls novamart/
ls novamart/departments/

touch novamart/departments/engineering/team-notes.txt
touch novamart/logs/system.log
touch novamart/README.txt

ls -la novamart/
```

---

### 🟢 Lab 2.3 — Navigation Challenge (Practice)

**Objective:** Navigate the NovaMart structure using only `cd`, `pwd`, and `ls`.

Starting from your home directory, navigate to each of these locations using only **RELATIVE paths** (no absolute paths allowed!):

1. `novamart/departments/engineering`
2. `novamart/projects/website`
3. `novamart/logs`

Then navigate back to your home directory using only the `~` shortcut.

After each `cd`, run `pwd` to confirm where you are.

**Bonus:** Try to complete the whole challenge in fewer than 15 commands total.

---

## Quick Recap

- `pwd` shows your current location in the filesystem
- `ls` lists files and folders. Add `-l` for details, `-a` for hidden files
- `cd` moves you between folders. `cd ~` goes home, `cd ..` goes up one level
- `mkdir` creates folders. Use `-p` to create nested folders in one command
- `touch` creates empty files or updates a file's timestamp
- Absolute paths start with `/`. Relative paths start from where you are
- `~` means home, `.` means current, `..` means parent

## 🎯 Mini Challenge

Without looking at your notes, build this structure from scratch:

```
novamart-challenge/
├── servers/
│   ├── web/
│   └── database/
├── configs/
└── reports/placeholder.txt
```

Then navigate into `servers/web` and back to home using only shortcuts.

## 🐙 GitHub Progress Checkpoint

```
Folder:          enterprise-linux-operations-platform/module-02
Files to commit: novamart-structure.txt, notes.md
Commit message:  "Module 02: NovaMart workspace structure created"
```

## Knowledge Check

**Review Questions:**
1. What does `pwd` stand for and what does it tell you?
2. What is the difference between `ls` and `ls -la`?
3. What does the `-p` flag do in `mkdir -p`?
4. What is the difference between an absolute path and a relative path?
5. If you are in `/home/john/documents`, what does `cd ../..` take you to?

**Practical Questions:**
- Create a three-level deep folder structure using a single `mkdir` command.
- Starting from `/etc`, navigate to `/home` and back using only relative paths.

**Reflection Question:**
*The terminal felt overwhelming at first. How has navigation started to feel more natural? What helped?*

