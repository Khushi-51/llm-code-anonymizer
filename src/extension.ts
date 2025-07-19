import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

  // Command to anonymize the selected code
  let disposable = vscode.commands.registerCommand('code-anonymizer.askGpt', () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showInformationMessage('No file is open!');
      return;
    }

    const selection = editor.selection;
    const selectedText = editor.document.getText(selection);

    if (!selectedText.trim()) {
      vscode.window.showErrorMessage('Please select some code first!');
      return;
    }

    // --- Helper Functions ---

    function removeComments(code: string): string {
      return code
        .replace(/\/\/.*$/gm, '') // Remove single-line comments
        .replace(/\/\*[\s\S]*?\*\//g, ''); // Remove multi-line comments
    }

    function anonymizeIdentifiers(code: string): { anonymized: string; mapping: Record<string, string> } {
      const usedNames = new Set<string>();
      const nameMap: Record<string, string> = {};
      const reverseMap: Record<string, string> = {};

      // List of common keywords to ignore
      const keywords = new Set([
        'function', 'if', 'else', 'return', 'for', 'while', 'let', 'const', 'var', 
        'class', 'new', 'this', 'true', 'false', 'null', 'undefined', 'import', 
        'export', 'from', 'await', 'async', 'try', 'catch', 'finally', 'switch', 
        'case', 'default', 'break', 'continue', 'do', 'instanceof', 'typeof'
      ]);

      const anonymizedCode = code.replace(/\b[A-Za-z_][A-Za-z0-9_]*\b/g, (match) => {
        if (keywords.has(match.toLowerCase())) {
          return match;
        }

        if (!nameMap[match]) {
          let newName;
          let counter = Object.keys(nameMap).length + 1;
          do {
            newName = `var${counter}`;
            counter++;
          } while (usedNames.has(newName));
          
          usedNames.add(newName);
          nameMap[match] = newName;
          reverseMap[newName] = match;
        }

        return nameMap[match];
      });

      return { anonymized: anonymizedCode, mapping: reverseMap };
    }

    // --- Main Logic ---

    const strippedCode = removeComments(selectedText);
    const { anonymized: anonymizedCode, mapping } = anonymizeIdentifiers(strippedCode);

    // Store mapping in global state to be used by the revert command
    context.globalState.update('codeAnonymizerMapping', mapping);

    // Show a confirmation message to the user
    vscode.window.showInformationMessage(
        '🔐 Code Anonymized & Ready for AI. Mapping Saved.', 
        { modal: true, detail: `Your code has been anonymized. You can now copy it from the output channel and use it with any AI tool.` }
    );
    
    // **MODIFIED PART:** Output ONLY the anonymized code for easy copying.
    const outputChannel = vscode.window.createOutputChannel("Anonymized Code");
    outputChannel.clear();
    outputChannel.append(anonymizedCode); // Only append the code itself
    outputChannel.show();
  });

  // Command to revert the anonymized code back to the original
  let revertDisposable = vscode.commands.registerCommand('code-anonymizer.revertToOriginal', () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showInformationMessage('No file is open!');
      return;
    }

    const selection = editor.selection;
    const selectedText = editor.document.getText(selection);

    if (!selectedText.trim()) {
      vscode.window.showErrorMessage('Please select the AI-updated code first!');
      return;
    }

    // Retrieve the saved mapping
    const mapping = context.globalState.get<Record<string, string>>('codeAnonymizerMapping');
    if (!mapping) {
      vscode.window.showWarningMessage('No mapping available! Run "Anonymize Code" first.');
      return;
    }

    // Revert the code using the mapping
    let revertedCode = selectedText;
    for (const [anonymized, original] of Object.entries(mapping)) {
      // Use a regex with word boundary to replace whole words only
      const regex = new RegExp(`\\b${anonymized}\\b`, 'g');
      revertedCode = revertedCode.replace(regex, original);
    }

    // Replace the selected text with the reverted code
    editor.edit(editBuilder => {
      editBuilder.replace(selection, revertedCode);
    });

    vscode.window.showInformationMessage('✅ Code reverted to original names!');
  });

  context.subscriptions.push(disposable, revertDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}