import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppDispatch } from "./store";
import { API } from "../globals/http";
import { Status } from "./authSlice";

interface ICollection {
  id: string;
  collectionName: string;
}
interface ICollectionInitialState {
  collection: ICollection[];
  status: Status;
}

const initialState: ICollectionInitialState = {
  collection: [],
  status: Status.LOADING,
};
const categorySlice = createSlice({
  name: "collections",
  initialState,
  reducers: {
    setItems(
      state: ICollectionInitialState,
      action: PayloadAction<ICollection[]>
    ) {
      state.collection = action.payload;
    },

    setStatus(state: ICollectionInitialState, action: PayloadAction<Status>) {
      state.status = action.payload;
    },
  },
});
export const { setItems, setStatus } = categorySlice.actions;
export default categorySlice.reducer;

export function fetchCollection() {
  return async function fetchCollectionThunk(dispatch: AppDispatch) {
    try {
      const response = await API.get("/collection");
      if (response.status === 200) {
        dispatch(setItems(response.data.data));
        dispatch(setStatus(Status.SUCCESS));
      } else {
        dispatch(setStatus(Status.ERROR));
      }
    } catch (error) {
      console.log(error);
      dispatch(setStatus(Status.ERROR));
    }
  };
}
