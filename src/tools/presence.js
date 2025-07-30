export function setPresence(client, presence = "online", status = "") {
  return client.setPresence({ presence, status_msg: status });
}
