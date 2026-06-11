# MODULE 4 — Linux Filesystem Fundamentals

_Every important location in Linux has a purpose. This module teaches you what each major directory is for — and why that structure exists._

## 1. What You Will Learn

- The Linux Filesystem Hierarchy Standard (FHS)
- What each major directory is for
- Where configuration files live
- Where logs are stored
- Where programs are installed
- How to explore each directory safely

## 2. Why This Matters

When you are troubleshooting a server at 2am, you need to know exactly where to look. Application logs are in `/var/log`. System configuration is in `/etc`. Installed programs are in `/usr/bin`. Knowing this saves time and stress.

## 3. The Filesystem Hierarchy Standard

Linux follows a standard called the **Filesystem Hierarchy Standard (FHS)**. This means that across almost every Linux distribution, the same directories exist in the same places, with the same purpose.

This is extremely useful. If you learn the filesystem structure on Ubuntu, you will immediately know your way around CentOS, Debian, or Amazon Linux.

## 4. The Major Directories

### / — The Root

The single forward slash represents the **root** of the entire filesystem. Everything in Linux is inside `/`. There is no higher level than this.

```bash
ls /
```

Output:

```
bin  boot  dev  etc  home  lib  media  mnt  opt  proc  root  run  sbin  srv  sys  tmp  usr  var
```

### /home — User Home Directories

This is where each user's personal files live. When you create a user named john, Linux automatically creates `/home/john`.

Your home directory is the **only place** where a regular user has full permissions to create, edit, and delete files.

The `~` shortcut always points to your own home directory.

### /etc — Configuration Files

`/etc` stands for **Editable Text Configuration**. This is where all system-wide configuration files live. Everything in `/etc` is a **plain text file**. Linux does not use a registry like Windows.

| File                    | What It Configures                      |
| ----------------------- | --------------------------------------- |
| `/etc/passwd`           | User account information                |
| `/etc/group`            | Group information                       |
| `/etc/hostname`         | The server's hostname                   |
| `/etc/hosts`            | Local DNS mappings                      |
| `/etc/fstab`            | Which disks to mount at boot time       |
| `/etc/ssh/sshd_config`  | SSH server configuration                |
| `/etc/apt/sources.list` | Where Ubuntu gets software updates from |

```bash
cat /etc/hostname
```

Output:

```
DESKTOP-ABC123
```

### /var — Variable Data

`/var` contains files that change constantly as the system runs. The most important subdirectory here is `/var/log` — the home of all system and application log files.

| Directory           | What Is Stored Here                   |
| ------------------- | ------------------------------------- |
| `/var/log`          | All system and application log files  |
| `/var/log/syslog`   | General system messages               |
| `/var/log/auth.log` | Login and authentication events       |
| `/var/cache`        | Cached data for applications          |
| `/var/spool`        | Data waiting to be processed          |
| `/var/www`          | Default location for web server files |

### /usr — User Programs

`/usr` stands for **Unix System Resources**. This is where system-wide programs and libraries are installed.

| Directory    | What Is Stored Here                          |
| ------------ | -------------------------------------------- |
| `/usr/bin`   | Most user programs (ls, cat, grep, etc.)     |
| `/usr/sbin`  | System administration programs               |
| `/usr/lib`   | Libraries shared by programs                 |
| `/usr/share` | Shared data like documentation               |
| `/usr/local` | Software you compiled and installed yourself |

### /opt — Optional Software

Third-party software that is not part of the standard Linux distribution is installed here. Examples: `/opt/google/chrome`, `/opt/jdk-17`, `/opt/novamart`

### /tmp — Temporary Files

`/tmp` holds temporary files. Everything in `/tmp` is deleted automatically when the system reboots. **Never store important data in `/tmp`.**

### /proc and /sys — Virtual Filesystems

These directories do not contain real files stored on disk. They are windows into the running kernel.

- `/proc` contains information about running processes and the kernel
- `/sys` contains information about hardware devices

```bash
cat /proc/cpuinfo
```

This shows detailed information about your CPU — read directly from the kernel.

### /dev — Devices

Everything in Linux is a file — including hardware devices.

- `/dev/sda` — your first hard drive
- `/dev/null` — a black hole that discards everything written to it
- `/dev/tty` — your terminal connection

---

## Hands-On Labs

### 🔵 Lab 4.1 — Filesystem Exploration Tour (Guided)

**Objective:** Visit each major directory and understand its contents.

Run each of these commands and spend 30 seconds reading the output:

```bash
ls /
ls /home
ls /etc
ls /var/log
ls /usr/bin
ls /opt
ls /tmp
```

After running each `ls`, ask yourself: does the content match what you expected?

---

### 🔵 Lab 4.2 — Read System Configuration Files (Guided)

**Objective:** Read real configuration files safely.

```bash
cat /etc/hostname
cat /etc/hosts
cat /etc/os-release

cat /proc/cpuinfo | head -20
```

Reading `/etc/os-release` tells you exactly which Linux distribution and version you are running. The `| head -20` part shows only the first 20 lines so it does not flood your screen. We will cover pipes in detail in a later module.

---

## 💼 Interview Corner

**Q: What is /etc used for?**
A: `/etc` stores system-wide configuration files. These are plain text files that control how the system and services behave. Examples include `/etc/hostname`, `/etc/hosts`, and `/etc/ssh/sshd_config`.

**Q: What is /var/log?**
A: `/var/log` is where Linux stores log files. System logs, authentication logs, and application logs all live here. When troubleshooting, `/var/log` is usually your first stop.

**Q: What is the difference between /bin and /usr/bin?**
A: Historically, `/bin` held essential commands needed during early boot, while `/usr/bin` held additional user programs. In modern Ubuntu, `/bin` is a symbolic link to `/usr/bin` and they are effectively the same.

_Why interviewers ask this: It tests whether you understand Linux filesystem standards and have actually explored the system rather than just memorized commands._

---

## Quick Recap

- `/` is the root of the entire filesystem — everything lives under it
- `/home` stores user home directories — your personal space
- `/etc` stores all configuration files as plain text
- `/var/log` is where logs live — your troubleshooting starting point
- `/usr/bin` holds most installed programs
- `/opt` is for optional third-party software
- `/tmp` is for temporary files that are deleted on reboot
- `/proc` and `/sys` are virtual filesystems that expose kernel information

## 🐙 GitHub Progress Checkpoint

```
Folder:          enterprise-linux-operations-platform/module-04
Files to commit: filesystem-map.md (document what you found in each directory)
Commit message:  "Module 04: Linux filesystem explored and documented"
```
