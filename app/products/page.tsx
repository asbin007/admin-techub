'use client'
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useEffect } from "react";
import { fetchProducts } from "@/store/productSlice";
import { ProductTable } from "./components/productTable";

export default function Page() {
  const dispatch = useAppDispatch();
  const { products } = useAppSelector((store) => store.adminProducts);

  useEffect(() => {
    dispatch(fetchProducts());
  }, []);
  return (
    <div>
      <ProductTable products={products} />
      
    </div>
  )
}

