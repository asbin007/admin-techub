
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { MoreHorizontal } from "lucide-react";
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
import AdminLayout from "../adminLayout/adminLayout";

// Interface for product data based on JSON structure
interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  discount: number;
  originalPrice: number;
  images: string;
  inStock: boolean;
  isNew: boolean;
  totalStock: number;
  createdAt: string;
  Category: { categoryName: string };
  Collection: { collectionName: string };
}

export default function Products() {
  // State to hold fetched products
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulate fetching data from backend (replace with your API call)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Example API call (replace with your backend endpoint)
        // const response = await fetch("/api/products");
        // const result = await response.json();
        // setProducts(result.data);

        // For now, using the provided JSON data
        const result = {
          message: "Products fetched successfully",
          data: [
            {
              id: "99e12dfb-18f2-43ad-bfa8-ed2405e40f14",
              name: "Jordan",
              brand: "Nikes",
              price: 150,
              discount: 20,
              originalPrice: 187.5,
              images: "1747111962636-shoes6.png",
              inStock: true,
              isNew: true,
              totalStock: 10,
              createdAt: "2025-05-13T04:52:42.650Z",
              Category: { categoryName: "Jordan" },
              Collection: { collectionName: "Man" },
            },
            {
              id: "da0790fc-c10f-4962-8afa-bd7fbbcd6ba7",
              name: "Jordan",
              brand: "Nikes",
              price: 150,
              discount: 20,
              originalPrice: 187.5,
              images: "1747112007653-shoes7.png",
              inStock: true,
              isNew: true,
              totalStock: 10,
              createdAt: "2025-05-13T04:53:27.662Z",
              Category: { categoryName: "Jordan" },
              Collection: { collectionName: "Women" },
            },
            {
              id: "f0018c35-07ff-4c51-8d4b-8d744066dc99",
              name: "Jordan",
              brand: "Nikes",
              price: 150,
              discount: 20,
              originalPrice: 187.5,
              images: "1747644103106-shoes7.png",
              inStock: true,
              isNew: true,
              totalStock: 10,
              createdAt: "2025-05-19T08:41:43.117Z",
              Category: { categoryName: "Jordan" },
              Collection: { collectionName: "Women" },
            },
          ],
        };
        setProducts(result.data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <Card>
          <CardContent>
            <p>Loading products...</p>
          </CardContent>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>
            Manage your products and view their details.
          </CardDescription>
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
                <TableHead className="hidden md:table-cell">Collection</TableHead>
                <TableHead className="hidden md:table-cell">Created At</TableHead>
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
                      src={`/images/${product.images}`} // Adjust path based on your backend
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
                    {product.Category.categoryName}
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
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Delete</DropdownMenuItem>
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
