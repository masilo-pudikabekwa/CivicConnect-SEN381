export interface User {
  id: string;
  email: string;
  name?: string | null;
  role: "CITIZEN" | "PERSONNEL" | "ADMIN";
}