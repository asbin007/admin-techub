
export interface IProduct {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice: number;
  image: string[];
  inStock: boolean;
  isNew: boolean;
  size: string[];
  color: string[];
  badge: string;
  discount: number;
  RAM: string[];
  ROM: string[];
  spec: string[];
  createdAt: string;
  updatedAt: string;
  categoryId: string;
  Category:{
    categoryName:string
  }
  description:string[],
  keyFeatures:string[],
  totalStock:number,

 

}
