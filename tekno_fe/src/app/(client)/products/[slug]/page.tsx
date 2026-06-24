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
  params: Promise<{ slug: string }>;
};

export default async function SingleProductPage({ params }: Props) {
  const { slug } = await params;

  const product = await getProductDetail(slug);
  const isStock = product?.variants?.[0]?.stock as any > 0 || false;

  if (!product) return <NotFoundPage />;

  return (
    <Container className="flex flex-col space-y-6 md:space-y-8 my-6 md:my-10">
      <Breadcrumb />

      <div className="flex flex-col md:flex-row gap-10">
        {product.images && (
          <ImageView images={product.images} isStock={isStock} />
        )}

        <div className="w-full md:w-1/2 flex flex-col gap-6 pt-2">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-3">{product.name}</h2>
            <p className="text-base text-gray-400 leading-relaxed">{product.description}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center text-primary gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 font-semibold text-sm shadow-[0_0_10px_rgba(255,213,0,0.1)]">
              <Star fill="currentColor" className="h-4 w-4 drop-shadow-sm" />
              <span>{product.averageRating ?? 0}</span>
            </div>

            <div className="h-5 w-px bg-gray-800" />
            <div className="text-sm font-medium text-gray-500">
              {product.totalSold} sold
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 border-y border-gray-800/50 py-5">
            <div className="flex flex-col items-center justify-center gap-2 p-3 bg-[#111111] border border-gray-800 rounded-xl text-center group hover:bg-[#1a1a1a] transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_15px_rgba(255,213,0,0.05)]">
              <HousePlug className="text-primary w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-gray-400 group-hover:text-gray-300 uppercase tracking-wider">In stock</span>
            </div>
            <div className="flex flex-col items-center justify-center gap-2 p-3 bg-[#111111] border border-gray-800 rounded-xl text-center group hover:bg-[#1a1a1a] transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_15px_rgba(255,213,0,0.05)]">
              <HousePlug className="text-primary w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-gray-400 group-hover:text-gray-300 uppercase tracking-wider">Guaranteed</span>
            </div>
            <div className="flex flex-col items-center justify-center gap-2 p-3 bg-[#111111] border border-gray-800 rounded-xl text-center group hover:bg-[#1a1a1a] transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_15px_rgba(255,213,0,0.05)]">
              <HousePlug className="text-primary w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-gray-400 group-hover:text-gray-300 uppercase tracking-wider">Free Delivery</span>
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
