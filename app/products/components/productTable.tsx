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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AdminLayout from "@/app/adminLayout/adminLayout";
import { IProduct } from "../types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { deleteProduct } from "@/store/productSlice";
import { Status } from "@/store/authSlice";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"; // Correct import
import ProductForm from "./productForm";

export function ProductTable({ products }: { products: IProduct[] }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { status } = useAppSelector((store) => store.adminProducts);
  const CLOUDINARY_VERSION = "v1750340657";

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await dispatch(deleteProduct(id))
        router.refresh();
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product. Please try again.");
      }
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);

  useEffect(() => {
    if (status === Status.SUCCESS) {
      router.refresh();
      setIsDialogOpen(false);
    }
  }, [status, router]);

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
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-8 gap-1">
                <Plus className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add Product
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[90vw] w-full md:max-w-7xl p-0 m-0 h-[90vh] overflow-y-auto">
              <DialogHeader className="px-6 py-4 border-b sticky top-0 bg-background z-10">
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                  Fill out the form to add a new product to the inventory.
                </DialogDescription>
              </DialogHeader>
              <ProductForm closeModal={() => setIsDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  Image
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Price</TableHead>
                <TableHead className="hidden md:table-cell">Stock</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead className="hidden md:table-cell">Created At</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center">
                    No products available.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => {
                  const imageUrl =
                    product.image && product.image[0]
                      ? `https://res.cloudinary.com/dxpe7jikz/image/upload/${CLOUDINARY_VERSION}${product.image[0].replace(
                          "/uploads",
                          ""
                        )}.jpg`
                      : "https://via.placeholder.com/300x300?text=No+Image";

                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Link href={`/products/${product.id}`}>
                          <Image
                            alt={`${product.name} image`}
                            className="aspect-square rounded-md object-cover"
                            height={64}
                            src={imageUrl}
                            width={64}
                          />
                        </Link>
                      </TableCell>
                      <TableCell className="font-medium">
                        <Link href={`/products/${product.id}`}>
                          {product.name}
                        </Link>
                      </TableCell>
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
                        {formatPrice(product.price)}
                        {product.discount > 0 && (
                          <span className="text-muted-foreground ml-2 line-through">
                            {formatPrice(product.originalPrice)}
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
                            <DropdownMenuItem asChild>
                              <Link href={`/products/${product.id}`}>
                                View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(product.id)}>
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
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