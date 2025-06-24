# Code Anonymizer

A VS Code extension that strips comments and anonymizes code (e.g., renames variables) to safely share with GPT or other LLMs.

## Features
- Removes comments from selected code.
- Anonymizes variables, functions, and classes (e.g., `myVar` → `var1`).
- Provides a mock LLM suggestion for code improvement.

## How to Use
1. Install the extension in VS Code.
2. Open a `.js` or `.ts` file.
3. Select the code you want to anonymize.
4. Run the command `Ask GPT (Code Anonymizer)` (Ctrl+Shift+P).
5. See the anonymized code and mock LLM suggestion in the popup.

## Installation
1. Clone this repo: `git clone https://github.com/Khushi-51/llm-code-anonymizer.git`
2. Open in VS Code: `code .`
3. Run `npm install` in the terminal.
4. Press F5 to test in the Extension Development Host.

## Development
- Built with TypeScript.
- Uses VS Code API for extension functionality.

## Future Plans
- Integrate a real free LLM (if available).
- Add option to save LLM suggestions in code.

## License
[MIT](LICENSE) (add a `LICENSE` file if you want, or change this).

## Acknowledgements
Inspired by the need to safely share code with AI tools.