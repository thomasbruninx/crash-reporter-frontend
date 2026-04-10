import axios from "axios";
import type {
  InstanceQueryResponse,
  ProjectQueryResponse,
  ReportQueryResponse
} from "./orval/backend.schemas";

const client = axios.create({
  baseURL: "",
  withCredentials: true
});

export async function login(username: string, password: string) {
  return client.post("/api/v1/login", { username, password });
}

export async function queryProjects(params?: {
  uuids?: string[];
  project_ids?: string[];
  page?: number;
  resultsperpage?: number;
  name?: string;
  include_stats?: boolean;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}) {
  const { data } = await client.get<ProjectQueryResponse>("/api/v1/project/query", { params });
  return data;
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
  page?: number;
  resultsperpage?: number;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
}) {
  const params: Record<string, string | number | undefined> = {
    project_uuids: filters?.projectUuid,
    project_ids: filters?.projectId,
    page: filters?.page,
    resultsperpage: filters?.resultsperpage,
    sort_by: filters?.sort_by,
    sort_dir: filters?.sort_dir
  };
  const { data } = await client.get<InstanceQueryResponse>("/api/v1/instance/query", {
    params
  });
  return data;
}

export async function updateInstance(uuid: string, notes: string) {
  await client.patch(`/api/v1/instance/${uuid}`, { notes });
}

export async function deleteInstance(uuid: string) {
  await client.delete(`/api/v1/instance/${uuid}`);
}

export async function queryReports(
  project_uuid: string,
  severity?: string,
  instance_uuid?: string,
  pagination?: { page?: number; resultsperpage?: number; sort_by?: string; sort_dir?: "asc" | "desc" }
) {
  const params: Record<string, string | string[] | number> = { project_uuids: project_uuid };
  if (severity) params.severity = severity;
  if (instance_uuid) params.instance_uuids = instance_uuid;
  if (pagination?.page !== undefined) params.page = pagination.page;
  if (pagination?.resultsperpage !== undefined) params.resultsperpage = pagination.resultsperpage;
  if (pagination?.sort_by !== undefined) params.sort_by = pagination.sort_by;
  if (pagination?.sort_dir !== undefined) params.sort_dir = pagination.sort_dir;
  const { data } = await client.get<ReportQueryResponse>("/api/v1/report/query", { params });
  return data;
}

export async function deleteReport(uuid: string) {
  await client.delete(`/api/v1/report/${uuid}`);
}
