import os
import py_compile
import sys

def check_syntax(directory):
    errors = []
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.py'):
                path = os.path.join(root, file)
                try:
                    py_compile.compile(path, doraise=True)
                except py_compile.PyCompileError as e:
                    errors.append(str(e))
                except Exception as e:
                    errors.append(f"Error compiling {path}: {e}")
    return errors

if __name__ == "__main__":
    directory = sys.argv[1] if len(sys.argv) > 1 else "backend"
    errors = check_syntax(directory)
    if errors:
        print("\n".join(errors))
        sys.exit(1)
    else:
        print("No syntax errors found.")
