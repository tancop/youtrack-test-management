// eslint-disable-next-line @typescript-eslint/no-require-imports
const entities = require("@jetbrains/youtrack-scripting-api/entities");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const search = require("@jetbrains/youtrack-scripting-api/search");

exports.httpHandler = {
    endpoints: [
        {
            method: 'GET',
            path: 'isAppEnabled',
            handle: async function handle(ctx) {
                await ctx.response.json({value: ctx.globalStorage.extensionProperties.appEnabled});
            }
        },
        {
            method: 'POST',
            path: 'toggleAppEnabled',
            handle: async function handle(ctx) {
                ctx.globalStorage.extensionProperties.appEnabled = !ctx.globalStorage.extensionProperties.appEnabled;
                await ctx.response.json({value: ctx.globalStorage.extensionProperties.appEnabled});
            }
        },
        {
            method: 'GET',
            path: 'getBaseUrl',
            handle: async function handle(ctx) {
                // Search for all issues visible to the user
                /** @type {string[]} */
                let issueRefs = JSON.parse(search.search(undefined, '')).map(ref => ref.id);

                let issue = entities.Issue.findById(issueRefs[0]);

                // Get the YouTrack instance base URL by stripping last two parts
                // example.youtrack.cloud/issues/DEMO-1 -> example.youtrack.cloud
                const LAST_URL_SLICES = 2;
                let urlSlices = issue.url.split('/');
                let baseUrl = urlSlices.slice(0, urlSlices.length - LAST_URL_SLICES).join('/');

                // Return project info to the user
                await ctx.response.json({value: baseUrl});
            }
        }
    ]
};
