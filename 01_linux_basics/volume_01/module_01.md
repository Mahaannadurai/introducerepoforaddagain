# MODULE 1 — Getting Comfortable With Linux

*Before writing a single command, let us understand what Linux is, why it matters, and how to feel at home in the terminal.*

## 1. What You Will Learn

- What Linux is and where it came from
- Why Linux powers the internet, the cloud, and DevOps
- How WSL lets you run Linux on your Windows computer
- How to open and use the terminal
- How to run your first Linux commands
- How to use command history and tab completion
- How to get help when you are stuck
- How to create your GitHub repository for this course

## 2. Why This Matters

If you want to work in DevOps, Cloud Engineering, or Site Reliability, you will use Linux every single day. Not occasionally — every day.

Here is where Linux is running right now, right as you read this:

- The websites you visit — most run on Linux servers
- The cloud platforms you will deploy to — AWS, Azure, Google Cloud all run on Linux
- Containers and Kubernetes — built on Linux
- CI/CD pipelines — running on Linux
- Database servers — running on Linux

Learning Linux is not optional for DevOps. It is the foundation everything else is built on.

## 3. Simple Explanation

### What is Linux?

Think of your computer like a restaurant.

The hardware — your processor, RAM, hard drive — is the kitchen. The kitchen does not know how to cook by itself. It needs someone to tell it what to do.

Linux is the chef. Linux is the software that controls your hardware and makes everything work together.

More specifically, Linux is an **operating system** — just like Windows on your home computer, or macOS on a Mac. But Linux was designed to be powerful, fast, and free.

## 4. Linux Concept

### A Brief History

In 1991, a Finnish university student named **Linus Torvalds** was frustrated with existing operating systems. So he built his own. He called it Linux.

Linus shared his code publicly and invited others to help improve it. Thousands of developers around the world joined in. Today, Linux is maintained by millions of contributors and used by billions of devices.

Linux is **open source** — meaning its source code is freely available for anyone to read, modify, and distribute. This is why there are many versions of Linux, called **distributions** or **distros**.

| Linux Distribution | Common Use |
|---|---|
| Ubuntu | Beginner-friendly, very popular for servers and desktops |
| Debian | Extremely stable, used in production servers |
| CentOS / Rocky Linux | Enterprise servers, common in companies |
| Alpine | Tiny and fast, used inside Docker containers |
| Amazon Linux | AWS cloud servers |
| Kali Linux | Penetration testing and security work |

We are using **Ubuntu 24.04** in this course because it is the most beginner-friendly and the most widely used in DevOps.

## 5. How WSL Works

### Running Linux Inside Windows

WSL stands for **Windows Subsystem for Linux**. Microsoft built it so developers could run a real Linux environment directly inside Windows — without rebooting or using a virtual machine.

Think of it like having a Linux computer living inside your Windows computer. They share files, they can talk to each other, but Linux has its own filesystem and its own way of doing things.

```
┌─────────────────────────────────────────┐
│         Your Windows 11 Computer        │
│                                         │
│   ┌──────────────────────────────────┐  │
│   │    WSL Ubuntu 24.04 (Linux)      │  │
│   │                                  │  │
│   │   Your terminal lives here       │  │
│   │   Linux commands run here        │  │
│   │   Linux filesystem lives here    │  │
│   └──────────────────────────────────┘  │
│                                         │
│   Windows files: C:\Users\YourName      │
│   Linux files:   /home/yourname         │
└─────────────────────────────────────────┘
```

## 6. Opening the Terminal

### Your Gateway to Linux

The terminal is the window where you type commands and see results. It is also called the **command line** or **shell**.

There are several ways to open your Ubuntu terminal on Windows 11:

1. Press the Windows key, type `Ubuntu`, press Enter
2. Open Windows Terminal, click the dropdown arrow at the top, select Ubuntu
3. In VS Code, press `Ctrl + `` ` (backtick) to open the integrated terminal, then select Ubuntu

When the terminal opens, you will see something like:

```
yourname@computername:~$
```

- `yourname` = your Linux username
- `computername` = your machine name
- `~` = you are in your home folder
- `$` = you are a regular user (not an administrator)

That text before the dollar sign is called the **prompt**. It tells you who you are, where you are, and what kind of user you are.

## 7. Your First Commands

### Running Commands in the Terminal

A command is an instruction you type and send to Linux. You type the command and press Enter. Linux reads it, does the work, and shows you the result.

```bash
whoami
```
Output:
```
john
```

The `whoami` command tells you which user you are logged in as.

```bash
pwd
```
Output:
```
/home/john
```

`pwd` stands for **Print Working Directory**. It tells you where you currently are inside the Linux filesystem.

```bash
date
```
Output:
```
Tue Jun  9 14:23:01 UTC 2026
```

```bash
uname -a
```
Output:
```
Linux DESKTOP-ABC123 5.15.0-1054-azure #62-Ubuntu SMP...
```

The `uname` command shows information about the Linux system. The `-a` flag means "show all information." **Flags** are extra options you can add to commands.

## 8. Terminal Basics

### Copy and Paste in the Terminal

| Action | Shortcut in Terminal |
|---|---|
| Copy text | `Ctrl + Shift + C` |
| Paste text | `Ctrl + Shift + V` |
| Cancel a running command | `Ctrl + C` |
| Clear the screen | `Ctrl + L` or `clear` |
| Exit the terminal | `exit` or `Ctrl + D` |

> **Important:** `Ctrl+C` in the terminal does NOT copy — it cancels whatever command is currently running.

### Command History

Linux remembers every command you have ever typed. Scroll through your history using the arrow keys.

| Action | How To Do It |
|---|---|
| Previous command | Press the Up arrow key |
| Next command | Press the Down arrow key |
| Search your history | Press `Ctrl + R`, then type part of the command |
| Show all history | Type: `history` |
| Run a previous command | Type: `!number` (e.g., `!42` to run command 42) |

### Tab Completion

Tab completion is one of the most useful terminal skills. When you start typing a command or filename, press **Tab** and Linux will try to finish it for you.

If there are multiple options, press Tab **twice** and Linux will show you all the possibilities. Tab completion saves time and prevents typos. Get into the habit of using it constantly.

## 9. Getting Help

### You Are Never Stuck

```bash
man ls
```

The `man` command opens the **manual page** for any command. Press `q` to quit the manual.

```bash
ls --help
```

Most commands accept the `--help` flag, which shows a quick summary of how to use them.

```bash
whatis ls
```

The `whatis` command gives you a one-line description of what a command does.

## 10. Linux vs Windows

| Topic | Windows | Linux |
|---|---|---|
| Folder separator | `C:\Users\John\Documents` | `/home/john/documents` |
| Case sensitivity | File.txt = file.txt (ignored) | File.txt ≠ file.txt (different files!) |
| Admin account | Administrator | root |
| Program installation | .exe installer | package manager (apt, yum) |
| Configuration files | Registry and .ini files | plain text files in /etc |
| File extensions | Required (.exe) | Not required |

---

## Hands-On Labs

### 🔵 Lab 1.1 — Your First Terminal Session (Guided)

**Objective:** Get comfortable opening the terminal and running your first commands.

1. Open your Ubuntu terminal
2. Run the following commands one at a time and read the output after each:
   ```bash
   whoami
   pwd
   date
   uname -a
   hostname
   echo "Hello from Linux!"
   ```
3. Use the Up arrow to scroll through your command history
4. Type `his` and press Tab twice — what happens?
5. Run: `history`

**Expected:** You should see your username, your home directory path, the date, system information, your computer's hostname, and your greeting message.

---

### 🔵 Lab 1.2 — Getting Help (Guided)

**Objective:** Learn to use the built-in help system.

1. Read the manual for the date command:
   ```bash
   man date
   ```
   *(Press `q` to quit)*

2. Get quick help for the echo command:
   ```bash
   echo --help
   ```

3. Find out what `whatis` says about these commands:
   ```bash
   whatis pwd
   whatis whoami
   whatis date
   ```

> **Tip:** You do not need to memorize commands. You just need to know how to find them.

---

### 🟢 Lab 1.3 — Create Your GitHub Repository (Practice)

**Objective:** Set up the course repository on GitHub.

1. Go to github.com — click **+** > **New repository**
2. Repository name: `enterprise-linux-operations-platform`
3. Description: `My Linux learning journey at NovaMart Global`
4. Set to **Public**, check **Add a README file**, click **Create repository**
5. Clone it locally:
   ```bash
   cd ~
   git clone https://github.com/YOURUSERNAME/enterprise-linux-operations-platform.git
   cd enterprise-linux-operations-platform
   ls
   ```

You should see your `README.md` file listed.

---

### 🔴 Lab 1.4 — Troubleshooting Lab

**Objective:** Practice reading error messages.

Run these intentionally broken commands and read what Linux says:

```bash
whamoi
PWD
man fakecmd
```

Questions to answer:
- What kind of message does Linux show when a command is not found?
- What does "command not found" tell you?
- Is the error message helpful?

> Linux error messages are your friends. Always read them carefully.

---

## Quick Recap

- Linux is an open-source operating system that powers most of the internet, cloud, and DevOps infrastructure
- WSL lets you run real Linux inside your Windows computer
- The terminal prompt shows: `username@hostname:directory$`
- `Ctrl+Shift+C` to copy, `Ctrl+Shift+V` to paste in the terminal
- Use the **Up arrow** to navigate command history
- Press **Tab** to auto-complete commands and filenames
- Use `man <command>`, `--help`, and `whatis` to get help
- Linux is **case-sensitive**: `file.txt` and `File.txt` are different files

## 🎯 Mini Challenge

Complete all of these in one terminal session:

1. Find out your Linux username
2. Find out the current date and time
3. Display the message: `I am a Linux user at NovaMart Global`
4. Find out what the `hostname` command does using `whatis`
5. Run your command from step 3 again using the Up arrow — without retyping it

## 🐙 GitHub Progress Checkpoint

```
Folder:          enterprise-linux-operations-platform/module-01
Files to commit: README.md, notes.txt (your observations)
Commit message:  "Module 01: First terminal session complete"
```

```bash
git add .
git commit -m "Module 01: First terminal session complete"
git push origin main
```

## Knowledge Check

**Review Questions:**
1. What does "open source" mean?
2. What does WSL stand for and what does it do?
3. Why is Linux important for DevOps engineers?
4. What is the difference between `Ctrl+C` and `Ctrl+Shift+C` in the terminal?
5. Name three places in the real world where Linux is running right now.

**Practical Questions:**
- Open a terminal and find out your system's hostname, username, and current directory in one session.
- Use the `man` command to find one flag for the `date` command that you have not used yet. Try it.

**Reflection Question:**
*Before today, how did you feel about the command line? How do you feel now? What surprised you?*

