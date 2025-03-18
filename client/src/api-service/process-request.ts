export const processRequest = async ({
  path,
  payload,
  method = "GET",
  isFormData = false,
  params = {},
}: {
  path: string;
  payload?: Record<string, unknown> | FormData;
  method?: "GET" | "PUT" | "POST" | "DELETE";
  isFormData?: boolean;
  params?: Record<string, string>;
}) => {
  let response;
  const searchParams = new URLSearchParams(params).toString();
  // TODO pull the path from env vars
  const url = `http://localhost:3000/${path}${
    searchParams ? "?" + searchParams : ""
  }`;
  if (isFormData) {
    response = await fetch(url, {
      body: payload as FormData,
      method,
    });
  } else {
    response = await fetch(url, {
      body: payload && JSON.stringify(payload),
      method,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!response.ok) {
    const { message } = await response.json();
    throw new Error(message);
  }
  return response.json();
};
