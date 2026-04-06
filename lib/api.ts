import axios from "axios";
import type { InstanceOut, ProjectOut, ReportOut } from "./orval/backend.schemas";

const client = axios.create({
  baseURL: "",
  withCredentials: true
});

export async function login(username: string, password: string) {
  return client.post("/api/v1/login", { username, password });
}

export async function queryProjects() {
  const { data } = await client.get<{ items: ProjectOut[] }>("/api/v1/project/query");
  return data.items;
}

export async function createProject(project_id: string, name: string) {
  await client.post("/api/v1/project", { project_id, name });
}

export async function deleteProject(uuid: string) {
  await client.delete(`/api/v1/project/${uuid}`);
}

export async function updateProject(uuid: string, name: string) {
  await client.patch(`/api/v1/project/${uuid}`, { name });
}

export async function queryInstances(filters?: {
  projectUuid?: string;
  projectId?: string;
}) {
  const params: Record<string, string | undefined> = {
    project_uuids: filters?.projectUuid,
    project_ids: filters?.projectId
  };
  const { data } = await client.get<{ items: InstanceOut[] }>("/api/v1/instance/query", {
    params
  });
  return data.items;
}

export async function updateInstance(uuid: string, notes: string) {
  await client.patch(`/api/v1/instance/${uuid}`, { notes });
}

export async function deleteInstance(uuid: string) {
  await client.delete(`/api/v1/instance/${uuid}`);
}

export async function queryReports(project_uuid: string, severity?: string, instance_uuid?: string) {
  const params: Record<string, string> = { project_uuids: project_uuid };
  if (severity) params.severity = severity;
  if (instance_uuid) params.instance_uuids = instance_uuid;
  const { data } = await client.get<{ items: ReportOut[] }>("/api/v1/report/query", { params });
  return data.items;
}

export async function deleteReport(uuid: string) {
  await client.delete(`/api/v1/report/${uuid}`);
}
