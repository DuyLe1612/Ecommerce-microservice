export interface Category {
  id: number;
  name: string;
  slug: string;
  iconPath: string;
  imageUrl: string;
  parentId: number | null;
  description: string;
  subCategories: Category[]
}

export type CategoryAttribute = {
  id: number;
  name: string;
  values: string[];
};
