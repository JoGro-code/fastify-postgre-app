export interface CreateUserRequest {
  Body: {
    name: string;
    email: string;
  };
}

export interface UpdateUserRequest {
  Params: {
    id: string;
  };
  Body: {
    name?: string;
    email?: string;
  };
}

export interface GetUserRequest {
  Params: {
    id: string;
  };
}

export interface DeleteUserRequest {
  Params: {
    id: string;
  };
}
