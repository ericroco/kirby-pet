const vscode = require('vscode');

function activate(context) {
    console.log('Kirby Pets está activo!');

    // Paths to the GIFs
    const inhaleGifUri = vscode.Uri.joinPath(context.extensionUri, 'assets', 'inhale.gif');
    const walkGifUri = vscode.Uri.joinPath(context.extensionUri, 'assets', 'walk.gif');
    const swapGifUri = vscode.Uri.joinPath(context.extensionUri, 'assets', 'bike.gif');

    // Function to make Kirby walk across a random line
    function makeKirbyWalk() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            console.error('No active editor found.');
            return;
        }

        // Get the document and calculate total lines
        const document = editor.document;
        const totalLines = document.lineCount;

        // Randomly select a line (ensure it's not empty)
        let randomLineIndex;
        do {
            randomLineIndex = Math.floor(Math.random() * totalLines);
        } while (document.lineAt(randomLineIndex).text.trim() === '');

        const randomLine = document.lineAt(randomLineIndex);
        const lineLength = randomLine.text.length;

        // Save the original content of the line
        const originalContent = randomLine.text;

        // Replace the line with spaces for the "walk" animation
        const replaceLineWithSpaces = () => {
            const edit = new vscode.WorkspaceEdit();
            const range = randomLine.range;
            const spaces = ' '.repeat(lineLength); // Replace with spaces
            edit.replace(document.uri, range, spaces);
            vscode.workspace.applyEdit(edit);
        };

        // Restore the original content of the line
        const restoreOriginalContent = () => {
            const edit = new vscode.WorkspaceEdit();
            const range = randomLine.range;
            edit.replace(document.uri, range, originalContent);
            vscode.workspace.applyEdit(edit);
        };

        // Initial position (off-screen)
        let positionX = -30; // Adjust starting position for smaller size

        const interval = 20; // Animation speed (milliseconds)

        // Create a decoration for the "inhale" animation
        const inhaleDecoration = vscode.window.createTextEditorDecorationType({
            before: {
                contentIconPath: inhaleGifUri,
                margin: '0 5px 0 0' // Adjust margin for smaller size
            }
        });

        // Show the "inhale" animation first (static position)
        const showInhaleAnimation = () => {
            const range = new vscode.Range(
                randomLineIndex,
                0, // Start at the beginning of the line
                randomLineIndex,
                0 // End at the beginning of the line
            );
            editor.setDecorations(inhaleDecoration, [{ range }]);
        };

        // Show the "inhale" animation
        showInhaleAnimation();

        // Wait for the "inhale" animation to finish (e.g., 1 second)
        setTimeout(() => {
            // Dispose of the "inhale" decoration
            editor.setDecorations(inhaleDecoration, []);
            inhaleDecoration.dispose();

            // Replace the line with spaces
            replaceLineWithSpaces();

            // Create a decoration for the "walk" animation
            const walkDecoration = vscode.window.createTextEditorDecorationType({
                before: {
                    contentIconPath: walkGifUri,
                    margin: '0 5px 0 0' // Adjust margin for smaller size
                }
            });

            // Animate Kirby walking
            const animateKirby = () => {
                const editor = vscode.window.activeTextEditor;
                if (!editor) return;

                // Update Kirby's position
                positionX += 3; // Adjust speed for smaller size
                if (positionX > lineLength * 10) {
                    // Stop the animation and remove the decoration
                    clearInterval(animationInterval);
                    editor.setDecorations(walkDecoration, []); // Clear decorations
                    walkDecoration.dispose(); // Dispose of the decoration

                    // Trigger the swap animation
                    triggerSwapAnimation();
                    return;
                }

                // Update the range for the decoration
                const range = new vscode.Range(
                    randomLineIndex,
                    Math.max(0, Math.floor(positionX / 10)), // Ensure character is non-negative
                    randomLineIndex,
                    Math.max(0, Math.floor(positionX / 10)) // Ensure character is non-negative
                );
                editor.setDecorations(walkDecoration, [{ range }]);
            };

            // Start the animation loop
            const animationInterval = setInterval(animateKirby, interval);
        }, 1000); // Wait 1 second for the "inhale" animation

        // Function to trigger the swap animation
        function triggerSwapAnimation() {
            const editor = vscode.window.activeTextEditor;
            if (!editor) return;

            // Randomly select two lines (ensure they are not empty)
            let line1Index, line2Index;
            do {
                line1Index = Math.floor(Math.random() * totalLines);
            } while (document.lineAt(line1Index).text.trim() === '');

            do {
                line2Index = Math.floor(Math.random() * totalLines);
            } while (document.lineAt(line2Index).text.trim() === '' || line2Index === line1Index);

            const line1 = document.lineAt(line1Index);
            const line2 = document.lineAt(line2Index);

            // Create a decoration for the "swap" animation
            const swapDecoration = vscode.window.createTextEditorDecorationType({
                after: {
                    contentIconPath: swapGifUri,
                    margin: '0 5px 0 0' // Adjust margin for smaller size
                }
            });

            // Show the "swap" animation at the end of the first line
            const range1 = new vscode.Range(
                line1Index,
                line1.text.length, // End of line 1
                line1Index,
                line1.text.length
            );

            editor.setDecorations(swapDecoration, [{ range: range1 }]);

            // Wait for 5 seconds before moving to the second line
            setTimeout(() => {
                // Move the "swap" animation to the end of the second line
                const range2 = new vscode.Range(
                    line2Index,
                    line2.text.length, // End of line 2
                    line2Index,
                    line2.text.length
                );

                editor.setDecorations(swapDecoration, [{ range: range2 }]);

                // Wait for 1 second before performing the swap
                setTimeout(() => {
                    // Dispose of the "swap" decoration
                    editor.setDecorations(swapDecoration, []);
                    swapDecoration.dispose();

                    // Swap the content of the two lines
                    const edit = new vscode.WorkspaceEdit();
                    const line1Range = line1.rangeIncludingLineBreak;
                    const line2Range = line2.rangeIncludingLineBreak;

                    const line1Content = document.getText(line1Range);
                    const line2Content = document.getText(line2Range);

                    edit.replace(document.uri, line1Range, line2Content);
                    edit.replace(document.uri, line2Range, line1Content);

                    vscode.workspace.applyEdit(edit);
                }, 1000); // Wait 1 second before swapping
            }, 5000); // Wait 5 seconds before moving to the second line
        }
    }

    // Schedule Kirby's random appearances
    function scheduleKirbyAppearance() {
        setInterval(() => {
            // Generate a random delay between 0 and 5 minutes (in milliseconds)
            const randomDelay = Math.random() * 5 * 60 * 1000;

            setTimeout(() => {
                makeKirbyWalk();
            }, randomDelay);
        }, 5 * 60 * 1000); // Repeat every 5 minutes
    }

    // Start scheduling Kirby's appearances
    scheduleKirbyAppearance();
}

function deactivate() {
    console.log('Kirby Pets se ha desactivado.');
}

module.exports = {
    activate,
    deactivate
};