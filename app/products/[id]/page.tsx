"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Edit,
  
  Package,
  Trash2,
  Calendar,
  Tag,
  Palette,
  Ruler,
  HardDrive,
  Cpu,
  Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProductAdmin, deleteProduct} from "@/store/productSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,

} from "@/components/ui/dialog";
import { Status } from "@/store/authSlice";
import ProductForm from "../components/productForm";

export default function ProductDetailsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { product, status } = useAppSelector((state) => state.adminProducts);

  const CLOUDINARY_VERSION = process.env.NEXT_PUBLIC_CLOUDINARY_VERSION || "v1750340657";

  useEffect(() => {
    if (id) dispatch(fetchProductAdmin(id as string));
  }, [dispatch, id]);

  // Refresh product details after successful edit
  useEffect(() => {
    if (status === Status.SUCCESS && id) {
      dispatch(fetchProductAdmin(id as string)); // Refresh product details
      setIsModalOpen(false); 
    }
  }, [status, dispatch, id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "NPR",
    }).format(price);
  };

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await dispatch(deleteProduct(id as string));
        router.push("/products"); // Redirect to product list after deletion
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Failed to delete product. Please try again.");
      }
    }
  };

  const closeModal = () => setIsModalOpen(false);

  if (!product) return <p>Loading...</p>;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/products">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-muted-foreground">Product ID: {product.id}</p>
          </div>
        </div>
        <div className="flex gap-2">
        
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
  <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)}>
    <Edit className="h-4 w-4 mr-2" />
    Edit
  </Button>
  <DialogContent className="max-w-[90vw] w-full md:max-w-7xl p-0 m-0 h-[90vh] overflow-y-auto">
    <DialogHeader className="px-6 py-4 border-b sticky top-0 bg-background z-10">
      <DialogTitle>Edit Product</DialogTitle>
      <DialogDescription>
        Modify the product details below and save your changes.
      </DialogDescription>
    </DialogHeader>
    <ProductForm closeModal={closeModal} product={product} />
  </DialogContent>
</Dialog>

          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {product?.image.map((img, index) => {
                  const imageUrl = img
                    ? `https://res.cloudinary.com/dxpe7jikz/image/upload/f_auto/${CLOUDINARY_VERSION}${img.replace(
                        "/uploads",
                        ""
                      )}`
                    : "https://via.placeholder.com/300x300?text=No+Image";
                  return (
                    <div key={index} className="aspect-square relative rounded-lg overflow-hidden border">
                      <Image
                        src={imageUrl}
                        alt={`${product?.name ?? "Product"} - Image ${index + 1}`}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                        priority={index === 0} // Add priority to the first image (likely LCP)
                        className="object-cover"
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {product.description.map((desc, index) => (
                <p key={index} className="text-sm leading-relaxed">
                  {desc}
                </p>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Key Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {product.keyFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {product.spec.map((specification, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
                    <span>{specification}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant={product.inStock ? "default" : "destructive"}>
                  {product.inStock ? "In Stock" : "Out of Stock"}
                </Badge>
                {product.isNew && <Badge variant="secondary">New</Badge>}
                {product.discount > 0 && (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    {product.discount}% OFF
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold">{formatPrice(product.price)}</span>
                {product.originalPrice > product.price && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
              {product.discount > 0 && (
                <p className="text-sm text-green-600">
                  Save {formatPrice(product.originalPrice - product.price)} ({product.discount}% off)
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Stock Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Total Stock:</span>
                <span className="text-sm">{product.totalStock} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Status:</span>
                <Badge variant={product.inStock ? "default" : "destructive"} className="text-xs">
                  {product.inStock ? "Available" : "Unavailable"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Variants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Palette className="h-4 w-4" />
                  <span className="text-sm font-medium">Colors</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {product.color.map((color, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {color}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Ruler className="h-4 w-4" />
                  <span className="text-sm font-medium">Sizes</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {product.size.map((size, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {size}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Cpu className="h-4 w-4" />
                  <span className="text-sm font-medium">RAM</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {product.RAM.map((ram, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {ram}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <HardDrive className="h-4 w-4" />
                  <span className="text-sm font-medium">Storage</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {product.ROM.map((storage, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {storage}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Category & Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Brand:</span>
                <span className="text-sm">{product.brand}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Category:</span>
                <Badge variant="secondary">{product.Category.categoryName}</Badge>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Created: {formatDate(product.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Updated: {formatDate(product.updatedAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
