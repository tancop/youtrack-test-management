import React, {memo, MouseEventHandler, useCallback, useEffect, useState} from 'react';
import Toggle, {Size} from "@jetbrains/ring-ui-built/components/toggle/toggle";
import List from "@jetbrains/ring-ui-built/components/list/list";
import Avatar from "@jetbrains/ring-ui-built/components/avatar/avatar";

const host = await YTApp.register();

interface Project {
    name: string;
    id: string;
    iconUrl: string | undefined;
}

const AppComponent: React.FunctionComponent = () => {
    const [isEnabled, setEnabled] = useState<boolean>(false);
    const [projects, setProjects] = useState<Project[]>([]);
    const [baseUrl, setBaseUrl] = useState<string>('');

    const getProjectUrl = useCallback((id: string) => {
        return `${baseUrl}/projects/${id}`;
    }, [baseUrl]);

    useEffect(() => {
        host.fetchApp('backend/isAppEnabled', {}).then(
            (res) => {
                // Initialize the toggle to current persisted value
                setEnabled((res as { value: boolean }).value);
            }
        );
        host.fetchYouTrack('admin/projects?fields=name,id,iconUrl', {}).then(
            (res) => {
                const newProjects = res as Project[];
                setProjects(newProjects);
            }
        );
        host.fetchApp('backend/getBaseUrl', {}).then(
            res => setBaseUrl((res as {value: string}).value),
        )
    }, []);

    const toggleEnabled: MouseEventHandler<HTMLInputElement> = useCallback(async (event) => {
        event.preventDefault();
        const result: { value: boolean } = await host.fetchApp('backend/toggleAppEnabled', {method: 'POST'});
        setEnabled(result.value);
    }, []);

    return (
      <div className="widget">
        <Toggle className="toggle" size={Size.Size20} onClick={toggleEnabled} checked={isEnabled}>Enable
          Tests</Toggle>
        <List
          data={
            projects.map((project) => (
                {
                    key: project.id,
                    label: <span className="list-entry">
                      <Avatar size={40} url={project.iconUrl}/>
                      <b>{project.name}</b>
                    </span>,
                    href: getProjectUrl(project.id),
                }
            ))
        }
        />
      </div>
    );
};

export const App = memo(AppComponent);
