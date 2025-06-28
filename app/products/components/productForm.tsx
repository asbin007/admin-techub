"use client"

import React, { ChangeEvent, FormEvent, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Plus,
  X,
  Save,
  Eye,
  Upload,
  Package,
  Settings,
  FileText,
  ImageIcon,
  Cpu,
  HardDrive,
  Monitor,
  Palette,
  Star,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  BarChart3,
} from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { addProduct, updateProduct } from "@/store/productSlice"
import { fetchCategoryItems, resetStatus } from "@/store/categoriesSlice"
import { fetchCollection } from "@/store/collectionSlice"
import { IProduct } from "../types"
import { Status } from "@/store/authSlice"

interface ModalProps {
  closeModal: () => void
  product?: IProduct // Optional product for editing
}

const ramOptions = ["4GB", "8GB", "16GB", "32GB", "64GB", "128GB"]
const romOptions = ["128GB SSD", "256GB SSD", "512GB SSD", "1TB SSD", "2TB SSD", "4TB SSD", "1TB HDD", "2TB HDD"]
const sizeOptions = ["11-inch", "12-inch", "13-inch", "14-inch", "15-inch", "16-inch", "17-inch", "18-inch"]
const colorOptions = [
  "Silver",
  "Space Gray",
  "Black",
  "White",
  "Blue",
  "Red",
  "Gold",
  "Rose Gold",
  "Midnight",
  "Starlight",
]

const ProductForm: React.FC<ModalProps> = ({ closeModal, product }) => {
  const dispatch = useAppDispatch()
  const { items: categories } = useAppSelector((store) => store.category)
  const { status } = useAppSelector((store) => store.adminProducts)

  const [formData, setFormData] = useState<Partial<IProduct>>({
    id: product?.id || `product_${Date.now()}`,
    name: product?.name || "",
    brand: product?.brand || "",
    price: product?.price || 0,
    originalPrice: product?.originalPrice || 0,
    image: product?.image || [],
    inStock: product?.inStock ?? true,
    isNew: product?.isNew ?? false,
    size: product?.size || [],
    color: product?.color || [],
    badge: product?.badge || "",
    discount: product?.discount || 0,
    RAM: product?.RAM || [],
    ROM: product?.ROM || [],
    spec: product?.spec || [],
    categoryId: product?.categoryId || "",
    description: product?.description || [],
    keyFeatures: product?.keyFeatures || [],
    totalStock: product?.totalStock || 0,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newImage, setNewImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [newSpec, setNewSpec] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [newKeyFeature, setNewKeyFeature] = useState("")

  const CLOUDINARY_UPLOAD_PRESET = "your_upload_preset" // Replace with your Cloudinary upload preset
  const CLOUDINARY_CLOUD_NAME = "dxpe7jikz"
  const CLOUDINARY_VERSION = "v1750340657"

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name?.trim()) newErrors.name = "Product name is required"
    if (!formData.brand) newErrors.brand = "Brand selection is required"
    if (!formData.price || formData.price <= 0) newErrors.price = "Valid price is required"
    if (!formData.categoryId) newErrors.categoryId = "Category selection is required"
    if (!formData.totalStock || formData.totalStock < 0) newErrors.totalStock = "Valid stock quantity is required"
    if (!formData.image?.length) newErrors.image = "At least one product image is required"
    if (!formData.RAM?.length) newErrors.RAM = "At least one RAM option is required"
    if (!formData.ROM?.length) newErrors.ROM = "At least one storage option is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof IProduct, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const addToArray = (field: keyof IProduct, value: string) => {
    if (value.trim()) {
      const currentArray = (formData[field] as string[]) || []
      setFormData((prev) => ({
        ...prev,
        [field]: [...currentArray, value.trim()],
      }))
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: "" }))
      }
    }
  }

  const removeFromArray = (field: keyof IProduct, index: number) => {
    const currentArray = (formData[field] as string[]) || []
    setFormData((prev) => ({
      ...prev,
      [field]: currentArray.filter((_, i) => i !== index),
    }))
  }

  const toggleArrayItem = (field: keyof IProduct, value: string) => {
    const currentArray = (formData[field] as string[]) || []
    if (currentArray.includes(value)) {
      setFormData((prev) => ({
        ...prev,
        [field]: currentArray.filter((item) => item !== value),
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: [...currentArray, value],
      }))
    }
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET)

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      )
      const data = await response.json()
      return `/uploads/${data.public_id}`
    } catch (error) {
      console.error("Error uploading image to Cloudinary:", error)
      throw new Error("Failed to upload image")
    }
  }

  const calculateDiscount = () => {
    if (formData.originalPrice && formData.price && formData.originalPrice > formData.price) {
      return Math.round(((formData.originalPrice - formData.price) / formData.originalPrice) * 100)
    }
    return 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      let imageUrls = formData.image || []
      if (newImage) {
        const uploadedImage = await uploadImageToCloudinary(newImage)
        imageUrls = [...imageUrls, uploadedImage]
      }

      const productData = {
        ...formData,
        id: formData.id || `product_${Date.now()}`,
        image: imageUrls,
        discount: calculateDiscount(),
        createdAt: formData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        Category: {
          id: formData.categoryId || "",
          categoryName: categories.find((cat) => cat.id === formData.categoryId)?.categoryName || "",
        },
        categoryId: formData.categoryId || "",
      }

      if (product) {
        await dispatch(updateProduct(productData)).unwrap()
      } else {
        await dispatch(addProduct(productData)).unwrap()
      }
    } catch (error) {
      console.error("Error saving product:", error)
      setErrors((prev) => ({ ...prev, submit: "Failed to save product. Please try again." }))
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    dispatch(fetchCategoryItems())
    dispatch(fetchCollection())
  }, [dispatch])

  useEffect(() => {
    if (status === Status.SUCCESS) {
      closeModal()
      dispatch(resetStatus())
    }
  }, [status, closeModal, dispatch])

  const selectedCategory = categories.find((cat) => cat.id === formData.categoryId)
  const discountPercentage = calculateDiscount()

  return (
    <div className="fixed inset-0 w-full h-full bg-white overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b shadow-sm p-6 sticky top-0 z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{product ? "Edit Product" : "Create New Product"}</h1>
              <p className="text-gray-500 mt-1 text-sm">
                {product ? "Update product details and specifications" : "Add a new product to your inventory"}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <Button
              variant="outline"
              className="h-10 bg-transparent flex-1 sm:flex-none border-gray-300 hover:bg-gray-100"
              onClick={() => alert("Preview not implemented")} // Replace with actual preview logic
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="h-10 bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-none"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {product ? "Update Product" : "Create Product"}
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              className="h-10 text-gray-500 hover:text-red-500"
              onClick={closeModal}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full bg-gray-50 border rounded-lg">
              <TabsTrigger value="basic" className="text-sm py-2">
                <Package className="w-4 h-4 mr-2" />
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="media" className="text-sm py-2">
                <ImageIcon className="w-4 h-4 mr-2" />
                Media
              </TabsTrigger>
              <TabsTrigger value="specs" className="text-sm py-2">
                <Settings className="w-4 h-4 mr-2" />
                Specs
              </TabsTrigger>
              <TabsTrigger value="content" className="text-sm py-2">
                <FileText className="w-4 h-4 mr-2" />
                Content
              </TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-6">
              <Card className="border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    Product Information
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-500">
                    Enter the core details and pricing for the product
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                        Product Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="e.g., MacBook Pro 16-inch M3 Max"
                        className={`h-10 ${errors.name ? "border-red-500" : "border-gray-300"}`}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="brand" className="text-sm font-medium text-gray-700">
                        Brand <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="brand"
                        value={formData.brand}
                        onChange={(e) => handleInputChange("brand", e.target.value)}
                        placeholder="e.g., Apple"
                        className={`h-10 ${errors.brand ? "border-red-500" : "border-gray-300"}`}
                      />
                      {errors.brand && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.brand}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="price" className="text-sm font-medium text-gray-700">
                        Current Price <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => handleInputChange("price", Number.parseFloat(e.target.value) || 0)}
                          placeholder="1999.99"
                          className={`h-10 pl-10 ${errors.price ? "border-red-500" : "border-gray-300"}`}
                        />
                      </div>
                      {errors.price && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.price}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="originalPrice" className="text-sm font-medium text-gray-700">
                        Original Price
                      </Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="originalPrice"
                          type="number"
                          step="0.01"
                          value={formData.originalPrice}
                          onChange={(e) => handleInputChange("originalPrice", Number.parseFloat(e.target.value) || 0)}
                          placeholder="2299.99"
                          className="h-10 pl-10 border-gray-300"
                        />
                      </div>
                      {discountPercentage > 0 && (
                        <p className="text-sm text-green-600 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          {discountPercentage}% discount
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="totalStock" className="text-sm font-medium text-gray-700">
                        Stock Quantity <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <BarChart3 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="totalStock"
                          type="number"
                          value={formData.totalStock}
                          onChange={(e) => handleInputChange("totalStock", Number.parseInt(e.target.value) || 0)}
                          placeholder="50"
                          className={`h-10 pl-10 ${errors.totalStock ? "border-red-500" : "border-gray-300"}`}
                        />
                      </div>
                      {errors.totalStock && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.totalStock}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                        Category <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.categoryId}
                        onValueChange={(value) => handleInputChange("categoryId", value)}
                        onOpenChange={(open) => open && dispatch(fetchCategoryItems())}
                      >
                        <SelectTrigger className={`h-10 ${errors.categoryId ? "border-red-500" : "border-gray-300"}`}>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.categoryName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.categoryId && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.categoryId}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="collection" className="text-sm font-medium text-gray-700">
                        Collection
                      </Label>
                     
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="badge" className="text-sm font-medium text-gray-700">
                      Product Badge
                    </Label>
                    <Input
                      id="badge"
                      value={formData.badge}
                      onChange={(e) => handleInputChange("badge", e.target.value)}
                      placeholder="e.g., Best Seller, New Arrival, Limited Edition"
                      className="h-10 border-gray-300"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-lg gap-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                      <div className="flex items-center space-x-3">
                        <Switch
                          id="inStock"
                          checked={formData.inStock}
                          onCheckedChange={(checked) => handleInputChange("inStock", checked)}
                        />
                        <Label htmlFor="inStock" className="text-sm font-medium text-gray-700">
                          In Stock
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Switch
                          id="isNew"
                          checked={formData.isNew}
                          onCheckedChange={(checked) => handleInputChange("isNew", checked)}
                        />
                        <Label htmlFor="isNew" className="text-sm font-medium text-gray-700">
                          New Product
                        </Label>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Product will be {formData.inStock ? "available" : "unavailable"} for purchase
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Media Tab */}
            <TabsContent value="media" className="space-y-6">
              <Card className="border-gray-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-blue-600" />
                    Product Images
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-500">
                    Upload high-quality images of the product
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-base font-medium text-gray-900 mb-2">Upload Product Images</h3>
                    <p className="text-sm text-gray-500 mb-4">Select an image file to upload to Cloudinary</p>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="mx-auto max-w-md h-10"
                    />
                    {imagePreview && (
                      <div className="mt-4">
                        <img
                          src={imagePreview}
                          alt="Image Preview"
                          className="max-w-[200px] mx-auto rounded-lg"
                        />
                      </div>
                    )}
                  </div>

                  {errors.image && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errors.image}</AlertDescription>
                    </Alert>
                  )}

                  {formData.image && formData.image.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900 text-base">
                        Added Images ({formData.image.length})
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {formData.image.map((img, index) => (
                          <div key={index} className="relative group border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <ImageIcon className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-sm">Image {index + 1}</p>
                                  <p className="text-xs text-gray-500 truncate max-w-[150px]">
                                    {img.startsWith("/uploads") ? `Cloudinary: ${img}` : img}
                                  </p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFromArray("image", index)}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Specifications Tab */}
            <TabsContent value="specs" className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <Card className="border-gray-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-blue-600" />
                      Hardware Specifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <HardDrive className="w-4 h-4" />
                        RAM Options <span className="text-red-500">*</span>
                      </Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {ramOptions.map((ram) => (
                          <Badge
                            key={ram}
                            variant={formData.RAM?.includes(ram) ? "default" : "outline"}
                            className="cursor-pointer justify-center py-2 text-sm"
                            onClick={() => toggleArrayItem("RAM", ram)}
                          >
                            {ram}
                          </Badge>
                        ))}
                      </div>
                      {errors.RAM && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.RAM}
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <HardDrive className="w-4 h-4" />
                        Storage Options <span className="text-red-500">*</span>
                      </Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {romOptions.map((rom) => (
                          <Badge
                            key={rom}
                            variant={formData.ROM?.includes(rom) ? "default" : "outline"}
                            className="cursor-pointer justify-center py-2 text-sm"
                            onClick={() => toggleArrayItem("ROM", rom)}
                          >
                            {rom}
                          </Badge>
                        ))}
                      </div>
                      {errors.ROM && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.ROM}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Monitor className="w-5 h-5 text-blue-600" />
                      Physical Specifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Monitor className="w-4 h-4" />
                        Screen Sizes
                      </Label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {sizeOptions.map((size) => (
                          <Badge
                            key={size}
                            variant={formData.size?.includes(size) ? "default" : "outline"}
                            className="cursor-pointer justify-center py-2 text-sm"
                            onClick={() => toggleArrayItem("size", size)}
                          >
                            {size}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Palette className="w-4 h-4" />
                        Available Colors
                      </Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {colorOptions.map((color) => (
                          <Badge
                            key={color}
                            variant={formData.color?.includes(color) ? "default" : "outline"}
                            className="cursor-pointer justify-center py-2 text-sm"
                            onClick={() => toggleArrayItem("color", color)}
                          >
                            {color}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings className="w-5 h-5 text-blue-600" />
                      Additional Specifications
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-500">
                      Add detailed technical specifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex gap-3">
                      <Textarea
                        value={newSpec}
                        onChange={(e) => setNewSpec(e.target.value)}
                        placeholder="e.g., Intel Core i7-13700H, 14-core CPU"
                        className="flex-1 h-20 border-gray-300"
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          addToArray("spec", newSpec)
                          setNewSpec("")
                        }}
                        disabled={!newSpec.trim()}
                        className="h-10"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    {formData.spec && formData.spec.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900 text-base">
                          Technical Specifications ({formData.spec.length})
                        </h4>
                        <div className="space-y-2">
                          {formData.spec.map((spec, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-medium text-blue-600">{index + 1}</span>
                                </div>
                                <span className="text-sm text-gray-900">{spec}</span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFromArray("spec", index)}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <Card className="border-gray-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      Product Description
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-500">
                      Add detailed description points
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-3">
                      <Textarea
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        placeholder="e.g., Experience unprecedented performance with the M3 chip"
                        className="flex-1 h-24 border-gray-300"
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          addToArray("description", newDescription)
                          setNewDescription("")
                        }}
                        disabled={!newDescription.trim()}
                        className="h-10"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    {formData.description && formData.description.length > 0 && (
                      <div className="space-y-2">
                        {formData.description.map((desc, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                          >
                            <span className="text-sm text-gray-900 flex-1">{desc}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromArray("description", index)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-gray-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Star className="w-5 h-5 text-blue-600" />
                      Key Features
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-500">
                      Highlight key selling points
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-3">
                      <Input
                        value={newKeyFeature}
                        onChange={(e) => setNewKeyFeature(e.target.value)}
                        placeholder="e.g., 22-hour battery life"
                        className="flex-1 h-10 border-gray-300"
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          addToArray("keyFeatures", newKeyFeature)
                          setNewKeyFeature("")
                        }}
                        disabled={!newKeyFeature.trim()}
                        className="h-10"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    {formData.keyFeatures && formData.keyFeatures.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.keyFeatures.map((feature, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="flex items-center gap-2 py-1 px-3 text-sm"
                          >
                            <Star className="w-4 h-4" />
                            {feature}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 hover:bg-transparent text-gray-400 hover:text-red-500"
                              onClick={() => removeFromArray("keyFeatures", index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900">Product Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Name</span>
                  <span className="font-medium truncate max-w-[200px]">{formData.name || "Not set"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Brand</span>
                  <span className="font-medium">{formData.brand || "Not selected"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Category</span>
                  <span className="font-medium">
                    {selectedCategory ? selectedCategory.categoryName : "Not selected"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Price</span>
                  <span className="font-medium">${formData.price || 0}</span>
                </div>
                {discountPercentage > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Discount</span>
                    <Badge variant="secondary" className="text-green-600">
                      {discountPercentage}% OFF
                    </Badge>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Stock</span>
                  <span className="font-medium">{formData.totalStock || 0} units</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900">Completion Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>Basic Info</span>
                  <CheckCircle2
                    className={`w-4 h-4 ${formData.name && formData.brand && formData.price ? "text-green-500" : "text-gray-300"}`}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>Images</span>
                  <CheckCircle2
                    className={`w-4 h-4 ${formData.image?.length ? "text-green-500" : "text-gray-300"}`}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>Specifications</span>
                  <CheckCircle2
                    className={`w-4 h-4 ${formData.RAM?.length && formData.ROM?.length ? "text-green-500" : "text-gray-300"}`}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span>Content</span>
                  <CheckCircle2
                    className={`w-4 h-4 ${formData.description?.length || formData.keyFeatures?.length ? "text-green-500" : "text-gray-300"}`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm">
            <CardContent className="pt-6 space-y-3">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full h-10 bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving Product...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {product ? "Update Product" : "Create Product"}
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full h-10 border-gray-300 hover:bg-gray-100"
                onClick={() => alert("Preview not implemented")} // Replace with actual preview logic
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview Product
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {errors.submit && (
        <div className="max-w-7xl mx-auto p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errors.submit}</AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  )
}

export default ProductForm