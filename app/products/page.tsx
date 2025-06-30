'use client'
import React, { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchProducts } from '@/store/productSlice';
import  { ProductTable } from './components/productTable';

export default function Page() {
    const dispatch=useAppDispatch();
      const{products}  = useAppSelector((state) => state.adminProducts)
      useEffect(()=>{
        dispatch(fetchProducts())
      },[])


  return (
    <div>
        <ProductTable  products={products} />
      
    </div>
  )
}
