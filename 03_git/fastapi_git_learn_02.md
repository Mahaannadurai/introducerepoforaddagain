# Git From Practice
# Book 2 — Git for Teams, GitHub, and DevOps Workflows
## Collaboration, Pull Requests, Rebasing, and CI/CD (2026 Edition)

---

# Before You Start

This book assumes you completed Book 1.

You should already be comfortable with:

```text
git init, git add, git commit
git status, git diff, git log
git branch, git switch, git merge
resolving merge conflicts
git restore, git reset
git push, git pull
```

If any of these feel shaky, go back to Book 1 first.

This book builds directly on top of that foundation.

---

# Who This Book Is For

This book is for:

- Developers who know solo Git but have never collaborated with a team
- Aspiring DevOps engineers who need to understand Git inside CI/CD pipelines
- Freshers preparing for interviews that ask about Pull Requests and code review
- Anyone who has seen "rebase" in a tutorial and quietly avoided it

---

# What Makes This Book Different

Book 1 taught you Git on your own computer, alone.

Real software is never built alone.

Book 2 teaches Git the way it is actually used at a company:

- Multiple people working on the same repository
- Code review before anything reaches `main`
- Automated tests running on every change
- A pipeline that deploys code automatically

We will continue building the **FastAPI Todo API** from Book 1.

This time, you will work with a second developer: **Priya**, your teammate.

Some chapters, you will literally simulate being both people, on the same
computer, using two folders. This is the only way to safely practice
real conflicts and reviews before doing it with a real coworker.

By the end of this book you will know:

✅ How to clone a repository and contribute to someone else's project

✅ How to open a Pull Request and what it actually does

✅ How to review someone else's code properly

✅ How to keep your branch updated using `rebase` vs `merge`

✅ How to handle conflicts that happen during collaboration

✅ How protected branches stop bad code from reaching production

✅ How a CI/CD pipeline uses Git to test and deploy your code automatically

✅ The exact Git workflow used inside real DevOps teams

---

# The One Rule (Same as Book 1)

Do not memorize commands.

Always ask:

> What problem does this command solve?
> What would go wrong without it?

---

# Project Recap

Here is where Book 1 left us:

```text
fastapi-todo/
│
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── models.py
│   └── routes/
│       ├── __init__.py
│       └── todos.py
│
├── requirements.txt
├── .gitignore
└── README.md
```

Pushed to GitHub at:

```text
https://github.com/yourusername/fastapi-todo
```

With a working history of meaningful commits and at least one resolved
merge conflict.

If your project does not match this, that is fine — clone any working
FastAPI Todo project, or recreate Book 1's final state before continuing.

---

# Chapter 1 — Why Solo Git Is Not Enough

In Book 1, you were the only person touching the repository.

Every command you learned assumed:

```text
You write code → You commit → You push
```

The moment a second person joins, new problems appear that
`git add`, `git commit`, and `git push` alone cannot solve.

---

## Problem 1 — Whose code is correct?

You and Priya both add a `delete_todo` function.

Yours deletes by ID.

Hers deletes by title.

Who is right? Should both exist? Should someone review this before
it reaches `main`?

Solo Git has no answer. Solo Git just merges and hopes.

---

## Problem 2 — How do changes reach the team safely?

If everyone pushes directly to `main` whenever they want, `main` becomes
unstable. A half-finished feature from Priya could break your work
the moment you pull.

---

## Problem 3 — How do you review code before it ships?

In Book 1, nobody checked your code before it became permanent history.

In a real team, code gets read by at least one other person before
it reaches production. Mistakes, security issues, and bad design get
caught here — not in production at 2 AM.

---

## Problem 4 — How does testing happen automatically?

Manually running tests before every push does not scale to a team of
10, 50, or 500 engineers. Something needs to test the code automatically,
every single time, with no exceptions.

---

## The Solution: GitHub Workflow + CI/CD

This book solves all four problems using:

```text
Problem                         Solution
─────────────────────────────────────────────────
Whose code is correct?          Pull Requests + Code Review
Unstable main branch            Branch Protection Rules
No review before merging        Required Pull Request Reviews
No automatic testing            CI/CD Pipelines (GitHub Actions)
```

This is the exact workflow used at almost every modern software company.

---

# Chapter 2 — Cloning vs Initializing

In Book 1, you used `git init` to start a brand new repository.

When joining an existing project, you use `git clone` instead.

---

## The Problem

Priya already has a copy of `fastapi-todo` on her laptop because she
created it (or you shared it with her). You need an identical copy on
your computer, with full history, ready to work on.

---

## Simulating Two Developers on One Computer

To practice safely, you will create two separate folders representing
two different developers.

```bash
mkdir ~/git-book2-practice
cd ~/git-book2-practice
```

---

## Clone Your Own Repository (as "Priya")

This simulates Priya cloning the team's repository for the first time.

```bash
git clone https://github.com/yourusername/fastapi-todo.git priya-copy
```

Expected output:

```text
Cloning into 'priya-copy'...
remote: Enumerating objects: 40, done.
remote: Counting objects: 100% (40/40), done.
remote: Compressing objects: 100% (28/28), done.
Receiving objects: 100% (40/40), 6.21 KiB | 6.21 MiB/s, done.
Resolving deltas: 100% (8/8), done.
```

Look inside:

```bash
cd priya-copy
ls -la
```

Expected output:

```text
.git/
.gitignore
README.md
app/
requirements.txt
```

Notice: the `.git` folder already exists, fully populated.

`git clone` does three things in one command:

```text
1. Downloads the entire repository (every commit, every branch)
2. Creates a Working Directory with the latest files
3. Automatically sets up "origin" pointing back to GitHub
```

Verify the remote was set up automatically:

```bash
git remote -v
```

Expected output:

```text
origin  https://github.com/yourusername/fastapi-todo.git (fetch)
origin  https://github.com/yourusername/fastapi-todo.git (push)
```

Compare this to Book 1, where you had to run `git remote add origin ...`
manually after `git init`. With `clone`, this step is automatic.

---

## init vs clone

```text
git init     →  start a brand new, empty repository
git clone    →  copy an existing repository (with full history)
```

You will use `git clone` far more often than `git init` once you start
working on teams, because most repositories already exist before you
join them.

---

## Verify Priya's Copy Works

```bash
git log --oneline
```

Expected output: the exact same commit history you built in Book 1.

```text
i5j7k88 Merge feature branches
j6k8l99 Add description field to Todo model
h9i4l33 Add PATCH endpoint to mark todo as completed
...
a3f8d21 Initial commit: add README
```

Priya now has an identical copy of your project, including every commit.

---

# Chapter 3 — Working With Remote Branches

In Book 1, all your branches lived only on your computer.

In a team, branches need to be visible to everyone.

---

## Local Branches vs Remote Branches

```text
Local branch    →  exists only on your computer
Remote branch   →  exists on GitHub, visible to the whole team
```

When you push a branch, it becomes a remote branch others can see.

---

## Create a Branch and Push It (as yourself)

Go back to your original repository folder (not the `priya-copy` one):

```bash
cd ~/fastapi-todo
```

Pull the latest first — always do this before starting new work:

```bash
git pull
```

Expected output:

```text
Already up to date.
```

Create a new branch:

```bash
git switch -c feature/update-todo
```

Add an update endpoint. Open `app/routes/todos.py` and add:

```python
@router.put("/{todo_id}")
def update_todo(todo_id: int, updated: Todo):
    for index, todo in enumerate(todos):
        if todo.id == todo_id:
            todos[index] = updated
            return updated
    raise HTTPException(status_code=404, detail="Todo not found")
```

Commit:

```bash
git add app/routes/todos.py
git commit -m "Add PUT endpoint to update an existing todo"
```

---

## Push the Branch (Not main)

```bash
git push -u origin feature/update-todo
```

Expected output:

```text
Enumerating objects: 7, done.
Counting objects: 100% (7/7), done.
Writing objects: 100% (4/4), 512 bytes | 512.00 KiB/s, done.
remote:
remote: Create a pull request for 'feature/update-todo' on GitHub by visiting:
remote:      https://github.com/yourusername/fastapi-todo/pull/new/feature/update-todo
remote:
To https://github.com/yourusername/fastapi-todo.git
 * [new branch]      feature/update-todo -> feature/update-todo
```

Notice GitHub already suggests opening a Pull Request. We will do that
in the next chapter.

---

## See Remote Branches

```bash
git branch -r
```

Expected output:

```text
  origin/feature/update-todo
  origin/main
```

These are branches that exist on GitHub.

To see both local and remote together:

```bash
git branch -a
```

Expected output:

```text
* feature/update-todo
  main
  remotes/origin/feature/update-todo
  remotes/origin/main
```

---

## Fetch vs Pull — An Important Distinction

```bash
git fetch
```

`fetch` downloads new information from GitHub (new commits, new branches)
but does **not** change any of your files.

```bash
git pull
```

`pull` does two things in sequence:

```text
1. git fetch   (download new history)
2. git merge   (combine it into your current branch)
```

`pull` is really `fetch` + `merge` automatically.

This distinction matters a lot once you start reviewing other people's
branches without wanting to immediately merge them into your own work.

---

# Chapter 4 — Your First Pull Request

A Pull Request (often shortened to "PR") is a request to merge your
branch into another branch, with a conversation attached.

---

## What a Pull Request Actually Is

Many beginners think a Pull Request is a Git feature.

It is not.

```text
Git           →  tracks code and history (works without GitHub)
Pull Request  →  a GitHub feature for reviewing and discussing
                  a merge before it happens
```

You could use Git your entire career without ever using a Pull Request,
if you worked completely alone. The moment you collaborate, Pull
Requests become essential.

---

## Why Not Just Merge Directly?

You already know how to merge locally:

```bash
git merge feature/update-todo
```

So why bother with GitHub's Pull Request feature at all?

Because a Pull Request gives you:

```text
✅ A space to discuss the change before it happens
✅ A diff view the whole team can see and comment on
✅ A place to run automated tests before merging
✅ A required approval step (if branch protection is enabled)
✅ A permanent record of WHY a change was made, not just WHAT changed
```

---

## Open Your First Pull Request

Go to your GitHub repository in the browser:

```text
https://github.com/yourusername/fastapi-todo
```

You will see a banner:

```text
feature/update-todo had recent pushes
[Compare & pull request]
```

Click **Compare & pull request**.

---

## Fill Out the Pull Request

**Title:**

```text
Add PUT endpoint to update an existing todo
```

**Description:**

```markdown
## What this does
Adds a PUT /todos/{id} endpoint that lets users update an existing
todo's title, completion status, description, and priority.

## Why
Users currently can only create and delete todos. They have no way
to edit a todo without deleting and recreating it.

## How to test
1. Create a todo with POST /todos/
2. Send a PUT request to /todos/{id} with updated fields
3. Verify the response shows the updated data
4. Verify GET /todos/{id} reflects the change
```

This description is just as important as the code itself.

A good PR description answers: **what**, **why**, and **how to verify**.

Click **Create pull request**.

---

## Understanding the Pull Request Page

GitHub now shows you:

```text
┌────────────────────────────────────────┐
│  Conversation  │  Commits  │  Files Changed  │
└────────────────────────────────────────┘
```

**Conversation tab** — discussion, comments, approval status

**Commits tab** — every commit included in this PR

**Files Changed tab** — the actual diff, line by line, exactly like
`git diff` but in a readable web interface

This is the same information `git diff` and `git log` give you locally,
displayed in a way that is easy for teammates to read and comment on.

---

## Self-Review Before Asking Others

Before asking a teammate to review, review your own PR first.

Click the **Files Changed** tab.

Read through every line as if you were a stranger seeing this code
for the first time.

Ask yourself:

```text
Does this match what the title and description say?
Did I leave in any debug print statements?
Did I accidentally include unrelated changes?
Is there anything confusing that needs a comment?
```

This habit alone catches a large percentage of mistakes before anyone
else even looks at your code.

---

# Chapter 5 — Code Review

Now you will simulate being the reviewer, reading code someone else
wrote (your own PR from Chapter 4, viewed with fresh eyes).

---

## What Code Review Actually Checks

A good review is not just "does this work?"

```text
1. Correctness     — does the code do what it claims?
2. Readability      — can another developer understand it quickly?
3. Consistency      — does it match the style of the rest of the project?
4. Edge cases        — what happens with bad input? Empty input? Missing data?
5. Security          — does this introduce any risk?
6. Tests             — is there any way to verify this keeps working?
```

---

## Leaving Comments on a Pull Request

On the **Files Changed** tab, hover over any line of code.

A blue **+** icon appears.

Click it to leave a comment on that specific line.

Example comment you might leave on your own `update_todo` function:

```text
What happens if the request body is missing the `id` field?
Should we validate that updated.id matches todo_id, or allow
the ID to be changed during an update?
```

This is a real, valid review comment. It questions an edge case the
code does not currently handle.

---

## Requesting Changes vs Approving

GitHub gives reviewers three options:

```text
Comment           →  general feedback, no formal verdict
Approve           →  "this is good, ready to merge"
Request changes   →  "this needs work before it can merge"
```

If you request changes, the PR author updates their branch and pushes
again. The same PR automatically updates — you do not need to open a
new one.

---

## Practice: Fix a Review Comment

Let's act on the comment from above.

Update `app/routes/todos.py`:

```python
@router.put("/{todo_id}")
def update_todo(todo_id: int, updated: Todo):
    if updated.id != todo_id:
        raise HTTPException(
            status_code=400,
            detail="ID in URL must match ID in request body"
        )
    for index, todo in enumerate(todos):
        if todo.id == todo_id:
            todos[index] = updated
            return updated
    raise HTTPException(status_code=404, detail="Todo not found")
```

Commit and push to the SAME branch:

```bash
git add app/routes/todos.py
git commit -m "Validate that todo_id matches the ID in the request body"
git push
```

Expected output:

```text
To https://github.com/yourusername/fastapi-todo.git
   feature/update-todo -> feature/update-todo
```

Go back to your open Pull Request on GitHub.

The new commit appears automatically in the same PR.

This is an important concept: **a Pull Request is tied to a branch,
not to a single push.** Every commit you push to that branch shows up
in the same PR until it is merged or closed.

---

## Merging the Pull Request

Once you are satisfied (or a teammate approves it), scroll to the
bottom of the PR page.

You will see merge options:

```text
Create a merge commit
Squash and merge
Rebase and merge
```

---

## The Three Merge Options Explained

### Create a merge commit

```text
main:      A ── B ── C ────────── M
                       \         /
feature:                D ── E ──
```

Keeps every individual commit, plus one extra merge commit.
History shows exactly how the branch was developed.

### Squash and merge

```text
main:      A ── B ── C ── S
```

Combines ALL commits from the branch into a single new commit on main.
History on main stays clean — one commit per feature, regardless of
how many small commits happened on the branch.

### Rebase and merge

```text
main:      A ── B ── C ── D' ── E'
```

Takes each commit from the branch and replays them on top of main,
one by one, with no merge commit at all. History looks like the
work happened in a straight line.

---

## Which One Should You Use?

```text
Team is small, history detail matters     → Merge commit
Team wants clean main history             → Squash and merge
Team wants linear history, no clutter      → Rebase and merge
```

**Squash and merge is the most common choice for feature branches** in
modern teams, because it keeps `main`'s history readable — one commit
per feature — while your branch can have as many small "fix typo" or
"work in progress" commits as you want during development.

For this book, choose **Squash and merge**.

Click it. Confirm. Your PR is merged.

---

## Clean Up

GitHub offers a **Delete branch** button after merging. Click it.

Locally, sync up:

```bash
git switch main
git pull
git branch -d feature/update-todo
```

Expected output:

```text
Switched to branch 'main'
Updating i5j7k88..k9l2m11
Fast-forward
 app/routes/todos.py | 12 ++++++++++++
 1 file changed, 12 insertions(+)
Deleted branch feature/update-todo (was l8m1n22).
```

---

# Chapter 6 — Branch Protection Rules

Right now, nothing is stopping you (or Priya) from pushing directly
to `main` and skipping Pull Requests entirely.

Branch protection rules fix this.

---

## The Problem Without Protection

```text
Priya pushes directly to main with an untested change
↓
main is now broken
↓
Everyone who pulls main gets the broken code
↓
Production deployment fails
```

This happens constantly on real teams without protection rules.

---

## Set Up Branch Protection

On GitHub, go to your repository.

Click **Settings** → **Branches** → **Add branch protection rule**.

Branch name pattern:

```text
main
```

Enable these options:

```text
☑ Require a pull request before merging
☑ Require approvals (set to 1)
☑ Require status checks to pass before merging
☑ Do not allow bypassing the above settings
```

Click **Create**.

---

## What Changes Now

Try to push directly to main:

```bash
git switch main
echo "test" >> README.md
git add README.md
git commit -m "Test direct push to main"
git push
```

Expected output:

```text
remote: error: GH006: Protected branch update failed for refs/heads/main.
remote: error: Changes must be made through a pull request.
To https://github.com/yourusername/fastapi-todo.git
 ! [remote rejected] main -> main (protected branch hook declined)
error: failed to push some refs
```

GitHub blocked the push.

Undo your local test commit:

```bash
git reset --hard HEAD~1
```

Expected output:

```text
HEAD is now at k9l2m11 Validate that todo_id matches the ID in the request body
```

**Note:** `git reset --hard` permanently discards changes. Use it carefully —
unlike `git restore`, there is no warning before the change is gone.

From now on, every change — even small ones — must go through a branch
and a Pull Request. This is exactly how production codebases at real
companies are protected.

---

# Chapter 7 — Rebasing: The Concept Beginners Fear

Rebasing has a reputation for being confusing.

It is not, once you see the actual problem it solves.

---

## The Problem Rebase Solves

You created a branch three days ago.

Since then, five new commits have landed on `main` from your teammates.

Your branch does not have those changes.

```text
main:      A ── B ── C ── D ── E ── F
                \
your branch:      G ── H
```

You have two options to bring your branch up to date with `main`.

---

## Option 1 — Merge main into your branch (what you already know)

```bash
git switch feature/your-branch
git merge main
```

Result:

```text
main:      A ── B ── C ── D ── E ── F
                \                    \
your branch:      G ── H ──────────── M
```

This works. But it creates an extra merge commit, and the history
shows your branch "catching up" in a slightly messy way.

---

## Option 2 — Rebase your branch onto main

```bash
git switch feature/your-branch
git rebase main
```

Result:

```text
main:      A ── B ── C ── D ── E ── F
                                      \
your branch:                           G' ── H'
```

Rebase takes your commits (`G` and `H`) and **replays** them on top of
the latest `main`, one at a time, as if you had started your branch
today instead of three days ago.

Notice: `G` and `H` become `G'` and `H'` — slightly different commits
with new IDs, because Git is recreating them on a new base.

---

## Real World Analogy

Imagine you are writing a research paper.

**Merging** is like stapling someone else's update pages into the middle
of your draft — both versions exist, stapled together, in the order
they happened.

**Rebasing** is like rewriting your own pages so they read as if you
started writing AFTER reading the latest update — your contribution
looks like a clean continuation of the current document, not a
patchwork of two timelines.

---

## Practice: Simulate Falling Behind

Let's recreate this exact scenario.

First, make sure main is current:

```bash
git switch main
git pull
```

Create a branch and make one commit:

```bash
git switch -c feature/add-sorting
```

Add a sort endpoint to `app/routes/todos.py`:

```python
@router.get("/sorted/")
def get_sorted_todos():
    return sorted(todos, key=lambda t: t.priority)
```

```bash
git add app/routes/todos.py
git commit -m "Add endpoint to return todos sorted by priority"
```

**Do not push yet.**

---

## Simulate a Teammate's Change Landing on Main

Switch to main and pretend Priya merged something while you were
working:

```bash
git switch main
```

Add a small change directly to a new branch and merge it (simulating
Priya's already-approved, already-merged PR):

```bash
git switch -c priya-simulated-work
```

Open `README.md` and add a line:

```text
## API Endpoints
See /docs for the full interactive API documentation.
```

```bash
git add README.md
git commit -m "Add API documentation note to README"
git switch main
git merge priya-simulated-work
git branch -d priya-simulated-work
```

Now `main` has moved forward, but your `feature/add-sorting` branch
does not know about it yet.

---

## Rebase Your Branch Onto the Updated Main

```bash
git switch feature/add-sorting
git rebase main
```

Expected output:

```text
Successfully rebased and updated refs/heads/feature/add-sorting.
```

Check the log:

```bash
git log --oneline --graph
```

Expected output:

```text
* n3o4p55 (HEAD -> feature/add-sorting) Add endpoint to return todos sorted by priority
* m2n3o44 (main) Add API documentation note to README
* k9l2m11 Validate that todo_id matches the ID in the request body
...
```

Your commit now sits cleanly on top of the latest main.

No merge commit was created.

---

## Push After a Rebase

Because rebase rewrites commit history (remember: `G` became `G'`),
a normal push will be rejected if you had already pushed this branch
before rebasing.

```bash
git push
```

If rejected:

```text
! [rejected]  feature/add-sorting -> feature/add-sorting (non-fast-forward)
```

You need to force the push, since you intentionally rewrote history:

```bash
git push --force-with-lease
```

Expected output:

```text
To https://github.com/yourusername/fastapi-todo.git
 + a1b2c3d...n3o4p55 feature/add-sorting -> feature/add-sorting (forced update)
```

---

## Why `--force-with-lease` and Not Just `--force`

```text
--force              overwrites the remote branch no matter what
--force-with-lease   overwrites the remote branch ONLY if nobody else
                      has pushed to it since you last fetched
```

`--force-with-lease` protects you from accidentally erasing a
teammate's work that you didn't know about. Always prefer it over
plain `--force`.

---

## The Golden Rebase Rule

```text
✅ Safe to rebase:    branches only you are working on, not yet shared
❌ Dangerous to rebase: branches that teammates have already pulled
                        and are building on top of
```

If Priya already pulled your branch and started her own commits on
top of it, and you rebase and force-push, her work and yours will no
longer share a common history. This causes serious confusion.

**Rule of thumb:** rebase your own feature branches before opening a
PR. Once a PR is open and others may be building on it, switch to merging.

---

## Merge vs Rebase — Quick Comparison

```text
                    Merge                    Rebase
─────────────────────────────────────────────────────────
History            Shows exactly what        Looks like a
                    happened, including       clean straight
                    timing                    line
Extra commits       Yes (merge commit)        No
Safe on shared      Yes, always               Only if nobody
branches?                                     else has the branch
Common use          Bringing a finished       Updating your own
                    feature into main         branch before opening
                                               a PR
```

Finish cleaning up this practice branch:

```bash
git switch main
git pull
git merge feature/add-sorting
git push
git branch -d feature/add-sorting
```

---

# Chapter 8 — Interactive Rebase: Cleaning Up Your Own History

Before opening a Pull Request, you often want to clean up messy commits
you made while developing.

---

## The Problem

While building a feature, your real commit history often looks like this:

```text
add new endpoint
fix typo
oops forgot import
actually fix the bug this time
remove debug print
```

This is honest, normal development. But it is embarrassing and
unhelpful to show a reviewer five commits when really there was
one logical change.

---

## Interactive Rebase to Squash Commits

Let's create this messy scenario on purpose.

```bash
git switch -c feature/messy-history
```

Make a small change, commit it badly:

```python
# In app/routes/todos.py, add at the bottom:
@router.get("/count/")
def count_todos():
    return len(todo)
```

```bash
git add app/routes/todos.py
git commit -m "wip"
```

Now fix the typo (`todo` should be `todos`):

```python
@router.get("/count/")
def count_todos():
    return len(todos)
```

```bash
git add app/routes/todos.py
git commit -m "fix typo"
```

You now have two messy commits for one tiny feature.

---

## Clean It Up with Interactive Rebase

```bash
git rebase -i HEAD~2
```

`HEAD~2` means "the last 2 commits".

An editor opens showing:

```text
pick a1b2c3d wip
pick e4f5g6h fix typo

# Rebase instructions:
# p, pick   = use commit as is
# s, squash = combine with previous commit, keep both messages
# f, fixup  = combine with previous commit, discard this message
# r, reword = use commit but edit the message
# d, drop   = remove commit entirely
```

Change the second line from `pick` to `squash` (or just `s`):

```text
pick a1b2c3d wip
squash e4f5g6h fix typo
```

Save and close the editor.

A second editor screen opens asking you to write the combined commit
message:

```text
# This is a combination of 2 commits.
# This is the 1st commit message:

wip

# This is the 2nd commit message:

fix typo
```

Delete all of this and replace it with one clean message:

```text
Add endpoint to count total todos
```

Save and close.

Expected output:

```text
[detached HEAD a9b8c7d] Add endpoint to count total todos
 1 file changed, 4 insertions(+)
Successfully rebased and updated refs/heads/feature/messy-history.
```

Check the log:

```bash
git log --oneline
```

Expected output:

```text
a9b8c7d (HEAD -> feature/messy-history) Add endpoint to count total todos
n3o4p55 Add endpoint to return todos sorted by priority
...
```

Two messy commits became one clean commit.

---

## When to Use Interactive Rebase

```text
✅ Before opening a Pull Request, to clean up your own messy commits
✅ On branches nobody else has pulled yet
❌ Never on main
❌ Never on a branch others are actively working on
```

Clean up the practice branch:

```bash
git switch main
git branch -D feature/messy-history
```

(`-D` force-deletes a branch even if it was never merged — fine here
since this was just practice.)

---

# Chapter 9 — Stashing: Pausing Work Without Committing

Sometimes you need to switch branches immediately, but your current
work is not ready to commit.

---

## The Problem

You are halfway through writing a function. It does not even run yet.
Suddenly, you need to switch to `main` to fix an urgent bug.

```bash
git switch main
```

Expected output:

```text
error: Your local changes to the following files would be overwritten by checkout:
        app/routes/todos.py
Please commit your changes or stash them before you switch branches.
```

Git refuses to switch, because it would lose your unfinished work.

You do not want to commit broken code. You just want to pause.

---

## The Solution: git stash

```bash
git stash
```

Expected output:

```text
Saved working directory and index state WIP on feature/your-branch: a9b8c7d Add endpoint
```

Your unfinished changes are tucked away safely. Check status:

```bash
git status
```

Expected output:

```text
nothing to commit, working tree clean
```

Your working directory is clean again. Now you can switch branches
freely:

```bash
git switch main
```

Fix the urgent bug, commit it, push it.

---

## Bringing Your Work Back

```bash
git switch feature/your-branch
git stash pop
```

Expected output:

```text
On branch feature/your-branch
Changes not staged for commit:
        modified:   app/routes/todos.py

Dropped refs/stash@{0}
```

Your unfinished work is back exactly as you left it.

---

## Viewing and Managing Multiple Stashes

```bash
git stash list
```

Expected output:

```text
stash@{0}  WIP on feature/your-branch: a9b8c7d Add endpoint
```

You can stash multiple times. Apply a specific one:

```bash
git stash apply stash@{0}
```

`apply` keeps the stash in the list. `pop` applies AND removes it.

---

## Stash Cheat Sheet

```text
git stash               save current changes, clean working directory
git stash list          see all saved stashes
git stash pop           apply the most recent stash and remove it
git stash apply         apply a stash but keep it in the list
git stash drop          delete a stash without applying it
```

---

# Chapter 10 — Tags: Marking Releases

Branches change constantly. Sometimes you need to mark a specific
point in history that will never change — like "this is version 1.0,
the exact code we deployed to customers."

---

## Create a Tag

```bash
git switch main
git pull
git tag -a v1.0.0 -m "First stable release of Todo API"
```

`-a` creates an annotated tag (with a message, author, and date —
the recommended type). `-m` provides the message.

---

## View Tags

```bash
git tag
```

Expected output:

```text
v1.0.0
```

See details:

```bash
git show v1.0.0
```

Expected output shows the tag message, then the full commit it points to.

---

## Push Tags to GitHub

Tags do not push automatically with `git push`. You must push them
explicitly:

```bash
git push origin v1.0.0
```

Or push all tags at once:

```bash
git push --tags
```

On GitHub, go to your repository → **Releases** → you will see `v1.0.0`
listed, and you can turn it into a formal GitHub Release with notes.

---

## Why Tags Matter in DevOps

This is directly relevant to CI/CD, which you'll see in Chapter 12.

```text
Pipelines often trigger differently based on tags:

Push to a branch         → run tests
Push a tag like v1.0.0   → run tests AND deploy to production
```

Tags give you a stable, permanent reference point — exactly what
production deployments need.

---

# Chapter 11 — A Real Team Conflict Scenario

In Book 1, you resolved a conflict alone. Now let's resolve one
through the actual GitHub Pull Request flow, the way it really happens
on a team.

---

## Setup: Two Branches Touching the Same Code

You will play both developers using your two folders from Chapter 2.

**As yourself**, in `~/fastapi-todo`:

```bash
git switch main
git pull
git switch -c feature/add-due-date
```

Edit `app/models.py`:

```python
from pydantic import BaseModel
from typing import Optional


class Todo(BaseModel):
    id: int
    title: str
    completed: bool = False
    description: str = ""
    priority: int = 1
    due_date: Optional[str] = None
```

```bash
git add app/models.py
git commit -m "Add optional due_date field to Todo model"
git push -u origin feature/add-due-date
```

Open a Pull Request on GitHub for this branch, but **do not merge it yet**.

---

**As "Priya"**, in `~/git-book2-practice/priya-copy`:

```bash
git switch main
git pull
git switch -c feature/add-tags
```

Edit `app/models.py` (the same file, same area):

```python
from pydantic import BaseModel
from typing import Optional, List


class Todo(BaseModel):
    id: int
    title: str
    completed: bool = False
    description: str = ""
    priority: int = 1
    tags: List[str] = []
```

```bash
git add app/models.py
git commit -m "Add tags field to Todo model"
git push -u origin feature/add-tags
```

Open a second Pull Request for this branch.

---

## Merge the First PR

Back as yourself, merge `feature/add-due-date` into `main` through
GitHub (Squash and merge, like Chapter 5).

`main` now has the `due_date` field.

---

## Try to Update the Second PR

As Priya, sync with main:

```bash
git switch main
git pull
```

Now try to update Priya's branch with the latest main:

```bash
git switch feature/add-tags
git rebase main
```

Expected output:

```text
Auto-merging app/models.py
CONFLICT (content): Merge conflict in app/models.py
error: could not apply f3g4h55... Add tags field to Todo model
```

This is the same kind of conflict from Book 1 — but now it is happening
because two real, separate Pull Requests touched the same area of code.

---

## Resolve It

Open `app/models.py`:

```python
from pydantic import BaseModel
from typing import Optional
<<<<<<< HEAD
    due_date: Optional[str] = None
=======
from typing import List


class Todo(BaseModel):
    id: int
    title: str
    completed: bool = False
    description: str = ""
    priority: int = 1
    tags: List[str] = []
>>>>>>> f3g4h55 (Add tags field to Todo model)
```

Your real conflicting region will look slightly different depending
on exact line positions, but the principle is identical to Book 1.
Combine both intentions:

```python
from pydantic import BaseModel
from typing import Optional, List


class Todo(BaseModel):
    id: int
    title: str
    completed: bool = False
    description: str = ""
    priority: int = 1
    due_date: Optional[str] = None
    tags: List[str] = []
```

Stage and continue the rebase:

```bash
git add app/models.py
git rebase --continue
```

Expected output:

```text
Successfully rebased and updated refs/heads/feature/add-tags.
```

Force-push the updated branch:

```bash
git push --force-with-lease
```

Go back to the second Pull Request on GitHub. It now shows a clean
diff with both fields present, and the conflict is gone — because
you resolved it locally before GitHub ever needed to deal with it.

---

## The Lesson

This is exactly what happens constantly on real teams: two PRs touch
similar code, the first one merges, and the second one needs to be
updated. Rebasing onto the latest `main` and resolving the conflict
locally — before merging through GitHub — is the standard professional
workflow.

Merge the second PR. Clean up both folders' local branches.

---

# Chapter 12 — Introduction to CI/CD with GitHub Actions

This is the chapter where Git stops being just a personal tool and
becomes part of an automated pipeline — the actual bridge into DevOps.

---

## What Is CI/CD?

```text
CI  =  Continuous Integration
       Automatically test every change, every time, with no exceptions

CD  =  Continuous Deployment / Delivery
       Automatically deploy code that passes all tests
```

---

## The Problem Without CI/CD

```text
Developer pushes code
↓
Maybe they ran the tests locally. Maybe they forgot.
↓
Code merges into main
↓
Bug discovered in production
↓
"Wait, did anyone actually test this?"
```

---

## How CI/CD Uses Git

This is the key insight for this chapter:

**CI/CD pipelines are triggered by Git events.**

```text
Git event                          Pipeline reaction
─────────────────────────────────────────────────────
Push to any branch                 Run tests
Open a Pull Request                Run tests, show pass/fail on the PR
Push a tag like v1.0.0              Run tests, then deploy
Merge into main                     Run tests, then deploy to staging
```

Every single trigger is a Git action you already know how to perform.

---

## Write a Test for Our API

Before automating tests, we need a test to automate.

Install the testing tool:

```bash
pip install pytest httpx
pip freeze > requirements.txt
```

Create `tests/__init__.py` and `tests/test_main.py`:

```bash
mkdir tests
touch tests/__init__.py
```

Create `tests/test_main.py`:

```python
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Todo API is running"}


def test_create_and_get_todo():
    new_todo = {
        "id": 1,
        "title": "Learn Git",
        "completed": False
    }
    create_response = client.post("/todos/", json=new_todo)
    assert create_response.status_code == 200

    get_response = client.get("/todos/1")
    assert get_response.status_code == 200
    assert get_response.json()["title"] == "Learn Git"
```

Run the tests locally:

```bash
pytest
```

Expected output:

```text
============= test session starts =============
collected 2 items

tests/test_main.py ..                      [100%]

============= 2 passed in 0.34s =============
```

Both tests pass.

Commit this on a branch:

```bash
git switch -c feature/add-tests
git add tests/ requirements.txt
git commit -m "Add pytest test suite for API endpoints"
git push -u origin feature/add-tests
```

---

## Create the GitHub Actions Workflow

GitHub Actions reads workflow files from a specific folder:

```text
.github/workflows/
```

Create it:

```bash
mkdir -p .github/workflows
touch .github/workflows/tests.yml
```

Add this content to `.github/workflows/tests.yml`:

```yaml
name: Run Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          pip install -r requirements.txt

      - name: Run tests
        run: |
          pytest
```

---

## Reading This File Like a Beginner

Let's decode every section.

```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
```

This says: run this workflow whenever someone pushes to `main`, OR
whenever a Pull Request targets `main`. This is the Git event trigger
we discussed earlier, written as actual configuration.

```yaml
runs-on: ubuntu-latest
```

GitHub spins up a fresh, temporary Ubuntu Linux server to run this —
the exact Linux skills from your earlier training are what is actually
happening behind this one line.

```yaml
steps:
  - name: Checkout code
    uses: actions/checkout@v4
```

This step runs the equivalent of `git clone` on that fresh server,
downloading your repository's code.

```yaml
  - name: Install dependencies
    run: |
      pip install -r requirements.txt
```

This installs everything listed in `requirements.txt` — the same file
you created in Book 1 with `pip freeze`.

```yaml
  - name: Run tests
    run: |
      pytest
```

This runs the exact same `pytest` command you ran on your own computer
seconds ago — except now it runs automatically, on every single push
and every Pull Request, forever, with no human needing to remember to do it.

---

## Commit and Push the Workflow

```bash
git add .github/workflows/tests.yml
git commit -m "Add GitHub Actions workflow to run tests automatically"
git push
```

---

## Open a Pull Request and Watch It Work

Open a Pull Request for `feature/add-tests` on GitHub.

Within seconds, you will see a new section appear on the PR page:

```text
Some checks haven't completed yet
🟡 Run Tests / test — In progress...
```

Wait about 30 seconds. Refresh.

```text
All checks have passed
✅ Run Tests / test — Successful in 24s
```

Click **Details** next to the check to see the full log of everything
that happened — exactly the same output you saw locally, just running
on GitHub's servers automatically.

---

## Make the Check Required

Go back to **Settings** → **Branches** → edit your protection rule for `main`.

Under **Require status checks to pass before merging**, search for and
select:

```text
Run Tests / test
```

Save.

Now, no Pull Request can be merged into `main` unless this test suite
passes. This is the same branch protection from Chapter 6, now
connected to real automated testing.

---

## Prove It Works: Break a Test on Purpose

Create a new branch:

```bash
git switch main
git pull
git switch -c feature/break-something
```

Edit `app/main.py` and change the root message:

```python
@app.get("/")
def root():
    return {"message": "Something different"}
```

```bash
git add app/main.py
git commit -m "Change root message"
git push -u origin feature/break-something
```

Open a Pull Request for this branch.

Expected result on GitHub:

```text
Some checks were not successful
❌ Run Tests / test — Failing after 18s
```

Click **Details**. You will see the actual pytest failure:

```text
FAILED tests/test_main.py::test_root_endpoint
AssertionError: assert {'message': 'Something different'} == {'message': 'Todo API is running'}
```

And the **Merge pull request** button is now disabled, with a message:

```text
Merging is blocked
Required status check "Run Tests / test" is expected.
```

This is CI/CD protecting your codebase automatically, using only the
Git skills you already have.

---

## Clean Up

Close this PR without merging (since it was intentionally broken):

```bash
git switch main
git branch -D feature/break-something
```

On GitHub, close the PR and delete the remote branch.

Merge `feature/add-tests` properly (since it passed), then sync:

```bash
git switch main
git pull
```

---

# Chapter 13 — A Simple Deployment Trigger

You have seen testing automated. Now let's see deployment triggered
by Git, conceptually, using the tagging skill from Chapter 10.

---

## Extend the Workflow to Deploy on Tags

Update `.github/workflows/tests.yml`. Add a second job:

```yaml
name: Run Tests

on:
  push:
    branches: [main]
    tags: ['v*']
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          pip install -r requirements.txt

      - name: Run tests
        run: |
          pytest

  deploy:
    needs: test
    if: startsWith(github.ref, 'refs/tags/v')
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy notice
        run: |
          echo "Deploying version ${GITHUB_REF#refs/tags/}"
          echo "In a real project, this step would push to a server,"
          echo "build a Docker image, or trigger a cloud deployment."
```

---

## Reading the New Parts

```yaml
tags: ['v*']
```

Now this workflow also triggers when you push a tag starting with `v`
— exactly the tags you created in Chapter 10, like `v1.0.0`.

```yaml
deploy:
  needs: test
```

The `deploy` job only runs if the `test` job succeeds first. Tests
gate deployment automatically.

```yaml
if: startsWith(github.ref, 'refs/tags/v')
```

The `deploy` job only runs when triggered by a version tag — not on
every regular push to `main`.

This is a real, working skeleton of the pattern every production
deployment pipeline uses: **test first, deploy only on tagged releases,
deployment depends on tests passing.**

---

## Trigger It

Commit and push this workflow update through the normal PR process,
then merge it into `main`.

Pull the latest:

```bash
git switch main
git pull
```

Create and push a new version tag:

```bash
git tag -a v1.1.0 -m "Add update endpoint, sorting, and test suite"
git push origin v1.1.0
```

Go to the **Actions** tab on GitHub. You will see the workflow ran,
the `test` job passed, and the `deploy` job ran afterward, printing
the deployment notice.

This is the exact mechanism — Git tags triggering tested, gated
deployments — that real DevOps pipelines build on top of.

---

# Chapter 14 — The Complete Team Workflow

Here is the full professional workflow, combining everything from
both books.

```text
┌─────────────────────────────────────────────────────────┐
│ 1. git pull (on main)                                   │
│ 2. git switch -c feature/your-feature                   │
│ 3. Write code, commit small, meaningful commits          │
│ 4. git rebase main (if main has moved on)                │
│ 5. git push -u origin feature/your-feature               │
│ 6. Open a Pull Request with a clear description          │
│ 7. CI automatically runs tests on the PR                 │
│ 8. Teammate reviews, leaves comments                      │
│ 9. You push fixes; PR updates automatically                │
│ 10. Tests pass, reviewer approves                          │
│ 11. Squash and merge into main                             │
│ 12. Delete the branch                                      │
│ 13. (For releases) Tag the commit: git tag -a vX.Y.Z      │
│ 14. Tag push triggers automated deployment                  │
└─────────────────────────────────────────────────────────┘
```

Every single step in this list is something you have now done with
your own hands in this book.

---

# Book 2 Final Interview Questions

**Q1: What is the difference between `git clone` and `git init`?**

Answer: `git init` creates a brand new, empty repository. `git clone`
copies an existing repository, including its full history, and
automatically sets up the remote connection to it.

---

**Q2: What is a Pull Request, and is it a Git feature or a GitHub feature?**

Answer: A Pull Request is a GitHub feature, not a Git feature. Git
itself has no concept of a "Pull Request" — it is a layer GitHub adds
on top of Git to support code review and discussion before a merge happens.

---

**Q3: What is the difference between `git fetch` and `git pull`?**

Answer: `git fetch` downloads new commits and branches from the
remote but does not change your files. `git pull` does a `fetch`
followed automatically by a `merge`, updating your current branch.

---

**Q4: What is the difference between merging and rebasing?**

Answer: Merging combines two branches' histories and creates a merge
commit, preserving exactly what happened and when. Rebasing replays
your commits on top of another branch's latest state, creating a
clean, linear history with no merge commit — but it rewrites commit
history, so it should only be used on branches that have not been
shared with other people yet.

---

**Q5: Why use `--force-with-lease` instead of `--force` when pushing after a rebase?**

Answer: `--force` overwrites the remote branch unconditionally, which
can silently destroy a teammate's work if they pushed something you
don't know about. `--force-with-lease` only allows the push if the
remote branch is exactly as you last saw it, protecting against
accidentally erasing someone else's commits.

---

**Q6: What does a branch protection rule do?**

Answer: It prevents direct pushes to a specified branch (usually
`main`), requiring all changes to go through a Pull Request, often
with required reviews and passing status checks, before the branch
can be updated.

---

**Q7: What is the difference between Continuous Integration and Continuous Deployment?**

Answer: Continuous Integration automatically tests every code change,
every time, to catch problems early. Continuous Deployment
automatically releases code that passes those tests to production
(or staging), removing manual deployment steps.

---

**Q8: How does a CI/CD pipeline know when to run?**

Answer: It is triggered by Git events — typically a push to a branch,
the opening or updating of a Pull Request, or the pushing of a tag.
The pipeline configuration specifies exactly which events trigger which jobs.

---

**Q9: What is `git stash` used for?**

Answer: It temporarily saves uncommitted changes so you can switch
branches or pull updates without committing unfinished work. You can
later restore the stashed changes with `git stash pop`.

---

**Q10: What is a Git tag, and why is it useful in deployment pipelines?**

Answer: A tag marks a specific, permanent point in a repository's
history — commonly used for release versions like `v1.0.0`. Unlike
branches, tags do not move forward with new commits, which makes them
ideal as stable triggers for production deployments.

---

# You Are Ready

If you completed every chapter hands-on, opened real Pull Requests,
resolved a conflict through the GitHub flow, and watched your own
CI pipeline pass and fail on command, you now understand Git the way
it is actually used inside a software team.

This is the exact foundation that supports:

```text
Docker            — building and shipping containerized applications
Kubernetes        — every deployment is triggered by Git events like these
Terraform         — infrastructure changes go through the same PR workflow
Ansible           — playbooks are version controlled and reviewed the same way
Production CI/CD  — what you built in Chapters 12–13 is a real, working skeleton
```

You are no longer someone who "knows Git commands."

You understand how a team of engineers uses Git, GitHub, and
automation together to ship software safely.

---

# Quick Reference Card — Book 2

```text
TEAM SETUP
git clone <url>                      copy an existing repository
git remote -v                        see remote connections

REMOTE BRANCHES
git branch -r                        list remote branches
git branch -a                        list local + remote branches
git fetch                            download new history, don't merge
git push -u origin branch-name       push and track a new branch

REBASE
git rebase main                      replay your commits onto latest main
git rebase -i HEAD~3                 interactively clean up last 3 commits
git rebase --continue                resume after resolving a conflict
git rebase --abort                   cancel a rebase in progress
git push --force-with-lease          safely push after rewriting history

STASH
git stash                            save uncommitted changes, clean directory
git stash pop                        restore the most recent stash
git stash list                       see all stashes

TAGS
git tag -a v1.0.0 -m "message"       create an annotated tag
git push origin v1.0.0               push a single tag
git push --tags                      push all tags

UNDO (DANGEROUS)
git reset --hard HEAD~1              permanently discard last commit's changes

PULL REQUEST WORKFLOW
1. git switch -c feature/name
2. commit, push -u origin feature/name
3. Open PR on GitHub
4. CI runs automatically
5. Review, fix, push again
6. Squash and merge
7. Delete branch
```