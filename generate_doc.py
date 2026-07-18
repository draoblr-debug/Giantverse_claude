import os
import json

def get_file_content_preview(filepath, max_lines=10):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = [next(f).strip() for _ in range(max_lines)]
            return " ".join([l for l in lines if l]).strip()
    except Exception:
        return "<binary or unreadable>"

def analyze_directory(root_dir):
    exclude_dirs = {'node_modules', '.git', '.next', 'dist', 'build'}
    file_info = []
    
    for dirpath, dirnames, filenames in os.walk(root_dir):
        dirnames[:] = [d for d in dirnames if d not in exclude_dirs]
        for filename in filenames:
            if filename.endswith(('.png', '.jpg', '.jpeg', '.gif', '.ico', '.pdf', '.svg')):
                continue
            
            filepath = os.path.join(dirpath, filename)
            rel_path = os.path.relpath(filepath, root_dir)
            preview = get_file_content_preview(filepath)
            
            file_info.append({
                'path': rel_path.replace('\\', '/'),
                'preview': preview
            })
            
    return file_info

def generate_markdown(file_info):
    md = "# Giantverse - AI Project Documentation\n\n"
    md += "This document provides a comprehensive overview of the Giantverse project for AI agents. It describes the project structure and the purpose of every file.\n\n"
    
    md += "## Project Overview\n\n"
    md += "Giantverse is an interactive identity-discovery experience built with Next.js. Participants go through a birth ritual, a personality survey (or guided conversation), and are matched against one of 32 archetypes across the Order of Giants and the Order of Hunters. The result is a 'Giantverse Name' and a printable identity card.\n\n"
    md += "**Tech Stack**: Next.js (App Router), React, Tailwind CSS, Zustand, Prisma, Vercel AI SDK.\n\n"
    
    md += "## Architecture Summary\n\n"
    md += "1. **Presentation Layer**: `app/` (Next.js Pages) and `components/` (React UI). No business logic.\n"
    md += "2. **Application Layer**: `stores/` (Zustand state) and `hooks/`.\n"
    md += "3. **API Layer**: `app/api/` (Next.js Route Handlers).\n"
    md += "4. **Engine Layer**: `src/engines/` (Pure TypeScript logic for naming, conversation, archetype scoring, prompting).\n"
    md += "5. **Service Layer**: `src/services/` (External integrations like AI, Database).\n"
    md += "6. **Database Layer**: `src/db/` and `prisma/` (Prisma ORM).\n\n"
    
    md += "## Directory and File Breakdown\n\n"
    
    # Group files by top-level directory
    groups = {}
    for info in file_info:
        parts = info['path'].split('/')
        top_dir = parts[0] if len(parts) > 1 else 'Root'
        if top_dir not in groups:
            groups[top_dir] = []
        groups[top_dir].append(info)
        
    for group_name in sorted(groups.keys()):
        md += f"### {group_name}/\n\n"
        for info in sorted(groups[group_name], key=lambda x: x['path']):
            path = info['path']
            # Basic heuristic for file purpose
            purpose = "Core file."
            if "app/" in path and path.endswith("page.tsx"): purpose = "Next.js Route Page UI."
            elif "app/api/" in path: purpose = "Next.js API Route Handler."
            elif "components/ui/" in path: purpose = "Reusable Shadcn/UI primitive component."
            elif "components/experience/" in path: purpose = "Experience specific UI component."
            elif "components/layout/" in path: purpose = "Layout UI component."
            elif "src/engines/" in path: purpose = "Core business logic engine."
            elif "stores/" in path: purpose = "Zustand global state store."
            elif "prisma/" in path: purpose = "Database schema and configuration."
            elif path.endswith(".test.ts"): purpose = "Unit test file."
            elif "docs/" in path: purpose = "Project documentation."
            
            preview = info['preview'][:100] + "..." if len(info['preview']) > 100 else info['preview']
            
            md += f"- **`{path}`**\n"
            md += f"  - *Purpose*: {purpose}\n"
            md += f"  - *Preview*: `{preview}`\n\n"
            
    return md

if __name__ == "__main__":
    root_dir = r"c:\Users\test\Documents\Projects\Giantverse_claude"
    file_info = analyze_directory(root_dir)
    md_content = generate_markdown(file_info)
    
    output_path = os.path.join(root_dir, "PROJECT_INFO.md")
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(md_content)
    
    print(f"Generated documentation with {len(file_info)} files at {output_path}")
