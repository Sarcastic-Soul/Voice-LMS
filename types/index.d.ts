// type User = {
//   name: string;
//   email: string;
//   image?: string;
//   accountId: string;
// };

type Companion = {
  id: string;
  name: string;
  subject: string;
  topic: string;
  duration: number;
  author: string;
  isBookmarked: boolean;
  created_at: string;
  updated_at: string;
};

interface CreateCompanion {
  name: string;
  subject: string;
  topic: string;
  voice: string;
  style: string;
  duration: number;
}

interface GetAllCompanions {
  limit?: number;
  page?: number;
  subject?: string | string[];
  topic?: string | string[];
}

interface BuildClient {
  key?: string;
  sessionToken?: string;
}

interface CreateUser {
  email: string;
  name: string;
  image?: string;
  accountId: string;
}

interface SearchParams {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

interface Avatar {
  userName: string;
  width: number;
  height: number;
  className?: string;
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

interface CompanionComponentProps {
  companionId: string;
  subject: string;
  topic: string;
  name: string;
  userName: string;
  userImage: string;
  voice: string;
  style: string;
}
