"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
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

// Sample product data based on your interface
const sampleProduct = {
  id: "prod_123456789",
  name: "iPhone 15 Pro Max",
  brand: "Apple",
  price: 1199,
  originalPrice: 1299,
  image: [
    "/placeholder.svg?height=400&width=400",
    "/placeholder.svg?height=400&width=400",
    "/placeholder.svg?height=400&width=400",
    "/placeholder.svg?height=400&width=400",
  ],
  inStock: true,
  isNew: true,
  size: ["6.1 inch", "6.7 inch"],
  color: ["Natural Titanium", "Blue Titanium", "White Titanium", "Black Titanium"],
  badge: "Best Seller",
  discount: 8,
  RAM: ["8GB"],
  ROM: ["128GB", "256GB", "512GB", "1TB"],
  spec: [
    "A17 Pro chip with 6-core GPU",
    "Pro camera system with 48MP Main camera",
    "Up to 29 hours video playback",
    "Face ID for secure authentication",
    "iOS 17 with new features",
  ],
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-20T14:45:00Z",
  categoryId: "cat_smartphones",
  Category: {
    categoryName: "Smartphones",
  },
  description: [
    "The iPhone 15 Pro Max is Apple's most advanced iPhone yet, featuring the powerful A17 Pro chip and a revolutionary titanium design.",
    "With its advanced camera system, you can capture stunning photos and videos in any lighting condition.",
    "The large 6.7-inch Super Retina XDR display provides an immersive viewing experience for all your content.",
  ],
  keyFeatures: [
    "Titanium design - Strong, light, and durable",
    "A17 Pro chip - The most powerful chip in a smartphone",
    "Pro camera system - Professional-grade photography",
    "Action Button - Customizable for your most-used features",
    "USB-C connectivity - Universal charging and data transfer",
  ],
  totalStock: 150,
}

export default function ProductDetailsPage() {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/products">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{sampleProduct.name}</h1>
            <p className="text-muted-foreground">Product ID: {sampleProduct.id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Images and Basic Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {sampleProduct.image.map((img, index) => (
                  <div key={index} className="aspect-square relative rounded-lg overflow-hidden border">
                    <Image
                      src={img || "/placeholder.svg"}
                      alt={`${sampleProduct.name} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Product Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sampleProduct.description.map((desc, index) => (
                <p key={index} className="text-sm leading-relaxed">
                  {desc}
                </p>
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
                {sampleProduct.keyFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
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
                {sampleProduct.spec.map((specification, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
                    <span>{specification}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Product Details */}
        <div className="space-y-6">
          {/* Status and Badges */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant={sampleProduct.inStock ? "default" : "destructive"}>
                  {sampleProduct.inStock ? "In Stock" : "Out of Stock"}
                </Badge>
                {sampleProduct.isNew && <Badge variant="secondary">New</Badge>}
                {sampleProduct.badge && <Badge variant="outline">{sampleProduct.badge}</Badge>}
                {sampleProduct.discount > 0 && (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    {sampleProduct.discount}% OFF
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold">{formatPrice(sampleProduct.price)}</span>
                {sampleProduct.originalPrice > sampleProduct.price && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(sampleProduct.originalPrice)}
                  </span>
                )}
              </div>
              {sampleProduct.discount > 0 && (
                <p className="text-sm text-green-600">
                  Save {formatPrice(sampleProduct.originalPrice - sampleProduct.price)} ({sampleProduct.discount}% off)
                </p>
              )}
            </CardContent>
          </Card>

          {/* Stock Information */}
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
                <span className="text-sm">{sampleProduct.totalStock} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Status:</span>
                <Badge variant={sampleProduct.inStock ? "default" : "destructive"} className="text-xs">
                  {sampleProduct.inStock ? "Available" : "Unavailable"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Product Variants */}
          <Card>
            <CardHeader>
              <CardTitle>Variants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Colors */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Palette className="h-4 w-4" />
                  <span className="text-sm font-medium">Colors</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {sampleProduct.color.map((color, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {color}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Ruler className="h-4 w-4" />
                  <span className="text-sm font-medium">Sizes</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {sampleProduct.size.map((size, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {size}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* RAM */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Cpu className="h-4 w-4" />
                  <span className="text-sm font-medium">RAM</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {sampleProduct.RAM.map((ram, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {ram}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Storage */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <HardDrive className="h-4 w-4" />
                  <span className="text-sm font-medium">Storage</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {sampleProduct.ROM.map((storage, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {storage}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category and Metadata */}
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
                <span className="text-sm">{sampleProduct.brand}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Category:</span>
                <Badge variant="secondary">{sampleProduct.Category.categoryName}</Badge>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Created: {formatDate(sampleProduct.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Updated: {formatDate(sampleProduct.updatedAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
