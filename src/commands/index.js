// Fixed roll command with maximum 1000 sides validation
function rollCommand(sides) {
    try {
        if (sides <= 0 || sides > 1000) throw new Error('Sides must be between 1 and 1000.');
        return Math.floor(Math.random() * sides) + 1;
    } catch (error) {
        console.error('Error in rollCommand:', error);
        return `Error: ${error.message}`;
    }
}

// Play command with 30 second timeout
function playCommand() {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error('Play command timed out.'));   
        }, 30000);
        // Your play logic here...
        resolve('Playing...'); // Example resolve
        clearTimeout(timeout);
    });
}

// Sticker command with 50MB maximum size validation
function stickerCommand(file) {
    try {
        if (file.size > 50 * 1024 * 1024) throw new Error('File size exceeds 50MB limit.');
        // Process sticker...
        return 'Sticker processed.'; // Example return
    } catch (error) {
        console.error('Error in stickerCommand:', error);
        return `Error: ${error.message}`;
    }
}

// Improved error handling for all admin commands
async function adminCommandHandler(command) {
    try {
        const result = await command();
        return result;
    } catch (error) {
        console.error('Error in admin command:', error);
        return `Error: ${error.message}`;
    }
}