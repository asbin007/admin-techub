import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, X, AlertCircle, Plus, Trash2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createProduct, updateProducts } from "@/store/productSlice";
import { fetchCategoryItems } from "@/store/categoriesSlice";
import { IProduct } from "../types";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ModalProps {
  closeModal: () => void;
  product?: IProduct;
}

interface Errors {
  [key: string]: string | undefined;
}

const ProductForm = ({ closeModal, product }: ModalProps) => {
  const dispatch = useAppDispatch();
  const { items: categories } = useAppSelector((store) => store.category);

  // Common options for dropdowns
  const RAM_OPTIONS = ["4GB", "8GB", "16GB", "32GB", "64GB"];
  const ROM_OPTIONS = ["64GB", "128GB", "256GB", "512GB", "1TB", "2TB"];
  const SIZE_OPTIONS = ["13", "14", "16", "17", "18"];
  const COLOR_OPTIONS = [
    "Black",
    "White",
    "Silver",
    "Gold",
    "Blue",
    "Red",
    "Green",
    "Pink",
    "Gray",
    "Space Gray",
  ];

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
  const [newTagInputs, setNewTagInputs] = useState({
    RAM: "",
    ROM: "",
    size: "",
    color: "",
    spec: "",
    description: "",
    keyFeatures: "",
  });

  useEffect(() => {
    if (!categories.length) {
      dispatch(fetchCategoryItems());
    }
  }, [dispatch, categories.length]);

  const validateForm = () => {
    const newErrors: Errors = {};
    if (!formData.name?.trim()) newErrors.name = "Product name is required";
    if (!formData.brand?.trim()) newErrors.brand = "Brand is required";
    if (!formData.price || formData.price <= 0)
      newErrors.price = "Price must be greater than 0";
    if (
      formData.originalPrice &&
      formData.price &&
      formData.originalPrice < formData.price
    ) {
      newErrors.originalPrice =
        "Original price must be greater than current price";
    }
    if (!formData.totalStock || formData.totalStock < 0)
      newErrors.totalStock = "Stock quantity cannot be negative";
    if (!formData.categoryId) newErrors.categoryId = "Category is required";
    if (!formData.image?.length && !newImages.length)
      newErrors.image = "At least one image is required";
    if (!formData.RAM?.length)
      newErrors.RAM = "At least one RAM option is required";
    if (!formData.ROM?.length)
      newErrors.ROM = "At least one storage option is required";
    if (!formData.size?.length)
      newErrors.size = "At least one size option is required";
    if (!formData.color?.length)
      newErrors.color = "At least one color option is required";
    if (!formData.spec?.length)
      newErrors.spec = "At least one specification is required";
    if (!formData.description?.length)
      newErrors.description = "At least one description point is required";
    if (!formData.keyFeatures?.length)
      newErrors.keyFeatures = "At least one key feature is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "image") {
      const input = e.target as HTMLInputElement;
      const files = Array.from(input.files || []);
      setNewImages(files);
      return;
    }

    if (name === "price" || name === "originalPrice" || name === "totalStock") {
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

  const handleTagInputChange = (field: string, value: string) => {
    setNewTagInputs({
      ...newTagInputs,
      [field]: value,
    });
  };

  const addTag = (field: keyof typeof newTagInputs) => {
    if (!newTagInputs[field].trim()) return;

    const newTags = [
      ...(formData[field] as string[]),
      newTagInputs[field].trim(),
    ];
    setFormData({
      ...formData,
      [field]: newTags,
    });
    setNewTagInputs({
      ...newTagInputs,
      [field]: "",
    });
  };

  const removeTag = (field: string, index: number) => {
    const newTags = [...(formData[field as keyof IProduct] as string[])];
    newTags.splice(index, 1);
    setFormData({
      ...formData,
      [field]: newTags,
    });
  };

  const handleSelectChange = (field: string, value: string) => {
    const fieldValue = formData[field as keyof IProduct];
    if (Array.isArray(fieldValue) && !fieldValue.includes(value)) {
      const newValues = [
        ...fieldValue,
        value,
      ];
      setFormData({
        ...formData,
        [field]: newValues,
      });
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const formDataToSend = new FormData();

      // Append all non-file fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "image") return;

        if (Array.isArray(value)) {
          formDataToSend.append(key, JSON.stringify(value));
        } else if (value !== undefined && value !== null) {
          formDataToSend.append(key, String(value));
        }
      });

      // Append new images with correct field name
      newImages.forEach((file) => {
        formDataToSend.append("image", file);
      });

      if (product?.id) {
        await dispatch(updateProducts(product.id, formDataToSend));
      } else {
        await dispatch(createProduct(formDataToSend));
      }

      closeModal();
    } catch (error) {
      console.error("Submission error:", error);
      setErrors({
        form: error instanceof Error ? error.message : "Failed to save product",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full p-6">
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">
            {product ? "Edit Product" : "Add Product"}
          </CardTitle>
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
            {errors.form && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.form}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Product Name <span className="text-red-500">*</span>
                </Label>
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
                <Label htmlFor="brand">
                  Brand <span className="text-red-500">*</span>
                </Label>
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

              {/* Pricing */}
              <div className="space-y-2">
                <Label htmlFor="price">
                  Price (NPR) <span className="text-red-500">*</span>
                </Label>
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

              {/* Inventory */}
              <div className="space-y-2">
                <Label htmlFor="totalStock">
                  Stock Quantity <span className="text-red-500">*</span>
                </Label>
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
                <Label htmlFor="categoryId">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select
                  name="categoryId"
                  value={formData.categoryId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, categoryId: value })
                  }
                >
                  <SelectTrigger
                    className={errors.categoryId ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category?.categoryName}
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

              {/* Images */}
              <div className="space-y-2">
                <Label htmlFor="image">
                  Images <span className="text-red-500">*</span>
                </Label>
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
                {newImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newImages.map((file, index) => (
                      <Badge
                        key={`img-${index}-${file.name}`}
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        {file.name}
                        <button
                          type="button"
                          onClick={() => {
                            const newFiles = [...newImages];
                            newFiles.splice(index, 1);
                            setNewImages(newFiles);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* RAM Options */}
              <div className="space-y-2">
                <Label>
                  RAM Options <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <Select
                    onValueChange={(value) => handleSelectChange("RAM", value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select RAM" />
                    </SelectTrigger>
                    <SelectContent>
                      {RAM_OPTIONS.map((ram) => (
                        <SelectItem key={ram} value={ram}>
                          {ram}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={newTagInputs.RAM}
                    onChange={(e) =>
                      handleTagInputChange("RAM", e.target.value)
                    }
                    placeholder="Custom RAM"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addTag("RAM")}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {errors.RAM && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.RAM}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.RAM?.map((ram, index) => (
                    <Badge
                      key={`ram-${index}-${ram}`} // Combine index and value for uniqueness
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {ram}
                      <button
                        type="button"
                        onClick={() => removeTag("RAM", index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* ROM Options */}
              {/* ROM Options */}
              <div className="space-y-2">
                <Label>
                  Storage Options <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <Select
                    onValueChange={(value) => handleSelectChange("ROM", value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select Storage" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROM_OPTIONS.map((rom) => (
                        <SelectItem key={`rom-option-${rom}`} value={rom}>
                          {rom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={newTagInputs.ROM}
                    onChange={(e) =>
                      handleTagInputChange("ROM", e.target.value)
                    }
                    placeholder="Custom Storage"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addTag("ROM")}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {errors.ROM && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.ROM}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.ROM?.map((rom, index) => (
                    <Badge
                      key={`rom-selected-${index}-${rom}`}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {rom}
                      <button
                        type="button"
                        onClick={() => removeTag("ROM", index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Size Options */}
              {/* Size Options */}
              <div className="space-y-2">
                <Label>
                  Size Options <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <Select
                    onValueChange={(value) => handleSelectChange("size", value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select Size" />
                    </SelectTrigger>
                    <SelectContent>
                      {SIZE_OPTIONS.map((size) => (
                        <SelectItem key={`size-option-${size}`} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={newTagInputs.size}
                    onChange={(e) =>
                      handleTagInputChange("size", e.target.value)
                    }
                    placeholder="Custom Size"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addTag("size")}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {errors.size && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.size}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.size?.map((size, index) => (
                    <Badge
                      key={`size-selected-${index}-${size}`}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {size}
                      <button
                        type="button"
                        onClick={() => removeTag("size", index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
              {/* Color Options */}
              <div className="space-y-2">
                <Label>
                  Color Options <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <Select
                    onValueChange={(value) =>
                      handleSelectChange("color", value)
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select Color" />
                    </SelectTrigger>
                    <SelectContent>
                      {COLOR_OPTIONS.map((color) => (
                        <SelectItem key={color} value={color}>
                          {color}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={newTagInputs.color}
                    onChange={(e) =>
                      handleTagInputChange("color", e.target.value)
                    }
                    placeholder="Custom Color"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addTag("color")}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {errors.color && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.color}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.color?.map((color, index) => (
                    <Badge
                      key={`color-${index}-${color}`}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {color}
                      <button
                        type="button"
                        onClick={() => removeTag("color", index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Specifications */}
              <div className="space-y-2">
                <Label>
                  Specifications <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={newTagInputs.spec}
                    onChange={(e) =>
                      handleTagInputChange("spec", e.target.value)
                    }
                    placeholder="Add specification"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addTag("spec")}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {errors.spec && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.spec}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.spec?.map((spec, index) => (
                    <Badge
                      key={`spec-${index}-${spec}`}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {spec}
                      <button
                        type="button"
                        onClick={() => removeTag("spec", index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>
                  Description <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <Textarea
                    value={newTagInputs.description}
                    onChange={(e) =>
                      handleTagInputChange("description", e.target.value)
                    }
                    placeholder="Add description point"
                    className="flex-1"
                    rows={1}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addTag("description")}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {errors.description && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.description}
                  </p>
                )}
                <ScrollArea className="h-24 rounded-md border p-2 mt-2">
                  <div className="space-y-1">
                    {formData.description?.map((desc, index) => (
                      <div
                        key={`desc-${index}-${desc.substring(0, 10)}`}
                        className="flex items-start gap-2"
                      >
                        <span className="text-sm">• {desc}</span>
                        <button
                          type="button"
                          onClick={() => removeTag("description", index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Key Features */}
              <div className="space-y-2">
                <Label>
                  Key Features <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <Textarea
                    value={newTagInputs.keyFeatures}
                    onChange={(e) =>
                      handleTagInputChange("keyFeatures", e.target.value)
                    }
                    placeholder="Add key feature"
                    className="flex-1"
                    rows={1}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addTag("keyFeatures")}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {errors.keyFeatures && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.keyFeatures}
                  </p>
                )}
                <ScrollArea className="h-24 rounded-md border p-2 mt-2">
                  <div className="space-y-1">
                    {formData.keyFeatures?.map((feature, index) => (
                      <div
                        key={`feature-${index}-${feature.substring(0, 10)}`}
                        className="flex items-start gap-2"
                      >
                        <span className="text-sm">• {feature}</span>
                        <button
                          type="button"
                          onClick={() => removeTag("keyFeatures", index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {/* Toggles */}
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <Switch
                    id="inStock"
                    checked={formData.inStock}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, inStock: checked })
                    }
                  />
                  <Label htmlFor="inStock">In Stock</Label>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <Switch
                    id="isNew"
                    checked={formData.isNew}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isNew: checked })
                    }
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
              {isSubmitting
                ? "Saving..."
                : product
                ? "Update Product"
                : "Create Product"}
              <Save className="w-4 h-4 ml-2" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductForm;
