import z from "zod";

const initEnv = () => {
  const env = Object.entries(import.meta.env);

  const EnvSchema = z.object({
    SERVER_URL: z.string().optional().default("http://localhost:3000"),
    SERVER_MOCK_API_PORT: z.string().optional().default("3000"),
    API_VERSION: z.coerce.number().default(1),
    TOKEN_SECRET: z.string().default("secret"),
    NODE_ENV: z
      .enum(["prod", "dev", "test", "production", "development"])
      .default("dev"),
  });

  const envVars = env.reduce<{
    [key: string]: string;
  }>((envMap, envArr) => {
    const [key, value] = envArr;

    if (key.startsWith("VITE_")) {
      envMap[key.replace("VITE_", "")] = value;
    }

    return envMap;
  }, {});

  const parsedEnv = EnvSchema.safeParse(envVars);

  if (!parsedEnv.success) {
    throw new Error(
      `Invalid env provided.
The following variables are missing or invalid:
${Object.entries(z.treeifyError(parsedEnv.error))
  .map(([k, v]) => `- ${k}: ${v}`)
  .join("\n")}
`
    );
  }

  return parsedEnv.data;
};

export const env = initEnv();
