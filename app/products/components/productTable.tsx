"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchProductAdmin, deleteProduct } from "@/store/productSlice"
import {
  ArrowLeft,
  Edit,
  Eye,
  Package,
  Trash2,
  Calendar,
  Tag,
  Palette,
  Ruler,
  HardDrive,
  Cpu,
  Star,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import ProductForm from "./productForm"

export default function ProductTable() {
  const [isEditing, setIsEditing] = useState(false)
  const { id } = useParams()
  const dispatch = useAppDispatch()
  const router = useRouter()
  const CLOUDINARY_VERSION = "v1750340657"

  const { product } = useAppSelector((state) => state.adminProducts)

  useEffect(() => {
    if (id) dispatch(fetchProductAdmin(id as string))
  }, [dispatch, id])

  const handleDelete = async () => {
    if (id && confirm("Are you sure you want to delete this product?")) {
      try {
        await dispatch(deleteProduct(id as string)).unwrap()
        router.push("/admin/products")
      } catch (error) {
        console.error("Error deleting product:", error)
        alert("Failed to delete product. Please try again.")
      }
    }
  }

  const formatDate = (date: string) =>
    new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "NPR",
    }).format(price)

  if (!product) return <p>Loading...</p>

  if (isEditing) {
    return <ProductForm closeModal={() => setIsEditing(false)} product={product} />
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/products">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-muted-foreground">Product ID: {product.id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => alert("Preview not implemented")}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {product.image.map((img, index) => {
                  const imageUrl = img.startsWith("/uploads")
                    ? `https://res.cloudinary.com/dxpe7jikz/image/upload/${CLOUDINARY_VERSION}${img.replace("/uploads", "")}.jpg`
                    : img
                  return (
                    <div key={index} className="aspect-square relative rounded-lg overflow-hidden border">
                      <Image
                        src={imageUrl}
                        alt={`${product.name} - Image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {product.description.map((desc, index) => (
                <p key={index} className="text-sm leading-relaxed">{desc}</p>
              ))}
            </CardContent>
          </Card>

          {/* Key Features */}
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
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Specifications */}
          <Card>
            <CardHeader>
              <CardTitle>Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {product.spec.map((specification, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-2" />
                    <span>{specification}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Badge variant={product.inStock ? "default" : "destructive"}>
                {product.inStock ? "In Stock" : "Out of Stock"}
              </Badge>
              {product.isNew && <Badge variant="secondary">New</Badge>}
              {product.badge && <Badge variant="outline">{product.badge}</Badge>}
              {product.discount > 0 && (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  {product.discount}% OFF
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* Pricing */}
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

          {/* Stock Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Stock Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Total Stock:</span>
                <span>{product.totalStock} units</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">Status:</span>
                <Badge variant={product.inStock ? "default" : "destructive"} className="text-xs">
                  {product.inStock ? "Available" : "Unavailable"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Variants */}
          <Card>
            <CardHeader>
              <CardTitle>Variants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Colors", icon: <Palette />, items: product.color },
                { label: "Sizes", icon: <Ruler />, items: product.size },
                { label: "RAM", icon: <Cpu />, items: product.RAM },
                { label: "Storage", icon: <HardDrive />, items: product.ROM },
              ].map(({ label, icon, items }) => (
                <div key={label}>
                  <div className="flex items-center gap-2 mb-2">
                    {icon}
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {items.map((val, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {val}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Category & Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Brand:</span>
                <span>{product.brand}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Category:</span>
                <Badge variant="secondary">{product.Category.categoryName}</Badge>
              </div>
             
              <Separator />
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <span>Created: {formatDate(product.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <span>Updated: {formatDate(product.updatedAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
