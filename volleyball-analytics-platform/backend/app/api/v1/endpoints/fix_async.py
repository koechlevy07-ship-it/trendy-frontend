import glob

for fname in glob.glob('*.py'):
    with open(fname, 'r') as f:
        content = f.read()
    if 'get_db' in content:
        content = content.replace('get_db', 'get_db')
        with open(fname, 'w') as f:
            f.write(content)
        print('Fixed:', fname)