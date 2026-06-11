# MODULE 3 — SSH and Remote Access

*SSH is how you connect to every Linux server in the world. Understanding it deeply — key-based auth, configuration, port forwarding, and hardening — is a daily DevOps skill.*

## 1. What You Will Learn

- How SSH works at a conceptual level
- How to connect to remote servers
- How to generate and use SSH key pairs
- How SSH agent works
- How to configure the SSH client with `~/.ssh/config`
- How to harden the SSH server
- How to use SSH for tunneling and port forwarding
- How to copy files securely: `scp` and `rsync`

## 2. Why This Matters

Every cloud server you ever manage will be accessed via SSH. Every deployment pipeline uses SSH or SSH-based protocols. GitHub, GitLab, and Bitbucket use SSH for repository authentication. Key-based SSH authentication is a security baseline requirement in any serious infrastructure.

## 3. How SSH Works

SSH (Secure Shell) creates an **encrypted tunnel** between your computer and a remote server. All traffic through this tunnel is encrypted — commands you type, output you see, files you transfer.

### The Handshake

```
Your Computer                    Remote Server
     │                                │
     │── Connection Request ─────────>│
     │<─ Server's Public Key ─────────│
     │   (verify it's who you expect) │
     │── Agree on encryption ────────>│
     │<─ Encrypted session begins ────│
     │── Authenticate (key or pass) ─>│
     │<─ Authentication accepted ─────│
     │   (You are in!)                │
```

### Password vs Key Authentication

| Method | How It Works | Security | DevOps Use |
|---|---|---|---|
| Password | Type a password each time | Medium — brute-forceable | Avoid in production |
| Key-based | Private key on your machine, public key on server | High — cryptographically strong | Standard practice |

## 4. SSH Key Pairs

### How Key Authentication Works

1. You generate a **key pair**: a private key (stays on your computer, never shared) and a public key (placed on servers you want to access)
2. When you connect, SSH proves you have the private key without ever sending it
3. The server grants access if your public key is in `~/.ssh/authorized_keys`

```
Your Computer                    Remote Server
  private key                    ~/.ssh/authorized_keys
  (never leaves)                 (contains your public key)
       │                                │
       │── "I have the private key" ───>│
       │<─ "Prove it (math challenge)" ─│
       │── "Here is my proof" ─────────>│
       │<─ "Proof checks out. Welcome." ─│
```

### Generate an SSH Key Pair

```bash
ssh-keygen -t ed25519 -C "john@novamart-ops"
```

Options:
- `-t ed25519` — use the Ed25519 algorithm (modern, fast, secure — preferred over RSA)
- `-C "comment"` — a label to identify this key

You will be prompted:
```
Generating public/private ed25519 key pair.
Enter file in which to save the key (/home/john/.ssh/id_ed25519):
Enter passphrase (empty for no passphrase):
Enter same passphrase again:
```

> **On passphrases:** A passphrase encrypts your private key on disk. Without a passphrase, anyone who gets your private key file can impersonate you. With a passphrase, they also need to know the passphrase. In production environments, always use a passphrase.

The result:
- `~/.ssh/id_ed25519` — your **private key** (treat like a password — never share)
- `~/.ssh/id_ed25519.pub` — your **public key** (safe to share, put on servers)

```bash
# View your public key
cat ~/.ssh/id_ed25519.pub
```
Output:
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI... john@novamart-ops
```

### Key File Permissions

SSH is strict about permissions on key files:

```bash
chmod 700 ~/.ssh                    # Only owner can access .ssh directory
chmod 600 ~/.ssh/id_ed25519         # Only owner can read/write private key
chmod 644 ~/.ssh/id_ed25519.pub     # Public key can be read by others
chmod 600 ~/.ssh/authorized_keys    # Only owner can read authorized_keys
```

SSH will refuse to use a private key if its permissions are too open.

## 5. Connecting to Remote Servers

### Basic Connection

```bash
ssh username@hostname
ssh username@192.168.1.100
ssh john@server.novamart.com
```

### First Connection — Host Verification

The first time you connect to a server:

```
The authenticity of host 'server.novamart.com (192.168.1.100)' can't be established.
ED25519 key fingerprint is SHA256:abc123def456...
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```

Type `yes`. SSH saves the server's fingerprint to `~/.ssh/known_hosts`. On future connections, SSH verifies the server matches the saved fingerprint — protecting against someone impersonating your server.

### Common SSH Options

```bash
ssh -p 2222 john@server.com          # Connect on non-standard port
ssh -i ~/.ssh/other_key john@server  # Use a specific private key
ssh -v john@server                   # Verbose — shows exactly what is happening
ssh -vv john@server                  # Even more verbose (debugging)
ssh -A john@server                   # Forward SSH agent (for jumping between servers)
```

## 6. Deploying Your Public Key

### Manually

```bash
# On the remote server, as the target user:
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "your-public-key-content" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### With ssh-copy-id (The Easy Way)

```bash
ssh-copy-id john@server.novamart.com
# or specify the key:
ssh-copy-id -i ~/.ssh/id_ed25519.pub john@server.novamart.com
```

This copies your public key to the remote server's `authorized_keys` in one command.

## 7. SSH Agent

Having a passphrase on your private key is secure but requires entering it every time. The **SSH agent** remembers your decrypted key in memory so you only enter the passphrase once per session.

```bash
# Start the agent (often already running)
eval $(ssh-agent)

# Add your key to the agent (enter passphrase once)
ssh-add ~/.ssh/id_ed25519

# List keys the agent knows about
ssh-add -l

# Connect — no passphrase needed
ssh john@server.novamart.com
```

## 8. SSH Client Configuration

The `~/.ssh/config` file lets you define shortcuts and defaults for SSH connections.

```bash
nano ~/.ssh/config
```

```
# NovaMart Production Web Server
Host novamart-web
    HostName 192.168.1.100
    User ubuntu
    Port 22
    IdentityFile ~/.ssh/novamart_prod_key
    ServerAliveInterval 60

# NovaMart Database Server
Host novamart-db
    HostName 192.168.1.101
    User dbadmin
    Port 2222
    IdentityFile ~/.ssh/novamart_prod_key
    ForwardAgent yes

# Jump host configuration
Host internal-server
    HostName 10.0.0.50
    User ops1
    ProxyJump novamart-web
```

```bash
# Now connect with just:
ssh novamart-web
ssh novamart-db
ssh internal-server    # Automatically jumps through novamart-web
```

```bash
chmod 600 ~/.ssh/config    # Config file must have restrictive permissions
```

## 9. SSH Server Configuration

The SSH server configuration is at `/etc/ssh/sshd_config`. These settings control who can connect and how.

```bash
sudo nano /etc/ssh/sshd_config
```

### Essential Hardening Settings

```ini
# Disable root login entirely
PermitRootLogin no

# Disable password authentication (use keys only)
PasswordAuthentication no

# Only allow specific users
AllowUsers john alice ops1

# Change the default port (reduces automated scanning)
Port 2222

# Limit authentication attempts
MaxAuthTries 3

# Disconnect idle sessions after 10 minutes
ClientAliveInterval 300
ClientAliveCountMax 2

# Disable X11 forwarding if not needed
X11Forwarding no

# Use only strong host key algorithms
HostKeyAlgorithms ssh-ed25519,rsa-sha2-512,rsa-sha2-256
```

After editing:
```bash
# Test the configuration before reloading
sudo sshd -t

# If no errors, reload
sudo systemctl reload sshd
```

> **Warning:** If you disable PasswordAuthentication before adding your public key to `authorized_keys`, you will lock yourself out. Always verify key-based auth works before disabling passwords.

## 10. Copying Files Securely

### scp — Secure Copy

`scp` works like `cp` but over SSH.

```bash
# Copy a file to a remote server
scp localfile.txt john@server:/home/john/

# Copy from a remote server to local
scp john@server:/var/log/app.log ~/logs/

# Copy a directory recursively
scp -r ./app/ john@server:/opt/novamart-app/

# Use a specific key
scp -i ~/.ssh/mykey file.txt john@server:/path/

# Copy between two remote servers
scp user@server1:/path/file user@server2:/path/
```

### rsync — Efficient File Synchronization

`rsync` is smarter than `scp` — it only transfers the parts of files that have changed, making large transfers much faster.

```bash
# Sync a local directory to a remote server
rsync -avz ./app/ john@server:/opt/novamart-app/

# -a = archive mode (preserves permissions, timestamps, symlinks)
# -v = verbose
# -z = compress during transfer

# Sync from remote to local
rsync -avz john@server:/var/log/novamart/ ~/logs/

# Dry run (preview without actually transferring)
rsync -avz --dry-run ./app/ john@server:/opt/

# Delete files on destination that no longer exist at source
rsync -avz --delete ./app/ john@server:/opt/novamart-app/

# Exclude certain files
rsync -avz --exclude='*.log' --exclude='.git/' ./app/ john@server:/opt/
```

## 11. SSH Tunneling

SSH tunnels let you access services on remote networks securely through the encrypted SSH connection.

### Local Port Forwarding

Forward a port on your local machine to a port on the remote server.

```bash
# Access a remote database (port 5432) as if it were local (port 5433)
ssh -L 5433:localhost:5432 john@server.novamart.com

# Now on your local machine: connect to localhost:5433
# The connection is tunneled through SSH to server:5432
```

### Remote Port Forwarding

Make a port on the remote server forward to your local machine.

```bash
# Make remote server's port 8080 forward to your local port 3000
ssh -R 8080:localhost:3000 john@server.novamart.com
```

---

## Hands-On Labs

### 🔵 Lab 3.1 — Generate and Manage SSH Keys (Guided)

**Objective:** Create a proper SSH key setup for NovaMart operations.

```bash
# Step 1: Check if you already have keys
ls -la ~/.ssh/

# Step 2: Generate an Ed25519 key pair for NovaMart
ssh-keygen -t ed25519 -C "yourname@novamart-ops" -f ~/.ssh/novamart_ops

# Step 3: Set correct permissions
chmod 700 ~/.ssh
chmod 600 ~/.ssh/novamart_ops
chmod 644 ~/.ssh/novamart_ops.pub

# Step 4: View the public key (this is what goes on servers)
cat ~/.ssh/novamart_ops.pub

# Step 5: Add the key to SSH agent
eval $(ssh-agent)
ssh-add ~/.ssh/novamart_ops

# Step 6: List keys in agent
ssh-add -l

# Step 7: Generate a second key for GitHub
ssh-keygen -t ed25519 -C "yourname@github" -f ~/.ssh/github_key
cat ~/.ssh/github_key.pub
```

---

### 🔵 Lab 3.2 — SSH to Localhost (Guided)

**Objective:** Practice SSH connections using localhost.

```bash
# Step 1: Install OpenSSH server if not present
sudo apt install -y openssh-server

# Step 2: Start and enable sshd
sudo systemctl enable --now sshd
sudo systemctl status sshd

# Step 3: Copy your key to your own authorized_keys
mkdir -p ~/.ssh
cat ~/.ssh/novamart_ops.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# Step 4: Connect to yourself via SSH
ssh -i ~/.ssh/novamart_ops $(whoami)@localhost

# Step 5: Once connected, verify you are in a new session
whoami
echo "Connected to: $(hostname)"
exit   # Exit the SSH session

# Step 6: Check the SSH connection log
sudo journalctl -u sshd -n 20
```

---

### 🟢 Lab 3.3 — Configure SSH Client (Practice)

**Objective:** Set up `~/.ssh/config` for NovaMart server shortcuts.

```bash
# Create the SSH config file
nano ~/.ssh/config
```

Add these entries (using localhost for practice):
```
# NovaMart local development
Host novamart-local
    HostName localhost
    User USERNAME_HERE
    IdentityFile ~/.ssh/novamart_ops
    ServerAliveInterval 60
    ServerAliveCountMax 3

# Default settings for all connections
Host *
    AddKeysToAgent yes
    IdentitiesOnly yes
    ServerAliveInterval 120
```

```bash
chmod 600 ~/.ssh/config

# Test the shortcut
ssh novamart-local

# Verify the config is being used
ssh -v novamart-local 2>&1 | grep "config"
```

---

### 🟢 Lab 3.4 — Harden the SSH Server (Practice)

**Objective:** Apply security hardening to the SSH server configuration.

```bash
# Backup original config
sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup

# View current settings
grep -v "^#" /etc/ssh/sshd_config | grep -v "^$"

# Test current config
sudo sshd -t && echo "Config is valid"

# Make targeted edits
sudo nano /etc/ssh/sshd_config
```

Apply these settings (verify key auth works first!):
```ini
PermitRootLogin no
MaxAuthTries 3
X11Forwarding no
ClientAliveInterval 300
ClientAliveCountMax 2
```

```bash
# Test the new config
sudo sshd -t

# Reload (not restart — avoids dropping existing connections)
sudo systemctl reload sshd

# Verify changes
sudo sshd -T | grep -E 'permitrootlogin|maxauthtries|x11forwarding'
```

---

### 🟢 Lab 3.5 — File Transfer with scp and rsync (Practice)

**Objective:** Transfer files securely.

```bash
# Create test files
mkdir ~/transfer-test
echo "NovaMart config v1.0" > ~/transfer-test/config.txt
echo "Log entry 001" > ~/transfer-test/app.log

# scp to localhost
scp ~/transfer-test/config.txt novamart-local:/tmp/

# Verify
ssh novamart-local "cat /tmp/config.txt"

# rsync entire directory
rsync -avz ~/transfer-test/ novamart-local:/tmp/novamart-transfer/

# rsync with dry run
rsync -avz --dry-run ~/novamart/logs/ novamart-local:/tmp/logs-backup/

# rsync only recently modified files
rsync -avz --update ~/transfer-test/ novamart-local:/tmp/novamart-transfer/
```

---

## 💼 Interview Corner

**Q: What is the difference between SSH public and private keys?**
A: The private key stays on your machine and is never shared. It is used to prove your identity cryptographically. The public key is placed on servers in `~/.ssh/authorized_keys`. When you connect, SSH uses a challenge-response protocol where you prove you hold the private key without ever transmitting it.

**Q: What is `~/.ssh/known_hosts` and why does it matter?**
A: It stores the fingerprints of SSH servers you have connected to before. On each connection, SSH verifies the server matches the stored fingerprint. If the fingerprint changed unexpectedly, SSH warns you — this could indicate a server rebuild, or more seriously, a man-in-the-middle attack.

**Q: How would you disable password authentication on an SSH server?**
A: Set `PasswordAuthentication no` in `/etc/ssh/sshd_config`, then run `sudo systemctl reload sshd`. Critical: verify that key-based authentication works successfully before disabling passwords, or you will lock yourself out.

**Q: What is the difference between `scp` and `rsync`?**
A: `scp` copies files over SSH unconditionally. `rsync` synchronizes files efficiently by only transferring the changed parts. For large files or frequent syncs, `rsync` is far faster. `rsync` also supports exclude patterns, deletion of removed files, and preserving metadata.

---

## Quick Recap

- SSH creates an encrypted tunnel between your computer and remote servers
- Key-based authentication is more secure than passwords — generate a key pair with `ssh-keygen -t ed25519`
- Private key stays local (`chmod 600`), public key goes on servers (`~/.ssh/authorized_keys`)
- `ssh-copy-id` deploys your public key to a remote server automatically
- `~/.ssh/config` stores per-host settings and shortcut names
- Harden SSH by disabling root login and password auth in `/etc/ssh/sshd_config`
- Always run `sudo sshd -t` before reloading SSH config
- `scp` copies files, `rsync` synchronizes them efficiently

## 🎯 Mini Challenge

1. Generate a new Ed25519 key pair named `challenge_key`
2. Copy the public key to `localhost`'s `authorized_keys`
3. Create a `~/.ssh/config` entry called `challenge-host` that uses this key to connect to localhost
4. Connect using only `ssh challenge-host`
5. Transfer your entire `~/novamart/` directory to `/tmp/novamart-backup/` using rsync with verbose output

## 🐙 GitHub Progress Checkpoint

```
Folder:          enterprise-linux-operations-platform/module-24
Files to commit: ssh-config-template.txt, ssh-hardening-checklist.md
Commit message:  "Module 24: SSH key authentication and server hardening complete"
```

## Knowledge Check

**Review Questions:**
1. What is stored in `~/.ssh/authorized_keys`?
2. What permissions must a private key file have?
3. What does `ssh-copy-id` do?
4. What does `sudo sshd -t` do?
5. What is the difference between `ssh -L` and `ssh -R`?

**Practical Questions:**
- Write the complete sequence of commands to set up passwordless SSH access from machine A to machine B.
- Write an `~/.ssh/config` block for a server that uses a non-standard port and a specific key file.

**Reflection Question:**
*SSH key-based authentication is objectively more secure than passwords, yet many people still use passwords. What technical, workflow, or organizational factors might lead a team to continue using password-based SSH even when they know better?*


