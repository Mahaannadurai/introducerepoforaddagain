# LEVEL 3 – ADVANCED (Pre-SRE Base)
*System tracing, systemd mastery, networking deep-dives, storage internals, and bash at scale. Time to debug the kernel.*

---

## 14. Deep Process & Performance Inspection

| Command | What It Does | Real-world SRE Example | Flags & Variations |
|---------|--------------|------------------------|-------------------|
| `strace` | Trace system calls and signals (see what a process does at kernel level) | Debug why app is slow: `strace -c curl http://example.com` shows syscall counts | `-c` (count syscalls); `-e trace=read,write` (filter syscalls); `-p PID` (attach to running process); `-f` (follow forks); `-s 200` (string length); `-o file` (write to file) |
| `ltrace` | Trace library calls (what functions from libc, etc. are called) | Debug app crash: `ltrace ./app` shows which library function failed | `-c` (count calls); `-e regex` (filter calls); `-p PID` (attach); `-f` (follow forks); `-C` (decode C++ names) |
| `lsof` | List open files (which files/sockets a process has open) | Find what a process is reading/writing: `lsof -p 1234` | `-i` (network connections only); `-i :8080` (port 8080); `-u user` (by user); `-c nginx` (by process name); `-d fd` (specific file descriptor) |
| `fuser` | Find processes using a file/directory/port | Which process is listening on port 8080: `fuser -n tcp 8080` | `-n tcp/udp` (network sockets); `-k` (kill processes found); `-v` (verbose) |
| `/proc` filesystem | Virtual filesystem with process/system info | Check limits: `cat /proc/1234/limits`; check memory: `cat /proc/1234/status` | Read-only; key files: `cmdline` (args), `status` (state), `maps` (memory), `fd/` (open files), `net/tcp` (connections) |
| `sar` | System Activity Reporter (historical performance data) | Get CPU/memory over time: `sar -u 1 10` (10 samples, 1 sec apart) | `-u` (CPU); `-r` (memory); `-b` (I/O); `-n DEV` (network); `-d` (disk); requires sysstat package |
| `vmstat` | Virtual Memory Statistics (CPU, memory, swap, I/O counters) | Real-time memory/swap: `vmstat 1 5` (5 samples, 1 sec apart) | `1 5` (interval and count); `-s` (stats table); `-d` (disk stats); `-p /dev/sda1` (partition) |
| `iostat` | I/O Statistics (disk read/write performance) | Check disk utilization: `iostat -x 1` (extended stats, 1 sec interval) | `-x` (extended, show util%); `-d` (disk only); `-c` (CPU only); `-k` (KB/s); `-m` (MB/s) |
| `pidstat` | Per-process statistics (CPU, memory, I/O per process) | Find which process is writing to disk: `pidstat -d 1` (disk I/O, 1 sec) | `-u` (CPU per-process); `-r` (memory); `-d` (disk I/O); `-w` (context switches); `-l` (long commands) |

### `/proc` Filesystem Key Paths for Process Inspection

| Path | Content |
|------|---------|
| `/proc/PID/cmdline` | Full command line (null-separated args) |
| `/proc/PID/status` | Process state, memory, signals (human-readable) |
| `/proc/PID/maps` | Memory mappings (which libraries/files mapped) |
| `/proc/PID/fd/` | Directory of open file descriptors |
| `/proc/PID/limits` | Resource limits (max open files, stack size, etc.) |
| `/proc/PID/stat` | Process statistics (raw kernel data) |
| `/proc/meminfo` | Memory statistics (total, free, buffers, cached) |
| `/proc/cpuinfo` | CPU info (cores, flags, MHz) |
| `/proc/net/tcp` | Active TCP connections |
| `/proc/net/udp` | Active UDP connections |
| `/proc/loadavg` | Load average (1, 5, 15 min) |
| `/proc/uptime` | System uptime and idle time |
| `/proc/sys/vm/` | Virtual memory tuning parameters |

### Practical Examples: Deep Process Inspection

```bash
# Example 1: Trace system calls (shows what process does, slows it down)
strace -c sleep 1
# Time     Seconds    UsecSecs   Calls Errors Syscall
# 100.00%  0.000000  0.000000      0         total
# (Output shows syscall statistics)

# Example 2: Trace specific syscalls only
strace -e trace=read,write,open ls /var/log > /dev/null

# Example 3: Trace a running process by PID
sudo strace -p 1234 -f -s 200
# -f follows child processes, -s 200 shows 200-char strings

# Example 4: Trace library calls
ltrace ./my_app
# Prints: read@libc.so.6(3, 0x7fff..., 4096) = 1024

# Example 5: List all open files for a process
lsof -p 1234

# Example 6: Find what process is using a specific file
lsof /var/log/app.log

# Example 7: List all network connections for a process
lsof -p 1234 -i

# Example 8: Find process listening on port 8080
lsof -i :8080
# Or: fuser -n tcp 8080

# Example 9: Check process resource limits
cat /proc/1234/limits
# Limit                     Soft Limit           Hard Limit           Units
# Max cpu time              unlimited            unlimited            seconds
# Max file size             unlimited            unlimited            bytes

# Example 10: Check process memory usage (detailed)
cat /proc/1234/status | grep Vm
# VmPeak:	  123456 kB
# VmHWM:	   56789 kB
# VmRSS:	   45678 kB

# Example 11: CPU usage by top processes
pidstat -u 1 -l | head -20
# UID      PID  %usr %sys %guest %wait  %CPU  CPU Command
# root    1234 25.0  5.0   0.0   0.0  30.0    0  /usr/bin/python

# Example 12: Disk I/O by process
pidstat -d 1 5
# UID      PID   kB_rd/s   kB_wr/s kB_ccwr/s %CPU Command
# root    1234  1024.00   512.00    0.00    10% app

# Example 13: System-wide disk I/O stats
iostat -x 1 3
# avg-cpu: 20.0% user, 5.0% system, 75.0% idle
# Device: ...

# Example 14: Memory pressure (buffer cache)
vmstat 1 5 | tail -5
# procs memory    swap          io system             cpu
# r  b  swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st
# 0  0     0 1234567 567890 9876543 0   0   512   256  1000 2000 20 5 70 5 0

# Example 15: Check system uptime and load
cat /proc/uptime
# 123456.78 987654.32
# (uptime in seconds, idle time in seconds)

uptime
# 15:32:45 up 1 day, 10:30,  2 users,  load average: 0.12, 0.15, 0.10
```

> **SRE Wisdom**
> - **`strace` slows down processes dramatically** (10-100x); use `-c` for quick summary, not continuous monitoring.
> - **`lsof -p PID` is gold for understanding what a process has open** (files, sockets, pipes).
> - **Check `/proc/PID/limits` before tuning:** maybe the process hit file descriptor limit, not a real problem.
> - **`pidstat -d` shows actual disk I/O by process**; combine with `-w` to see context switches.
> - **`vmstat` output columns:** `r` (runnable processes), `b` (blocked), `si/so` (swap in/out). If `b` or `si/so` > 0, you have memory pressure.
> - **`iostat -x` % util > 80% means disk is bottleneck**; check which process with `pidstat -d`.

---

## 15. SystemD Mastery

| Command | What It Does | Real-world SRE Example | Flags & Variations |
|---------|--------------|------------------------|-------------------|
| `systemctl` | Manage systemd services (start, stop, enable, check status) | Start nginx and enable at boot: `sudo systemctl enable --now nginx` | `start/stop/restart` (manage); `enable/disable` (boot startup); `status` (show state); `reload` (reload config); `--user` (user services); `--no-pager` (no pagination) |
| `journalctl` | Query systemd journal (centralized logging) | Tail logs for nginx: `journalctl -u nginx -f` | `-u unit` (specific service); `-f` (follow, like tail -f); `-n 50` (last 50 lines); `--since "today"` (filter by time); `-p err` (filter by priority); `--no-pager` |
| `systemctl daemon-reload` | Reload systemd configuration after editing `.service` files | After editing `/etc/systemd/system/myapp.service`, run this | (required before systemctl sees new/changed services) |
| `systemctl list-units` | List all units (services, mounts, timers) | `systemctl list-units --type=service --state=failed` | `--type=service/mount/timer` (filter); `--state=running/failed/inactive` (filter); `--all` (include inactive) |
| `systemctl show` | Show all properties of a unit | `systemctl show -p ExecStart --value nginx` | `-p property` (specific property); `--value` (output value only); `--all` (all properties) |
| `systemctl set-property` | Temporarily change unit properties (until next reboot) | Limit service memory: `sudo systemctl set-property nginx MemoryLimit=512M` | Changes live but not persistent; edit `.service` file for permanent |

### SystemD Service File Basics

**Location:** `/etc/systemd/system/myapp.service` or `/usr/lib/systemd/system/`

**Basic Structure:**
```ini
[Unit]
Description=My Application
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/myapp
Restart=on-failure
RestartSec=5s
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

**Common Directives:**
- `Type=simple` (foreground), `Type=forking` (backgrounds), `Type=oneshot` (run once, exit)
- `ExecStart` (command to run)
- `Restart=on-failure` (restart if exits non-zero)
- `RestartSec=5s` (wait 5 seconds between restarts)
- `StandardOutput=journal` (send output to systemd journal)
- `User=appuser` (run as specific user)
- `WorkingDirectory=/opt/app` (change dir before exec)

### Practical Examples: SystemD

```bash
# Example 1: Check service status
sudo systemctl status nginx

# Example 2: Start service
sudo systemctl start nginx

# Example 3: Enable service at boot
sudo systemctl enable nginx

# Example 4: Start and enable in one command
sudo systemctl enable --now nginx

# Example 5: Stop and disable service
sudo systemctl disable --now nginx

# Example 6: Restart service and show status
sudo systemctl restart nginx && sudo systemctl status nginx

# Example 7: Reload service configuration (without full restart)
sudo systemctl reload nginx

# Example 8: View service logs (last 50 lines)
journalctl -u nginx -n 50 --no-pager

# Example 9: Follow service logs in real-time
journalctl -u nginx -f

# Example 10: View logs since last boot
journalctl -u nginx --since "today"

# Example 11: Show logs with timestamps
journalctl -u nginx -o short-monotonic

# Example 12: List all failed services
sudo systemctl list-units --state=failed

# Example 13: View all service files
sudo systemctl list-unit-files --type=service

# Example 14: Show service ExecStart command
systemctl show -p ExecStart --value nginx

# Example 15: Reload systemd after editing .service file
sudo nano /etc/systemd/system/myapp.service
sudo systemctl daemon-reload
sudo systemctl restart myapp

# Example 16: Limit service to 512MB memory
sudo systemctl set-property nginx MemoryLimit=512M

# Example 17: Check unit dependencies
systemctl show -p Wants -p Requires nginx

# Example 18: View all environment variables for service
systemctl show-environment
```

### Creating a Custom SystemD Service

```bash
# Step 1: Create service file
sudo nano /etc/systemd/system/myapp.service

[Unit]
Description=My Production App
After=network.target postgresql.service

[Service]
Type=simple
User=appuser
WorkingDirectory=/opt/myapp
ExecStart=/opt/myapp/bin/server --config=/opt/myapp/config.yaml
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
Environment="PYTHONUNBUFFERED=1"

[Install]
WantedBy=multi-user.target

# Step 2: Reload systemd to register service
sudo systemctl daemon-reload

# Step 3: Enable and start
sudo systemctl enable --now myapp

# Step 4: Verify
sudo systemctl status myapp
journalctl -u myapp -f
```

> **SRE Wisdom**
> - **Always `systemctl daemon-reload` after editing `.service` files**, or systemd won't see your changes.
> - **Use `journalctl -u service -f` to tail logs**, not `tail -f /var/log/...`; systemd centralizes logs.
> - **Set `Restart=on-failure` for auto-recovery** in production services.
> - **Use `Type=simple` for foreground processes** (most apps), `Type=forking` only for legacy daemons.
> - **Log to `journal` (StandardOutput=journal)** instead of files; systemd rotation is automatic.
> - **Use `enable --now` as shorthand** for `enable` + `start` together.

---

## 16. Networking 1 – Diagnosis & Configuration

| Command | What It Does | Real-world SRE Example | Flags & Variations |
|---------|--------------|------------------------|-------------------|
| `ip` | Modern network configuration (replaces `ifconfig`, `route`, `arp`) | Show all interfaces: `ip addr show` | `addr` (show addresses); `route` (show routes); `link` (show interfaces); `-s` (statistics) |
| `ss` | Socket statistics (replaces `netstat`, faster) | Show listening ports: `ss -tlnp` | `-t` (TCP); `-u` (UDP); `-l` (listening); `-n` (numeric, no DNS); `-p` (show process); `-a` (all); `-s` (summary) |
| `ethtool` | Ethernet tool (NIC speed, duplex, statistics) | Check NIC speed: `ethtool eth0` | `eth0` (interface name); `-i` (driver info); `-S` (statistics); `-A` (enable/disable offload) |
| `ping` | Test connectivity to host (ICMP echo) | Test gateway: `ping -c 3 8.8.8.8` | `-c count` (stop after N packets); `-W timeout` (timeout per packet); `-i interval` (inter-packet delay); `-s size` (packet size) |
| `mtr` | Trace route with continuous ping (combines traceroute + ping) | See latency to each hop: `mtr example.com` | `-c count` (stop after N packets); `-r` (report, no interactive); `--tcp` (TCP mode, not ICMP) |
| `traceroute` | Trace path to host (show each router hop) | Debug routing: `traceroute example.com` | `-m max_hops` (max hops); `-p port` (port); `--tcp` (TCP mode); `-I` (ICMP, not UDP) |
| `nslookup` | DNS lookup (query DNS server) | Resolve hostname: `nslookup example.com` | `example.com` (hostname); `8.8.8.8` (query specific nameserver); `-type=MX` (MX records) |
| `dig` | DNS lookup with detailed output (modern nslookup) | Query specific nameserver: `dig @8.8.8.8 example.com` | `@server` (use specific nameserver); `+short` (short output); `MX` (MX records); `NS` (nameserver records) |
| `host` | DNS lookup (simple, quick) | Quick DNS check: `host example.com` | `example.com` (hostname); `-t MX` (record type); `-v` (verbose) |

### Practical Examples: Networking Diagnosis

```bash
# Example 1: Show all network interfaces with details
ip addr show
# inet 192.168.1.100/24 brd 192.168.1.255 scope global eth0

# Example 2: Show IPv4 routes
ip route show
# default via 192.168.1.1 dev eth0
# 192.168.1.0/24 dev eth0 proto kernel scope link

# Example 3: Show listening ports and which process owns them
ss -tlnp
# LISTEN 0 128 *:8080 *:* users:(("node",pid=1234,fd=5))

# Example 4: Show all TCP connections
ss -an | grep ESTABLISHED
# ESTAB 0 0 192.168.1.100:52345 203.0.113.1:443

# Example 5: Check NIC speed and statistics
ethtool eth0
# Speed: 1000Mb/s
# Duplex: Full
# Link detected: yes

# Example 6: Check NIC driver and firmware
ethtool -i eth0
# driver: bnx2
# firmware-version: 1.2.34

# Example 7: Ping with timeout
ping -c 1 -W 2 example.com
# -c 1 (one packet), -W 2 (2 second timeout)

# Example 8: Trace route with RTT to each hop
mtr -c 5 -r example.com
# Shows 5 ping cycles to each hop

# Example 9: Resolve IP to hostname
nslookup 8.8.8.8
# Address: 8.8.8.8
# Name: dns.google

# Example 10: Query specific nameserver
dig @1.1.1.1 example.com
# Uses Cloudflare DNS (1.1.1.1)

# Example 11: Get MX records for domain
dig example.com MX +short
# 10 mail.example.com.

# Example 12: Get all DNS records
dig example.com ANY +short

# Example 13: Reverse DNS lookup
dig -x 203.0.113.1 +short
# Shows hostname of IP

# Example 14: Check if DNS resolves
host example.com 8.8.8.8
# Using nameserver 8.8.8.8

# Example 15: TCP connection test (check if port is open)
timeout 2 bash -c 'cat < /dev/null > /dev/tcp/example.com/443'
echo $?  # 0 = connected, 1 = timeout/refused
```

> **SRE Wisdom**
> - **Use `ip` not `ifconfig`** (modern, consistent across distros); Ubuntu 2024 LTS uses `ip` by default.
> - **`ss -tlnp` is the fastest way to see listening ports**; `netstat` is slower and deprecated.
> - **DNS issues? Check in order:** `nslookup` → `dig @nameserver` → `dig +trace` (full DNS chain).
> - **`mtr` is better than `traceroute`** because it shows loss % and latency continuously.
> - **Test port connectivity with:** `timeout 2 bash -c 'cat < /dev/null > /dev/tcp/host/port'` (no external tools needed).

---

## 17. Networking 2 – Troubleshooting & Security

| Command | What It Does | Real-world SRE Example | Flags & Variations |
|---------|--------------|------------------------|-------------------|
| `tcpdump` | Packet sniffer (capture network traffic, protocol-level debugging) | Capture all traffic on eth0: `sudo tcpdump -i eth0` | `-i interface` (which NIC); `-n` (no DNS, numeric IPs); `-c count` (stop after N packets); `-w file` (write to file); `-r file` (read from file); `host X` (filter by host); `port 443` (filter by port) |
| `tshark` | Wireshark CLI (cleaner than tcpdump output) | Capture and display: `sudo tshark -i eth0 -f "port 443"` | `-i interface`; `-f filter` (packet filter); `-n` (no DNS); `-T text/json/pdml` (output format); same filters as tcpdump |
| `nmap` | Network mapper (port scan, OS detection, service enumeration) | Scan host for open ports: `nmap example.com` | `-p 80,443` (specific ports); `-p-` (all ports); `-sS` (SYN scan); `-sU` (UDP scan); `-A` (aggressive: OS + version detection); `-Pn` (skip ping) |
| `netcat` (`nc`) | Network swiss-knife (listen on ports, connect to hosts, transfer files) | Test if port 8080 is open: `nc -zv example.com 8080` | `-l` (listen); `-p port` (which port); `-z` (zero I/O, just check); `-v` (verbose); `-u` (UDP); `-w timeout` (timeout) |
| `socat` | Socket cat (bidirectional pipe between addresses, netcat on steroids) | Forward local port to remote: `socat TCP-LISTEN:8080 TCP:example.com:80` | `TCP-LISTEN:port` (listen); `TCP:host:port` (connect); `UDP-LISTEN` (UDP); `EXEC:command` (execute command) |
| `iptables` | Firewall rules (netfilter kernel module, Ubuntu 2024 LTS uses nftables backend but iptables still works) | Block IP: `sudo iptables -A INPUT -s 203.0.113.1 -j DROP` | `-A` (append); `-D` (delete); `-I` (insert); `-L` (list); `-n` (numeric); `-v` (verbose); `INPUT/OUTPUT/FORWARD` (chains); `-j ACCEPT/DROP/REJECT` (action) |
| `nftables` | Modern firewall (replacement for iptables, default in Ubuntu 2024 LTS) | List rules: `sudo nft list ruleset` | Syntax: `nft add rule inet filter input tcp port 22 accept`; more flexible than iptables |
| `ufw` | Uncomplicated Firewall (high-level firewall management, uses nftables) | Allow SSH: `sudo ufw allow 22` | `enable/disable` (turn on/off); `allow/deny port` (rules); `status` (show rules); `status verbose` (detailed) |

### Practical Examples: Networking Troubleshooting

```bash
# Example 1: Capture all traffic on eth0 (stop with Ctrl+C)
sudo tcpdump -i eth0

# Example 2: Capture only HTTP traffic to/from example.com
sudo tcpdump -i eth0 -n host example.com and port 80

# Example 3: Capture to file for later analysis
sudo tcpdump -i eth0 -w capture.pcap
# Open in Wireshark: wireshark capture.pcap

# Example 4: Live packet analysis with tshark
sudo tshark -i eth0 -n -f "port 443"

# Example 5: Scan host for open ports
nmap example.com
# Shows open, closed, filtered ports

# Example 6: Scan specific ports
nmap -p 80,443,8080 example.com

# Example 7: Scan all ports (slow)
nmap -p- example.com

# Example 8: Aggressive scan (OS detection, version detection)
nmap -A example.com

# Example 9: UDP port scan
nmap -sU -p 53,123 example.com

# Example 10: Test if port is open (no banner)
nc -zv example.com 8080

# Example 11: Listen on port 8888 (useful for testing)
nc -l 8888
# Now send data to port 8888 and it will appear here

# Example 12: Transfer file via netcat
# On receiver: nc -l 8888 > file.tar.gz
# On sender: cat file.tar.gz | nc receiver_ip 8888

# Example 13: Port forward with socat
socat TCP-LISTEN:8080,reuseaddr,fork TCP:backend.internal:8080
# Listens on 8080, forwards to backend.internal:8080

# Example 14: List firewall rules
sudo ufw status verbose

# Example 15: Allow specific port
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443

# Example 16: Deny port
sudo ufw deny 23

# Example 17: Allow from specific IP
sudo ufw allow from 192.168.1.100 to any port 22

# Example 18: Enable firewall (careful!)
sudo ufw enable
# Make sure you allow SSH first or you'll lock yourself out!

# Example 19: Disable firewall (emergency)
sudo ufw disable

# Example 20: Low-level firewall rules (nftables)
sudo nft list ruleset
```

> **SRE Wisdom**
> - **Always allow SSH before enabling firewall**, or you'll lock yourself out: `sudo ufw allow 22/tcp`.
> - **`nmap` is forbidden on networks you don't own**; only use on your own infrastructure.
> - **`tcpdump` requires root**; use `sudo tcpdump` or add user to `tcpdump` group with `usermod -aG tcpdump user`.
> - **Combine filters with `and/or/not`:** `tcpdump -i eth0 "host X and port Y"` captures only matching traffic.
> - **Use `netcat -zv` to test if port is open** without making a full connection (just check SYN-ACK).
> - **Ubuntu 2024 LTS uses nftables backend** but maintains iptables compatibility via wrapper; prefer `ufw` for simplicity.

---

## 18. Storage Deep Dive – LVM & RAID

| Command | What It Does | Real-world SRE Example | Flags & Variations |
|---------|--------------|------------------------|-------------------|
| `dd` | Disk dump (raw block copy, be CAREFUL) | Clone entire disk: `sudo dd if=/dev/sda of=/dev/sdb bs=4M status=progress` | `if=input` (input file/device); `of=output` (output); `bs=size` (block size); `status=progress` (show progress); `count=N` (copy N blocks only) |
| `mdadm` | Manage RAID arrays (software RAID) | Create RAID 1: `sudo mdadm --create /dev/md0 --level=1 --raid-devices=2 /dev/sda1 /dev/sdb1` | `--create` (create new); `--stop` (deactivate); `--assemble` (activate existing); `--manage --add` (add disk to array) |
| `pvcreate` | Create physical volume (LVM initialization) | Init disk for LVM: `sudo pvcreate /dev/sdb` | (no common flags; marks device as LVM) |
| `pvs`/`pvdisplay` | List physical volumes | `sudo pvs` (short format); `sudo pvdisplay` (detailed) | (read-only display) |
| `vgcreate` | Create volume group (LVM grouping) | Create VG from PV: `sudo vgcreate vg0 /dev/sdb /dev/sdc` | `-s extentsize` (extent size, usually 4M) |
| `vgs`/`vgdisplay` | List volume groups | `sudo vgs`; `sudo vgdisplay` | (read-only display) |
| `lvcreate` | Create logical volume (LVM partition) | Create 100GB LV: `sudo lvcreate -L 100G -n data vg0` | `-L size` (fixed size); `-l extents` (in extents); `-n name` (LV name); `-i stripes` (stripe across PVs) |
| `lvs`/`lvdisplay` | List logical volumes | `sudo lvs`; `sudo lvdisplay` | (read-only display) |
| `lvextend` | Grow logical volume | Expand LV to 150GB: `sudo lvextend -L 150G /dev/vg0/data` | `-L size` (absolute size); `-L +size` (add size); then run `resize2fs` or `xfs_growfs` |
| `lvreduce` | Shrink logical volume (risky, requires unmount) | Shrink LV: `sudo lvreduce -L 50G /dev/vg0/data` | (same flags as lvextend) |
| `fio` | Flexible I/O tester (benchmark disk/SSD performance) | Benchmark sequential read: `fio --name=read --ioengine=libaio --iodepth=32 --direct=1 --rw=read --bs=4k --size=10G` | `--name` (test name); `--ioengine=libaio` (async I/O); `--iodepth=32` (queue depth); `--rw=read/write/rw` (operation); `--bs=4k` (block size); `--size=10G` (file size) |

### LVM Quick Reference (Physical Volume → Volume Group → Logical Volume)

```
Physical Volumes (PV):     /dev/sda  /dev/sdb  /dev/sdc
                              |        |        |
                         +----+----+---+
                         |
Volume Group (VG):   vg0 (e.g., 3TB total)
                     |
    +----------------+----------------+
    |                |                |
Logical Volumes:  root (100GB)  home (200GB)  backup (500GB)
```

### Practical Examples: Storage Operations

```bash
# Example 1: Clone one disk to another (careful!)
sudo dd if=/dev/sda of=/dev/sdb bs=4M status=progress
# Shows progress as it copies

# Example 2: Create disk image
sudo dd if=/dev/sda of=disk_backup.img bs=4M status=progress

# Example 3: Restore disk from image
sudo dd if=disk_backup.img of=/dev/sda bs=4M status=progress

# Example 4: Initialize disk for LVM
sudo pvcreate /dev/sdb

# Example 5: Create volume group from multiple disks
sudo vgcreate vg_data /dev/sdb /dev/sdc

# Example 6: List volume groups
sudo vgs
# VG      #PV #LV #SN Attr   VSize VFree
# vg_data   2   1   0 wz--n- 2.00t 1.50t

# Example 7: Create 100GB logical volume
sudo lvcreate -L 100G -n backup vg_data

# Example 8: Format and mount LV
sudo mkfs.ext4 /dev/vg_data/backup
sudo mkdir -p /mnt/backup
sudo mount /dev/vg_data/backup /mnt/backup

# Example 9: Expand LV from 100GB to 150GB
sudo lvextend -L 150G /dev/vg_data/backup

# Example 10: Expand filesystem to match LV size
sudo resize2fs /dev/vg_data/backup

# Example 11: View LV details
sudo lvdisplay /dev/vg_data/backup

# Example 12: Create RAID 1 array (mirroring)
sudo mdadm --create /dev/md0 --level=1 --raid-devices=2 /dev/sda1 /dev/sdb1

# Example 13: Check RAID status
cat /proc/mdstat
# md0 : active raid1 sda1[0] sdb1[1]

# Example 14: Benchmark disk read performance
fio --name=read --ioengine=libaio --iodepth=32 --direct=1 --rw=read --bs=4k --size=1G --runtime=60 --group_reporting

# Example 15: Benchmark sequential write
fio --name=write --ioengine=libaio --iodepth=32 --direct=1 --rw=write --bs=4k --size=1G
```

> **SRE Wisdom**
> - **`dd` is dangerous: if=input and of=output are easy to swap**, always triple-check before running.
> - **LVM is a lifesaver for dynamic storage allocation**: resize filesystems without downtime.
> - **Expand LV with `lvextend`, then grow filesystem**; skipping the second step wastes space.
> - **Test LVM recovery by practicing:** create VG → LV → format → extend → shrink (on test VM first!).
> - **`mdadm` RAID is software-based**: no special hardware needed, but slower than hardware RAID.
> - **Use `fio` before production workload** to understand disk limits (IOPS, throughput, latency).

---

## 19. Bash Advanced – Production-Grade Scripts

| Concept | Syntax | Real-world SRE Example | Notes |
|---------|--------|------------------------|-------|
| **Traps** | `trap handler SIGNAL` | `trap 'cleanup; exit 1' ERR` runs cleanup on error | Essential for graceful shutdown; restore state before exit |
| **Signal handling** | `trap 'func' SIGTERM SIGINT` | Handle Ctrl+C gracefully | Catch signals, cleanup, exit cleanly |
| **Subshells** | `(commands)` vs `{commands;}` | `(cd /tmp; rm -rf *)` changes dir in subshell only | Subshells don't affect parent environment |
| **File descriptors** | `exec 3< file` (open for read), `exec 3> file` (open for write) | `exec 3< /var/log/app.log; read -u 3 line` | Access files with custom FDs; useful for parallel reads |
| **Named pipes** | `mkfifo mypipe; command > mypipe &` | Synchronize concurrent processes | Create FIFO with `mkfifo`, write from one process, read from another |
| **Process substitution** | `<(command)` | `diff <(sort file1) <(sort file2)` compares sorted files | Avoids intermediate files; cleaner than `> temp.txt` |
| **Getopts** | `getopts "o:v" opt` in while loop | Parse `--option value` arguments cleanly | Standard way to handle flags; `-o` takes argument (colon), `-v` boolean |
| **Select menu** | `select var in item1 item2; do ... done` | User picks from list: `select env in prod staging dev; do ...` | Interactive menu with numbered options |
| **Locking** | `flock -n fd` or `[ -f lock.file ] && wait` | Prevent concurrent runs: `flock -n 9 || exit 1` | Ensure only one instance of script runs |
| **jq** | `jq '.field' file.json`, `jq -r '.field'` | Parse JSON safely: `curl api.example.com \| jq '.data[]'` | Powerful JSON processor; much safer than grep on JSON |
| **yq** | `yq '.field' file.yaml` | Parse YAML configs: `yq '.database.host' config.yaml` | YAML equivalent of jq; needs `apt install yq` |

### Practical Examples: Bash Advanced

```bash
#!/bin/bash
# Example 1: Trap-based cleanup (critical for production)

cleanup() {
    echo "Cleaning up..."
    [ -f /tmp/deployment.lock ] && rm /tmp/deployment.lock
    [ -n "$TMPDIR" ] && rm -rf "$TMPDIR"
    exit $?
}

trap cleanup EXIT
trap 'exit 1' SIGTERM SIGINT

TMPDIR=$(mktemp -d)
# ... do work ...
# When script exits (normally or via signal), cleanup runs
```

```bash
#!/bin/bash
# Example 2: Getopts for argument parsing

usage() {
    echo "Usage: $0 -e environment -v version [-d]"
    exit 1
}

environment=""
version=""
debug=0

while getopts "e:v:dh" opt; do
    case $opt in
        e) environment="$OPTARG" ;;
        v) version="$OPTARG" ;;
        d) debug=1 ;;
        h) usage ;;
        *) usage ;;
    esac
done

[ -z "$environment" ] || [ -z "$version" ] && usage
echo "Deploying $version to $environment"
[ $debug -eq 1 ] && set -x
```

```bash
#!/bin/bash
# Example 3: File locking to prevent concurrent runs

LOCKFILE="/var/lock/backup.lock"

# Acquire lock or exit if already running
if ! mkdir "$LOCKFILE" 2>/dev/null; then
    echo "Backup already running" >&2
    exit 1
fi

trap "rmdir $LOCKFILE" EXIT

# Proceed with backup
tar -czf /backups/backup-$(date +%s).tar.gz /data
echo "Backup complete"
```

```bash
#!/bin/bash
# Example 4: Process substitution for complex pipelines

# Compare sorted files without creating temp files
diff <(grep "^ERROR" app.log | cut -d: -f2 | sort) \
     <(grep "^ERROR" app.log.old | cut -d: -f2 | sort)
```

```bash
#!/bin/bash
# Example 5: Named pipes for parallel processing

mkfifo output1 output2

(long_task_1 > output1) &
(long_task_2 > output2) &

# Wait for both
cat output1
cat output2

rm output1 output2
```

```bash
#!/bin/bash
# Example 6: jq for JSON parsing

# Get first 5 users from API
curl -s https://api.example.com/users | jq '.[] | select(.active == true)' | head -5

# Extract email from user object
curl -s https://api.example.com/users/123 | jq -r '.email'

# Pretty-print JSON
echo '{"a":1,"b":2}' | jq '.'
```

```bash
#!/bin/bash
# Example 7: yq for YAML parsing

# Get database host from config
yq '.database.host' config.yaml

# Modify YAML value
yq e '.database.port = 5433' -i config.yaml
```

```bash
#!/bin/bash
# Example 8: Interactive select menu

select action in "Deploy" "Rollback" "Monitor" "Exit"; do
    case $action in
        Deploy) echo "Deploying..."; break ;;
        Rollback) echo "Rolling back..."; break ;;
        Monitor) echo "Monitoring..."; break ;;
        Exit) exit 0 ;;
    esac
done
```

> **SRE Wisdom**
> - **Every production script needs `trap` for cleanup**: temp files, locks, connections must be released even if script crashes.
> - **Use `getopts` not manual arg parsing**: standard, clean, handles `--help` etc.
> - **Lock files prevent duplicate runs**: critical for cron jobs and sensitive operations.
> - **Use `jq`/`yq` for parsing JSON/YAML**, not `grep` and `cut`; structured parsing is much safer.
> - **Process substitution `<(...)` beats temp files**: cleaner, no disk I/O, easier to track.
> - **Test scripts with `bash -n script.sh`** (syntax check) and `bash -x script.sh` (debug trace).

---

## Bash Aliases & Time-Savers (Level 3)

Add to `~/.bashrc`:

```bash
# Debugging & monitoring
alias traceme='strace -e trace=read,write,open,close'
alias lsof8080='lsof -i :8080'
alias listen='ss -tlnp'
alias netview='ss -tlnp'

# System info
alias meminfo='free -h'
alias cpuinfo='lscpu'
alias diskinfo='df -h'
alias loadavg='cat /proc/loadavg'

# LVM shortcuts
alias pvlist='pvs'
alias vglist='vgs'
alias lvlist='lvs'

# Systemd shortcuts
alias sctl='sudo systemctl'
alias jctl='journalctl'

# JSON/YAML parsing
alias jqcompact='jq -c'  # jqcompact file.json
alias yqedit='yq e -i'   # yqedit '.field = value' file.yaml

# Networking
alias nmap-fast='nmap -T4 -F'
alias tcpdump-http='sudo tcpdump -i any "port 80 or port 443"'
```

---

## Checkpoint: By the end of Level 3, you should be able to:

- [ ] Use `strace`/`ltrace` to debug system-level and library-level issues
- [ ] Inspect processes with `lsof`, `/proc`, `pidstat`
- [ ] Master `systemctl`, `journalctl`, and create custom `.service` files
- [ ] Configure networks: `ip`, `ss`, DNS with `dig`, routing
- [ ] Troubleshoot networking: `tcpdump`, `netcat`, `nmap`, firewalls with `ufw`
- [ ] Manage storage: LVM (PV/VG/LV), RAID with `mdadm`, benchmark with `fio`
- [ ] Write production bash: traps, signal handling, locking, JSON/YAML parsing
- [ ] Understand `/proc` filesystem for system inspection

---

**Next:** [Level 4 – SRE God Mode](LEVEL_4_SRE_GODMODE.md) (kernel tuning, eBPF, observability, production scenarios)
