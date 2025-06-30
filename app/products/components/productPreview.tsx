// In app/preview/product/page.tsx
"use client";

import { useEffect, useState } from "react";
import { IProduct } from "@/app/products/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

export default function ProductPreviewPage() {
  const [product, setProduct] = useState<Partial<IProduct> | null>(null);
  const CLOUDINARY_VERSION = "v1750340657";

  useEffect(() => {
    const previewData = localStorage.getItem("productPreview");
    if (previewData) {
      setProduct(JSON.parse(previewData));
    }
  }, []);

  if (!product) return <p>Loading preview...</p>;

  const imageUrl =
    product.image && product.image[0]
      ? `https://res.cloudinary.com/dxpe7jikz/image/upload/${CLOUDINARY_VERSION}${product.image[0].replace("/uploads", "")}.jpg`
      : "https://via.placeholder.com/300x300?text=No+Image";

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>{product.name || "Product Preview"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Image
                src={imageUrl}
                alt={product.name || "Product"}
                width={300}
                height={300}
                className="object-cover rounded-lg"
              />
            </div>
            <div>
              <p><strong>Brand:</strong> {product.brand || "Not set"}</p>
              <p><strong>Price:</strong> NPR {product.price || 0}</p>
              <p><strong>Category:</strong> {product.categoryId || "Not set"}</p>
              <p><strong>Stock:</strong> {product.totalStock || 0} units</p>
              <p><strong>In Stock:</strong> {product.inStock ? "Yes" : "No"}</p>
              <p><strong>Description:</strong></p>
              <ul>
                {product.description?.map((desc, index) => (
                  <li key={index}>{desc}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}