const entities = require("@jetbrains/youtrack-scripting-api/entities");
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
            path: 'getProjects',
            handle: async function handle(ctx) {
                // Search for all issues visible to the user
                /** @type {string[]} */
                let issueRefs = JSON.parse(search.search(undefined, '')).map(ref => ref.id);

                // Get the issue objects for all of them
                /** @type {Issue[]} */
                let issues = [];
                for (const ref of issueRefs) {
                    issues.push(entities.Issue.findById(ref));
                }

                // Get the YouTrack instance base URL by stripping last two parts
                // example.youtrack.cloud/issues/DEMO-1 -> example.youtrack.cloud
                const LAST_URL_SLICES = 2;
                let urlSlices = issues[0].url.split('/');
                let baseUrl = urlSlices.slice(0, urlSlices.length - LAST_URL_SLICES).join('/');

                /** @type {Project[]} */
                let projects = []

                // Get all unique projects from the issues
                for (const issue of issues) {
                    let project = issue.project;
                    if (!projects.some(existing => existing.key === project.key)) {
                        projects.push(project);
                    }
                }

                // Return project info to the user
                await ctx.response.json(projects.map(proj => ({
                    name: proj.name,
                    key: proj.key,
                    //
                    href: `${baseUrl}/projects/${proj.key}`,
                })));
            }
        }
    ]
};
