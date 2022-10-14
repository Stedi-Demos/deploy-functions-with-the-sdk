export async function fetchStatusPage(url) {
  return "body";
}

export function extractUptimes(source) {
  return [
    { "product": "Buckets", uptime: "99.88%" },
    { "product": "EDI Translate", uptime: "100%" },
  ]
}

export function logUptimes(uptimes) {
  for (const uptime of uptimes) {
    console.info(`${uptime.product}: ${uptime.uptime}`);
  }
}