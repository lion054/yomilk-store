import { useMemo, useEffect } from "react";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next";
import { useQuery } from "@tanstack/react-query";
import ProductDetails from "../../components/ecommerce/ProductDetails";
import Layout from '../../components/layout/Layout';
import apiClient from "../../config/api";
import { toast } from "react-toastify";
import { logger } from "../../lib/logger";
import SEO from "../../components/common/SEO";
import { generateProductSeo, generateBreadcrumbSchema } from "../../config/seo";
import { useProducts } from "../../hooks";
import { queryKeys } from "../../lib/queryClient";
import { getProductImageUrl } from "../../lib/imageProxy";
import AppErrorBoundary from "../../components/AppErrorBoundary";

/**
 * Fetch product by slug with fallback to products list
 */
const fetchProductByItemCode = async (itemCode: any, allProducts: any) => {
    try {
        const code = Array.isArray(itemCode) ? (itemCode[0] || '') : itemCode;
        if (!code) return null;

        logger.info(`Fetching product: ${code}`);

        try {
            const productData = await (apiClient as any).getProduct(code);

            if (productData) {
                const resolvedImage = getProductImageUrl(productData, '');
                if (resolvedImage) {
                    productData.image = resolvedImage;
                    if (productData.PicturName) productData.PicturName = resolvedImage;
                    if (productData.picturName) productData.picturName = resolvedImage;
                }
                return productData;
            }
        } catch (apiError: any) {
            logger.warn(`API fetch failed for ${code}`, apiError?.message);
        }

        // Fallback to products context
        if (allProducts && allProducts.length > 0) {
            const productFromCache = allProducts.find((p: any) => {
                const pCode = (p.ItemCode || p.itemCode || '').toLowerCase();
                const codeLower = (code || '').toString().toLowerCase();
                return pCode === codeLower;
            });

            if (productFromCache) return productFromCache;
        }

        return null;
    } catch (error) {
        logger.error(`Unexpected error fetching product:`, error);
        return null;
    }
};

interface ProductIdProps { }

export const getServerSideProps: GetServerSideProps<ProductIdProps> = async () => {
    return { props: {} };
};

const ProductId = ({  }: ProductIdProps) => {
    const router = useRouter();
    const queryCode = router.query['itemCode'];
    const resolvedItemCode = Array.isArray(queryCode) ? queryCode[0] : queryCode;

    const { products: allProducts } = useProducts();

    const {
        data: product,
        isLoading,
        isFetching,
        refetch,
        isError,
    } = useQuery({
        queryKey: queryKeys.products.detail(resolvedItemCode as any),
        queryFn: () => fetchProductByItemCode(resolvedItemCode, allProducts),
        enabled: !!resolvedItemCode,
        retry: false,
        staleTime: 10 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });

    useEffect(() => {
        if (isError) {
            logger.error('Product fetch error');
            toast.error('Failed to load product');
        }
    }, [isError]);

    const productTitle = useMemo(() => {
        return (product as any)?.title || (product as any)?.ItemName || (product as any)?.itemName || (product as any)?.name || 'Product';
    }, [product]);

    // Loading state
    if (isLoading && !product) {
        return (
            <Layout parent="Home" sub="Shop" subChild="Loading">
                <section className="mt-50 mb-50">
                    <div className="container">
                        <div className="row">
                            <div className="col-xl-10 col-lg-12 m-auto">
                                <div className="product-detail accordion-detail">
                                    <div className="row mb-50 mt-30">
                                        <div className="col-md-6 col-sm-12 col-xs-12 mb-md-0 mb-sm-5">
                                            <div className="skeleton-box" style={{ width: "100%", height: "400px", backgroundColor: "#f0f0f0", borderRadius: "10px", position: "relative", overflow: "hidden" }}>
                                                <div className="skeleton-shimmer"></div>
                                            </div>
                                        </div>
                                        <div className="col-md-6 col-sm-12 col-xs-12">
                                            <div className="detail-info detail-info-mobile">
                                                <div className="skeleton-box" style={{ width: "60%", height: "30px", backgroundColor: "#f0f0f0", borderRadius: "6px", marginBottom: "20px", position: "relative", overflow: "hidden" }}>
                                                    <div className="skeleton-shimmer"></div>
                                                </div>
                                                <div className="skeleton-box" style={{ width: "40%", height: "40px", backgroundColor: "#f0f0f0", borderRadius: "6px", marginBottom: "20px", position: "relative", overflow: "hidden" }}>
                                                    <div className="skeleton-shimmer"></div>
                                                </div>
                                                <div className="skeleton-box" style={{ width: "100%", height: "80px", backgroundColor: "#f0f0f0", borderRadius: "6px", marginBottom: "20px", position: "relative", overflow: "hidden" }}>
                                                    <div className="skeleton-shimmer"></div>
                                                </div>
                                                <div className="skeleton-box" style={{ width: "200px", height: "50px", backgroundColor: "#f0f0f0", borderRadius: "6px", position: "relative", overflow: "hidden" }}>
                                                    <div className="skeleton-shimmer"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-center mt-4">
                                        <div className="spinner-border text-success" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <p className="mt-3 text-muted">Loading product details...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <style jsx>{`
                    @keyframes shimmer {
                        0% { transform: translateX(-100%); }
                        100% { transform: translateX(100%); }
                    }
                    .skeleton-shimmer {
                        position: absolute;
                        top: 0; right: 0; bottom: 0; left: 0;
                        transform: translateX(-100%);
                        background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%);
                        animation: shimmer 1.5s infinite;
                    }
                `}</style>
            </Layout>
        );
    }

    // Error / not found
    if ((isError || !product) && !isLoading) {
        return (
            <>
                <SEO title="Product Not Found | Snappy Fresh" description="The product you're looking for is not available." noindex={true} />
                <Layout parent="Home" sub="Shop" subChild="Not Found">
                    <section className="mt-50 mb-50">
                        <div className="container">
                            <div className="row">
                                <div className="col-lg-8 m-auto text-center" style={{ padding: '60px 20px', backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
                                    <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111', marginBottom: '15px' }}>Product Not Found</h2>
                                    <p style={{ fontSize: '15px', color: '#666', marginBottom: '30px' }}>
                                        The product <strong>{resolvedItemCode}</strong> could not be found.
                                    </p>
                                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                        <button className="btn btn-success" onClick={() => refetch()} disabled={isFetching} style={{ padding: '12px 24px', borderRadius: '8px', fontWeight: '600' }}>
                                            {isFetching ? 'Retrying...' : 'Try Again'}
                                        </button>
                                        <button className="btn btn-outline-success" onClick={() => router.push('/store')} style={{ padding: '12px 24px', borderRadius: '8px', fontWeight: '600' }}>
                                            Back to Shop
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </Layout>
            </>
        );
    }

    if (!product) return null;

    const productSeoConfig = generateProductSeo(product);
    const productBreadcrumbs = [
        { name: 'Home', url: '/' },
        { name: 'Shop', url: '/store' },
        { name: productTitle, url: `/product/${resolvedItemCode}` }
    ];
    const breadcrumbSchema = generateBreadcrumbSchema(productBreadcrumbs);
    const structuredData = {
        '@context': 'https://schema.org',
        '@graph': [productSeoConfig.structuredData, breadcrumbSchema]
    };

    return (
        <>
            <SEO
                title={productSeoConfig.title}
                description={productSeoConfig.description}
                keywords={productSeoConfig.keywords}
                ogImage={productSeoConfig.ogImage}
                canonical={productSeoConfig.canonical}
                type="product"
                structuredData={structuredData as any}
            />
            <Layout parent="Home" sub="Shop" subChild={productTitle}>
                <div className="container">
                    <AppErrorBoundary>
                        <ProductDetails product={product as any} />
                    </AppErrorBoundary>
                </div>
            </Layout>
        </>
    );
};

export default ProductId;
