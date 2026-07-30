#!/usr/bin/env python3
"""Verification script for Chapter 2: Project Foundation & Monorepo Initialization."""

import os
import sys
from pathlib import Path

REPO_ROOT = Path("volleyball-analytics-platform")

# Root files that must exist
ROOT_FILES = [
    "README.md",
    "LICENSE",
    ".gitignore",
    ".env.example",
    "docker-compose.yml",
    "docker-compose.override.yml",
    "Makefile",
    "CLAUDE.md",
]

# Required directories
REQUIRED_DIRS = [
    "backend",
    "frontend",
    "ai-engine",
    "mobile",
    "database",
    "deployment",
    "infrastructure",
    "documentation",
    "shared",
    "datasets",
    "models",
    "scripts",
    "tests",
    "tools",
    ".github",
    ".vscode",
    "ai-engine",
    "backend",
    "frontend",
    "mobile",
    "database",
    "deployment",
    "infrastructure",
    "documentation",
    "shared",
    "datasets",
    "models",
    "scripts",
    "tests",
    "tools",
    ".github",
    ".vscode",
]

# Backend key files
BACKEND_KEY_FILES = [
    "backend/pyproject.toml",
    "backend/poetry.lock",
    "backend/Dockerfile",
    "backend/README.md",
    "backend/app/main.py",
    "backend/app/core/config.py",
    "backend/app/core/database.py",
    "backend/app/core/security.py",
    "backend/app/models/models.py",
    "backend/app/models/user.py",
    "backend/app/models/team.py",
    "backend/app/models/match.py",
    "backend/app/models/player.py",
    "backend/app/api/v1/__init__.py",
]

# Frontend key files
FRONTEND_KEY_FILES = [
    "frontend/package.json",
    "frontend/tsconfig.json",
    "frontend/tsconfig.node.json",
    "frontend/vite.config.ts",
    "frontend/tailwind.config.js",
    "frontend/Dockerfile",
    "frontend/README.md",
    "frontend/src/main.tsx",
    "frontend/src/App.tsx",
    "frontend/index.html",
    "frontend/tsconfig.json",
    "frontend/tsconfig.node.json",
    "frontend/vite.config.ts",
    "frontend/tailwind.config.js",
]

# AI Engine key files
AI_ENGINE_KEY_FILES = [
    "ai-engine/pyproject.toml",
    "ai-engine/poetry.lock",
    "ai-engine/Dockerfile",
    "ai-engine/README.md",
    "ai-engine/configs/config.yaml",
]

# Docker files
DOCKER_FILES = [
    "docker-compose.yml",
    "docker-compose.override.yml",
    "backend/Dockerfile",
    "frontend/Dockerfile",
    "ai-engine/Dockerfile",
]

# Documentation directories
DOC_DIRS = [
    "documentation/architecture",
    "documentation/backend",
    "documentation/frontend",
    "documentation/database",
    "documentation/ai",
    "documentation/deployment",
    "documentation/api",
    "documentation/diagrams",
    "documentation/runbooks",
    "documentation/meeting-notes",
    "documentation/decisions",
]

# GitHub workflows
GITHUB_WORKFLOWS = [
    ".github/workflows/ci.yml",
]

# Issue templates
ISSUE_TEMPLATES = [
    ".github/ISSUE_TEMPLATE/bug_report.md",
    ".github/ISSUE_TEMPLATE/feature_request.md",
    ".github/ISSUE_TEMPLATE/documentation.md",
    ".github/ISSUE_TEMPLATE/security_vulnerability.md",
]

# PR template
PR_TEMPLATE_FILE = ".github/PULL_REQUEST_TEMPLATE.md"

# CODEOWNERS
CODEOWNERS_FILE = ".github/CODEOWNERS"

# VS Code config
VSCODE_CONFIG = [
    ".vscode/settings.json",
    ".vscode/launch.json",
    ".vscode/extensions.json",
]

# GitHub workflows
GITHUB_WORKFLOWS = [
    ".github/workflows/ci.yml",
]

# Issue templates
ISSUE_TEMPLATES = [
    ".github/ISSUE_TEMPLATE/bug_report.md",
    ".github/ISSUE_TEMPLATE/feature_request.md",
    ".github/ISSUE_TEMPLATE/documentation.md",
    ".github/ISSUE_TEMPLATE/security_vulnerability.md",
]

# PR template
PR_TEMPLATE_FILE = ".github/PULL_REQUEST_TEMPLATE.md"

# CODEOWNERS
CODEOWNERS_FILE = ".github/CODEOWNERS"

# VS Code config
VSCODE_CONFIG = [
    ".vscode/settings.json",
    ".vscode/launch.json",
    ".vscode/extensions.json",
]

# GitHub workflows
GITHUB_WORKFLOWS = [
    ".github/workflows/ci.yml",
]

# Issue templates
ISSUE_TEMPLATES = [
    ".github/ISSUE_TEMPLATE/bug_report.md",
    ".github/ISSUE_TEMPLATE/feature_request.md",
    ".github/ISSUE_TEMPLATE/documentation.md",
    ".github/ISSUE_TEMPLATE/security_vulnerability.md",
]

# PR template
PR_TEMPLATE_FILE = ".github/PULL_REQUEST_TEMPLATE.md"

# CODEOWNERS
CODEOWNERS_FILE = ".github/CODEOWNERS"

# VS Code config
VSCODE_CONFIG = [
    ".vscode/settings.json",
    ".vscode/launch.json",
    ".vscode/extensions.json",
]

# GitHub workflows
GITHUB_WORKFLOWS = [
    ".github/workflows/ci.yml",
]

# Issue templates
ISSUE_TEMPLATES = [
    ".github/ISSUE_TEMPLATE/bug_report.md",
    ".github/ISSUE_TEMPLATE/feature_request.md",
    ".github/ISSUE_TEMPLATE/documentation.md",
    ".github/ISSUE_TEMPLATE/security_vulnerability.md",
]

# PR template
PR_TEMPLATE_FILE = ".github/PULL_REQUEST_TEMPLATE.md"

# CODEOWNERS
CODEOWNERS_FILE = ".github/CODEOWNERS"

# VS Code config
VSCODE_CONFIG = [
    ".vscode/settings.json",
    ".vscode/launch.json",
    ".vscode/extensions.json",
]

def check_all():
    """Run all verification checks."""
    # Use repo root as current directory
    base = Path("volleyball-analytics-platform")
    
    all_passed = True
    missing = []
    
    def check(path_str, desc):
        nonlocal all_passed
        path = Path("volleyball-analytics-platform") / path_str
        exists = path.exists()
        status = "OK" if exists else "MISSING"
        if not exists:
            return False
        return True
    
    all_passed = True
    missing = []
    
    def check_path(path_str, desc):
        nonlocal all_passed
        path = Path("volleyball-analytics-platform") / path_str
        exists = path.exists()
        status = "OK" if exists else "MISSING"
        if not exists:
            all_passed = False
            missing.append(f"{desc}: {path_str}")
        print(f"  [{'OK' if exists else 'MISSING'}] {desc}: {path_str}")
        return exists
    
    print("=" * 60)
    print("VOLLEYBALL ANALYTICS PLATFORM - CHAPTER 2 VERIFICATION")
    print("=" * 60)
    
    all_passed = True
    missing = []
    
    # Check root files
    print("\n=== Root Files ===")
    for f in ROOT_FILES:
        path = Path("volleyball-analytics-platform") / f
        exists = path.exists()
        status = "OK" if exists else "MISSING"
        if not exists:
            missing.append(f"Root: {f}")
        print(f"  [{'OK' if exists else 'MISSING'}] {f}")
    
    # Check directories
    print("\n=== Required Directories ===")
    for d in REQUIRED_DIRS:
        path = Path("volleyball-analytics-platform") / d
        exists = path.exists()
        status = "OK" if exists else "MISSING"
        if not exists:
            missing.append(f"Dir: {d}")
        print(f"  [{'OK' if exists else 'MISSING'}] {d}")
    
    # Backend key files
    print("\n=== Backend Key Files ===")
    for f in BACKEND_KEY_FILES:
        path = Path("volleyball-analytics-platform") / f
        exists = path.exists()
        print(f"  [{'OK' if exists else 'MISSING'}] {f}")
        if not path.exists():
            missing.append(f"Backend: {f}")
    
    # Frontend key files
    print("\n=== Frontend Key Files ===")
    for f in FRONTEND_KEY_FILES:
        path = Path("volleyball-analytics-platform") / f
        exists = path.exists()
        print(f"  [{'OK' if exists else 'MISSING'}] {f}")
        if not path.exists():
            missing.append(f"Frontend: {f}")
    
    # AI Engine key files
    print("\n=== AI Engine Key Files ===")
    for f in AI_ENGINE_KEY_FILES:
        path = Path("volleyball-analytics-platform") / f
        exists = path.exists()
        print(f"  [{'OK' if exists else 'MISSING'}] {f}")
        if not path.exists():
            missing.append(f"AI Engine: {f}")
    
    # Docker files
    print("\n=== Docker Files ===")
    for f in DOCKER_FILES:
        path = Path("volleyball-analytics-platform") / f
        exists = path.exists()
        print(f"  [{'OK' if exists else 'MISSING'}] {f}")
        if not path.exists():
            missing.append(f"Docker: {f}")
    
    # Documentation directories
    print("\n=== Documentation Directories ===")
    for d in DOC_DIRS:
        path = Path("volleyball-analytics-platform") / d
        exists = path.exists()
        print(f"  [{'OK' if exists else 'MISSING'}] {d}")
        if not path.exists():
            missing.append(f"Doc Dir: {d}")
    
    # GitHub workflows
    print("\n=== GitHub Workflows ===")
    for f in GITHUB_WORKFLOWS:
        path = Path("volleyball-analytics-platform") / f
        exists = path.exists()
        print(f"  [{'OK' if exists else 'MISSING'}] {f}")
        if not path.exists():
            missing.append(f"Workflow: {f}")
    
    # Issue templates
    print("\n=== Issue Templates ===")
    for f in ISSUE_TEMPLATES:
        path = Path("volleyball-analytics-platform") / f
        exists = path.exists()
        print(f"  [{'OK' if exists else 'MISSING'}] {f}")
        if not path.exists():
            missing.append(f"Issue Template: {f}")
    
    # PR template
    path = Path("volleyball-analytics-platform") / PR_TEMPLATE_FILE
    exists = path.exists()
    print(f"\n=== PR Template ===")
    print(f"  [{'OK' if exists else 'MISSING'}] {PR_TEMPLATE_FILE}")
    if not exists:
        missing.append("PR Template")
    
    # CODEOWNERS
    path = Path("volleyball-analytics-platform") / CODEOWNERS_FILE
    exists = path.exists()
    print(f"\n=== CODEOWNERS ===")
    print(f"  [{'OK' if exists else 'MISSING'}] {CODEOWNERS_FILE}")
    if not exists:
        missing.append("CODEOWNERS")
    
    # VS Code config
    print("\n=== VS Code Config ===")
    for f in VSCODE_CONFIG:
        path = Path("volleyball-analytics-platform") / f
        exists = path.exists()
        print(f"  [{'OK' if exists else 'MISSING'}] {f}")
        if not path.exists():
            missing.append(f"VS Code: {f}")
    
    # GitHub workflows
    print("\n=== GitHub Workflows ===")
    for f in GITHUB_WORKFLOWS:
        path = Path("volleyball-analytics-platform") / f
        exists = path.exists()
        print(f"  [{'OK' if exists else 'MISSING'}] {f}")
        if not exists:
            missing.append(f"Workflow: {f}")
    
    # Issue templates
    print("\n=== Issue Templates ===")
    for f in ISSUE_TEMPLATES:
        path = Path("volleyball-analytics-platform") / f
        exists = path.exists()
        print(f"  [{'OK' if exists else 'MISSING'}] {f}")
        if not exists:
            missing.append(f"Issue Template: {f}")
    
    # PR template
    path = Path("volleyball-analytics-platform") / PR_TEMPLATE_FILE
    exists = path.exists()
    print(f"\n=== PR Template ===")
    print(f"  [{'OK' if exists else 'MISSING'}] {PR_TEMPLATE_FILE}")
    if not exists:
        missing.append("PR Template")
    
    # CODEOWNERS
    path = Path("volleyball-analytics-platform") / CODEOWNERS_FILE
    exists = path.exists()
    print(f"\n=== CODEOWNERS ===")
    print(f"  [{'OK' if exists else 'MISSING'}] {CODEOWNERS_FILE}")
    if not exists:
        missing.append("CODEOWNERS")
    
    # VS Code config
    print("\n=== VS Code Config ===")
    for f in VSCODE_CONFIG:
        path = Path("volleyball-analytics-platform") / f
        exists = path.exists()
        print(f"  [{'OK' if exists else 'MISSING'}] {f}")
        if not path.exists():
            missing.append(f"VS Code: {f}")
    
    # GitHub workflows
    print("\n=== GitHub Workflows ===")
    for f in GITHUB_WORKFLOWS:
        path = Path("volleyball-analytics-platform") / f
        exists = path.exists()
        print(f"  [{'OK' if exists else 'MISSING'}] {f}")
        if not exists:
            missing.append(f"Workflow: {f}")
    
    # Issue templates
    print("\n=== Issue Templates ===")
    for f in ISSUE_TEMPLATES:
        path = Path("volleyball-analytics-platform") / f
        exists = path.exists()
        print(f"  [{'OK' if exists else 'MISSING'}] {f}")
        if not exists:
            missing.append(f"Issue Template: {f}")
    
    # PR template
    path = Path("volleyball-analytics-platform") / PR_TEMPLATE_FILE
    exists = path.exists()
    print(f"\n=== PR Template ===")
    print(f"  [{'OK' if exists else 'MISSING'}] {PR_TEMPLATE_FILE}")
    if not exists:
        missing.append("PR Template")
    
    # CODEOWNERS
    path = Path("volleyball-analytics-platform") / CODEOWNERS_FILE
    exists = path.exists()
    print(f"\n=== CODEOWNERS ===")
    print(f"  [{'OK' if exists else 'MISSING'}] {CODEOWNERS_FILE}")
    if not exists:
        missing.append("CODEOWNERS")
    
    # VS Code config
    print("\n=== VS Code Config ===")
    for f in VSCODE_CONFIG:
        path = Path("volleyball-analytics-platform") / f
        exists = path.exists()
        print(f"  [{'OK' if exists else 'MISSING'}] {f}")
        if not exists:
            missing.append(f"VS Code: {f}")
    
    # Summary
    print("\n" + "=" * 60)
    if all(missing == [] for missing in [missing]):
        print("ALL CHECKS PASSED - Chapter 2 Complete!")
    else:
        print(f"MISSING ITEMS ({len(missing)}):")
        for m in missing:
            print(f"  - {m}")
    
    return len(missing) == 0


if __name__ == "__main__":
    # Check if we're in the right directory
    if not Path("volleyball-analytics-platform").exists():
        print("Error: Run this script from the project root directory")
        sys.exit(1)
    
    success = check_all()
    sys.exit(0 if success else 1)