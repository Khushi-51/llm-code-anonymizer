import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('code-anonymizer.askGpt', () => {
    // Check if there’s an active editor
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showInformationMessage('No file is open!');
      return;
    }

    // Get the selected code
    const selection = editor.selection;
    const selectedText = editor.document.getText(selection);

    // If no code is selected, show an error
    if (!selectedText.trim()) {
      vscode.window.showErrorMessage('Please select some code first!');
      return;
    }

    // Step 1: Remove comments
    function removeComments(code: string): string {
      return code
        .replace(/\/\/.*$/gm, '') // Remove single-line comments
        .replace(/\/\*[\s\S]*?\*\//g, ''); // Remove multi-line comments
    }

    // Step 2: Rename variables, functions, and classes to generic names
    function anonymizeIdentifiers(code: string): string {
      const usedNames = new Set<string>();
      const nameMap: Record<string, string> = {};

      return code.replace(/\b[A-Za-z_][A-Za-z0-9_]*\b/g, (match) => {
        // Skip JavaScript keywords
        if (['function', 'if', 'else', 'return', 'for', 'while', 'let', 'const', 'var', 'class', 'new', 'this', 'true', 'false', 'null', 'undefined'].includes(match.toLowerCase())) {
          return match;
        }

        // Assign a new generic name if not mapped yet
        if (!nameMap[match]) {
          let newName = 'var1'; // Start with var1
          let counter = 1;
          while (usedNames.has(newName)) {
            counter++;
            newName = `var${counter}`;
          }
          usedNames.add(newName);
          nameMap[match] = newName;
        }

        return nameMap[match];
      });
    }

    // Step 3: Mock LLM response
    function mockLLMResponse(code: string): string {
      // Simple mock: adds a suggestion to optimize by adding a constant
      return `// Suggestion: Use a constant for better readability\n${code.replace('var1', 'function optimizedVar1')}`;
    }

    // Apply the stripping
    const strippedCode = removeComments(selectedText);
    const anonymizedCode = anonymizeIdentifiers(strippedCode);
    const llmSuggestion = mockLLMResponse(anonymizedCode);

    // Show the result
    vscode.window.showInformationMessage('🔐 LLM Suggestion: ' + llmSuggestion.substring(0, 50) + '...');
    console.log('LLM Suggestion:', llmSuggestion);
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}