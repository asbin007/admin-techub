import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppDispatch } from "./store";
import { API, APIS } from "../globals/http";


export interface IUser {
  id: string | null;
  username: string | null;
  email: string | null;
  password: string | null;
  token: string | null;
  role: string | null;
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

// --------------------- Slice ---------------------

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setStatus(state, action: PayloadAction<Status>) {
      state.status = action.payload;
    },
    setUsers(state, action: PayloadAction<IUser[]>) {
      state.user = action.payload;
    },
    deleteUser(state, action: PayloadAction<string>) {
      const index = state.user.findIndex((u) => u.id === action.payload);
      if (index !== -1) {
        state.user.splice(index, 1);
      }
    },
    setToken(state, action: PayloadAction<{ id: string; token: string }>) {
      const user = state.user.find((u) => u.id === action.payload.id);
      if (user) {
        user.token = action.payload.token;
      }
    },
    logout(state) {
      state.user = [];
      state.status = Status.LOADING;
      // Clear auth token from cookies
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    },
  },
});

export const { setStatus, setUsers, deleteUser, logout, setToken } = userSlice.actions;
export default userSlice.reducer;

// --------------------- Thunks ---------------------

// Login User
export function loginUser(data: { email: string; password: string }) {
  return async function loginUserThunk(dispatch: AppDispatch) {
    try {
      const response = await API.post("/auth/logins", data);

      if (response.status === 200) {
        const { id, username, email, token } = response.data;

        if (token) {
          // ✅ Store token in cookie so middleware can read it
          document.cookie = `token=${token}; path=/;`;

          dispatch(setUsers([
            { id, username, email, password: null, token, role: null },
          ]));
          dispatch(setStatus(Status.SUCCESS));
          return { success: true };
        }
      }

      dispatch(setStatus(Status.ERROR));
      return { success: false };
    } catch (error) {
      console.log("Login error:", error);
      dispatch(setStatus(Status.ERROR));
      return { success: false };
    }
  };
}

// Fetch All Users (Admin Panel)
export function fetchUsers() {
  return async function fetchUsersThunk(dispatch: AppDispatch) {
    try {
      const response = await APIS.get("/auth/users");

      if (response.status === 200) {
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

// Delete a User
export function deleteUserById(id: string) {
  return async function deleteUserByIdThunk(dispatch: AppDispatch) {
    try {
      const response = await APIS.delete(`/auth/users/${id}`);
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

// Get current logged-in user (optional replacement for loadUserFromStorage)
export function getCurrentUser() {
  return async function getCurrentUserThunk(dispatch: AppDispatch) {
    try {
      const response = await APIS.get("/auth/me"); // Should read from cookie

      if (response.status === 200) {
        const { id, username, email, token, role } = response.data;
        dispatch(setUsers([
          { id, username, email, password: null, token, role },
        ]));
        dispatch(setStatus(Status.SUCCESS));
      } else {
        dispatch(setStatus(Status.ERROR));
      }
    } catch (error) {
      console.log("Get current user failed:", error);
      dispatch(setStatus(Status.ERROR));
    }
  };
}
