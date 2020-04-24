export const fetcher = (url, options) =>
  fetch(url, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    ...options,
  }).then((r) => {
    if (r?.headers?.get("content-type")?.match("json")) {
      return r.json();
    }
  });
