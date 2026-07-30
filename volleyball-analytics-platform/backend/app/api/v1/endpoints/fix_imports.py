import glob

for fname in glob.glob('*.py'):
    with open(fname, 'r') as f:
        content = f.read()
    if 'get_db' in content:
        # Replace the import line
        content = content.replace(
            'from app.core.database import get_db as get_db',
            'from app.core.database import get_db as get_db'
        )
        with open(fname, 'w') as f:
            f.write(content)
        print('Fixed:', fname)