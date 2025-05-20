import { IProduct, Status } from "./../globals/types/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IProducts } from "../globals/types/types";
import { AppDispatch, RootState } from "./store";
import { APIS } from "../globals/http";

const initialState: IProducts = {
  products: [],
  status: Status.LOADING,
  product: null,
};
const productSlice = createSlice({
  name: "adminProducts",
  initialState,
  reducers: {
    setProducts(state: IProducts, action: PayloadAction<IProduct[]>) {
      state.products = action.payload;
    },
    setStatus(state: IProducts, action: PayloadAction<Status>) {
      state.status = action.payload;
    },
    addProductToProducts(state: IProducts, action: PayloadAction<IProduct>) {
      state.products.push(action.payload);
    },
    setProduct(state: IProducts, action: PayloadAction<IProduct>) {
      state.product = action.payload;
    },
  },
});

export const { setStatus, setProduct, setProducts, addProductToProducts } =
  productSlice.actions;
export default productSlice.reducer;

export function addProduct(data: IProduct) {
  return async function addProductThunk(dispatch: AppDispatch) {
    try {
      const res = await APIS.post("/product", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (res.status === 201) {
        dispatch(setStatus(Status.SUCCESS));
        dispatch(addProductToProducts(res.data.data));
      } else {
        dispatch(setStatus(Status.ERROR));
      }
    } catch (error) {
      dispatch(setStatus(Status.ERROR));
      console.log(error);
    }
  };
}

export function fetchProducts() {
  return async function fetchProductsThunk(dispatch: AppDispatch) {
    try {
      const response = await APIS.get("/product");
      if (response.status === 201) {
        dispatch(setProducts(response.data.data));
      } else {
        dispatch(setStatus(Status.ERROR));
      }
    } catch (error) {
      console.log(error);

      dispatch(setStatus(Status.ERROR));
    }
  };
}

export function fetchProductAdmin(id: string) {
  return async function fetchProductAdminThunk(
    dispatch: AppDispatch,
    getState: () => RootState
  ) {
    const store = getState();
    const productExists = store.adminProducts.products.find(
      (product: IProduct) => product.id == id
    );

    if (productExists) {
      dispatch(setProduct(productExists));
      dispatch(setStatus(Status.SUCCESS));
    } else {
      try {
        const response = await APIS.get("/product/" + id);
        if (response.status === 200) {
          dispatch(setStatus(Status.SUCCESS));
          dispatch(setProduct(response.data.data));
        } else {
          dispatch(setStatus(Status.ERROR));
        }
      } catch (error) {
        console.log(error);
        dispatch(setStatus(Status.ERROR));
      }
    }
  };
}
