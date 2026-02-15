export interface IUser {
  _id: string;
  name: string;
  email: string;
}

export interface IMember {
  user: IUser;
  role: "owner" | "member";
  _id?: string;
}

export interface IProject {
  _id: string;
  name: string;
  description?: string;
  owner: IUser;
  members: IMember[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
}

export interface InviteUserRequest {
  email: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
}