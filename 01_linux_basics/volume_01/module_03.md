# MODULE 3 — Understanding Linux Architecture

*Before going deeper into Linux commands, you need to understand what is actually happening when you type a command. This module reveals the layers of Linux — the kernel, the shell, and user space.*

## 1. What You Will Learn

- What the Linux kernel is and what it does
- What the shell is and how it works
- What user space means
- How a command travels from your keyboard to the hardware
- The difference between bash and other shells

## 2. Why This Matters

When something goes wrong on a Linux server — a process crashes, a command fails, a service stops — knowing the architecture helps you understand where the problem is. Is it a kernel issue? A shell configuration problem? A user permissions issue?

This knowledge also helps you speak the language of DevOps interviews. Almost every Linux interview asks about the kernel or the shell.

## 3. Simple Explanation

### The Three Layers of Linux

Think of Linux like a building with three floors:

- **Ground floor:** The Hardware — your physical CPU, RAM, disk
- **Middle floor:** The Kernel — the brains, talking to hardware
- **Top floor:** User Space — where you and your programs live

You live and work on the top floor. You never need to go to the ground floor yourself — the kernel handles that for you. The shell is the elevator between your floor and the kernel.

## 4. The Kernel

### The Brain of Linux

The kernel is the core of the operating system. It is the piece of software that has **direct access to your hardware**.

The kernel handles:

- **Memory management** — deciding how RAM is used
- **Process management** — deciding which programs run when
- **Device drivers** — talking to hardware like disks, network cards, keyboards
- **Filesystem** — managing how data is stored and retrieved
- **Security** — enforcing who can do what

```bash
uname -r
```
Output:
```
5.15.0-1054-azure
```

This command shows you which version of the Linux kernel you are running.

## 5. The Shell

### Your Interpreter

The shell is a program that reads the commands you type and translates them into instructions the kernel can understand. Think of the shell as a **translator**. You speak English (Linux commands). The kernel speaks machine language. The shell stands between you and translates.

```
You type:  ls -la
   ↓
┌────────────────────────────┐
│    SHELL (bash)            │  ← Reads your command
│    Parses: ls -la          │  ← Figures out what you want
│    Calls:  /bin/ls         │  ← Finds the ls program
└────────────┬───────────────┘
             ↓ System Call
┌────────────────────────────┐
│    KERNEL                  │  ← Talks to hardware
│    Reads from disk         │  ← Gets the file list
│    Returns data            │  ← Sends it back up
└────────────┬───────────────┘
             ↓
┌────────────────────────────┐
│    SHELL                   │
│    Formats the output      │
│    Prints to your screen   │
└────────────────────────────┘
You see: file list printed on screen
```

### Types of Shells

| Shell | Notes |
|---|---|
| bash | Bourne Again Shell — the most common shell, your default in Ubuntu |
| sh | The original Bourne shell — simple and always available |
| zsh | Z Shell — popular with developers, default on macOS |
| fish | Friendly interactive shell — very beginner-friendly |
| dash | Lightweight, used for fast script execution in Ubuntu |

```bash
echo $SHELL
```
Output:
```
/bin/bash
```

## 6. User Space

**User space** is the area where all regular programs run — your text editor, web browser, command-line tools, and your own scripts.

User space programs cannot directly access hardware. They must ask the kernel to do it for them through **system calls**. This separation means a badly written program cannot crash the kernel or corrupt hardware. The worst it can do is crash itself.

## 7. Root vs Regular Users

In Linux, the **root user** is the superuser. Root has permission to do anything on the system — including things that could break it permanently.

Regular users (like you) have limited permissions. This is a safety feature.

| User Type | What They Can Do |
|---|---|
| Regular user (`$`) | Manage files in their own home directory, run most programs |
| root user (`#`) | Do anything — install software, change system files, manage other users |
| `sudo` command | Run ONE command as root temporarily — with permission |

```bash
sudo whoami
```
Output:
```
[sudo] password for john:
root
```

`sudo` lets a regular user run a specific command with root privileges. Notice the prompt changes from `$` to `#` when acting as root.

---

## Quick Recap

- The kernel is the core of Linux — it talks directly to hardware
- The shell translates your commands into kernel instructions
- bash is the default shell in Ubuntu
- User space is where your programs and commands run
- root is the superuser with unlimited permissions
- Regular users have limited permissions for safety
- `sudo` lets you run a single command as root

## 🎯 Mini Challenge

Explore your shell environment:

1. Find out which kernel version you are running
2. Find out which shell you are using
3. Run: `echo $USER` — what does this tell you?
4. Run: `echo $HOME` — what does this tell you?
5. Run: `sudo whoami` — what changes?

## 🐙 GitHub Progress Checkpoint

```
Folder:          enterprise-linux-operations-platform/module-03
Files to commit: linux-architecture-notes.md
Commit message:  "Module 03: Linux architecture understood"
```

## Knowledge Check

**Review Questions:**
1. What is the kernel and what are its main responsibilities?
2. What is a shell? What does it do when you type a command?
3. What is the difference between the root user and a regular user?
4. What does `sudo` do?
5. What is the difference between the `$` prompt and the `#` prompt?

**Practical Questions:**
- Find out your kernel version, shell name, and current user all in one terminal session.
- Explain in your own words what happens between typing `ls` and seeing output on screen.

**Reflection Question:**
*How has understanding the layers of Linux changed how you think about what happens when you type a command?*
