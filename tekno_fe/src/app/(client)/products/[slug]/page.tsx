import { Container } from "@/components/MainLayout/Container";
import { Breadcrumb } from "@/components/share/breadcumbCustom";
import { getProductDetail } from "@/services/products";
import ImageView from "@/components/product/productDetail/ImageView";
import { HousePlug, Star } from "lucide-react";
import SimilarProducts from "@/components/product/productDetail/SimilarProducts";
import FrequentlyBoughtTogether from "@/components/product/productDetail/FrequentlyBoughtTogether";
import Comments from "@/components/product/productDetail/Comments";
import TechnicalDetails from "@/components/product/productDetail/TechnicalDetails";
import NotFoundPage from "../../not-found";
import ProductVariantSelectorDynamic from "@/components/product/productDetail/ProductVariantSelectorDynamic";

type Props = {
  params: { slug: string };
};

export default async function SingleProductPage({ params }: Props) {
  const { slug } = params;

  const product = await getProductDetail(slug);
  const isStock = product?.variants?.[0]?.stock > 0 || false;

  if (!product) return <NotFoundPage />;

  return (
    <Container className="flex flex-col space-y-5 my-5">
      <Breadcrumb />

      <div className="flex flex-col md:flex-row gap-10">
        {product.images && (
          <ImageView images={product.images} isStock={isStock} />
        )}

        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <h2 className="text-2xl">{product.name}</h2>
          <p>{product.description}</p>

          <div className="flex items-center gap-2">
            <div className="flex items-center text-white gap-2 rounded-md bg-primary px-2 py-1">
              <Star fill="white" className="h-5 w-5" />
              <span>{product.averageRating ?? 0}</span>
            </div>

            <div className="border-l border-gray-500 px-2">
              sold <span>{product.totalSold}</span>
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-gray-500 md:border-none pb-2">
            <div className="flex items-center gap-2">
              <HousePlug className="text-primary" />
              <span>In stock</span>
            </div>
            <div className="flex items-center gap-2">
              <HousePlug className="text-primary" />
              <span>Guaranteed</span>
            </div>
            <div className="flex items-center gap-2">
              <HousePlug className="text-primary" />
              <span>Free Delivery</span>
            </div>
          </div>

          <ProductVariantSelectorDynamic product={product} />
        </div>
      </div>

      <TechnicalDetails specs={product.specs} />
      <SimilarProducts />
      <Comments productId={product.id} />
      <FrequentlyBoughtTogether />
    </Container>
  );
}