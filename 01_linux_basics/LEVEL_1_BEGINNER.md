# LEVEL 1 – BEGINNER (Days 1–30)
*Absolute zero to filesystem fluency in 30 days. Master navigation, permissions, and basic file operations.*

---

## 1. Navigating the Filesystem

| Command | What It Does | Real-world SRE Example | Flags & Variations |
|---------|--------------|------------------------|-------------------|
| `pwd` | Print working directory (your current location in the filesystem) | Verify you're in `/var/log` before tailing application logs | `-L` (logical path, follow symlinks); `-P` (physical path, resolve symlinks) |
| `ls` | List directory contents with sensible defaults | View all files in a deployment folder to spot incomplete uploads | `-a` (all, including dotfiles); `-l` (long format); `-h` (human-readable sizes); `-S` (sort by size); `-t` (sort by time); `-r` (reverse order); `-R` (recursive) |
| `cd` | Change directory to navigate the filesystem | Jump from `/home/user` to `/var/log` to investigate logs | `cd ~` (home dir); `cd /` (root); `cd ..` (parent); `cd -` (previous dir); `cd ../../../` (multiple levels) |
| `tree` | Display directory structure as a tree (recursive visualization) | Show the entire `/opt/app` structure to a junior engineer | `-L 3` (depth limit); `-d` (directories only); `-I 'pattern'` (ignore files); `-h` (show sizes) |
| `stat` | Show file metadata: permissions, timestamps, inode, size | Check file timestamp to verify a cron job actually ran | `-c '%A %Y'` (format output); `-L` (follow symlinks); `stat /var/log/auth.log` |

### Practical Examples: Navigation

```bash
# Example 1: Navigate and display directory structure
cd /var/log
pwd
# Output: /var/log

# Example 2: List all files including hidden, human-readable sizes, sorted by modification time
ls -lahtr /home
# Output shows oldest-to-newest files with their sizes in M/G format

# Example 3: Show tree structure of application directory (3 levels deep)
tree -L 3 -h /opt/myapp
# ├── bin/
# │   ├── server (1.2M)
# │   └── cli (250K)
# ├── config/ (4.0K)
# └── logs/ (20M)

# Example 4: Check if a file was modified within the last hour
stat /tmp/deployment.lock | grep -i modify
# Modify: 2026-06-04 14:32:15.123456789 +0000

# Example 5: One-liner to find all recently modified files in /tmp
find /tmp -mmin -5 -ls
# Lists inode, size, and path of files modified in last 5 minutes
```

> **SRE Wisdom**
> - Always use `cd -` to jump back to your previous directory—saves you from repeating long paths.
> - `pwd -P` resolves symlinks to their true path; crucial when symlink chains hide the real location.
> - `ls -lS` sorts by file size descending—instantly find bloated log files eating disk space.
> - Don't use `tree` on `/` without `-L` depth limit; it'll take forever and overwhelm the console.

---

## 2. Reading Files

| Command | What It Does | Real-world SRE Example | Flags & Variations |
|---------|--------------|------------------------|-------------------|
| `cat` | Concatenate and display file contents; fast for small files (<10MB) | Dump config file to verify environment variables | `-n` (line numbers); `-A` (show all, including tabs/newlines); `-s` (squeeze blank lines) |
| `less` | Paged file viewer; essential for large logs; use `less` instead of `cat` on huge files | Scroll through 500MB application.log without crashing terminal | `G` (end of file); `g` (start); `/pattern` (search); `?pattern` (reverse search); `N` (next match) |
| `head` | Display first N lines of a file; default 10 lines | Check first 20 lines of a config file to verify it's correct | `-n 50` (show first 50 lines); `-c 1K` (first 1KB of bytes); `-q` (quiet, no filename header) |
| `tail` | Display last N lines of a file; essential for log monitoring | Watch last 50 lines of deployment log for errors | `-n 100` (show last 100 lines); `-f` (follow/stream new lines); `-F` (follow even if file rotates); `+50` (from line 50 onward) |
| `tac` | Reverse cat; display file backwards, line-by-line | Find the last error in a logfile quickly before truncation happens | (no common flags; simple reverse output) |
| `nl` | Add line numbers to output; cleaner than `cat -n` for piping | Number lines in config for debugging line-specific errors | `-v 100` (start numbering at 100); `-nln` (line numbers left-aligned); `-s '|'` (custom separator) |

### Practical Examples: Reading Files

```bash
# Example 1: Display a config file with line numbers and all special chars visible
cat -nA /etc/nginx/nginx.conf
# 1  user www-data;$
# 2  worker_processes auto;$
# 3      ^^indentation visible with '^I'

# Example 2: Monitor a log file in real-time (new lines appear instantly)
tail -f /var/log/application.log
# [2026-06-04 14:32:15] INFO: Request completed
# [2026-06-04 14:32:16] ERROR: Database timeout  ← appears as it's written
# Press Ctrl+C to stop

# Example 3: Tail a log that rotates (e.g., daily logrotate)
tail -F /var/log/syslog
# -F follows the filename even if it gets rotated/replaced

# Example 4: Show last 20 lines, then follow new additions
tail -n 20 -f /var/log/auth.log

# Example 5: Display lines 100-150 of a large file
sed -n '100,150p' /var/log/huge.log
# Or: head -n 150 /var/log/huge.log | tail -n 51

# Example 6: Page through a large file and search
less /var/log/syslog
# Inside less: /kernel → searches for "kernel"
# n → next match, N → previous match

# Example 7: Check first 5 lines of all config files
head -n 5 /etc/nginx/sites-available/*

# Example 8: Reverse-read a file (useful for finding most recent entry first)
tac /var/log/auth.log | head -20
```

> **SRE Wisdom**
> - **Never `cat` a huge file** (>100MB). Use `less`, `tail -f`, or `head -n` to avoid terminal freezing.
> - `tail -F` (capital F) survives logrotation; `tail -f` (lowercase f) may stop following if the file is rotated.
> - Pipe `cat` outputs into `grep` for quick searches: `cat file | grep ERROR` (though `grep file` is faster).
> - `less +G /var/log/app.log` jumps to the end immediately, then you can scroll up.
> - For binary files, use `file` first to identify type, then `xxd` or `od` for hex/octal dumps.

---

## 3. Creating & Destroying Files and Directories

| Command | What It Does | Real-world SRE Example | Flags & Variations |
|---------|--------------|------------------------|-------------------|
| `touch` | Create an empty file or update its timestamp to now | Mark deployment lock files to prevent concurrent deploys | `-t [[CC]YY]MMDDhhmm[.ss]` (set custom timestamp); `-d 'date string'` (set via date); `-a` (update access time only); `-m` (modify time only) |
| `mkdir` | Create directories; does not create parent dirs unless `-p` used | Create `/var/log/myapp` ensuring all parents exist with `-p` | `-p` (create parents); `-m 0755` (set permissions); `-v` (verbose output) |
| `rm` | Remove files permanently (no trash, no undo—careful!) | Delete old deployment artifacts after retention period | `-f` (force, ignore errors); `-i` (interactive, ask before delete); `-r` (recursive, for dirs); `-v` (verbose) |
| `rmdir` | Remove empty directories only; safe (won't delete non-empty) | Clean up temporary directories after build process | (only succeeds if dir is empty; no common flags) |
| `cp` | Copy files or directories; preserves permissions with `-p` | Backup a config before editing: `cp nginx.conf nginx.conf.bak` | `-r` (recursive for dirs); `-p` (preserve permissions); `-a` (archive: recursive + preserve all); `-v` (verbose); `--backup=t` (numbered backups) |
| `mv` | Move or rename files/directories; atomic if same filesystem | Rename failed deployment rollback log for archive | `-i` (interactive); `-f` (force overwrite); `-v` (verbose); `-u` (update only if source newer) |
| `ln -s` | Create symbolic link (shortcut to file/dir) | Link `/opt/app/current` to `/opt/app/release-2026.06.04` for zero-downtime swaps | `-s` (symbolic, not hard link); `-f` (force overwrite); `-n` (no-dereference, link to symlink itself) |
| `ln` | Create hard link (another name for the same inode) | Create backup of a config that must stay in sync (rare; use `-s` instead) | `-f` (force); `--backup` (create backup of existing) |

### Practical Examples: Creating & Destroying

```bash
# Example 1: Create nested directory structure in one command
mkdir -p /var/log/myapp/{backup,archive,current}
# Creates: /var/log/myapp, /var/log/myapp/backup, etc.

# Example 2: Create a lock file and check its timestamp
touch /var/lock/deployment.lock
stat /var/lock/deployment.lock | grep Modify

# Example 3: Copy a config file with backup (preserve permissions)
cp -p /etc/nginx/nginx.conf /etc/nginx/nginx.conf.bak

# Example 4: Create backup with timestamp
cp /etc/hosts /etc/hosts.$(date +%Y%m%d-%H%M%S).bak

# Example 5: Rename a file (move within same dir)
mv deployment-failed.log deployment-failed-2026-06-04.log

# Example 6: Create symbolic link to application directory
ln -s /opt/app/releases/2026-06-04-14-30 /opt/app/current
# Now /opt/app/current always points to latest release

# Example 7: Verify symlink target
ls -l /opt/app/current
# lrwxrwxrwx 1 root root 36 Jun  4 14:30 current -> /opt/app/releases/2026-06-04-14-30

# Example 8: Remove a directory with all contents
rm -rf /tmp/old_deployment
# Use -i to confirm each file if nervous: rm -rvf

# Example 9: Touch multiple files with a loop
for i in {1..5}; do touch file_$i.txt; done

# Example 10: Atomic copy (copy then move)—safer for production
cp -p source.conf source.conf.tmp && mv source.conf.tmp source.conf
```

> **SRE Wisdom**
> - **`rm -rf` is a loaded gun.** Always double-check the path. Consider `rm -ri` (interactive) on critical dirs.
> - **Use `-p` with `cp`** to preserve permissions, timestamps, and ownership; always do this for configs.
> - **Symlinks are your friend for zero-downtime deploys:** point to the old version, then atomically update the link to new version.
> - **Never `rm` without checking what you're deleting:** use `ls -la` first to see the actual files.
> - **`touch` on an existing file updates only timestamp**, doesn't truncate content—safe for "heartbeat" files.
> - **Hard links (`ln` without `-s`)** share the same inode; dangerous for backups since deleting the original removes data from all links.

---

## 4. Basic Permissions

| Command | What It Does | Real-world SRE Example | Flags & Variations |
|---------|--------------|------------------------|-------------------|
| `chmod` | Change file/directory permissions (mode) using octal or symbolic | Ensure only app owner can read config with secrets: `chmod 600 /etc/app/secrets.conf` | Octal: `0755` (owner rwx, group rx, other rx); `-R` (recursive); `-v` (verbose); Symbolic: `u+x` (add owner execute), `g-w` (remove group write), `o=r` (set other to read-only) |
| `chown` | Change file owner and group | Transfer log dir ownership to syslog user: `chown syslog:adm /var/log/myapp` | `owner:group` format; `-R` (recursive); `-v` (verbose); `--from=old:old` (only if currently owned by old) |
| `chgrp` | Change group only (without touching owner) | Add audit group to config file: `chgrp audit /etc/app/config.yaml` | `-R` (recursive); `-v` (verbose) |
| `umask` | Set default permissions for new files/dirs (inverse logic) | Set `umask 0077` so new files are readable only by owner (600), new dirs by owner only (700) | Display current: `umask`; Set temporary: `umask 0027`; Set persistent in `~/.bashrc` or `/etc/profile` |

### Permission Reference Table (Octal & Symbolic)

| Octal | Symbolic | Meaning |
|-------|----------|---------|
| 7 | rwx | Read (4) + Write (2) + Execute (1) = 7 |
| 6 | rw- | Read (4) + Write (2) = 6 |
| 5 | r-x | Read (4) + Execute (1) = 5 |
| 4 | r-- | Read (4) only |
| 0 | --- | No permissions |

**Position meanings:** `0755` = `[special][owner][group][other]` → owner rwx, group rx, other rx.

### Practical Examples: Permissions

```bash
# Example 1: Make a script executable by owner
chmod u+x /usr/local/bin/deploy.sh
# Or octal: chmod 755 /usr/local/bin/deploy.sh

# Example 2: Create a secret file readable only by owner (600)
touch /etc/app/secrets.conf
chmod 600 /etc/app/secrets.conf
# Verify: ls -l /etc/app/secrets.conf
# -rw------- 1 root root 0 Jun  4 14:30 secrets.conf

# Example 3: Recursive permission change on entire app directory
chmod -R 755 /opt/myapp/bin
chmod -R 644 /opt/myapp/config
# Bins executable, configs read-only

# Example 4: Change owner and group together
chown -R app:app /opt/myapp
# All files now owned by user 'app', group 'app'

# Example 5: Add execute permission for group
chmod g+x /usr/local/bin/deploy.sh

# Example 6: Remove write permission from others
chmod o-w /var/log/myapp/config.log

# Example 7: Set permissions symbolically: owner rwx, group rx, other nothing
chmod u=rwx,g=rx,o= /var/log/sensitive.log

# Example 8: Verify permissions in octal format (GNU stat)
stat -c '%a %n' /usr/local/bin/deploy.sh
# 755 /usr/local/bin/deploy.sh

# Example 9: Set default umask for new files (in ~/.bashrc)
echo "umask 0077" >> ~/.bashrc
source ~/.bashrc
# All new files created will be 600 (owner rw only)

# Example 10: Recursive change with before/after check
chmod -v -R 644 /opt/myapp/templates
# Changed from 755 to 644: '/opt/myapp/templates/index.html'
# Changed from 755 to 644: '/opt/myapp/templates/error.html'
```

> **SRE Wisdom**
> - **Remember: 4=r, 2=w, 1=x.** Octal `755` = `7(rwx) 5(r-x) 5(r-x)` = owner full, group read-execute, other read-execute.
> - **Never make secrets `644`** (world-readable). Use `600` (owner only) or `640` (owner + group).
> - **Symbolic mode is safer when you only know what to add/remove**, e.g., `chmod o-w file` removes write from others without affecting rwx bits.
> - **`chmod -R` is recursive and powerful**—verify with `find` first: `find /dir -type f -o -type d | head` before applying changes.
> - **Set `umask 0077` in `.bashrc` for secure defaults**, especially on shared servers.
> - **Check actual permissions with `stat` in octal:** `stat -c '%a %n' file` beats `ls -l` for scripting.

---

## 5. Getting Help

| Command | What It Does | Real-world SRE Example | Flags & Variations |
|---------|--------------|------------------------|-------------------|
| `man` | Display manual pages for commands (comprehensive reference) | Deep-dive into `tar` options: `man tar` then search `/pattern` | `man -k keyword` (search all manpages for keyword); `man 5 fstab` (section 5 = file formats); `-a` (show all sections) |
| `help` | Built-in shell command help (faster than `man` for bash builtins) | Quick help on `for` loop syntax: `help for` | Only works for bash built-ins; external commands need `man` or `--help` |
| `whatis` | One-line description of a command (queries manpage database) | Quick reminder: `whatis netstat` | (no common flags; outputs description only) |
| `--help` | Most modern commands include inline help (faster than `man`) | Check `curl --help` for flag reference | Works with most GNU tools; older Unix tools may not support it |
| `apropos` | Search manual pages by keyword (alias: `man -k`) | Find all network-related commands: `apropos network` | (no common flags; searches manpage descriptions) |
| `info` | GNU texinfo documentation (more detailed than `man` for GNU tools) | Navigate `info coreutils` for detailed `ls` docs | (navigable with arrow keys, `n`/`p` for next/previous) |

### Practical Examples: Getting Help

```bash
# Example 1: Read manual for a command
man ls
# Inside man: /flag → search; n → next; q → quit

# Example 2: Search manpages for a topic
man -k network
# Outputs all commands with "network" in description

# Example 3: Read specific section of manpage (sections: 1=commands, 5=files, 8=admin)
man 5 fstab
# Shows file format documentation for /etc/fstab

# Example 4: Quick one-line description
whatis ssh
# ssh (1)               - OpenSSH remote login client

# Example 5: Help on bash built-in
help for
# for: for (( expr1; expr2; expr3 )); do COMMANDS; done

# Example 6: Modern command inline help
curl --help | head -20
# Shows curl usage and common flags

# Example 7: Search for all commands related to "process"
apropos process
# Lists: ps, kill, top, pkill, etc.

# Example 8: Full manpage in pager, then search inside
man grep
# Press '/' then type 'regex' to search within the page

# Example 9: Get manpage section 1 (commands) vs section 8 (admin)
man 1 passwd    # User command to change password
man 8 passwd    # Admin tool to manage user passwords

# Example 10: Extract just the synopsis from manpage (scripting)
man ls | head -20
# Gets first 20 lines showing command syntax
```

> **SRE Wisdom**
> - **`man -k` is your search engine** when you forget command names; e.g., `man -k "disk usage"` finds `du` and `df`.
> - **Manpages have sections**: 1=commands, 2=syscalls, 3=libraries, 5=file formats (e.g., `fstab`), 8=admin tools. Use `man 5 fstab` vs `man fstab`.
> - **`--help` is faster than `man` for flags**, but `man` gives examples and detailed explanations.
> - **Info pages are deeper but slower** to navigate; useful for GNU tools if manpage isn't enough.
> - **Alias common lookups for speed:**
>   ```bash
>   alias whatisgrep='whatis grep'
>   alias mangrep='man grep | less'
>   ```

---

## 6. Bash Basics – Your First Scripts

| Concept | Syntax | Real-world SRE Example | Common Pitfalls |
|---------|--------|------------------------|-----------------|
| **Shebang** | `#!/bin/bash` at line 1 | Tells OS to execute with bash, not sh | Always use `#!/bin/bash`, never `#!/bin/sh` (POSIX, limited features) |
| **Variables** | `VAR=value` (no spaces!) | `LOGDIR="/var/log/app"` then `$LOGDIR` in commands | **`VAR = value` is wrong!** No spaces around `=`; use `${VAR}` if followed by text |
| **Command substitution** | `$(command)` or `` `command` `` | `HOSTNAME=$(hostname)` or `DATE=$(date +%Y%m%d)` | Use `$(...)` modern syntax; backticks are outdated and nest poorly |
| **Echo output** | `echo "text $VAR more text"` | `echo "Deployment started at $(date)"`  | Use double quotes for variable expansion; single quotes prevent expansion |
| **Simple if-then** | `if [ condition ]; then ... fi` | `if [ -f /var/lock/deploy.lock ]; then echo "Already running"; fi` | Spaces inside brackets are **required**: `[ $x = 5 ]` not `[$x=5]` |
| **For loop** | `for item in list; do ... done` | `for file in /var/log/*.log; do gzip "$file"; done` | Always quote variables: `"$file"` to handle spaces in filenames |
| **While loop** | `while condition; do ... done` | `while [ $count -lt 10 ]; do ... ((count++)); done` | Use `((count++))` for arithmetic instead of `$((count + 1))` |
| **Read user input** | `read -p "Prompt: " VAR` | `read -p "Enter deployment version: " VERSION` | Add `-r` to disable backslash escaping: `read -rp "Prompt: " VAR` |
| **Exit code** | Command returns `$?` (0=success, non-zero=fail) | `if command; then success; else fail; fi` | Check `$?` immediately after command; it resets after each command |

### Practical Examples: Bash Basics

```bash
#!/bin/bash
# Example 1: Simple script with variables and echo

LOGDIR="/var/log/myapp"
TIMESTAMP=$(date +%Y-%m-%d\ %H:%M:%S)

echo "Starting deployment at $TIMESTAMP"
echo "Log directory: $LOGDIR"

# Output:
# Starting deployment at 2026-06-04 14:32:15
# Log directory: /var/log/myapp
```

```bash
#!/bin/bash
# Example 2: Check if file exists before reading

CONFIG="/etc/app/config.conf"

if [ -f "$CONFIG" ]; then
    echo "Config file found: $CONFIG"
    cat "$CONFIG"
else
    echo "ERROR: Config file missing: $CONFIG" >&2
    exit 1
fi
```

```bash
#!/bin/bash
# Example 3: Loop through files and process them

for logfile in /var/log/*.log; do
    if [ -f "$logfile" ]; then
        lines=$(wc -l < "$logfile")
        echo "$logfile has $lines lines"
    fi
done
```

```bash
#!/bin/bash
# Example 4: Simple counter with while loop

counter=1
max=5

while [ $counter -le $max ]; do
    echo "Iteration $counter"
    ((counter++))
done

# Output:
# Iteration 1
# Iteration 2
# ... Iteration 5
```

```bash
#!/bin/bash
# Example 5: Read user input and validate

read -p "Enter deployment environment (prod/staging/dev): " ENV

if [ "$ENV" = "prod" ]; then
    echo "WARNING: Deploying to PRODUCTION"
elif [ "$ENV" = "staging" ]; then
    echo "Deploying to staging environment"
else
    echo "Deploying to development environment"
fi
```

```bash
#!/bin/bash
# Example 6: Check command exit status

if ping -c 1 8.8.8.8 > /dev/null 2>&1; then
    echo "Network is UP"
else
    echo "Network is DOWN"
    exit 1
fi

# The exit status ($?) is automatically checked by 'if'
```

```bash
#!/bin/bash
# Example 7: Combine multiple commands

BACKUP_DIR="/var/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR" && \
cp /etc/app/config.conf "$BACKUP_DIR/config_$TIMESTAMP.conf" && \
echo "Backup successful at $BACKUP_DIR/config_$TIMESTAMP.conf" || \
echo "ERROR: Backup failed"
```

> **SRE Wisdom**
> - **Always quote variables:** `"$VAR"` not `$VAR`. Unquoted variables split on spaces and expand wildcards.
> - **Use `$(command)` not backticks.** Modern, nests cleanly, easier to read.
> - **Spaces inside `[ ]` are mandatory:** `[ $x -eq 5 ]` works, `[$x -eq 5]` fails.
> - **Use `-f` to test if file exists**, `-d` for directory, `-x` for executable.
> - **Redirect stderr to stdout:** `2>&1` redirects error output to stdout for logging.
> - **Use `&&` for "and then" (only run next if previous succeeds)**, `||` for "or" (fallback if previous fails).
> - **Add shebang as first line!** `#!/bin/bash` ensures the script runs with bash, not the system shell (which might be `sh`).
> - **Never `rm -rf` without absolute path testing first!** Use: `[ -d "$dir" ] && rm -rf "$dir"`.

---

## Quick Reference: Common Test Operators

Use these inside `[ ]` for conditionals:

| Operator | Meaning | Example |
|----------|---------|---------|
| `-f` | File exists | `[ -f /var/log/app.log ]` |
| `-d` | Directory exists | `[ -d /opt/app ]` |
| `-x` | File is executable | `[ -x /usr/local/bin/script ]` |
| `-z` | String is empty | `[ -z "$VAR" ]` |
| `-n` | String is not empty | `[ -n "$VAR" ]` |
| `=` | Strings equal | `[ "$ENV" = "prod" ]` |
| `!=` | Strings not equal | `[ "$ENV" != "dev" ]` |
| `-eq` | Integers equal | `[ $count -eq 5 ]` |
| `-ne` | Integers not equal | `[ $count -ne 0 ]` |
| `-lt` | Less than | `[ $count -lt 10 ]` |
| `-gt` | Greater than | `[ $count -gt 10 ]` |
| `-le` | Less than or equal | `[ $count -le 10 ]` |
| `-ge` | Greater than or equal | `[ $count -ge 10 ]` |

---

## Bash Aliases & Time-Savers (Level 1)

Add these to `~/.bashrc` and run `source ~/.bashrc`:

```bash
# Navigation speedups
alias ll='ls -lah'
alias la='ls -a'
alias ..='cd ..'
alias ...='cd ../..'
alias ....='cd ../../..'

# Safety first
alias rm='rm -i'  # Ask before deleting
alias mv='mv -i'  # Ask before overwriting
alias cp='cp -i'  # Ask before overwriting

# Useful shortcuts
alias mkdir='mkdir -p'  # Create parent dirs automatically
alias grep='grep --color=auto'  # Colorize grep output
alias diff='diff --color=auto'  # Colorize diff output
```

---

## Checkpoint: By the end of Level 1, you should be able to:

- [ ] Navigate any filesystem using `cd`, `pwd`, `ls`, `tree`
- [ ] Read files with `cat`, `less`, `head`, `tail` (no more using `cat` on huge files!)
- [ ] Create, copy, move, and delete files and directories safely
- [ ] Understand and change file permissions with `chmod`, `chown`, `chgrp`
- [ ] Get help with `man`, `whatis`, `--help` without searching Google
- [ ] Write a simple bash script with variables, if-then, and for loops
- [ ] Understand exit codes and use `&&` / `||` chains
- [ ] Know that `$?` contains the last command's exit status

---

**Next:** [Level 2 – Intermediate](LEVEL_2_INTERMEDIATE.md) (searching, text processing, process management)
