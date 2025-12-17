import type { Client } from "@/lib/api-client";

export const getRequest =
  (client: Client) =>
  async (token: string): Promise<{ id: string }> => {
    const res = await client.callApi(`auth/reset-password/${token}`, {
      method: "GET",
    });

    return res.json();
  };
