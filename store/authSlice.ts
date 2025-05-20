import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppDispatch } from "./store";
import { API, APIS } from "../globals/http";

export interface IUser {
  id: string | null;
  username: string | null;
  email: string | null;
  password: string | null;
  token: string | null;
  role:string|null
}

export enum Status {
  SUCCESS = "success",
  LOADING = "loading",
  ERROR = "error",
}

interface IInitialState {
  user: IUser[];
  status: Status;
}
const initialState: IInitialState = {
  user: [],

  status: Status.LOADING,
};

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setStatus(state: IInitialState, action: PayloadAction<Status>) {
      state.status = action.payload;
    },
    setUsers(state: IInitialState, action: PayloadAction<IUser[]>) {
      state.user = action.payload;
    },
    deleteUser(state: IInitialState, action: PayloadAction<string>) {
      const index = state.user.findIndex(
        (users) => users.id === action.payload
      );
      if (index !== -1) {
        state.user.splice(index, 1);
      }
    },
    setToken(
      state: IInitialState,
      action: PayloadAction<{ id: string; token: string }>
    ) {
      const user = state.user.find((u) => u.id === action.payload.id);
      if (user) {
        user.token = action.payload.token;
        localStorage.setItem("tokenauth", action.payload.token);
      }
    },
    logout(state: IInitialState) {
      state.user = [];
      state.status = Status.LOADING;
      localStorage.removeItem("tokenauth");
    },
  },
});

export const { setStatus, setUsers, deleteUser, logout, setToken } =
  userSlice.actions;
export default userSlice.reducer;

export function loginUser(data:  { email: string; password: string }) {
  return async function loginUserThunk(dispatch: AppDispatch) {
    try {
      const response = await API.post("/auth/logins", data);
      if (response.status === 201) {
        dispatch(setStatus(Status.SUCCESS));
        console.log("res", response.data);
        const token =
          response.data.token || response.data.session?.access_token;

        if (token) {
          localStorage.setItem("tokenauth", token);
          dispatch(setToken(token));
        } else {
          dispatch(setStatus(Status.ERROR));
        }
      } else {
        dispatch(setStatus(Status.ERROR));
      }
    } catch (error) {
      console.log(error);
      dispatch(setStatus(Status.ERROR));
    }
  };
}

export function fetchUsers() {
  return async function fetchUsersThunk(dispatch: AppDispatch) {
    try {
      const response = await APIS.get("/auth/users");

      if (response.status === 201) {
        dispatch(setStatus(Status.SUCCESS));
        dispatch(setUsers(response.data.data));
      } else {
        dispatch(setStatus(Status.ERROR));
      }
    } catch (error) {
      console.log(error);
      dispatch(setStatus(Status.ERROR));
    }
  };
}

export function deleteUserById(id: string) {
  return async function deleteUserByIdThunk(dispatch: AppDispatch) {
    try {
      const response = await APIS.delete("/auth/users/" + id);
      if (response.status === 200) {
        dispatch(setStatus(Status.SUCCESS));
        dispatch(deleteUser(id));
      } else {
        dispatch(setStatus(Status.ERROR));
      }
    } catch (error) {
      console.log(error);
      dispatch(setStatus(Status.ERROR));
    }
  };
}
