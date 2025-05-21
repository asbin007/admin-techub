import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { IProduct } from "../types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addProduct } from "@/store/productSlice";
import { Status } from "@/store/authSlice";
import { resetStatus, fetchCategoryItems } from "@/store/categoriesSlice";
import { fetchCollection } from "@/store/collectionSlice";

interface ModalProps {
  closeModal: () => void;
}

const ProductForm: React.FC<ModalProps> = ({ closeModal }) => {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((store) => store.category);
  const { collection } = useAppSelector((store) => store.collections);
  const { status } = useAppSelector((store) => store.adminProducts);
  
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<IProduct>({
    id: "",
    images: "",
    name: "",
    description: "",
    brand: "",
    discount: 0,
    originalPrice: 0,
    price: 0,
    inStock: true,
    isNew: true,
    totalStock: 0,
    createdAt: "",
    features: [],
    colors: [],
    sizes: [],
    Category: {
      id: "",
      categoryName: "",
    },
    Collection: {
      id: "",
      collectionName: "",
    },
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, files } = e.target as HTMLInputElement;

    if (name === "images" && files && files[0]) {
      const file = files[0];
      setFormData(prev => ({
        ...prev,
        images: file.name // or use a placeholder string, or upload and set the URL
      }));
      
      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleArrayChange = (
    name: "features" | "sizes" | "colors",
    value: string
  ) => {
    const arr = value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    setFormData((prev) => ({
      ...prev,
      [name]: arr,
    }));
  };

  const handleSelectChange = (name: keyof IProduct, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const productData = {
      ...formData,
      categoryId: formData.Category.id,
      collectionId: formData.Collection.id,
    };

    try {
      await dispatch(addProduct(productData));
    } catch (error) {
      console.error("Error adding product:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    dispatch(fetchCategoryItems());
    dispatch(fetchCollection());
  }, [dispatch]);

  useEffect(() => {
    if (status === Status.SUCCESS) {
      closeModal();
      dispatch(resetStatus());
    }
  }, [status, closeModal, dispatch]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Add New Product</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="originalPrice">Original Price</Label>
              <Input
                id="originalPrice"
                name="originalPrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.originalPrice}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="discount">Discount (%)</Label>
            <Input
              id="discount"
              name="discount"
              type="number"
              min="0"
              max="100"
              value={formData.discount}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <Select
                value={formData.Category.id}
                onValueChange={(value) => {
                  const selected = items.find(item => item.id === value);
                  if (selected) {
                    setFormData(prev => ({
                      ...prev,
                      Category: {
                        id: selected.id,
                        categoryName: selected.categoryName,
                      },
                    }));
                  }
                }}
                onOpenChange={(open) => open && dispatch(fetchCategoryItems())}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {items.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.categoryName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Collection</Label>
              <Select
                value={formData.Collection.id}
                onValueChange={(value) => {
                  const selected = collection.find(item => item.id === value);
                  if (selected) {
                    setFormData(prev => ({
                      ...prev,
                      Collection: {
                        id: selected.id,
                        collectionName: selected.collectionName,
                      },
                    }));
                  }
                }}
                onOpenChange={(open) => open && dispatch(fetchCollection())}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Collection" />
                </SelectTrigger>
                <SelectContent>
                  {collection.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.collectionName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="sizes">Sizes (comma-separated)</Label>
              <Input
                id="sizes"
                name="sizes"
                value={formData.sizes.join(", ")}
                onChange={(e) => handleArrayChange("sizes", e.target.value)}
                placeholder="S, M, L, XL"
              />
            </div>

            <div>
              <Label htmlFor="colors">Colors (comma-separated)</Label>
              <Input
                id="colors"
                name="colors"
                value={formData.colors.join(", ")}
                onChange={(e) => handleArrayChange("colors", e.target.value)}
                placeholder="Red, Blue, Green"
              />
            </div>

            <div>
              <Label htmlFor="features">Features (comma-separated)</Label>
              <Input
                id="features"
                name="features"
                value={formData.features.join(", ")}
                onChange={(e) => handleArrayChange("features", e.target.value)}
                placeholder="Waterproof, Wireless, etc."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>In Stock</Label>
              <Select
                value={formData.inStock.toString()}
                onValueChange={(val) =>
                  handleSelectChange("inStock", val === "true")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select stock status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Is New</Label>
              <Select
                value={formData.isNew.toString()}
                onValueChange={(val) =>
                  handleSelectChange("isNew", val === "true")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="totalStock">Total Stock</Label>
            <Input
              id="totalStock"
              name="totalStock"
              type="number"
              min="0"
              value={formData.totalStock}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="images">Product Image</Label>
            <Input
              type="file"
              id="images"
              name="images"
              accept="image/*"
              onChange={handleChange}
              required
            />
            {imagePreview && (
              <div className="mt-2">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="h-32 object-cover rounded-md"
                />
              </div>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Adding..." : "Add Product"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;