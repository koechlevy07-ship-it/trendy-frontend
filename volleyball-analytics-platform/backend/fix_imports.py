import os
import re

# Find all .py files and replace imports
for root, dirs, files in os.walk('.'):
    for f in files:
        if f.endswith('.py'):
            path = os.path.join(root, f)
            try:
                with open(path, 'r') as fp:
                    content = fp.read()
                
                # Replace imports from app.models.player to app.models.personnel
                if 'from app.models.personnel import' in content:
                    new_content = content.replace(
                        'from app.models.personnel import',
                        'from app.models.personnel import'
                    )
                    if new_content != content:
                        with open(path, 'w') as fp:
                            fp.write(new_content)
                        print(f'Fixed: {path}')
            except Exception as e:
                pass

print("Done!")