# Git From Practice
# Book 1 — Git Essentials Through a Real FastAPI Project
## Beginner to Job-Ready Git Foundations (2026 Edition)

---

# Who This Book Is For

This book is for:

- Students learning Git for the first time
- Aspiring Backend Developers
- Aspiring DevOps Engineers
- Freshers preparing for interviews
- Anyone tired of memorizing Git commands without understanding them

You do NOT need to know Python to follow this book.

The Python code is simple enough to copy and run.

What matters is learning Git.

---

# What Makes This Book Different?

Most Git tutorials teach:

```bash
git add
git commit
git push
```

without explaining WHY.

This book teaches Git through a real project.

Every Git command solves a real problem you can feel.

You will build a small FastAPI application while learning Git.

By the end of this book you will know:

✅ How Git actually works inside

✅ How to save your work safely

✅ How to create branches and why they exist

✅ How teams work on features without breaking each other

✅ How merge conflicts happen and how to resolve them confidently

✅ How to recover from mistakes

✅ How to push your work to GitHub

These are the exact Git skills expected from junior developers and
entry-level DevOps engineers in interviews and on the job.

---

# The One Rule

Throughout this book:

**Do not memorize commands.**

Always ask:

> Why do I need this command?
> What problem does it solve?

Git becomes easy when you understand the problem first.
The command is just the solution.

---

# Your Environment

Before starting, open your terminal.

On Windows, open **Git Bash** or **WSL Ubuntu**.

On Mac or Linux, open **Terminal**.

Verify Git is installed:

```bash
git --version
```

Expected output:

```text
git version 2.43.0
```

Any version above 2.30 is fine.

If you see `command not found`, install Git from https://git-scm.com

Verify Python is installed:

```bash
python3 --version
```

Expected output:

```text
Python 3.11.4
```

Any version above 3.8 is fine.

---

# Project Overview

We will build a simple Todo API together.

Here is what it will do:

```text
GET    /           → "API is running" message
GET    /todos      → list all todos
POST   /todos      → create a new todo
GET    /todos/{id} → get one todo by its ID
DELETE /todos/{id} → delete a todo
```

Here is the final project structure:

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

We will build this step by step.

We will use Git at every step.

---

# Chapter 1 — What Is Git and Why Does It Exist?

Before learning any commands, understand the problem Git solves.

---

## The Problem

Imagine this situation.

You spend 3 hours coding.

Everything works perfectly.

Then you try to add a new feature.

Something breaks.

You try to undo your changes.

But you can not remember exactly what you changed.

---

Or imagine this situation.

You and a teammate are both working on the same project.

You change one file.

Your teammate changes the same file.

One of you saves last.

The other person's work disappears.

---

These problems happen to every developer without Git.

---

## The Solution

Git is a tool that:

1. Saves snapshots of your project over time
2. Lets you go back to any snapshot instantly
3. Lets multiple people work on the same project safely
4. Keeps a complete history of who changed what and when

---

## Real World Analogy

Think of Git like the version history in Google Docs.

Every time you make a change, Google Docs saves a snapshot.

If you break something, you click "Version History" and go back.

Git does the same thing for code.

Except you control when each snapshot is saved.

---

## How Git Thinks About Your Project

Git has three areas.

Understanding these three areas is the most important thing in this chapter.

```text
┌────────────────────────────────────────────────────────────────────────────┐
│                                                                            │
│   Working Directory     →   Staging Area   →      Repository               │
│                                                                            │
│   (files you edit)      (files you choose)    (permanent history)          │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

### Area 1 — Working Directory

This is where you edit files.

When you open `main.py` and type code, you are in the Working Directory.

Git can see these files.

But Git is NOT saving them yet.

---

### Area 2 — Staging Area

This is a temporary holding area.

Think of it like a shopping cart before checkout.

You choose exactly which changes go into the next snapshot.

You do this with `git add`.

---

### Area 3 — Repository

This is permanent history.

Every time you run `git commit`, Git takes everything from the Staging Area and creates a permanent snapshot.

You can return to any snapshot at any time.

```text
Edit files      →    Choose files     →    Save snapshot
                                           forever

git add file         git commit -m "..."
```

---

## Why Three Areas?

Many beginners ask: why not just save automatically?

The Staging Area gives you control.

Example:

You are working on a feature.

You also fix a small typo in another file.

With the Staging Area, you can commit the feature and the typo separately.

Each commit tells a clear story.

This makes your history much easier to read and understand.

---

## Chapter Summary

Git solves the problem of losing work and overwriting teammates' code.

Git has three areas: Working Directory, Staging Area, Repository.

You edit in the Working Directory.

You choose what to save with `git add`.

You create a permanent snapshot with `git commit`.

---

# Chapter 2 — Setting Up Git and Your First Repository

Now let's get hands-on.

---

## Configure Git Identity

Before using Git, tell it who you are.

This information is attached to every commit you make.

```bash
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

Verify the settings:

```bash
git config --list
```

Expected output:

```text
user.name=Your Name
user.email=your@email.com
```

You only need to do this once on your computer.

---

## Configure the Default Branch Name

Modern Git uses `main` as the default branch name.

Set this now so your projects match GitHub:

```bash
git config --global init.defaultBranch main
```

---

## Create the Project Folder

```bash
mkdir fastapi-todo
cd fastapi-todo
```

Verify you are in the right place:

```bash
pwd
```

Expected output:

```text
/home/yourname/fastapi-todo
```

or on Windows:

```text
/c/Users/yourname/fastapi-todo
```

---

## Initialize Git

```bash
git init
```

Expected output:

```text
Initialized empty Git repository in /home/yourname/fastapi-todo/.git/
```

Git created a hidden folder called `.git` inside your project.

This is Git's database.

All your history, branches, and settings live here.

Never delete or edit this folder manually.

---

## Check Status — Your Most Important Command

```bash
git status
```

Expected output:

```text
On branch main

No commits yet

nothing to commit (create/copy files and start committing)
```

`git status` tells you:

- Which branch you are on
- What files have changed
- What files are staged
- What files Git is not tracking

You will run this command hundreds of times.

Run it before and after almost every Git action.

---

## Create Your First File

```bash
echo "# FastAPI Todo API" > README.md
```

Check status again:

```bash
git status
```

Expected output:

```text
On branch main

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        README.md

nothing added to commit but untracked files present
```

Git sees the file.

But notice: "Untracked files"

Git is not saving it yet.

You must tell Git to track it.

---

## Stage the File

```bash
git add README.md
```

Check status:

```bash
git status
```

Expected output:

```text
On branch main

No commits yet

Changes to be committed:
  (use "git rm --cached <file>..." to unstage)
        new file:   README.md
```

The file moved from "Untracked" to "Changes to be committed".

It is now in the Staging Area.

Think of it as: the file is in your shopping cart, waiting for checkout.

---

## Create Your First Commit

```bash
git commit -m "Initial commit: add README"
```

Expected output:

```text
[main (root-commit) a3f8d21] Initial commit: add README
 1 file changed, 1 insertion(+)
 create mode 100644 README.md
```

Your first snapshot is saved permanently.

The random letters and numbers (`a3f8d21`) are the commit's unique ID.

---

## View Your History

```bash
git log
```

Expected output:

```text
commit a3f8d21b4c9e123456789abcdef (HEAD -> main)
Author: Your Name <your@email.com>
Date:   Mon Jun 16 10:00:00 2026 +0530

    Initial commit: add README
```

This is your complete history so far.

One commit.

---

## The Compact View

```bash
git log --oneline
```

Expected output:

```text
a3f8d21 (HEAD -> main) Initial commit: add README
```

This is the most common way to view history.

You will use `git log --oneline` constantly.

---

## Chapter Summary

```bash
git config --global user.name "Your Name"   # set identity
git init                                     # create repository
git status                                   # check what's happening
git add README.md                            # move file to staging
git commit -m "message"                      # save permanent snapshot
git log --oneline                            # view history
```

---

# Chapter 3 — Commit Messages That Tell a Story

Before writing more code, let's talk about commit messages.

This is one of the most overlooked Git skills for beginners.

---

## Why Commit Messages Matter

Six months from now, you will look at your Git history and ask:

> What was I trying to do in this commit?

A good commit message answers that question instantly.

A bad commit message is useless.

---

## Bad Commit Messages

```text
fix
update
stuff
asdf
changes
wip
```

These tell you nothing.

---

## Good Commit Messages

```text
Add README with project description
Fix login bug that blocked users with special characters in email
Create Todo model with id, title, and completed fields
Remove unused import from routes/todos.py
```

These tell you exactly what happened.

---

## The Convention This Book Uses

We use the **imperative present tense**.

Think of it as giving Git a command:

```text
"Add README"           ✅
"Added README"         ❌
"Adding README"        ❌
```

Common starting words:

```text
Add       → adding something new
Create    → creating a new file or feature
Fix       → fixing a bug
Remove    → deleting something
Update    → changing existing functionality
Rename    → renaming a file
Refactor  → improving code without changing behavior
```

---

## Example Good History

```text
a3f8d21 Initial commit: add README
b7c4e15 Create project structure with requirements.txt
c9d8f30 Add FastAPI main application entry point
d1e5g22 Create Todo model with pydantic
e4f7h33 Add GET and POST routes for todos
f8g2i44 Add GET by ID and DELETE routes
g3h9j55 Create .gitignore for Python project
```

Each commit tells a clear story.

---

# Chapter 4 — Building the Project Foundation

Now we start coding.

But notice: we will add things slowly and commit after each meaningful step.

This is how real developers use Git.

---

## Step 1 — Create the Virtual Environment

A virtual environment keeps your project's Python packages separate from your system.

This is standard Python practice.

```bash
python3 -m venv venv
```

Verify it was created:

```bash
ls
```

Expected output:

```text
README.md  venv/
```

**Do NOT commit the venv folder to Git.**

It is large, operating-system-specific, and can be recreated by anyone.

We will tell Git to ignore it in the next step.

---

## Step 2 — Create .gitignore

A `.gitignore` file tells Git which files to never track.

Without this, you will accidentally commit:

- Virtual environments (huge, OS-specific)
- Python cache files (`__pycache__`, `.pyc`)
- Secret API keys and passwords
- Editor settings

Create the file:

```bash
touch .gitignore
```

Open it in your editor and add:

```text
# Virtual environment
venv/
.venv/

# Python cache files
__pycache__/
*.py[cod]
*.pyo
*.pyd

# Environment variables (secrets)
.env
.env.local

# Editor settings
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db
```

Save the file.

Check status:

```bash
git status
```

Expected output:

```text
On branch main

Untracked files:
        .gitignore

nothing added to commit but untracked files present
```

Notice: `venv/` does NOT appear in the list.

Git is already ignoring it because of `.gitignore`.

Stage and commit:

```bash
git add .gitignore
git commit -m "Add .gitignore for Python project"
```

---

## Step 3 — Activate the Virtual Environment

On Mac/Linux:

```bash
source venv/bin/activate
```

On Windows (Git Bash):

```bash
source venv/Scripts/activate
```

Your terminal prompt will change to show `(venv)`:

```text
(venv) yourname@computer:~/fastapi-todo$
```

This means the virtual environment is active.

All packages you install now go into this project only.

---

## Step 4 — Install Packages

```bash
pip install fastapi uvicorn
```

Expected output (abbreviated):

```text
Collecting fastapi
  Downloading fastapi-...
Collecting uvicorn
  Downloading uvicorn-...
Successfully installed fastapi-... uvicorn-...
```

---

## Step 5 — Create requirements.txt

`requirements.txt` records which packages your project needs.

Other developers run this file to set up their own environment.

```bash
pip freeze > requirements.txt
```

View the file:

```bash
cat requirements.txt
```

Expected output (your versions may differ):

```text
annotated-types==0.7.0
anyio==4.4.0
fastapi==0.111.0
...
uvicorn==0.30.1
```

Commit this file:

```bash
git add requirements.txt
git commit -m "Add requirements.txt with FastAPI and uvicorn"
```

---

## Step 6 — Create Folder Structure

```bash
mkdir -p app/routes
touch app/__init__.py
touch app/routes/__init__.py
```

The `__init__.py` files tell Python these folders are packages.

Check status:

```bash
git status
```

Expected output:

```text
On branch main

Untracked files:
        app/
```

Commit the structure:

```bash
git add app/
git commit -m "Create app package structure"
```

Check history:

```bash
git log --oneline
```

Expected output:

```text
d4e1f20 Create app package structure
c3d0e1f Add requirements.txt with FastAPI and uvicorn
b2c9d0e Add .gitignore for Python project
a3f8d21 Initial commit: add README
```

You have 4 commits.

Each one tells a clear story.

---

# Chapter 5 — Building the Application File by File

Now we build the actual application.

We commit after each meaningful piece.

This is how real-world development works.

---

## Create models.py

The model defines what a Todo item looks like.

Create `app/models.py`:

```python
from pydantic import BaseModel


class Todo(BaseModel):
    id: int
    title: str
    completed: bool = False
```

This defines a Todo as having:
- `id` — a number
- `title` — a text description
- `completed` — true or false (defaults to false)

Check what changed:

```bash
git status
```

Expected output:

```text
On branch main

Untracked files:
        app/models.py
```

Commit:

```bash
git add app/models.py
git commit -m "Create Todo model with id, title, and completed fields"
```

---

## Create routes/todos.py

Create `app/routes/todos.py`:

```python
from fastapi import APIRouter, HTTPException
from app.models import Todo

router = APIRouter(
    prefix="/todos",
    tags=["todos"]
)

# In-memory storage (no database needed for this project)
todos = []


@router.get("/")
def get_todos():
    return todos


@router.post("/")
def create_todo(todo: Todo):
    todos.append(todo)
    return todo


@router.get("/{todo_id}")
def get_todo(todo_id: int):
    for todo in todos:
        if todo.id == todo_id:
            return todo
    raise HTTPException(status_code=404, detail="Todo not found")


@router.delete("/{todo_id}")
def delete_todo(todo_id: int):
    global todos
    todos = [todo for todo in todos if todo.id != todo_id]
    return {"message": "Todo deleted"}
```

Commit:

```bash
git add app/routes/todos.py
git commit -m "Add CRUD routes for todos"
```

---

## Create main.py

Create `app/main.py`:

```python
from fastapi import FastAPI
from app.routes.todos import router

app = FastAPI(title="FastAPI Todo API")

app.include_router(router)


@app.get("/")
def root():
    return {"message": "Todo API is running"}
```

Commit:

```bash
git add app/main.py
git commit -m "Create FastAPI application entry point"
```

---

## Run the Application

```bash
uvicorn app.main:app --reload
```

Expected output:

```text
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

Open your browser:

```text
http://localhost:8000
```

You should see:

```json
{"message": "Todo API is running"}
```

Open the interactive docs:

```text
http://localhost:8000/docs
```

Swagger UI appears. You can test every endpoint here.

---

## Check Your History

Press `Ctrl+C` to stop the server.

```bash
git log --oneline
```

Expected output:

```text
g8h3k22 Create FastAPI application entry point
f7g2j11 Add CRUD routes for todos
e6f1i00 Create Todo model with id, title, and completed fields
d4e1f20 Create app package structure
c3d0e1f Add requirements.txt with FastAPI and uvicorn
b2c9d0e Add .gitignore for Python project
a3f8d21 Initial commit: add README
```

Seven commits.

Each one meaningful.

Each one reversible.

---

# Chapter 6 — Seeing What Changed

Before committing, always check exactly what you changed.

This habit catches mistakes before they become permanent.

---

## Make a Small Change

Open `app/main.py` and update the title:

```python
app = FastAPI(title="FastAPI Todo API v1.0")
```

Now run:

```bash
git diff
```

Expected output:

```text
diff --git a/app/main.py b/app/main.py
index 3d2e1f4..7a8b9c2 100644
--- a/app/main.py
+++ b/app/main.py
@@ -3,7 +3,7 @@ from app.routes.todos import router

-app = FastAPI(title="FastAPI Todo API")
+app = FastAPI(title="FastAPI Todo API v1.0")
```

Read this output:

```text
Lines starting with -    →    lines you removed (old)
Lines starting with +    →    lines you added (new)
Lines with no symbol     →    lines that did not change
```

`git diff` answers the question: **what exactly did I change since my last commit?**

---

## Run git diff Before Every Commit

This is one of the most important Git habits.

Before you commit, ask yourself:

> Are these exactly the changes I intended?

If yes, stage and commit.

If no, fix the mistake first.

---

## Commit the Change

```bash
git add app/main.py
git commit -m "Update API title to include version number"
```

---

## git diff With Staged Files

Once you run `git add`, `git diff` shows nothing.

To see what is staged:

```bash
git diff --staged
```

This is useful when you want to review what you are about to commit.

---

# Chapter 7 — Branches

This chapter teaches one of the most important Git concepts.

---

## The Problem

Your application works.

Now you want to add a new feature: a way to mark a Todo as completed.

You could edit the code directly on `main`.

But what if you break something?

What if the feature takes several days?

Meanwhile, your teammate needs to fix a bug.

If you are both working on `main`, you will constantly conflict with each other.

---

## The Solution: Branches

A branch is an isolated copy of your project.

You can make as many changes as you want on a branch.

The original `main` branch stays untouched.

When your feature is ready, you merge it back.

```text
main branch:       A ── B ── C ──────────────── F (merge)
                              \                 /
feature branch:                D ── E ──────────
```

---

## Real World Analogy

Imagine a science experiment.

You have a working formula.

Before testing a new ingredient, you make a copy of the formula.

You test the new ingredient on the copy.

If it works, you update the original.

If it fails, the original is safe.

Branches work exactly the same way.

---

## Create a Branch

Let's create a branch for adding a "complete todo" feature:

```bash
git branch feature/complete-todo
```

View all branches:

```bash
git branch
```

Expected output:

```text
  feature/complete-todo
* main
```

The `*` shows which branch you are currently on.

You created the branch but you are still on `main`.

---

## Switch to the Branch

```bash
git switch feature/complete-todo
```

Expected output:

```text
Switched to branch 'feature/complete-todo'
```

Verify:

```bash
git branch
```

Expected output:

```text
* feature/complete-todo
  main
```

You are now on the feature branch.

---

## Shortcut: Create and Switch in One Command

Instead of two commands, you can do both at once:

```bash
git switch -c feature/branch-name
```

The `-c` flag means "create".

This is the most common way branches are created in practice.

---

## Build the Feature

Add a new endpoint to `app/routes/todos.py` that marks a todo as completed.

Open `app/routes/todos.py` and add this function at the bottom:

```python
@router.patch("/{todo_id}/complete")
def complete_todo(todo_id: int):
    for todo in todos:
        if todo.id == todo_id:
            todo.completed = True
            return todo
    raise HTTPException(status_code=404, detail="Todo not found")
```

Check what changed:

```bash
git diff
```

The output shows only the new function.

Commit:

```bash
git add app/routes/todos.py
git commit -m "Add PATCH endpoint to mark todo as completed"
```

---

## Verify Branch Isolation

This is the most important part of this chapter.

Switch back to main:

```bash
git switch main
```

Open `app/routes/todos.py` and look at the bottom of the file.

The `complete_todo` function is gone.

Your feature does not exist on `main`.

This is branch isolation working correctly.

Switch back:

```bash
git switch feature/complete-todo
```

The function is back.

---

## View the Difference Between Branches

```bash
git log --oneline main..feature/complete-todo
```

Expected output:

```text
h9i4l33 Add PATCH endpoint to mark todo as completed
```

This shows commits that exist on your feature branch but NOT on main.

---

# Chapter 8 — Merging

Your feature works.

Now bring it into `main`.

---

## What is Merging?

Merging combines the history of two branches.

```text
Before merge:

main:              A ── B ── C
                              \
feature:                       D

After merge:

main:              A ── B ── C ── M
                              \   /
feature:                       D
```

`M` is the merge commit.

---

## Merge the Feature Branch

First, switch to the branch you want to merge INTO:

```bash
git switch main
```

Then merge:

```bash
git merge feature/complete-todo
```

Expected output:

```text
Updating g8h3k22..h9i4l33
Fast-forward
 app/routes/todos.py | 7 +++++++
 1 file changed, 7 insertions(+)
```

"Fast-forward" means Git simply moved `main` forward to include the new commit.

This happens when `main` has no new commits since the branch was created.

---

## Verify the Merge

```bash
git log --oneline
```

Expected output:

```text
h9i4l33 Add PATCH endpoint to mark todo as completed
g8h3k22 Update API title to include version number
...
```

The feature branch commit is now in `main`.

---

## Clean Up the Branch

After merging, delete the feature branch:

```bash
git branch -d feature/complete-todo
```

Expected output:

```text
Deleted branch feature/complete-todo (was h9i4l33).
```

The branch is gone.

The commits are not.

They are part of `main` now.

---

## The Full Branch Workflow

This is the workflow used by most professional development teams:

```text
1. Create branch        git switch -c feature/name
2. Make changes         (edit files)
3. Check changes        git diff
4. Stage changes        git add .
5. Commit               git commit -m "message"
6. Repeat 2-5           (until feature is complete)
7. Switch to main       git switch main
8. Merge                git merge feature/name
9. Delete branch        git branch -d feature/name
```

Practice this until it feels natural.

---

# Chapter 9 — Practice: Full Branch Workflow

Let's practice the complete workflow from scratch.

---

## Task: Add a Search Feature

Your task: add an endpoint to search todos by title.

---

### Step 1 — Create branch

```bash
git switch -c feature/search-todos
```

Verify:

```bash
git branch
```

Expected output:

```text
* feature/search-todos
  main
```

---

### Step 2 — Add the endpoint

Open `app/routes/todos.py` and add at the bottom:

```python
@router.get("/search/")
def search_todos(title: str):
    results = [
        todo for todo in todos
        if title.lower() in todo.title.lower()
    ]
    return results
```

---

### Step 3 — Check what changed

```bash
git diff
```

Review the output.

Does it show only the new function?

Good.

---

### Step 4 — Stage and commit

```bash
git add app/routes/todos.py
git commit -m "Add search endpoint to filter todos by title"
```

---

### Step 5 — Merge

```bash
git switch main
git merge feature/search-todos
git branch -d feature/search-todos
```

---

### Step 6 — Verify

```bash
git log --oneline
```

Expected output shows your new commit is in main.

---

# Chapter 10 — Merge Conflicts

Every developer who uses Git will eventually see a merge conflict.

Most beginners panic when this happens.

You will not panic.

Because right now, we will create a conflict on purpose and resolve it step by step.

---

## What Causes a Conflict?

A conflict happens when:

1. Two people change the **same line** in the same file
2. Git cannot automatically decide which change to keep

Git does not make that decision for you.

It asks you to decide.

---

## Create the Conflict on Purpose

We will simulate two people changing the same line.

---

### Step 1 — Create a branch and make a change

```bash
git switch -c feature/update-model
```

Open `app/models.py` and add a `priority` field:

```python
from pydantic import BaseModel


class Todo(BaseModel):
    id: int
    title: str
    completed: bool = False
    priority: int = 1
```

Commit:

```bash
git add app/models.py
git commit -m "Add priority field to Todo model"
```

---

### Step 2 — Switch to main and make a different change on the same file

```bash
git switch main
```

Open `app/models.py` and add a `description` field:

```python
from pydantic import BaseModel


class Todo(BaseModel):
    id: int
    title: str
    completed: bool = False
    description: str = ""
```

Commit:

```bash
git add app/models.py
git commit -m "Add description field to Todo model"
```

---

### Step 3 — Try to merge

```bash
git merge feature/update-model
```

Expected output:

```text
Auto-merging app/models.py
CONFLICT (content): Merge conflict in app/models.py
Automatic merge failed; fix conflicts and then commit the result.
```

Git found a conflict.

This is normal.

Do not panic.

---

### Step 4 — Understand what Git did

Open `app/models.py` in your editor.

You will see something like this:

```python
from pydantic import BaseModel


class Todo(BaseModel):
    id: int
    title: str
    completed: bool = False
<<<<<<< HEAD
    description: str = ""
=======
    priority: int = 1
>>>>>>> feature/update-model
```

Let's read this together:

```text
<<<<<<< HEAD
    description: str = ""
=======
```

This section is what EXISTS on your current branch (main).
`HEAD` means "the branch you are currently on".

```text
=======
    priority: int = 1
>>>>>>> feature/update-model
```

This section is what CAME IN from the branch you are merging.

The `=======` line divides the two versions.

---

### Step 5 — Decide what to keep

In this case, we want BOTH fields.

Edit the file to look like this:

```python
from pydantic import BaseModel


class Todo(BaseModel):
    id: int
    title: str
    completed: bool = False
    description: str = ""
    priority: int = 1
```

Important: remove ALL conflict markers:
- `<<<<<<< HEAD`
- `=======`
- `>>>>>>> feature/update-model`

The file should be clean Python code with no markers.

---

### Step 6 — Mark the conflict as resolved

```bash
git add app/models.py
```

Check status:

```bash
git status
```

Expected output:

```text
On branch main
All conflicts fixed but you are still merging.
  (use "git commit" to conclude merge)

Changes to be committed:
        modified:   app/models.py
```

---

### Step 7 — Complete the merge

```bash
git commit -m "Merge feature/update-model: add description and priority fields"
```

Expected output:

```text
[main i5j7k88] Merge feature/update-model: add description and priority fields
```

---

### Step 8 — Verify

```bash
git log --oneline
```

Expected output:

```text
i5j7k88 Merge feature/update-model: add description and priority fields
j6k8l99 Add description field to Todo model
h9i4l33 Add PATCH endpoint to mark todo as completed
...
```

The conflict is resolved.

The history shows exactly what happened.

---

## Conflict Resolution Summary

```text
1. Git tells you there is a conflict
2. Open the conflicting file
3. Find the <<<<<<<, =======, >>>>>>> markers
4. Decide what the file should look like
5. Remove ALL markers
6. Save the file
7. git add the file
8. git commit to complete the merge
```

---

# Chapter 11 — Undoing Mistakes

This chapter might be the most valuable in the book.

Every developer makes mistakes.

Git lets you undo almost anything.

---

## Situation 1 — You edited a file and want to discard the changes

You have not staged the change yet.

Make a mistake:

```python
# Open app/main.py and add this invalid line somewhere
this is completely broken code
```

Check status:

```bash
git status
```

Expected output:

```text
Changes not staged for commit:
        modified:   app/main.py
```

Discard the change:

```bash
git restore app/main.py
```

Check the file.

The invalid line is gone.

Git restored the file to the last committed version.

---

**Note:** You may see older tutorials use `git checkout -- filename`.

That is the old way.

`git restore` is the modern command that does the same thing.

Both work.

---

## Situation 2 — You staged a file and want to unstage it

You added a file to the staging area but changed your mind.

```bash
git add app/main.py
git status
```

Expected output:

```text
Changes to be committed:
        modified:   app/main.py
```

Unstage:

```bash
git restore --staged app/main.py
```

Check status:

```bash
git status
```

Expected output:

```text
Changes not staged for commit:
        modified:   app/main.py
```

The file is back in the Working Directory.

The change is still there.

Only the staging was reversed.

---

## Situation 3 — You committed a mistake and want to fix the commit message

```bash
git commit --amend -m "Corrected commit message"
```

This replaces the most recent commit message.

**Only use this on commits you have NOT pushed yet.**

---

## Situation 4 — You committed a mistake and want to undo the commit

You want to undo the last commit but KEEP your file changes:

```bash
git reset HEAD~1
```

What this does:
- Moves the commit back to "not committed"
- Keeps your file changes in the Working Directory
- You can fix the code and commit again

---

## Situation 5 — You want to go back to how a specific old commit looked

First, find the commit ID:

```bash
git log --oneline
```

```text
i5j7k88 Merge feature branches
h9i4l33 Add PATCH endpoint
g8h3k22 Update API title
...
a3f8d21 Initial commit: add README
```

Check out what the project looked like at that commit:

```bash
git show g8h3k22:app/main.py
```

This shows the file as it was at that commit.

Git does not change your project.

It just shows you the old content.

---

## Undo Cheat Sheet

| Situation | Command |
|---|---|
| Discard unsaved changes in a file | `git restore filename` |
| Unstage a file | `git restore --staged filename` |
| Fix last commit message | `git commit --amend -m "new message"` |
| Undo last commit (keep changes) | `git reset HEAD~1` |
| View an old file without changing anything | `git show COMMIT:filepath` |

---

# Chapter 12 — Reading History Like a Pro

Git history tells the story of your project.

Learning to read it is an important skill.

---

## The Basic Log

```bash
git log
```

Shows full details of every commit.

Press `q` to quit the log view.

---

## The Compact Log

```bash
git log --oneline
```

Expected output:

```text
i5j7k88 (HEAD -> main) Merge feature branches
j6k8l99 Add description field to Todo model
h9i4l33 Add PATCH endpoint to mark todo as completed
g8h3k22 Update API title to include version number
f8g2i44 Create FastAPI application entry point
e6f1i00 Add CRUD routes for todos
d5e0h11 Create Todo model with fields
c3d0e1f Add requirements.txt with FastAPI and uvicorn
b2c9d0e Add .gitignore for Python project
a3f8d21 Initial commit: add README
```

---

## The Graph Log

```bash
git log --oneline --graph --all
```

Expected output:

```text
*   i5j7k88 (HEAD -> main) Merge feature branches
|\
| * j6k8l99 (feature/update-model) Add priority field
* | k7l9m00 Add description field to Todo model
|/
* h9i4l33 Add PATCH endpoint to mark todo as completed
* g8h3k22 Update API title
* f8g2i44 Create FastAPI application entry point
...
```

The `*` represents a commit.

The lines show how branches connected.

---

## Search the Log

Find commits that mention a specific word:

```bash
git log --oneline --grep="Todo"
```

Expected output:

```text
h9i4l33 Add PATCH endpoint to mark todo as completed
e6f1i00 Add CRUD routes for todos
d5e0h11 Create Todo model with fields
```

Only commits whose messages contain "Todo" appear.

---

## See What Changed in a Specific Commit

```bash
git show h9i4l33
```

This shows the full diff of exactly what changed in that commit.

---

## See Who Changed a Line

```bash
git blame app/routes/todos.py
```

This shows every line of the file and which commit last changed it.

Very useful when debugging: "who wrote this line and why?"

---

# Chapter 13 — Pushing to GitHub

So far, your Git history lives only on your computer.

If your computer crashes, you lose everything.

GitHub is a cloud backup for your Git repository.

It also allows teams to collaborate.

---

## Create a GitHub Repository

1. Go to https://github.com
2. Click the **+** button → **New repository**
3. Repository name: `fastapi-todo`
4. Keep it **Public** or **Private** (your choice)
5. **Do NOT** initialize with README, .gitignore, or license
   (we already have these)
6. Click **Create repository**

GitHub shows you instructions.

We will use the "push an existing repository" option.

---

## Connect Your Local Repository to GitHub

GitHub will give you a URL that looks like:

```text
https://github.com/yourusername/fastapi-todo.git
```

Run:

```bash
git remote add origin https://github.com/yourusername/fastapi-todo.git
```

This command:
- Adds a "remote" connection called `origin`
- `origin` is the standard name for your main remote
- Points to your GitHub repository

Verify:

```bash
git remote -v
```

Expected output:

```text
origin  https://github.com/yourusername/fastapi-todo.git (fetch)
origin  https://github.com/yourusername/fastapi-todo.git (push)
```

---

## Push Your Work

```bash
git push -u origin main
```

Expected output:

```text
Enumerating objects: 35, done.
Counting objects: 100% (35/35), done.
Writing objects: 100% (35/35), 4.12 KiB | 4.12 MiB/s, done.
Total 35 (delta 0), reused 0 (delta 0)
To https://github.com/yourusername/fastapi-todo.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

The `-u origin main` part:
- `-u` sets `origin main` as the default
- After this, you can just type `git push` for future pushes

Go to your GitHub repository in the browser.

You will see all your files and all your commits.

---

## The Daily Push Habit

At the end of every working session:

```bash
git push
```

This backs up your work to GitHub.

This is one of the most important habits to build.

---

## Push vs Pull

```text
git push    →    send your commits to GitHub
git pull    →    get new commits from GitHub
```

When working in a team, always `git pull` before starting work.

This gets you the latest changes from your teammates.

---

# Chapter 14 — Daily Git Habits of Professional Engineers

This chapter summarizes the habits that separate beginners from professionals.

---

## Habit 1 — Check status constantly

```bash
git status
```

Run this before and after every action.

It tells you exactly where you are.

---

## Habit 2 — Check diff before committing

```bash
git diff
```

Always review exactly what changed before staging.

Did you accidentally add a debug statement?

Did you change something you didn't mean to?

`git diff` catches these mistakes.

---

## Habit 3 — Write meaningful commit messages

Bad:

```bash
git commit -m "fix"
```

Good:

```bash
git commit -m "Fix 404 error when searching todos with empty string"
```

Your future self will thank you.

---

## Habit 4 — Commit small and often

A commit should represent one logical change.

Bad:

```text
"Add user auth, fix todos bug, update README, refactor models"
```

Good:

```text
Commit 1: "Add user authentication endpoints"
Commit 2: "Fix 404 error in todos search"
Commit 3: "Update README with setup instructions"
Commit 4: "Refactor Todo model to use enum for priority"
```

Small commits are easier to understand, review, and undo.

---

## Habit 5 — Never commit directly to main on team projects

Always create a branch.

Make your changes.

Merge when ready.

```text
main branch should always contain working code.
```

---

## Habit 6 — Use .gitignore from the start

Create `.gitignore` before your first commit.

Never commit:
- Virtual environments
- Secret keys or passwords
- Build artifacts
- Editor settings

---

## Habit 7 — Push at the end of every session

```bash
git push
```

Even if the work is not finished.

Unfinished code on GitHub is better than finished code on a crashed hard drive.

---

## The Daily Workflow

```text
Start of day:
  git pull                    ← get latest from GitHub

During work:
  (make changes)
  git status                  ← check what changed
  git diff                    ← review exact changes
  git add .                   ← stage changes
  git commit -m "message"     ← save snapshot

End of day:
  git push                    ← back up to GitHub
```

---

# Chapter 15 — Final Practice Project

Complete this project without looking at the book.

If you get stuck, look back. That is fine.

The goal is to practice the complete workflow.

---

## The Task

Add three new features to the Todo API, each on its own branch.

---

### Feature 1: Get completed todos

Branch name: `feature/get-completed`

Add this endpoint to `app/routes/todos.py`:

```python
@router.get("/completed/")
def get_completed_todos():
    return [todo for todo in todos if todo.completed]
```

Full workflow:
1. `git switch -c feature/get-completed`
2. Add the code
3. `git diff` to review
4. `git add` and `git commit` with a good message
5. `git switch main`
6. `git merge feature/get-completed`
7. `git branch -d feature/get-completed`
8. `git push`

---

### Feature 2: Get pending todos

Branch name: `feature/get-pending`

Add this endpoint:

```python
@router.get("/pending/")
def get_pending_todos():
    return [todo for todo in todos if not todo.completed]
```

Use the same full workflow as Feature 1.

---

### Feature 3: Count todos

Branch name: `feature/todo-stats`

Add this endpoint:

```python
@router.get("/stats/")
def get_stats():
    total = len(todos)
    completed = len([t for t in todos if t.completed])
    pending = total - completed
    return {
        "total": total,
        "completed": completed,
        "pending": pending
    }
```

Use the same full workflow.

---

## After All Three Features

Run:

```bash
git log --oneline --graph --all
```

You should see a history that shows all three branches were created and merged.

Run:

```bash
git push
```

Go to GitHub and verify all your commits are there.

---

# Book 1 Final Interview Questions

These are real interview questions asked at junior developer and DevOps engineer interviews.

Read each question.

Try to answer it in your own words before reading the answer.

---

**Q1: What problem does Git solve?**

Answer: Git solves the problem of losing work, accidentally overwriting code, and making collaboration between developers difficult. It keeps a complete history of every change so you can go back to any point in time.

---

**Q2: What is the difference between the Working Directory, Staging Area, and Repository?**

Answer: The Working Directory is where you edit files. The Staging Area is where you choose which changes to include in the next commit (like a shopping cart). The Repository is permanent history — every commit is saved here forever.

---

**Q3: Why use `git add` instead of committing everything automatically?**

Answer: `git add` gives you control over what goes into each commit. You might change three files but only want to commit two of them. The Staging Area lets you create clean, focused commits that tell a clear story.

---

**Q4: What is a branch and why do we use them?**

Answer: A branch is an isolated copy of your project. You create a branch to work on a new feature or fix without affecting the main codebase. When the work is complete, you merge it back. This lets multiple people work on different things simultaneously without interfering.

---

**Q5: What causes a merge conflict?**

Answer: A merge conflict happens when two branches change the same line in the same file. Git cannot automatically decide which version to keep, so it asks you to resolve it manually.

---

**Q6: What does `git restore filename` do?**

Answer: It discards unsaved changes in a file and returns it to the last committed version. It is used when you made a mistake and want to start over on that file.

---

**Q7: What is the difference between `git log` and `git log --oneline`?**

Answer: `git log` shows the full details of each commit including the author, date, and full message. `git log --oneline` shows a compact one-line summary. `--oneline` is used more often for quickly scanning history.

---

**Q8: Why should developers avoid committing directly to main?**

Answer: The main branch should always contain working, stable code. If you commit directly to main and introduce a bug, it immediately affects everyone. Using branches keeps main clean and gives you a safe place to experiment.

---

**Q9: What is `.gitignore` and what goes in it?**

Answer: `.gitignore` is a file that tells Git which files and folders to never track. You put things in it that should not be in the repository: virtual environments, compiled files, secret keys, and editor settings.

---

**Q10: What does `git push` do?**

Answer: `git push` sends your local commits to a remote repository like GitHub. It backs up your work and makes it available to teammates.

---

# You Are Ready for Book 2

If you completed the final practice project and can answer the interview questions without looking at your notes, you are ready.

Book 2 covers:

- Collaborating on GitHub with Pull Requests
- Reviewing code
- Working with teammates
- Handling remote branches
- Rebasing
- Git in CI/CD pipelines
- Git in DevOps workflows

The foundation you built here supports everything in Book 2.

---

# Quick Reference Card

Cut this out and keep it nearby.

```text
SETUP
git config --global user.name "Name"
git config --global user.email "email"
git init

DAILY COMMANDS
git status              check what's happening
git diff                see exact changes
git add .               stage all changes
git add filename        stage one file
git commit -m "msg"     save snapshot
git log --oneline       view history
git push                back up to GitHub
git pull                get latest from GitHub

BRANCHES
git branch              list branches
git switch -c name      create and switch
git switch name         switch to branch
git merge name          merge branch into current
git branch -d name      delete branch

UNDO
git restore filename    discard file changes
git restore --staged f  unstage a file
git reset HEAD~1        undo last commit (keep changes)

INSPECT
git show COMMIT         see what changed in a commit
git blame filename      see who changed each line
git log --graph --all   visual branch history
```