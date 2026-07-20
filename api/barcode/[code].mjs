import { handleApiRequest, sendJson } from "../../server/api.mjs";

export default async function handler(request, response) {
  if (!(await handleApiRequest(request, response))) {
    sendJson(response, 404, { code: "API_NOT_FOUND" });
  }
}
