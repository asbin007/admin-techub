import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Status } from "./authSlice";
import { APIS } from "@/globals/http";
import { AppDispatch } from "./store";

// Enums for statuses
export enum OrderStatus {
  Preparation = "preparation",
  Ontheway = "ontheway",
  Delivered = "delivered",
  Pending = "pending",
  Cancelled = "cancelled",
}

export enum PaymentMethod {
  Khalti = "khalti",
  Esewa = "esewa",
  COD = "cod",
}

export enum PaymentStatus {
  Paid = "paid",
  Unpaid = "unpaid",
}

// Single order item in OrderDetails
export interface IOrderDetail {
  id: string;
  quantity: number;
  createdAt: string;
  orderId: string;
  productId: string;
  paymentId: string;
  Order: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    addressLine: string;
    city: string;
    street: string;
    zipcode: string;
    orderStatus: OrderStatus;
    totalPrice: number;
    state: string;
    userId: string;
    Payment: {
      paymentMethod: PaymentMethod;
      paymentStatus: PaymentStatus;
    };
  };
  Product: {
    image: string[];
    name: string;
    price: number;
    Category: {
      id: string;
      categoryName: string;
    };
  };
}

// Basic summary of each order in list
export interface IOrderSummary {
  id: string;
  totalPrice: number;
  orderStatus: OrderStatus;
  createdAt: string;
  Payment: {
    id: string;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
  };
  OrderDetails: {
    quantity: number;
  }[];
}

// Slice state
interface IOrderState {
  items: IOrderSummary[];
  orderDetails: IOrderDetail[];
  status: Status;
}

// Initial state
const initialState: IOrderState = {
  items: [],
  orderDetails: [],
  status: Status.LOADING,
};

// Slice
const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    setItems(state, action: PayloadAction<IOrderSummary[]>) {
      state.items = action.payload;
    },
    setOrderDetails(state, action: PayloadAction<IOrderDetail[]>) {
      state.orderDetails = action.payload;
    },
    setStatus(state, action: PayloadAction<Status>) {
      state.status = action.payload;
    },
  },
});

export default orderSlice.reducer;
export const { setItems, setStatus, setOrderDetails } = orderSlice.actions;

export function fetchOrders() {
  return async function fetchOrdersThunk(dispatch: AppDispatch) {
    try {
      const response = await APIS.get("/order/all");
      if (response.status === 200) {
        dispatch(setStatus(Status.SUCCESS));
        dispatch(setItems(response.data.data));
      } else {
        dispatch(setStatus(Status.ERROR));
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      dispatch(setStatus(Status.ERROR));
    }
  };
}

// Fetch full details of a specific order
export function fetchAdminOrderDetails(id: string) {
  return async function fetchAdminOrderDetailsThunk(dispatch: AppDispatch) {
    try {
      const response = await APIS.get(`/order/${id}`);
      if (response.status === 200) {
        dispatch(setStatus(Status.SUCCESS));
        dispatch(setOrderDetails(response.data.data));
      } else {
        dispatch(setStatus(Status.ERROR));
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      dispatch(setStatus(Status.ERROR));
    }
  };
}
