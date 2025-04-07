import React, {memo, MouseEventHandler, useCallback, useEffect, useState} from 'react';
import Toggle, {Size} from "@jetbrains/ring-ui-built/components/toggle/toggle";
import List from "@jetbrains/ring-ui-built/components/list/list";
import Avatar from "@jetbrains/ring-ui-built/components/avatar/avatar";
import {produce} from "immer";

const host = await YTApp.register();

interface Project {
    name: string;
    key: string;
    href: string;
    iconUrl: string | undefined;
}

interface IconResponse {
    iconUrl: string;
}

const AppComponent: React.FunctionComponent = () => {
    const [isEnabled, setEnabled] = useState<boolean>(false);
    const [projects, setProjects] = useState<Project[]>([]);

    const setIconUrl = useCallback((res: IconResponse, index: number, baseUrl: string) => {
        // Set the project entry's iconUrl to the one we got from the server
        setProjects(produce(draft => {
            draft[index].iconUrl = baseUrl + res.iconUrl;
        }));
    }, []);

    useEffect(() => {
        host.fetchApp('backend/isAppEnabled', {}).then(
            (res) => {
                // Initialize the toggle to current persisted value
                setEnabled((res as { value: boolean }).value);
            }
        );
        host.fetchApp('backend/getProjects', {}).then(
            (res) => {
                const newProjects = (res as Project[]);

                if (newProjects.length > 0) {
                    // Get base URL from one of the project's `href` property
                    // see backend.js for details
                    const LAST_URL_SLICES = 2;
                    const urlSlices = newProjects[0].href.split('/');
                    const baseUrl = urlSlices.slice(0, urlSlices.length - LAST_URL_SLICES).join('/');

                    for (let i = 0; i < newProjects.length; i++) {
                        // Send out requests for each project to get its icon URL
                        const project = newProjects[i];
                        host.fetchYouTrack(`admin/projects/${project.key}?fields=iconUrl`, {})
                            .then(res2 => setIconUrl((res2 as IconResponse), i, baseUrl));
                    }
                }

                setProjects(newProjects);
            }
        );
    }, []);

    const toggleEnabled: MouseEventHandler<HTMLInputElement> = useCallback(async (event) => {
        event.preventDefault();
        const result: { value: boolean } = await host.fetchApp('backend/toggleAppEnabled', {method: 'POST'});
        setEnabled(result.value);
    }, []);

    return (
      <div className="widget">
        <Toggle className="toggle" size={Size.Size20} onClick={toggleEnabled} checked={isEnabled}>Enable Tests</Toggle>
        <List
          data={
            projects.map((project) => (
                {
                    key: project.key,
                    label: <span className="list-entry">
                      <Avatar size={40} url={project.iconUrl}/>
                      <b>{project.name}</b>
                    </span>,
                    href: project.href,
                }
            ))
        }
        />
      </div>
    );
};

export const App = memo(AppComponent);
