/**
 * DURA Actor - Dependency Update Risk Analyzer
 * Apify Actor entry point
 */

const { Actor } = require('apify');
const { runDura } = require('./src/runDura');

Actor.main(async () => {
    // Read input from Actor (this initializes the Actor context)
    const input = await Actor.getInput();
    
    // Validate required input
    if (!input || !input.repoUrl) {
        throw new Error('Missing required input: repoUrl');
    }
    
    const { repoUrl, branch = 'main' } = input;
    
    // Now Actor.log should be available after getInput()
    // Use Actor.log if available, otherwise create a console-based logger
    const log = Actor.log || {
        info: (...args) => console.log(...args),
        warning: (...args) => console.warn(...args),
        error: (...args) => console.error(...args)
    };
    
    log.info(`Starting DURA analysis for repository: ${repoUrl}`);
    if (branch) {
        log.info(`Using branch: ${branch}`);
    }
    
    try {
        // Run the DURA pipeline
        const results = await runDura(repoUrl, branch);
        
        // Push results to dataset
        if (results && results.length > 0) {
            // Push each result as a separate item to the dataset
            for (const result of results) {
                await Actor.pushData(result);
            }
            log.info(`Successfully analyzed ${results.length} dependencies`);
        } else {
            log.warning('No dependencies found or analysis returned empty results');
            await Actor.pushData({
                message: 'No dependencies found in package.json',
                repoUrl,
                branch
            });
        }
        
        log.info('Analysis complete!');
        
    } catch (error) {
        log.error(`Analysis failed: ${error.message}`);
        if (error.stack) {
            log.error(error.stack);
        }
        
        // Push error to dataset for visibility
        await Actor.pushData({
            error: true,
            message: error.message,
            repoUrl,
            branch
        });
        
        throw error;
    }
});

