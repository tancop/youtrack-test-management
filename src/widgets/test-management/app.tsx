import React, {memo, MouseEventHandler, useCallback, useEffect, useState} from 'react';
import Toggle, {Size} from "@jetbrains/ring-ui-built/components/toggle/toggle";
import List from "@jetbrains/ring-ui-built/components/list/list";

const host = await YTApp.register();

interface Project {
    name: string;
    key: string;
    href: string;
}

const AppComponent: React.FunctionComponent = () => {
    const [isEnabled, setEnabled] = useState<boolean>(false);
    const [projects, setProjects] = useState<Project[]>([]);

    useEffect(() => {
        host.fetchApp('backend/isAppEnabled', {}).then(
            (res) => {
                // Initialize the toggle to current persisted value
                setEnabled((res as {value: boolean}).value);
            }
        );
    }, [])

    useEffect(() => {
        host.fetchApp('backend/getProjects', {}).then(
            (res) => {
                setProjects((res as Project[]));
            }
        );
    }, [])

    const toggleEnabled: MouseEventHandler<HTMLInputElement> = useCallback(async (event) => {
        event.preventDefault();
        const result: { value: boolean } = await host.fetchApp('backend/toggleAppEnabled', {method: 'POST'});
        setEnabled(result.value);
    }, []);

    return (
      <div className="widget">
        <Toggle size={Size.Size20} onClick={toggleEnabled} checked={isEnabled}>Enable Tests</Toggle>
        <List
          data={
            projects.map((project) => (
                {
                    key: project.key,
                    label: <b>{project.name}</b>,
                    href: project.href,
                }
            ))
        }
        />
      </div>
    );
};

export const App = memo(AppComponent);
