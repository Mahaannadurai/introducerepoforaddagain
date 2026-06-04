# LEVEL 2 – INTERMEDIATE (Months 1–3)
*Searching, text munging, process hunting, and disk forensics. Time to scale from "I know where files are" to "I can find anything and optimize anything."*

---

## 7. Searching Files & Directories

| Command | What It Does | Real-world SRE Example | Flags & Variations |
|---------|--------------|------------------------|-------------------|
| `find` | Recursive search by name, type, size, permissions, timestamp | Find all logs modified in last hour: `find /var/log -mmin -60 -type f` | `-name` (filename pattern); `-type f/d/l` (file/dir/link); `-size +100M` (size); `-mtime -7` (modified <7 days); `-perm 644` (permissions); `-exec command {} \;` (run command on results) |
| `grep` | Search file contents for text patterns (line-by-line regex) | Find all ERROR lines in logs: `grep ERROR /var/log/app.log` | `-i` (case-insensitive); `-v` (invert, show non-matches); `-c` (count matches); `-n` (line numbers); `-r` (recursive); `-E` (extended regex, same as `egrep`); `-P` (Perl regex, requires `-P` flag on some systems) |
| `locate` | Search filename database (pre-indexed, blazingly fast) | Find where `nginx.conf` is: `locate nginx.conf` | `-i` (case-insensitive); `-r` (regex); `-e` (only existing files); requires `updatedb` to refresh index first |
| `which` | Find the full path of a command in `$PATH` | Verify which `python` is being used: `which python3` | (no common flags; returns first match in `$PATH`) |
| `whereis` | Find command and manpage locations | `whereis curl` returns binary path and manpage path | `-b` (binaries only); `-m` (manpages only); `-s` (source files only) |

### Advanced `find` Examples (The Swiss Army Knife)

| Use Case | Command | Explanation |
|----------|---------|-------------|
| Find files larger than 100MB | `find / -size +100M -type f` | `-size +100M` searches from root; add `-not -path "*/proc/*"` to exclude pseudo-filesystems |
| Find files modified in last 24 hours | `find /var/log -mtime -1 -type f` | `-mtime -1` = modified less than 1 day ago |
| Find recently accessed files | `find /home -atime -7 -type f` | `-atime -7` = accessed within 7 days |
| Find files with specific permissions | `find /opt -perm 777 -type f` | `-perm 777` finds world-writable files (security audit) |
| Find broken symlinks | `find / -xtype l` | `-xtype l` finds broken links (links where target doesn't exist) |
| Delete files matching pattern | `find /tmp -name "*.tmp" -delete` | `-delete` removes matched files; safe because `find` runs first |
| Run command on results | `find /var/log -name "*.log" -exec gzip {} \;` | `{}` replaced with filename; `\;` ends command |
| Count results | `find /var -type f \| wc -l` | Pipe to `wc -l` for count |

### Practical Examples: Searching

```bash
# Example 1: Find all Python files in current directory recursively
find . -name "*.py" -type f

# Example 2: Find files modified in the last hour, verbose output
find /var/log -mmin -60 -type f -printf "%T@ %p\n" | sort -rn | head
# Newest first; %T@ is timestamp, %p is path

# Example 3: Search for text in all files recursively (case-insensitive)
grep -r "ERROR" /var/log --include="*.log" -i
# --include="*.log" limits search to .log files

# Example 4: Count how many times a pattern appears
grep -c "exception" /var/log/app.log

# Example 5: Show line numbers with grep results
grep -n "Failed" /var/log/auth.log | head -10

# Example 6: Use extended regex to find multiple patterns
grep -E "(error|fail|critical)" /var/log/app.log

# Example 7: Find and delete old files (30+ days old)
find /var/log -name "*.log" -mtime +30 -delete
# Or safer: -mtime +30 -print (preview before deleting)

# Example 8: Find files larger than 500MB and list size
find / -size +500M -type f -exec ls -lh {} \; 2>/dev/null | awk '{print $5, $9}'

# Example 9: Find which Python version is in use
which python3
# /usr/bin/python3

# Example 10: Quick file database search (much faster than find)
locate nginx.conf
# /etc/nginx/nginx.conf

# Example 11: Find and display first match only
grep -m 1 "ERROR" /var/log/app.log
# Stops after first match (useful for huge logs)

# Example 12: Grep with context lines (before and after)
grep -C 3 "exception" /var/log/app.log
# Show 3 lines before and after each match (-B 3 -A 3 also works)
```

> **SRE Wisdom**
> - **Use `find` for structural searches** (name, type, size, time); use `grep` for content searches.
> - **`locate` is 100x faster than `find`** but requires `updatedb`; use for quick lookups of known files.
> - **`find -exec` is dangerous**: test with `-print` first before running `-delete` or `-exec rm`.
> - **Exclude system dirs in `find`**: add `-not -path "*/proc/*" -not -path "*/sys/*"` to avoid hanging.
> - **Grep on large files is slow**; use `find -name "*.log" | xargs grep` to parallelize.
> - **`grep -E` enables regex**; use `(pattern1|pattern2)` for multiple matches.
> - **Add `-q` to grep for use in scripts** (no output, only exit code): `if grep -q "error" file; then ...`

---

## 8. Text Processing & Transformation

| Command | What It Does | Real-world SRE Example | Flags & Variations |
|---------|--------------|------------------------|-------------------|
| `cut` | Extract specific columns/characters from lines (fast, columnar data) | Extract usernames from `/etc/passwd`: `cut -d: -f1 /etc/passwd` | `-d` (delimiter); `-f` (field numbers); `-c` (character positions); `--output-delimiter` (change output delimiter) |
| `sort` | Sort lines alphabetically, numerically, or by custom field | Sort log timestamps: `sort /var/log/app.log` | `-n` (numeric sort); `-r` (reverse); `-k` (sort by field); `-u` (unique, remove duplicates); `-M` (month names); `-t` (field separator) |
| `uniq` | Remove or count duplicate adjacent lines (must be sorted first!) | Count unique IPs: `sort access.log | uniq -c \| sort -rn` | `-c` (count duplicates); `-d` (show only duplicates); `-u` (show only unique); `-i` (case-insensitive) |
| `wc` | Count lines, words, characters in files | Verify log size before archiving: `wc -l /var/log/app.log` | `-l` (lines); `-w` (words); `-c` (bytes); `-m` (characters); `-L` (longest line length) |
| `tr` | Translate or delete characters (sed-lite for character replacement) | Convert lowercase to uppercase: `echo "hello" \| tr 'a-z' 'A-Z'` | `-d` (delete characters); `-s` (squeeze repeated); `-c` (complement/invert); ranges like `a-z` |
| `diff` | Compare two files line-by-line (find differences) | Verify config change: `diff /etc/app/config.old /etc/app/config.new` | `-u` (unified diff, shows context); `-y` (side-by-side); `-i` (ignore case); `-w` (ignore whitespace); `-q` (quiet, just report if different) |
| `patch` | Apply a diff file to update a file | Apply config fix: `patch < config.patch` | `-p` (strip path components); `--dry-run` (preview changes); `-R` (reverse/undo); `-b` (create backup) |
| `awk` | Powerful columnar data processing (like cut but with math and conditions) | Sum column 3: `awk '{sum += $3} END {print sum}' data.txt` | `-F` (field separator); `BEGIN/END` blocks; full scripting language; `$0` (whole line), `$1/$2/...` (fields) |
| `sed` | Stream editor (search-replace, delete, append lines) | Replace all IPs: `sed 's/192.168.1/10.0.0/g' hosts.txt` | `s///` (substitute); `d` (delete); `a\\` (append); `i\\` (insert); `-i` (in-place edit); `-e` (multiple commands) |

### Practical Examples: Text Processing

```bash
# Example 1: Extract usernames from /etc/passwd (colon-delimited)
cut -d: -f1 /etc/passwd
# root, daemon, bin, sys, sync, ...

# Example 2: Extract specific columns from a table
ps aux | awk '{print $1, $2, $11}'  # USER, PID, COMMAND

# Example 3: Sort log file by timestamp, show newest first
sort -r /var/log/app.log | head -20

# Example 4: Count unique IPs in web access log, sort by frequency
cut -d' ' -f1 /var/log/nginx/access.log | sort | uniq -c | sort -rn | head
# Most common IPs appear first

# Example 5: Convert lowercase to uppercase
echo "deployment" | tr 'a-z' 'A-Z'
# Output: DEPLOYMENT

# Example 6: Replace multiple spaces with single space (cleanup logs)
sed 's/  */ /g' messy.txt
# Replaces 2+ spaces with single space

# Example 7: Delete lines containing a pattern
sed '/ERROR/d' app.log > app_clean.log
# Removes all ERROR lines

# Example 8: Count lines in logfile (fast)
wc -l /var/log/auth.log

# Example 9: Find longest line in a file (useful for troubleshooting)
wc -L /var/log/huge.log

# Example 10: Use awk to print lines where value > threshold
awk '$3 > 100 {print $1, $3}' data.txt
# Print field 1 and 3 where field 3 > 100

# Example 11: Sum all values in a column
awk '{sum += $2} END {print "Total: " sum}' sales.txt

# Example 12: Print every Nth line (useful for large logs)
sed -n '1~100p' huge.log
# Prints lines 1, 101, 201, 301, ... (every 100th line)

# Example 13: Get CPU and memory usage of a process with awk
ps aux | grep python | awk '{print $1, $3, $4}'
# USER, %CPU, %MEM

# Example 14: Diff configs before and after
diff -u /etc/nginx/nginx.conf.bak /etc/nginx/nginx.conf

# Example 15: Apply a patch file
patch /etc/app/config < config.patch
```

### Advanced Text Processing Pipeline

```bash
# Real-world example: Analyze web server logs for top IPs and response codes

# Step 1: Extract IPs and response codes
awk '{print $1, $9}' /var/log/nginx/access.log > ips_codes.txt

# Step 2: Sort and count unique combinations
sort ips_codes.txt | uniq -c | sort -rn

# Step 3: Filter by response code (show only errors: 4xx, 5xx)
awk '$3 >= 400 {print $1, $3}' ips_codes.txt | sort | uniq -c | sort -rn

# All in one pipeline:
awk '{print $1, $9}' /var/log/nginx/access.log | \
    sort | uniq -c | sort -rn | \
    awk '$3 >= 400 {print}' | head -20
```

> **SRE Wisdom**
> - **Combine `cut`, `sort`, `uniq` in pipelines** for powerful text analysis without loading files into memory.
> - **`uniq` only removes adjacent duplicates**, so **sort first:** `sort | uniq`, not `uniq | sort`.
> - **Use `awk` for math on columns**, e.g., `awk '{sum += $3} END {print sum}' file` sums column 3.
> - **`sed 's/old/new/g'` is global replace** (the `g` flag); without it, only first match per line is replaced.
> - **`sed -i` edits files in-place** (dangerous!); always backup or preview with `-e` first.
> - **Pipe commands with `|` to combine**: `grep ERROR | cut -d: -f1 | sort | uniq -c | sort -rn`.
> - **For large files, `awk` is faster than piping through multiple commands** because it processes in memory once.

---

## 9. Process Management & Monitoring

| Command | What It Does | Real-world SRE Example | Flags & Variations |
|---------|--------------|------------------------|-------------------|
| `ps aux` | List all running processes with full details (static snapshot) | Check if nginx is running: `ps aux \| grep nginx` | `aux` (all users, detailed); `-ef` (same but different format); `-o custom:format` (custom columns); `--forest` (tree view) |
| `top` | Live, scrollable process monitor (CPU, memory, updates every second) | Find memory hogs: `top -u username` then press `M` to sort by memory | `-u user` (specific user); `-p PID` (specific process); `-b -n 1` (batch mode, one snapshot); press `1` for per-CPU; `k` to kill |
| `htop` | Nicer version of `top` (colors, easier keybindings); not always installed | Same as `top`: `htop -u username` to filter | `-C` (disable colors); `-u user` (filter by user); `-p PID` (single process); `F5` to tree view |
| `kill` | Send signal to process (default SIGTERM=15, graceful shutdown) | Kill process by PID: `kill 1234` then wait 2 seconds, `kill -9 1234` if hung | `-9` (SIGKILL, immediate kill, no cleanup); `-15` (SIGTERM, graceful); `-1` (SIGHUP, reload config); `-STOP`/`-CONT` (pause/resume) |
| `pkill` | Kill processes by name (pattern matching, no PID needed) | Kill all Python processes: `pkill -f "python.*app.py"` | `-f` (match full command line); `-u user` (specific user); `-9` (force kill); `-e` (echo what you're killing) |
| `killall` | Kill all processes by exact name | Emergency stop nginx: `killall -9 nginx` | `-9` (SIGKILL); `-1` (SIGHUP); `-e` (confirm matches); (no grep-like patterns, exact match only) |
| `nice` | Start a process with lower priority (higher `nice` number = lower priority) | Run backup with low priority: `nice -n 19 tar czf backup.tar.gz /data` | `-n 10` (10 = lower priority); range -20 to 19; default is 0 |
| `renice` | Change priority of running process | Reduce priority of slow process: `renice +5 -p 1234` | `-n` (new nice value); `-p` (by PID); `-u user` (all processes of user); `-g group` (all processes of group) |
| `jobs` | List background jobs in current shell session | `jobs -l` shows all jobs with PID | `-l` (include PID); `-r` (running only); `-s` (stopped only); `bg %1` (resume job in background); `fg %1` (bring to foreground) |
| `bg` / `fg` | Resume stopped job in background / foreground | Start long task, press Ctrl+Z, then `bg` to continue in background | `bg %jobid` (resume background); `fg %jobid` (bring to foreground) |

### Linux Signals Reference (for `kill`, `killall`, `trap`)

| Signal | Number | Name | Behavior | When to Use |
|--------|--------|------|----------|------------|
| SIGHUP | 1 | Hangup | Reload config (graceful restart) | `kill -HUP $PID` for nginx/apache reload |
| SIGINT | 2 | Interrupt | Interactive interrupt (Ctrl+C) | Default behavior of Ctrl+C |
| SIGTERM | 15 | Terminate | Graceful shutdown (default `kill`) | `kill $PID` allows cleanup |
| SIGKILL | 9 | Kill | Immediate, force kill (no cleanup) | Last resort, `kill -9 $PID` when app won't quit |
| SIGSTOP | 19 | Stop | Pause process (can't be caught) | `kill -STOP $PID` to pause; `kill -CONT` to resume |
| SIGCONT | 18 | Continue | Resume stopped process | `kill -CONT $PID` resumes after STOP |
| SIGUSR1 | 10 | User-defined 1 | App-specific (check docs) | Often used to trigger log rotation, stats dump |
| SIGUSR2 | 12 | User-defined 2 | App-specific (check docs) | App-specific behavior |

### Practical Examples: Process Management

```bash
# Example 1: Check if a specific process is running
ps aux | grep nginx | grep -v grep
# If output is empty, nginx is not running

# Example 2: List all processes of a specific user
ps -u postgres
# Shows all PostgreSQL processes

# Example 3: View process tree (shows parent-child relationships)
ps auxf | grep python
# Shows python process and children (indented)

# Example 4: Get PID of a running process
pgrep nginx
# Returns just the PID (easier for scripting than ps grep)

# Example 5: Show process in real-time (top)
top -b -n 1 | head -20
# -b (batch mode), -n 1 (one snapshot) for scripting

# Example 6: Kill process by name
pkill -f "python.*worker.py"
# -f matches full command line

# Example 7: Graceful shutdown sequence (wait, then force kill)
kill 1234 && sleep 2 && kill -9 1234
# Send SIGTERM, wait 2 seconds, force kill if needed

# Example 8: Kill all processes of a user (careful!)
pkill -u baduser
# Logs user out

# Example 9: Monitor CPU and memory of a process
watch -n 1 'ps aux | grep 1234'
# Refreshes every 1 second

# Example 10: Run background job and detach from terminal
nohup long_running_job.sh &
# Process continues even after terminal closes

# Example 11: Pause and resume a process
kill -STOP 1234    # Pause
kill -CONT 1234    # Resume

# Example 12: Change priority of running process
renice -n +5 -p 1234
# Lower priority (higher nice number = lower priority)

# Example 13: Run process with low priority from start
nice -n 15 backup_script.sh
# Runs with nice=15 (lower priority than others)

# Example 14: See which process is using a specific port
lsof -i :8080
# Shows process using port 8080

# Example 15: Background a long-running command
tar czf backup.tar.gz /data &
jobs -l
# Show all background jobs with PIDs
```

> **SRE Wisdom**
> - **Never use `kill -9` first.** Always try `kill $PID` (SIGTERM) and wait 2-3 seconds. Use `-9` only if process doesn't die.
> - **`pkill -f` is dangerous** if you're not specific: `pkill -f python` might kill unrelated scripts. Use full path: `pkill -f "/opt/app/worker.py"`.
> - **`nice` ranges from -20 to 19:** -20 is highest priority (root only), 19 is lowest. Default is 0.
> - **Use `watch` to monitor a process repeatedly:** `watch -n 1 'ps aux | grep 1234'` refreshes every 1 second.
> - **`top -b -n 1` is perfect for scripts** (non-interactive snapshot); use `top -u user` to filter by user.
> - **Check exit codes after `kill`:** `kill $PID; if [ $? -eq 0 ]; then echo "Killed"; fi`.

---

## 10. File Archiving & Compression

| Command | What It Does | Real-world SRE Example | Flags & Variations |
|---------|--------------|------------------------|-------------------|
| `tar` | Archive files without compression (create `tar` bundles, or decompress) | Backup directory: `tar -cvf backup.tar /var/www` | `-c` (create); `-x` (extract); `-v` (verbose); `-f` (filename); `-z` (gzip); `-j` (bzip2); `-J` (xz); `--strip-components=1` (remove leading dir) |
| `gzip` | Compress individual files (`.gz` extension) | Quick compress: `gzip large.log` (becomes `large.log.gz`) | `-d` (decompress); `-1` to `-9` (compression level, 9=slowest/smallest); `-k` (keep original); `-v` (verbose) |
| `bzip2` | Better compression than gzip (`.bz2`), slower | Compress archival: `bzip2 archive.tar` (becomes `archive.tar.bz2`) | `-d` (decompress); `-9` (maximum compression); `-k` (keep original) |
| `xz` | Best compression (`.xz`), slowest but smallest file | Archive for long-term storage: `xz -9 large_backup.tar` | `-d` (decompress); `-0` to `-9` (compression level); `-k` (keep original); `-e` (extreme, very slow) |
| `zip` | Create zip archives (Windows-compatible, preserves structure) | Share files: `zip backup.zip file1.txt file2.txt` | `-r` (recursive); `-9` (max compression); `-e` (encrypt); `-l` (list contents); `-d` (delete from zip) |
| `7z` | 7-Zip format (excellent compression, needs `p7zip` package) | Max compression: `7z a backup.7z /data -t7z -m0=lzma2 -mx=9` | `a` (add); `x` (extract); `l` (list); `-mx=9` (max compression); `-p` (password) |

### Common `tar` Patterns (The SRE's Favorite Tool)

| Use Case | Command | Notes |
|----------|---------|-------|
| Create tar archive (uncompressed) | `tar -cvf backup.tar /var/www` | Use `-v` to see progress |
| Extract tar archive | `tar -xvf backup.tar` | Extracts to current dir |
| Create gzip-compressed tar | `tar -czvf backup.tar.gz /var/www` | `-z` adds gzip compression |
| Extract gzip tar | `tar -xzvf backup.tar.gz` | Auto-detects gzip |
| List contents without extracting | `tar -tvf backup.tar` | `-t` (table of contents) |
| Extract to specific directory | `tar -xvf backup.tar -C /tmp` | `-C` changes extraction dir |
| Exclude files/patterns | `tar -cvf backup.tar --exclude='*.log' /var/www` | Exclude pattern from archive |
| Stream tar over network | `tar -czf - /data \| ssh host tar -xzf -` | Compress, pipe to remote, extract |
| Tar with timestamps preserved | `tar -cpvf backup.tar /var/www` | `-p` (preserve perms, times) |

### Practical Examples: Archiving & Compression

```bash
# Example 1: Create a basic tar archive
tar -cvf backup-$(date +%Y%m%d).tar /home/user/documents

# Example 2: Create gzip-compressed tar (most common)
tar -czvf backup.tar.gz /var/www
# Output: tar: removing leading '/' from member names
# drwxr-xr-x root/root  0 2026-06-04 14:30 var/www/

# Example 3: Extract tar archive to specific location
tar -xzvf backup.tar.gz -C /var/tmp

# Example 4: List contents of tar without extracting
tar -tzvf backup.tar.gz | head -20

# Example 5: Backup with timestamp and compression
tar -czvf backup-$(date +%Y-%m-%d_%H-%M-%S).tar.gz /opt/app

# Example 6: Stream tar over SSH (backup to remote host)
tar -czf - /data | ssh backup.server "tar -xzf - -C /backups"

# Example 7: Exclude certain files from tar
tar -czvf backup.tar.gz /var/www --exclude='*.tmp' --exclude='logs/*'

# Example 8: Compress a single large file
gzip -9 large-logfile.log
# -9 for maximum compression

# Example 9: Decompress gzip file
gunzip large-logfile.log.gz
# Or: gzip -d large-logfile.log.gz

# Example 10: Compress with bzip2 for better ratio (slower)
bzip2 -9 archive.tar

# Example 11: Compress with xz for maximum compression (very slow)
xz -9e archive.tar
# -e (extreme) goes beyond -9

# Example 12: Create zip archive (cross-platform)
zip -r -9 backup.zip /var/www -x "*.log"

# Example 13: Check compression ratio
ls -lh backup.tar.gz backup.tar.bz2 backup.tar.xz
# Compare file sizes to see which compression is best

# Example 14: Extract only specific files from tar
tar -xzvf backup.tar.gz var/www/config.php

# Example 15: Tar multiple directories
tar -czvf backup.tar.gz /var/www /etc/nginx /opt/app
```

> **SRE Wisdom**
> - **Use `tar -czvf` (c=create, z=gzip, v=verbose, f=file)** as your default; it's the most common pattern.
> - **`tar` vs `tar.gz` trade-off:** uncompressed `tar` is fast, `.tar.gz` is slow to create but 10-20x smaller. For backups, use `.tar.gz`.
> - **Stream backups over SSH:** `tar -czf - /data | ssh host tar -xzf -` avoids disk I/O on source.
> - **List contents with `tar -tzf`** before extracting to verify structure.
> - **Exclude patterns with `--exclude`**: `tar -czvf backup.tar.gz --exclude='*.log' --exclude='tmp' /data`.
> - **`xz` is overkill for logs** (use gzip); reserve `xz -9e` for one-time cold backups where size matters more than speed.
> - **Test extraction:** `tar -tzf backup.tar.gz | head` then test full extraction in `/tmp` before trusting it.

---

## 11. User & Group Management

| Command | What It Does | Real-world SRE Example | Flags & Variations |
|---------|--------------|------------------------|-------------------|
| `useradd` | Create a new user account | Add app user: `useradd -m -s /bin/bash -d /home/appuser appuser` | `-m` (create home dir); `-s` (set shell); `-d` (home dir); `-u` (UID); `-g` (primary group); `-G` (supplementary groups); `-c` (comment/description) |
| `usermod` | Modify existing user account | Add user to `docker` group: `usermod -aG docker username` | `-aG` (append to group); `-s` (change shell); `-d` (new home); `-l` (rename user); `-L` (lock account); `-U` (unlock account) |
| `passwd` | Set or change user password | Change own password: `passwd` → prompts for old/new | `-l` (lock user); `-u` (unlock); `-d` (delete password); `-x days` (max password age); `-n days` (min password age) |
| `groupadd` | Create a new group | Create `docker` group: `groupadd docker` | `-g` (GID); `-S` (system group) |
| `groupmod` | Modify existing group | Rename group: `groupmod -n newname oldname` | `-n` (new name); `-g` (new GID) |
| `userdel` | Delete user account | Remove user: `userdel -r username` | `-r` (remove home dir and mail); (careful, non-reversible!) |
| `getent` | Query system databases (passwd, group, services) | List all users: `getent passwd` | `passwd` (user database); `group` (group database); `hosts` (hostname database) |
| `groups` | Show groups a user belongs to | Check user privileges: `groups username` | (no common flags; shows all groups for user) |
| `id` | Show user/group IDs and membership | Verify permissions: `id username` | `-u` (UID only); `-g` (GID only); `-G` (all groups); `-n` (names instead of numbers) |
| `su` | Switch user (become another user) | Execute command as root: `su - -c "systemctl restart nginx"` | `-` (login shell); `-c` (run command); `-s` (specify shell) |
| `sudo` | Execute command as another user (usually root) with privilege escalation | Restart service: `sudo systemctl restart nginx` | `-u user` (run as different user); `-s` (interactive shell); `-l` (list sudo permissions); `-H` (set HOME) |

### `/etc/sudoers` Quick Reference (Security-Critical!)

Edit with `visudo` (validates syntax before saving):

```bash
# Allow user 'deployer' to run systemctl without password
deployer ALL=(ALL) NOPASSWD:/bin/systemctl

# Allow group 'admins' to run all commands with password
%admins ALL=(ALL) ALL

# Allow specific commands without password for specific user
deployer ALL=(ALL) NOPASSWD:/usr/bin/docker,/usr/bin/systemctl
```

### Practical Examples: User & Group Management

```bash
# Example 1: Create new user with home directory and bash shell
sudo useradd -m -s /bin/bash -d /home/appuser appuser

# Example 2: Set password for user
sudo passwd appuser
# Prompts for password (won't echo)

# Example 3: Add existing user to a group
sudo usermod -aG docker deployer
# -a (append), -G (groups) → adds to docker group without removing other groups

# Example 4: Create a system group (for services)
sudo groupadd -S myapp

# Example 5: List all users
getent passwd | cut -d: -f1

# Example 6: List all groups
getent group | cut -d: -f1

# Example 7: Check which groups a user belongs to
id deployer
# uid=1001(deployer) gid=1001(deployer) groups=1001(deployer),999(docker)

# Example 8: Switch to different user and run command
su - -c "whoami" appuser

# Example 9: Execute as root with sudo
sudo -u postgres psql

# Example 10: List user's sudo permissions
sudo -l

# Example 11: Edit sudoers file safely (validation before save)
sudo visudo
# Then add: deployer ALL=(ALL) NOPASSWD:/bin/systemctl

# Example 12: Lock a user account (disable login)
sudo usermod -L username

# Example 13: Unlock a user account
sudo usermod -U username

# Example 14: Delete user and home directory
sudo userdel -r username

# Example 15: Change user's shell
sudo usermod -s /bin/zsh username
```

> **SRE Wisdom**
> - **Use `getent` instead of reading files directly** (respects LDAP, NIS, etc.): `getent passwd username`.
> - **Always use `visudo` to edit `/etc/sudoers`** (validates syntax and prevents lockout).
> - **`-aG` (append to groups) is safer than `-G`** (which replaces all groups): `usermod -aG docker user` doesn't remove other groups.
> - **Lock accounts with `usermod -L`** instead of deleting them; easier to restore and preserves audit trails.
> - **Set `NOPASSWD` in sudoers carefully**; use specific commands: `deployer ALL=(ALL) NOPASSWD:/usr/bin/systemctl` not `deployer ALL=(ALL) NOPASSWD:ALL`.
> - **Use `id` for quick permission check:** `id username` shows all groups and UIDs.

---

## 12. Disk & Filesystem Management

| Command | What It Does | Real-world SRE Example | Flags & Variations |
|---------|--------------|------------------------|-------------------|
| `df` | Display disk space usage by filesystem (mounted partitions) | Check all filesystems: `df -h` shows human-readable usage | `-h` (human-readable: K/M/G); `-i` (inode usage); `-T` (show filesystem type); `-a` (include pseudo-filesystems); `--total` (grand total) |
| `du` | Disk usage of files/directories (recursive, shows size of dirs) | Find large directories: `du -sh /var/* \| sort -h` | `-s` (summary, dir size only); `-h` (human-readable); `-d 1` (depth 1, immediate children); `--total` (sum all); `-c` (show totals) |
| `ncdu` | Nicer version of `du` (interactive, TUI, navigate directories) | Explore disk usage: `ncdu /var` then navigate with arrows | (ncurses interface, requires `apt install ncdu`) |
| `lsblk` | List block devices (disks and partitions as tree) | Show all disks: `lsblk` displays tree of devices | `-a` (all devices); `-d` (disk names only); `-f` (filesystems); `-S` (store output as set) |
| `blkid` | Show block device IDs (UUID, filesystem type) | Get UUID of device: `blkid /dev/sda1` | `-l` (list one per line); `-o udev` (udev format); `-s TYPE` (show specific attribute) |
| `mount` | Mount filesystem (attach partition to directory) | Mount USB: `sudo mount /dev/sdb1 /mnt/usb` | `-t type` (filesystem type); `-o options` (mount options); `-a` (mount all from `/etc/fstab`); `-r` (read-only) |
| `umount` | Unmount filesystem (safely remove partition) | Eject USB: `sudo umount /mnt/usb` | `-l` (lazy unmount, allow later cleanup); `-f` (force); `-a` (unmount all) |
| `fstab` | `/etc/fstab` file (persistent mounts, checked at boot) | Edit for permanent mounts: `sudo nano /etc/fstab` | Format: `device mount_point type options dump pass` |
| `resize2fs` | Grow ext4 filesystem to fill partition | Expand filesystem after partition grow: `sudo resize2fs /dev/sda1` | `-f` (force); `-M` (minimum size); `-p` (print progress) |
| `xfs_growfs` | Grow XFS filesystem to fill partition | Expand XFS after partition grow: `sudo xfs_growfs /mnt/xfs` | (no common flags; usually just `xfs_growfs /mount/point`) |
| `mkfs` | Create filesystem on device (format partition, DESTRUCTIVE!) | Format new partition: `sudo mkfs.ext4 /dev/sdb1` | `-t ext4/xfs/btrfs` (filesystem type); `-L label` (volume label); `-F` (force, no confirmation) |
| `fsck` | Filesystem check and repair (runs automatically at boot if dirty) | Manual check (unmount first): `sudo fsck /dev/sdb1` | `-y` (auto-fix without asking); `-n` (read-only, don't fix); `-f` (force even if marked clean) |

### Mount Options Reference (`-o` flag for `mount` or `/etc/fstab`)

| Option | Meaning | Example Use |
|--------|---------|------------|
| `defaults` | Standard options (rw, suid, dev, exec, auto, nouser, async) | `defaults` |
| `ro` | Read-only (write-protect) | ISO images, snapshots |
| `rw` | Read-write (default) | Normal partitions |
| `noexec` | Don't execute binaries (security) | `/tmp`, `/home` on multi-user systems |
| `nodev` | Don't allow device files | Security-sensitive filesystems |
| `nosuid` | Disable setuid/setgid bits (security) | `/tmp`, `/home` |
| `nouser` | Only root can mount | Default |
| `user` | Any user can mount | USB drives, removable media |
| `async` | Async I/O (fast, risky) | `/tmp` |
| `sync` | Sync I/O (slow, safe) | External drives, backups |
| `nofail` | Don't fail boot if mount fails | Optional filesystems |

### `/etc/fstab` Format & Example

```
# Device                 Mount Point   Type   Options              Dump Pass
UUID=abc-123-def        /             ext4   defaults             0    1
UUID=xyz-789-def        /home         ext4   defaults             0    2
/dev/mapper/vg0-backup  /backup       ext4   defaults,nofail      0    0
LABEL=USB_DRIVE         /mnt/usb      vfat   user,noauto,nofail   0    0
/swap.img               none          swap   sw                   0    0
```

### Practical Examples: Disk & Filesystem

```bash
# Example 1: Check disk usage of all filesystems (human-readable)
df -h
# Filesystem      Size  Used Avail Use% Mounted on
# /dev/sda1       100G   45G   55G  45% /
# tmpfs           8.0G     0  8.0G   0% /dev/shm

# Example 2: Find largest directories
du -sh /var/* | sort -h
# 1.2G  /var/log
# 500M  /var/cache
# 200M  /var/tmp

# Example 3: Check which directory is eating space
ncdu -x /
# Interactive TUI; arrow keys navigate; d to delete

# Example 4: List all block devices and partitions
lsblk
# NAME   MAJ:MIN RM  SIZE RO TYPE MOUNTPOINT
# sda      8:0    0  100G  0 disk
# ├─sda1   8:1    0   50G  0 part /
# └─sda2   8:2    0   50G  0 part /home

# Example 5: Get UUID of a partition (for /etc/fstab)
blkid /dev/sda1
# /dev/sda1: UUID="abc-123-def" TYPE="ext4"

# Example 6: Mount a partition (requires mount point to exist)
sudo mkdir -p /mnt/data
sudo mount /dev/sdb1 /mnt/data

# Example 7: Mount with specific options (read-only)
sudo mount -o ro /dev/sdb1 /mnt/data

# Example 8: Unmount a filesystem
sudo umount /mnt/data

# Example 9: Lazy unmount (allow safe eject even if in use)
sudo umount -l /mnt/usb

# Example 10: Make mount permanent by editing /etc/fstab
sudo nano /etc/fstab
# Add line: UUID=abc-123  /mnt/data  ext4  defaults  0 0
# Then: sudo mount -a (test mount all entries)

# Example 11: Check inode usage (not just disk space)
df -i
# Filesystem     Inodes  IUsed   IFree IUse% Mounted on
# /dev/sda1    6553600 123456 6430144    2% /

# Example 12: Expand ext4 filesystem after partition grows
sudo resize2fs /dev/sda1

# Example 13: Expand XFS filesystem after partition grows
sudo xfs_growfs /mnt/xfs

# Example 14: Check and repair filesystem (must be unmounted!)
sudo fsck -y /dev/sdb1
# -y auto-fixes errors

# Example 15: Create a new ext4 filesystem (DESTRUCTIVE!)
sudo mkfs.ext4 -L backup /dev/sdb1
# -L sets volume label
```

> **SRE Wisdom**
> - **Use `df` for overall disk usage**, `du` to find where space is used; `ncdu` if you need interactive exploration.
> - **`lsblk` is fastest way to see disk layout**; shows partitions, sizes, and mount points at a glance.
> - **Always `blkid` before editing `/etc/fstab`** to get correct UUIDs; UUIDs survive hardware changes unlike `/dev/sda1`.
> - **Test `fstab` changes with `sudo mount -a`** before reboot; wrong entries can prevent system from booting!
> - **`resize2fs` only works on ext filesystems**; use `xfs_growfs` for XFS, `btrfs filesystem resize` for btrfs.
> - **Check inodes with `df -i`** not just disk space; you can run out of inodes before disk space.
> - **Mount USB with `nouser` by default; use `user,noauto,nofail` in fstab for unprivileged mounts.**

---

## 13. Bash Intermediate – Level Up Your Scripts

| Concept | Syntax | Real-world SRE Example | Common Pitfalls |
|---------|--------|------------------------|-----------------|
| **Arrays** | `arr=(val1 val2)` then `${arr[0]}`, `${arr[@]}` (all), `${#arr[@]}` (count) | `servers=(web1 web2 web3); for s in "${servers[@]}"; do ssh $s "status"; done` | Always quote array expansion: `"${arr[@]}"` to preserve spaces |
| **Associative arrays** | `declare -A dict; dict[key]=value; ${dict[key]}` | `declare -A config; config[host]=db1; config[port]=5432` | Bash 4+ only; declare **before** assigning |
| **Functions** | `function_name() { commands; return code; }` | `backup() { tar -czf /backups/$(date +%s).tar.gz "$1"; }` | Use `return` for exit code (0-255); `echo` for output |
| **Exit codes** | Captured in `$?` (0=success, 1-255=error); tested with `if command; then...` | `if deploy_app; then notify_slack "Success"; else notify_slack "Failed"; fi` | Check `$?` immediately; it resets after each command |
| **Parameter expansion** | `${VAR:offset:length}`, `${VAR#pattern}`, `${VAR%pattern}`, `${VAR/old/new}` | `file="app.log"; echo ${file%.*}` → prints `app` | Complex; test in shell before using in scripts |
| **`set -e`** | Exit script if any command returns non-zero | `set -e; step1; step2; step3` → stops on first error | Can be overridden with `command \|\| true`; use `set -o pipefail` too |
| **`set -u`** | Exit if undefined variable is used | `set -u; echo $UNDEFINED` → error instead of empty | Catches typos like `$HSTNAME` vs `$HOSTNAME` |
| **`set -x`** | Print commands before executing (debug mode) | `set -x; deploy; set +x` → prints each command | Use `PS4='+ '` to customize debug prefix |
| **Pipes and `$?`** | Use `set -o pipefail` to catch errors in middle of pipe | `set -o pipefail; cat big.log \| grep ERROR \| wc -l` → fails if grep fails | Normally last command in pipe is checked |
| **Subshells** | `$(command)` runs in subshell; variables don't persist | `result=$(grep "ERROR" app.log); echo $result` | Changes in subshell don't affect parent shell |

### Practical Examples: Bash Intermediate

```bash
#!/bin/bash
# Example 1: Array iteration

servers=("web1.prod" "web2.prod" "web3.prod")

for server in "${servers[@]}"; do
    echo "Checking $server"
    ssh "$server" uptime
done
```

```bash
#!/bin/bash
# Example 2: Function with return code checking

deploy_service() {
    local service=$1
    echo "Deploying $service..."
    
    if systemctl restart "$service" 2>/dev/null; then
        echo "✓ $service restarted successfully"
        return 0
    else
        echo "✗ Failed to restart $service" >&2
        return 1
    fi
}

# Usage with error handling
if deploy_service nginx; then
    echo "Deployment succeeded"
else
    echo "Deployment failed" >&2
    exit 1
fi
```

```bash
#!/bin/bash
# Example 3: Debug with set -x

set -e  # Exit on error
set -u  # Error on undefined variables
set -o pipefail  # Catch pipe errors

# At this point, script is safe:
# - Stops if any command fails
# - Fails if undefined variable used
# - Fails if any command in pipe fails

# Enable debug logging
set -x
backup_database
verify_backup
set +x  # Disable debug logging
```

```bash
#!/bin/bash
# Example 4: Associative arrays (Bash 4+)

declare -A config

config[db_host]="localhost"
config[db_port]="5432"
config[db_name]="production"

echo "Connecting to ${config[db_host]}:${config[db_port]} / ${config[db_name]}"
```

```bash
#!/bin/bash
# Example 5: Parameter expansion tricks

filename="backup-2026-06-04.tar.gz"

# Remove extension (.tar.gz)
basename="${filename%.*}"
echo "$basename"  # backup-2026-06-04.tar

# Remove prefix
echo "${filename#backup-}"  # 2026-06-04.tar.gz

# Replace pattern
modified="${filename//./-}"
echo "$modified"  # backup-2026-06-04-tar-gz

# Substring
echo "${filename:0:6}"  # backup

# Get length
echo "${#filename}"  # 27
```

```bash
#!/bin/bash
# Example 6: Pipeline error handling

set -o pipefail

# This now fails if grep finds nothing
if cat /var/log/app.log | grep -q "ERROR" | wc -l > 0; then
    echo "Errors found!"
fi
```

> **SRE Wisdom**
> - **Use `set -e -u -o pipefail` at top of every production script** (fail fast, catch errors early).
> - **Quote array expansion: `"${arr[@]}"` not `${arr[@]}`** or spaces break elements into multiple args.
> - **Functions return exit codes (0-255); `echo` for output**, not `return`.
> - **Use `set -x` (debug) sparingly** in production; it logs everything including secrets. Better: use conditional `if [ "$DEBUG" = "1" ]; then set -x; fi`.
> - **Parameter expansion `${VAR%pattern}` removes from end**, `${VAR#pattern}` from start.
> - **Subshells `$(...)` run in isolated context**; variable assignments don't leak back to parent shell.
> - **Test scripts with `bash -n script.sh`** (syntax check) before running.

---

## Bash Aliases & Time-Savers (Level 2)

Add these to `~/.bashrc`:

```bash
# Finding & searching
alias findlog='find . -name "*.log" -type f'
alias findbig='find . -size +100M'
alias greplog='grep -r --include="*.log"'

# Process shortcuts
alias psg='ps aux | grep'  # psg python (show python processes)
alias toppy='top -p $(pgrep python | paste -sd "," -)'  # Top processes for python

# Disk & storage
alias diskfree='df -h | grep -v tmpfs'  # Show disk without tmpfs
alias dusum='du -sh'  # dusum /var (show total)
alias bigscan='du -sh */ | sort -rh | head -20'  # Find 20 largest dirs

# Safety
alias chown='chown -v'  # Verbose
alias chmod='chmod -v'  # Verbose
alias grep='grep --color=auto'

# Network
alias ports='ss -tlnp'  # Show listening ports
alias netstat='ss -tlnp'  # Modern netstat

# Text processing
alias sortu='sort | uniq'  # Sort and deduplicate
alias countlines='wc -l'
```

---

## Checkpoint: By the end of Level 2, you should be able to:

- [ ] Find files using `find`, `locate`, `grep`, `whereis`
- [ ] Master text processing: `cut`, `sort`, `uniq`, `awk`, `sed`
- [ ] Monitor processes: `ps aux`, `top`, `htop`, kill gracefully
- [ ] Archive and compress: `tar -czvf`, gzip, bzip2, xz
- [ ] Manage users and groups with `useradd`, `usermod`, `sudoers`
- [ ] Understand disk usage: `df`, `du`, `ncdu`, mounting
- [ ] Write production-ready bash scripts with arrays, functions, error handling
- [ ] Know Linux signals and when to use SIGTERM vs SIGKILL
- [ ] Use pipes and redirection confidently

---

**Next:** [Level 3 – Advanced](LEVEL_3_ADVANCED.md) (strace, systemd, networking, deep process inspection)
