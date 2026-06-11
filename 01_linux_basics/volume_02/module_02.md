# MODULE 2 — Systemd and Service Management

*On every modern Linux server, services are managed by systemd. When nginx starts on boot, when sshd restarts after a crash, when logs are collected — systemd is orchestrating all of it. Understanding systemd is not optional for DevOps work.*

## 1. What You Will Learn

- What systemd is and why it replaced older init systems
- How to start, stop, restart, and check services: `systemctl`
- How to enable services to start on boot
- How to read service logs: `journalctl`
- How to write your own systemd service unit file
- How to troubleshoot failed services

## 2. Why This Matters

In DevOps, you will deploy applications that need to run as services — starting automatically on boot, restarting if they crash, logging their output in a standard place. Systemd is how all of that happens. Whether you are managing nginx, PostgreSQL, Docker, a custom Python app, or a Java microservice — systemd is the mechanism.

## 3. What is systemd?

**systemd** is the init system and service manager for modern Linux. It is PID 1 — the first process the kernel starts, which then starts everything else.

Before systemd, Linux used SysV init with shell scripts. Systemd replaced that with a parallel, dependency-aware, log-integrated system.

```bash
# Confirm systemd is PID 1
ps -p 1
cat /proc/1/comm
```

Output:
```
systemd
```

### Units

Everything in systemd is a **unit**. Different unit types handle different things:

| Unit Type | Extension | Purpose |
|---|---|---|
| Service | `.service` | Programs and daemons |
| Socket | `.socket` | Network or IPC sockets |
| Timer | `.timer` | Scheduled tasks (like cron) |
| Target | `.target` | Group of units (like a runlevel) |
| Mount | `.mount` | Filesystem mount points |
| Path | `.path` | Monitor a file/directory for changes |

When you say "manage a service with systemd," you are working with `.service` unit files.

## 4. systemctl — The Control Command

`systemctl` is your interface to systemd.

### Starting and Stopping Services

```bash
sudo systemctl start nginx       # Start right now
sudo systemctl stop nginx        # Stop right now
sudo systemctl restart nginx     # Stop then start
sudo systemctl reload nginx      # Reload config without stopping (if supported)
sudo systemctl reload-or-restart nginx  # Reload if possible, restart if not
```

### Enable and Disable (Boot Behavior)

```bash
sudo systemctl enable nginx      # Start automatically on boot
sudo systemctl disable nginx     # Do not start on boot
sudo systemctl enable --now nginx  # Enable AND start immediately
sudo systemctl disable --now nginx # Disable AND stop immediately
```

> **Critical distinction:** `start` and `stop` affect the service **right now**. `enable` and `disable` affect what happens at **next boot**. They are independent. A service can be running but disabled (will not survive reboot) or enabled but stopped (will start on next boot but is not running now).

### Checking Service Status

```bash
sudo systemctl status nginx
```

Output:
```
● nginx.service - A high performance web server and a reverse proxy server
     Loaded: loaded (/lib/systemd/system/nginx.service; enabled; preset: enabled)
     Active: active (running) since Tue 2026-06-09 10:00:00 UTC; 2min ago
       Docs: man:nginx(8)
   Main PID: 1234 (nginx)
      Tasks: 3 (limit: 4631)
     Memory: 6.2M
        CPU: 45ms
     CGroup: /system.slice/nginx.service
             ├─1234 "nginx: master process /usr/sbin/nginx -g daemon off;"
             ├─1235 "nginx: worker process"
             └─1236 "nginx: worker process"

Jun 09 10:00:00 hostname systemd[1]: Starting nginx...
Jun 09 10:00:00 hostname nginx[1234]: nginx: the configuration syntax is ok
Jun 09 10:00:00 hostname systemd[1]: Started nginx.
```

Reading status output:
- `Loaded` — where the unit file is and whether it is enabled for boot
- `Active` — `active (running)`, `inactive (dead)`, `failed`
- `Main PID` — the primary process ID
- The log lines at the bottom show recent service events

### Useful systemctl Queries

```bash
systemctl status nginx            # Status of one service
systemctl list-units --type=service          # All loaded service units
systemctl list-units --type=service --state=running   # Only running services
systemctl list-units --type=service --state=failed    # Only failed services
systemctl is-active nginx         # Returns "active" or "inactive"
systemctl is-enabled nginx        # Returns "enabled" or "disabled"
systemctl is-failed nginx         # Returns "failed" if it failed
```

```bash
# Quick check in scripts
if systemctl is-active --quiet nginx; then
  echo "nginx is running"
else
  echo "nginx is NOT running"
fi
```

## 5. Service Unit Files

### Where Unit Files Live

| Location | Purpose |
|---|---|
| `/lib/systemd/system/` | Unit files from installed packages |
| `/etc/systemd/system/` | Your custom unit files (these take priority) |
| `~/.config/systemd/user/` | User-level units (no root needed) |

```bash
# View the nginx unit file
cat /lib/systemd/system/nginx.service
```

### Anatomy of a Service Unit File

```ini
[Unit]
Description=NovaMart Application Server
Documentation=https://docs.novamart.internal
After=network.target postgresql.service
Requires=postgresql.service

[Service]
Type=simple
User=novamart
Group=novamart
WorkingDirectory=/opt/novamart-app
ExecStart=/opt/novamart-app/bin/server --port 3000
ExecReload=/bin/kill -HUP $MAINPID
Restart=on-failure
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

**Breaking down each section:**

**[Unit]** — describes the unit and its dependencies
- `Description` — human-readable name
- `After` — start after these units (ordering, not a hard dependency)
- `Requires` — hard dependency — if this fails, our service fails too
- `Wants` — soft dependency — start alongside this if possible

**[Service]** — how to run the service
- `Type` — `simple` (default), `forking`, `notify`, `oneshot`
- `User` / `Group` — run as this user/group (security!)
- `WorkingDirectory` — set the working directory before starting
- `ExecStart` — the command to start the service
- `ExecReload` — command to reload config (SIGHUP)
- `Restart` — when to restart: `always`, `on-failure`, `on-abnormal`
- `RestartSec` — seconds to wait before restarting

**[Install]** — when to enable this unit
- `WantedBy=multi-user.target` — start this when the system reaches normal multi-user mode (the standard target for servers)

### Restart Policies

| Value | When it Restarts |
|---|---|
| `no` | Never (default) |
| `always` | Always — even on clean exit |
| `on-failure` | Only if exit code is non-zero or killed by signal |
| `on-abnormal` | On failure, timeout, or watchdog |
| `on-success` | Only if it exits cleanly (unusual) |

## 6. Creating a Custom Service

### The NovaMart Health Monitor

Let us create a real service that monitors NovaMart's application health.

```bash
# Step 1: Create the monitoring script
sudo mkdir -p /opt/novamart-app/scripts
sudo nano /opt/novamart-app/scripts/health-monitor.sh
```

Content of `health-monitor.sh`:
```bash
#!/bin/bash
# NovaMart Health Monitor
LOG_FILE="/opt/novamart-app/logs/health.log"

while true; do
  TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
  DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | tr -d '%')
  MEM_FREE=$(free -m | grep Mem | awk '{print $4}')
  LOAD=$(uptime | awk -F'load average:' '{print $2}' | cut -d, -f1 | xargs)

  echo "$TIMESTAMP | disk=${DISK_USAGE}% | mem_free=${MEM_FREE}MB | load=${LOAD}" >> "$LOG_FILE"

  if [ "$DISK_USAGE" -gt 85 ]; then
    echo "$TIMESTAMP | WARNING: Disk usage above 85%" >> "$LOG_FILE"
  fi

  sleep 60
done
```

```bash
# Step 2: Make it executable
sudo chmod 755 /opt/novamart-app/scripts/health-monitor.sh

# Step 3: Create the systemd unit file
sudo nano /etc/systemd/system/novamart-health.service
```

Content of `novamart-health.service`:
```ini
[Unit]
Description=NovaMart Health Monitor
After=network.target
Documentation=https://github.com/novamart/ops

[Service]
Type=simple
User=root
ExecStart=/opt/novamart-app/scripts/health-monitor.sh
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=novamart-health

[Install]
WantedBy=multi-user.target
```

```bash
# Step 4: Reload systemd to pick up the new unit file
sudo systemctl daemon-reload

# Step 5: Start and enable the service
sudo systemctl enable --now novamart-health

# Step 6: Check it is running
sudo systemctl status novamart-health

# Step 7: Watch the logs
sudo journalctl -u novamart-health -f
```

## 7. Targets — System States

Targets are groups of units that represent a system state. The most important ones:

| Target | Meaning |
|---|---|
| `multi-user.target` | Normal server operation — no GUI |
| `graphical.target` | Normal desktop operation — with GUI |
| `rescue.target` | Single-user mode for repair |
| `emergency.target` | Minimal environment for serious repair |
| `reboot.target` | System is rebooting |
| `poweroff.target` | System is powering off |

```bash
# See the current target
systemctl get-default

# List all active targets
systemctl list-units --type=target

# Change default target (e.g., set to no-GUI server mode)
sudo systemctl set-default multi-user.target
```

## 8. systemctl for System Power

```bash
sudo systemctl reboot          # Reboot the system
sudo systemctl poweroff        # Shut down
sudo systemctl halt            # Halt without poweroff
sudo systemctl suspend         # Suspend to RAM
```

---

## Hands-On Labs

### 🔵 Lab 2.1 — Manage nginx as a Service (Guided)

**Objective:** Full service lifecycle management with nginx.

```bash
# Install nginx if not already installed
sudo apt install -y nginx

# Step 1: Check its initial status
sudo systemctl status nginx

# Step 2: Stop it
sudo systemctl stop nginx
sudo systemctl status nginx    # Should show inactive

# Step 3: Start it
sudo systemctl start nginx
sudo systemctl status nginx    # Should show active (running)

# Step 4: Reload config without downtime
sudo systemctl reload nginx

# Step 5: Restart (stop + start)
sudo systemctl restart nginx

# Step 6: Check if it will start on boot
systemctl is-enabled nginx

# Step 7: Disable it (won't start on next boot)
sudo systemctl disable nginx
systemctl is-enabled nginx

# Step 8: Re-enable it
sudo systemctl enable nginx
systemctl is-enabled nginx

# Step 9: Use the combined command
sudo systemctl disable --now nginx    # Disable AND stop
sudo systemctl enable --now nginx     # Enable AND start
sudo systemctl status nginx
```

---

### 🔵 Lab 2.2 — Explore Systemd Units (Guided)

**Objective:** Understand what is running on the system.

```bash
# See all running services
systemctl list-units --type=service --state=running

# See any failed services
systemctl list-units --type=service --state=failed

# See all enabled services
systemctl list-unit-files --type=service --state=enabled

# Look at the nginx unit file
cat /lib/systemd/system/nginx.service

# See all unit files for a service
systemctl cat nginx

# Check what a service depends on
systemctl list-dependencies nginx

# Check what depends on a service
systemctl list-dependencies --reverse nginx
```

---

### 🟢 Lab 2.3 — Create the NovaMart Health Monitor Service (Practice)

**Objective:** Write and deploy your first custom systemd service.

Follow the steps in section 6 above to create and deploy `novamart-health.service`.

After deploying:

```bash
# Verify it is running
sudo systemctl status novamart-health

# Check the log file being created
tail -f /opt/novamart-app/logs/health.log

# Watch systemd journal output
sudo journalctl -u novamart-health -f --no-pager

# Simulate a restart
sudo systemctl restart novamart-health
sudo systemctl status novamart-health

# Check the restart count
sudo systemctl status novamart-health | grep -i restart
```

---

### 🟢 Lab 2.4 — Troubleshoot a Failed Service (Practice)

**Objective:** Practice the standard failed-service investigation workflow.

```bash
# Create a broken service for practice
sudo tee /etc/systemd/system/broken-test.service << 'EOF'
[Unit]
Description=Broken Test Service

[Service]
Type=simple
ExecStart=/usr/bin/nonexistent-command
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl start broken-test

# It will fail. Now investigate:
# Step 1: Check status
sudo systemctl status broken-test

# Step 2: Check journal logs
sudo journalctl -u broken-test -n 50

# Step 3: See exactly what went wrong
sudo journalctl -u broken-test --since "5 minutes ago"

# Step 4: Fix the service (update ExecStart to something valid)
sudo nano /etc/systemd/system/broken-test.service
# Change ExecStart to: /bin/sleep 3600
sudo systemctl daemon-reload
sudo systemctl start broken-test
sudo systemctl status broken-test

# Cleanup
sudo systemctl stop broken-test
sudo systemctl disable broken-test
sudo rm /etc/systemd/system/broken-test.service
sudo systemctl daemon-reload
```

---

### 🔴 Lab 2.5 — Troubleshooting: Service Won't Start

**The standard failed service checklist:**

```bash
# 1. What is the status?
sudo systemctl status service-name

# 2. What do the recent journal logs say?
sudo journalctl -u service-name -n 100

# 3. Are there any permission issues?
# Check the ExecStart path
sudo systemctl cat service-name
ls -la /path/to/executable

# 4. Does the config file have syntax errors?
nginx -t         # nginx-specific syntax check
# Most services have a similar check command

# 5. Are dependencies running?
systemctl list-dependencies service-name
systemctl is-active dependency-name

# 6. After fixing, reload daemon and restart
sudo systemctl daemon-reload
sudo systemctl restart service-name
sudo systemctl status service-name
```

---

## Common Mistakes

| Mistake | Problem | Solution |
|---|---|---|
| Starting without enabling | Service doesn't survive reboot | Use `enable --now` for both at once |
| Editing unit files without `daemon-reload` | systemd uses cached old version | Always run `daemon-reload` after editing unit files |
| Not checking `journalctl` when debugging | Missing the actual error message | Always check `journalctl -u service-name -n 50` |
| Using `kill` on a service PID | Bypasses systemd, may not restart | Use `systemctl stop` or `systemctl restart` |
| Confusing `reload` and `restart` | `reload` only works if the service supports it | Use `reload-or-restart` to be safe |

---

## Quick Recap

- systemd is PID 1 — it manages all services on a modern Linux system
- `systemctl start/stop/restart/reload` — control a service right now
- `systemctl enable/disable` — control whether it starts on boot
- `enable --now` and `disable --now` combine both actions
- `systemctl status service` shows current state and recent logs
- Service unit files live in `/etc/systemd/system/` (custom) and `/lib/systemd/system/` (installed)
- Always run `systemctl daemon-reload` after modifying unit files
- Use `journalctl -u service-name` to read service logs

## 🎯 Mini Challenge

1. Install `redis-server` with apt
2. Check its status — is it running? Is it enabled?
3. Stop it, disable it, verify both with `is-active` and `is-enabled`
4. Re-enable and start it with a single command
5. Find its unit file and identify: what user does it run as?
6. Write one-line commands that check if both nginx and redis are running

## 🐙 GitHub Progress Checkpoint

```
Folder:          enterprise-linux-operations-platform/module-23
Files to commit: novamart-health.service, health-monitor.sh, service-management-notes.md
Commit message:  "Module 23: Systemd service management — NovaMart health monitor deployed"
```

## Knowledge Check

**Review Questions:**
1. What is the difference between `systemctl start` and `systemctl enable`?
2. What does `systemctl daemon-reload` do and when must you run it?
3. What is the `[Install]` section of a unit file for?
4. What does `WantedBy=multi-user.target` mean?
5. How do you check why a service failed to start?

**Practical Questions:**
- Write a complete systemd unit file for a fictional Node.js application that runs as user `nodeapp`, starts after the network is up, restarts on failure, and starts on boot.
- Write the sequence of commands to deploy, start, enable, and verify a new custom service.

**Reflection Question:**
*Systemd restarts services automatically when they crash. This sounds like a good safety net, but can you think of a scenario where automatic restarts could make a problem worse instead of better?*

