"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Card, EmptyState, Field, PageHeader, inputClass } from "@/components/ui";

type Task = { id: string; title: string; status: string };
type Project = {
  id: string;
  name: string;
  description: string | null;
  tasks: Task[];
};

const COLUMNS = [
  { id: "todo", label: "To do" },
  { id: "in_progress", label: "In progress" },
  { id: "done", label: "Done" },
] as const;

export function PlanlyBoard({ projects }: { projects: Project[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [activeId, setActiveId] = useState(projects[0]?.id ?? "");
  const active = projects.find((project) => project.id === activeId) ?? projects[0];

  async function createProject() {
    const response = await fetch("/api/planly/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    const project = await response.json();
    setName("");
    setDescription("");
    setActiveId(project.id);
    router.refresh();
  }

  async function addTask() {
    if (!active) return;
    await fetch("/api/planly/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: active.id, title: taskTitle }),
    });
    setTaskTitle("");
    router.refresh();
  }

  async function moveTask(id: string, status: string) {
    await fetch("/api/planly/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    router.refresh();
  }

  return (
    <div>
      <PageHeader title="Planly" subtitle="Project management for campaigns, content, and launches." />
      <div className="grid gap-4 p-8 lg:grid-cols-[280px_1fr]">
        <div className="space-y-3">
          <Card className="space-y-3 p-4">
            <div className="text-sm font-medium">New project</div>
            <Field label="Name">
              <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Description">
              <input className={inputClass} value={description} onChange={(e) => setDescription(e.target.value)} />
            </Field>
            <Button onClick={createProject}>Create</Button>
          </Card>
          <Card>
            {projects.length === 0 ? (
              <EmptyState title="No projects" body="Create a project to start a board." />
            ) : (
              <ul className="divide-y divide-border">
                {projects.map((project) => (
                  <li key={project.id}>
                    <button
                      type="button"
                      onClick={() => setActiveId(project.id)}
                      className={`w-full px-4 py-3 text-left text-sm ${
                        active?.id === project.id ? "bg-primary/10 text-primary" : "hover:bg-background"
                      }`}
                    >
                      <div className="font-medium">{project.name}</div>
                      <div className="text-xs text-muted">{project.tasks.length} tasks</div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
        <div>
          {!active ? (
            <Card>
              <EmptyState title="Select a project" body="Planly boards appear here after you create a project." />
            </Card>
          ) : (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold">{active.name}</h2>
                {active.description ? <p className="text-sm text-muted">{active.description}</p> : null}
              </div>
              <div className="flex gap-2">
                <input
                  className={inputClass}
                  placeholder="Add a task"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                />
                <Button onClick={addTask}>Add</Button>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {COLUMNS.map((column) => {
                  const tasks = active.tasks.filter((task) => task.status === column.id);
                  return (
                    <Card key={column.id} className="p-3">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-medium">{column.label}</span>
                        <Badge>{tasks.length}</Badge>
                      </div>
                      <ul className="space-y-2">
                        {tasks.map((task) => (
                          <li key={task.id} className="rounded-lg border border-border bg-background p-3 text-sm">
                            <div>{task.title}</div>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {COLUMNS.filter((item) => item.id !== task.status).map((item) => (
                                <button
                                  key={item.id}
                                  type="button"
                                  className="text-xs text-primary hover:text-primary-dark"
                                  onClick={() => moveTask(task.id, item.id)}
                                >
                                  {item.label}
                                </button>
                              ))}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
