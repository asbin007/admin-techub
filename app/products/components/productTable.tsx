"use client";

import Image from "next/image";
import { MoreHorizontal, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AdminLayout from "@/app/adminLayout/adminLayout";
import { IProduct } from "../types";
import { useCallback, useState } from "react";
import ProductForm from "./productForm";
import { useAppDispatch } from "@/store/hooks";
import { deleteProduct } from "@/store/productSlice";

export function ProductTable({ products }: { products: IProduct[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);
  const dispatch = useAppDispatch();

  const deleteProducts = (id: string) => {
    dispatch(deleteProduct(id));
  };

  return (
    <AdminLayout>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Products</CardTitle>
            <CardDescription>
              Manage your products and view their details.
            </CardDescription>
          </div>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8 gap-1" onClick={openModal}>
                <Plus className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add Product
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] md:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
              </DialogHeader>
              <div className="h-screen ">
                <ProductForm closeModal={closeModal} />
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  <span className="sr-only">Image</span>
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Price</TableHead>
                <TableHead className="hidden md:table-cell">Stock</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead className="hidden md:table-cell">
                  Collection
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  Created At
                </TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="hidden sm:table-cell">
                    <Image
                      alt={`${product.name} image`}
                      className="aspect-square rounded-md object-cover"
                      height={64}
                      src={`http://localhost:5001/${product.images}`}
                      width={64}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.brand}</TableCell>
                  <TableCell>
                    <Badge variant={product.inStock ? "default" : "secondary"}>
                      {product.inStock ? "In Stock" : "Out of Stock"}
                    </Badge>
                    {product.isNew && (
                      <Badge variant="outline" className="ml-2">
                        New
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    ${product.price.toFixed(2)}
                    {product.discount > 0 && (
                      <span className="text-muted-foreground ml-2 line-through">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {product.totalStock}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {product?.Category?.categoryName}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {product.Collection.collectionName}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {new Date(product.createdAt).toLocaleString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={()=>deleteProducts(product.id)}>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Showing <strong>1-{products.length}</strong> of{" "}
            <strong>{products.length}</strong> products
          </div>
        </CardFooter>
      </Card>
    </AdminLayout>
  );
}
