export const fetcher = (url, options) =>
  fetch(url, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    ...options,
  }).then((r) => {
    if (!r.ok) {
      throw new Error("Network response was not ok");
    } else if (r?.headers?.get("content-type")?.match("json")) {
      return r.json();
    }
  });
