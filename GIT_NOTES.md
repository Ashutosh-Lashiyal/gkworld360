# Git — My Learning Notes

> A living cheat-sheet of everything I'm learning about Git, in plain English.
> Claude keeps this updated as we learn more. Newest concepts get added over time.
> _Last updated: 2 Jul 2026_

---

## The big mental model — Git's 3 areas

Every change moves through three areas:

```
1. Working Directory  →  2. Staging Area  →  3. History (commits)
   (files I've edited)      (files I've           (permanent
                             picked to save)        saved snapshots)
```

- `git add`  moves changes from area 1 → area 2 ("include these")
- `git commit` saves everything in area 2 → area 3 (a permanent checkpoint)

Analogy: packing a box. `add` = put items in the box. `commit` = seal & label it.

---

## Commit vs Push vs Deploy (these are DIFFERENT things)

| Action | What it does | Where the code goes |
|---|---|---|
| `git commit` | Saves a snapshot to history | **Local** — my computer only |
| `git push` | Uploads commits to GitHub | GitHub (cloud backup/sharing) |
| Deploy (Vercel) | Runs the code as a live website | Live on the internet |

Flow: **commit (local) → push (GitHub) → Vercel deploys (live).**
Committing does NOT put anything online. It's just a local checkpoint (like a save point in a game).

---

## Tracked vs Untracked files

- **Tracked** = files Git already knows (were in a previous commit). Git watches them.
- **Untracked** = brand-new files Git has never seen. It lists them so I can confirm I want them saved.

`git status` groups files under three headings:

| Heading | Means | Colour |
|---|---|---|
| Changes to be committed | staged, ready to save | green |
| Changes not staged for commit | tracked files I edited | red |
| Untracked files | brand-new files Git hasn't seen | red |

`git add` turns red → green.

---

## Staging: everything vs specific files

```bash
git add .                    # stage EVERYTHING
git add payload.config.ts    # stage one specific file
git add collections/         # stage a whole folder
git add file1.ts file2.ts    # stage several specific files
git restore --staged file    # UN-stage a file (green → red), keeps my edits
```

Why stage selectively? To make **atomic commits** — each commit = one logical change.
Clean history, and easy to undo one thing without undoing another.

---

## The golden safety rule — NEVER commit secrets

Files with passwords / API keys (like `.env.local`) must never be committed.
They're protected by `.gitignore` (our `.gitignore` has a `.env*` line, so all
`.env` files are skipped automatically). Check a file is ignored with:

```bash
git check-ignore .env.local   # prints the filename if it's safely ignored
```

---

## Branches ("cutting a branch")

A **branch** is a separate, parallel line of code where I can work without touching
the main version.

```
main:     ●───●───●───────────●   (safe, always working)
                   \          /
feature:            ●───●───●     (experiment here, then merge back)
```

- `main` = the official, working version (the trunk).
- "Cut a branch" = create a new branch to work on a feature safely.
- If good → **merge** it back into main. If bad → throw it away; main was untouched.

```bash
git switch -c my-new-feature   # create a new branch AND switch to it (modern)
# older equivalent: git checkout -b my-new-feature
git switch main                # switch back to the main branch
git branch                     # list branches (star = the one I'm on)
```

Solo + first commits: committing straight to `main` is fine.
Later / features / teams: cut a branch per feature (good habit).

---

## Quick command cheat-sheet

```bash
git status                 # what's changed / staged
git add .                  # stage all changes
git add <file>             # stage one file
git restore --staged <f>   # unstage a file
git commit -m "message"    # save a snapshot with a description
git log                    # view commit history (newest first)
git log --oneline          # compact one-line-per-commit view
git switch -c <name>       # create + switch to a new branch
git switch <name>          # switch to an existing branch
git branch                 # list branches
```

---

<!-- Claude: append new git concepts below as we learn them, keeping the beginner-friendly
     tone and updating the "Last updated" date at the top. -->
