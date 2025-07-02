import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Save, X, AlertCircle } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createProduct, updateProduct } from "@/store/productSlice";
import { fetchCategoryItems } from "@/store/categoriesSlice";
import { IProduct } from "../types";



interface ModalProps {
  closeModal: () => void;
  product?: IProduct;
}

interface Errors {
  name?: string;
  brand?: string;
  price?: string;
  originalPrice?: string;
  totalStock?: string;
  categoryId?: string;
  image?: string;
  RAM?: string;
  ROM?: string;
  size?: string;
  color?: string;
  spec?: string;
  description?: string;
  keyFeatures?: string;
}

const ProductForm = ({ closeModal, product }: ModalProps) => {
  const dispatch = useAppDispatch();
  const { items: categories } = useAppSelector((store) => store.category);

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
    discount: product?.discount || 0,
    RAM: product?.RAM || [],
    ROM: product?.ROM || [],
    spec: product?.spec || [],
    description: product?.description || [],
    keyFeatures: product?.keyFeatures || [],
    totalStock: product?.totalStock || 0,
    categoryId: product?.categoryId || "",
  });

  const [errors, setErrors] = useState<Errors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newImages, setNewImages] = useState<File[]>([]);

  // Fetch categories
  useEffect(() => {
    if (!categories.length) {
      dispatch(fetchCategoryItems());
    }
  }, [dispatch, categories.length]);

  // Validate form
  const validateForm = () => {
    const newErrors: Errors = {};
    if (!formData.name?.trim()) newErrors.name = "Product name is required";
    if (!formData.brand?.trim()) newErrors.brand = "Brand is required";
    if (!formData.price || formData.price <= 0) newErrors.price = "Price must be greater than 0";
    if (formData.originalPrice && formData.originalPrice < formData.price) newErrors.originalPrice = "Original price must be greater than current price";
    if (!formData.totalStock || formData.totalStock < 0) newErrors.totalStock = "Stock quantity cannot be negative";
    if (!formData.categoryId) newErrors.categoryId = "Category is required";
    if (!formData.image?.length && !newImages.length) newErrors.image = "At least one image is required";
    if (!formData.RAM?.length) newErrors.RAM = "At least one RAM option is required";
    if (!formData.ROM?.length) newErrors.ROM = "At least one storage option is required";
    if (!formData.size?.length) newErrors.size = "At least one size option is required";
    if (!formData.color?.length) newErrors.color = "At least one color option is required";
    if (!formData.spec?.length) newErrors.spec = "At least one specification is required";
    if (!formData.description?.length) newErrors.description = "At least one description point is required";
    if (!formData.keyFeatures?.length) newErrors.keyFeatures = "At least one key feature is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "image") {
      const input = e.target as HTMLInputElement;
      const files = Array.from(input.files || []);
      setNewImages(files);
      return;
    }

    // Handle comma-separated fields for arrays
    if (
      name === "RAM" ||
      name === "ROM" ||
      name === "size" ||
      name === "color" ||
      name === "spec" ||
      name === "description" ||
      name === "keyFeatures"
    ) {
      setFormData({
        ...formData,
        [name]: value.split(",").map((item) => item.trim()).filter(Boolean),
      });
    } else if (name === "price" || name === "originalPrice" || name === "totalStock") {
      setFormData({
        ...formData,
        [name]: Number(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "image") return; // Skip existing images
        formDataToSend.append(key, Array.isArray(value) ? JSON.stringify(value) : String(value));
      });

      // Append new images
      newImages.forEach((image, index) => {
        formDataToSend.append(`image[${index}]`, image);
      });

      // Calculate discount
      const discount =
        formData.originalPrice && formData.price && formData.originalPrice > formData.price
          ? Math.round(((formData.originalPrice - formData.price) / formData.originalPrice) * 100)
          : 0;

      const productData: IProduct = {
        ...formData,
        image: [],
        discount,
      } as IProduct;

      // Dispatch create or update action
      if (product) {
        await dispatch(updateProduct(productData));
      } else {
        await dispatch(createProduct(productData));
      }

      setIsSubmitting(false);
      closeModal();
    } catch  {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full p-6">
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">{product ? "Edit Product" : "Add Product"}</CardTitle>
          <Button
            variant="ghost"
            className="text-gray-500 hover:text-red-500"
            onClick={closeModal}
          >
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={errors.name ? "border-red-500" : ""}
                  placeholder="e.g., MacBook Pro"
                />
                {errors.name && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.name}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Brand <span className="text-red-500">*</span></Label>
                <Input
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className={errors.brand ? "border-red-500" : ""}
                  placeholder="e.g., Apple"
                />
                {errors.brand && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.brand}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price (NPR) <span className="text-red-500">*</span></Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  className={errors.price ? "border-red-500" : ""}
                  placeholder="1999.99"
                />
                {errors.price && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.price}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="originalPrice">Original Price (NPR)</Label>
                <Input
                  id="originalPrice"
                  name="originalPrice"
                  type="number"
                  step="0.01"
                  value={formData.originalPrice}
                  onChange={handleChange}
                  className={errors.originalPrice ? "border-red-500" : ""}
                  placeholder="2299.99"
                />
                {errors.originalPrice && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.originalPrice}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalStock">Stock Quantity <span className="text-red-500">*</span></Label>
                <Input
                  id="totalStock"
                  name="totalStock"
                  type="number"
                  value={formData.totalStock}
                  onChange={handleChange}
                  className={errors.totalStock ? "border-red-500" : ""}
                  placeholder="50"
                />
                {errors.totalStock && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.totalStock}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryId">Category <span className="text-red-500">*</span></Label>
                <Select
                  name="categoryId"
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger className={errors.categoryId ? "border-red-500" : ""}>
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
                <Label htmlFor="image">Images <span className="text-red-500">*</span></Label>
                <Input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleChange}
                  className={errors.image ? "border-red-500" : ""}
                />
                {errors.image && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.image}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="RAM">RAM Options (comma-separated) <span className="text-red-500">*</span></Label>
                <Input
                  id="RAM"
                  name="RAM"
                  value={formData.RAM?.join(", ") || ""}
                  onChange={handleChange}
                  className={errors.RAM ? "border-red-500" : ""}
                  placeholder="e.g., 8GB, 16GB, 32GB"
                />
                {errors.RAM && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.RAM}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="ROM">Storage Options (comma-separated) <span className="text-red-500">*</span></Label>
                <Input
                  id="ROM"
                  name="ROM"
                  value={formData.ROM?.join(", ") || ""}
                  onChange={handleChange}
                  className={errors.ROM ? "border-red-500" : ""}
                  placeholder="e.g., 256GB SSD, 512GB SSD"
                />
                {errors.ROM && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.ROM}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="size">Screen Sizes (comma-separated) <span className="text-red-500">*</span></Label>
                <Input
                  id="size"
                  name="size"
                  value={formData.size?.join(", ") || ""}
                  onChange={handleChange}
                  className={errors.size ? "border-red-500" : ""}
                  placeholder="e.g., 13-inch, 15-inch"
                />
                {errors.size && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.size}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Colors (comma-separated) <span className="text-red-500">*</span></Label>
                <Input
                  id="color"
                  name="color"
                  value={formData.color?.join(", ") || ""}
                  onChange={handleChange}
                  className={errors.color ? "border-red-500" : ""}
                  placeholder="e.g., Silver, Space Gray"
                />
                {errors.color && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.color}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="spec">Specifications (comma-separated) <span className="text-red-500">*</span></Label>
                <Textarea
                  id="spec"
                  name="spec"
                  value={formData.spec?.join(", ") || ""}
                  onChange={handleChange}
                  className={errors.spec ? "border-red-500" : ""}
                  placeholder="e.g., Intel Core i7, 14-core CPU"
                />
                {errors.spec && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.spec}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (comma-separated) <span className="text-red-500">*</span></Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description?.join(", ") || ""}
                  onChange={handleChange}
                  className={errors.description ? "border-red-500" : ""}
                  placeholder="e.g., High-performance M3 chip, Stunning Retina display"
                />
                {errors.description && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.description}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="keyFeatures">Key Features (comma-separated) <span className="text-red-500">*</span></Label>
                <Textarea
                  id="keyFeatures"
                  name="keyFeatures"
                  value={formData.keyFeatures?.join(", ") || ""}
                  onChange={handleChange}
                  className={errors.keyFeatures ? "border-red-500" : ""}
                  placeholder="e.g., 22-hour battery life, Thunderbolt 4 ports"
                />
                {errors.keyFeatures && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.keyFeatures}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <Switch
                    id="inStock"
                    checked={formData.inStock}
                    onCheckedChange={(checked) => setFormData({ ...formData, inStock: checked })}
                  />
                  <Label htmlFor="inStock">In Stock</Label>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <Switch
                    id="isNew"
                    checked={formData.isNew}
                    onCheckedChange={(checked) => setFormData({ ...formData, isNew: checked })}
                  />
                  <Label htmlFor="isNew">New Product</Label>
                </div>
              </div>
            </div>
           
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-cyan-600 hover:bg-cyan-700"
            >
              {isSubmitting ? "Saving..." : product ? "Update Product" : "Create Product"}
              <Save className="w-4 h-4 ml-2" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductForm; 