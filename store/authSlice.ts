import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppDispatch } from "./store";
import { APIS } from "../globals/http";

export interface IUser {
  id: string; // Added id property
  username: string | null;
  email: string | null;
  password: string | null;
  token: string | null;
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
      const index = state.user.findIndex((users) => users.id === action.payload);
      if (index !== -1) {
        state.user.splice(index, 1);
      }
    },
    setToken(state: IInitialState, action: PayloadAction<string>) {
      if (state.user.length > 0) {
        state.user[0].token = action.payload;
      }
    },
    logout(state: IInitialState) {
      state.user = [];
      state.status = Status.LOADING;
      localStorage.removeItem("tokenauth");
    },
  },
});

export const { setStatus, setUsers, deleteUser,logout,setToken } = userSlice.actions;
export default userSlice.reducer;

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
