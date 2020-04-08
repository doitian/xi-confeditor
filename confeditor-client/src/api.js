import type { ExcelRow } from "./types";

const headers = new Headers();
headers.append("Content-Type", "application/json");
headers.append("Accept", "application/json");

function fetchJson(request, init = {}) {
  return fetch(request, init)
    .then(response => {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json();
      }

      const path = decodeURI(response.url).replace(/^.*?:\/\/.*?\//, '/');
      throw new Error(
        `${init.get || "GET"} ${path}: ${response.status} ${response.statusText}`
      );
    })
    .then(body => {
      const error = body["error"];
      if (error === undefined || error === null) {
        return body;
      }

      throw new Error(error);
    });
}

export function fetchList() {
  return fetchJson("/api/excel", { headers });
}

export function fetchFile(name: string) {
  return fetchJson(`/api/excel/${encodeURIComponent(name)}`, { headers });
}

export function commitFileChanges(name: string, rows: ExcelRow[]) {
  return fetchJson(`/api/excel/${encodeURIComponent(name)}`, {
    method: "POST",
    body: JSON.stringify({ rows }),
    headers
  });
}

export function openExcel(name: string) {
  return fetchJson(`/api/excel/open/${encodeURIComponent(name)}`, {
    method: "POST",
    headers
  });
}
