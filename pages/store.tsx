/**
 * Shop Page — Sixty60-style redesign
 * Matches home page card design, clean horizontal category navigation
 */
import { useRouter } from "next/router";
import { useEffect, useState, useMemo } from "react";
import { useProducts } from "../hooks";
import { useProductSearch } from "../hooks/useProductSearch";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import Pagination from "./../components/ecommerce/Pagination";
import QuickView from "./../components/ecommerce/QuickView";
import SingleProduct from "./../components/ecommerce/SingleProduct";
import WishlistModal from "./../components/ecommerce/WishlistModal";
import ProductsLoadingState from "./../components/ProductsLoadingState";
import Layout from "./../components/layout/Layout";
import { useCategories } from "../hooks/useCategories";
import { filterProductsByCategory, filterProductsBySupCategory, isSuperCategory } from "../lib/categoryMappings";
import SEO from "../components/common/SEO";
import { pageSeoConfig, generateCategorySeo, generateBreadcrumbSchema } from "../config/seo";
import { getProductImageUrl } from "../lib/imageProxy";
import { getCategoryIcon } from "../services/CategoryIconsService";

const ProductsFullWidth = () => {
    let Router = useRouter(),
        searchTerm = Router.query['search'],
        categoryFromUrl = Router.query['category'],
        showLimit = 24,
        showPagination = 4;

    const { products: allProducts, isReady, error: _error, refetch: _refetch, isFetching } = useProducts();
    let [pagination, setPagination] = useState<number[]>([]);
    let [limit, _setLimit] = useState(showLimit);
    let [pages, setPages] = useState(0);
    let [currentPage, setCurrentPage] = useState(1);
    let [selectedCategory, setSelectedCategory] = useState<any>(null);

    const debouncedSearch = useDebouncedValue(typeof searchTerm === 'string' ? searchTerm : '', 400);
    const { data: searchData, isFetching: isSearching } = useProductSearch({
        search: debouncedSearch,
        pageSize: 50,
        pageNumber: 1,
        enabled: !!debouncedSearch && String(debouncedSearch).trim().length >= 2,
    });

    const { categories, loading: _categoriesLoading } = useCategories();

    useEffect(() => {
        if (categoryFromUrl && Array.isArray(categories) && categories.length > 0) {
            const category = categories.find(cat => cat?.ItmsGrpCod == categoryFromUrl);
            if (category) {
                setSelectedCategory(category);
                if (searchTerm) {
                    Router.replace({ pathname: '/store', query: { category: categoryFromUrl } }, undefined, { shallow: true });
                }
            }
        }
    }, [categoryFromUrl, categories]);

    const products = useMemo(() => {
        const useServerSearch = debouncedSearch && String(debouncedSearch).trim().length >= 2 && (searchData as any)?.values;
        let productsList;
        if (useServerSearch) {
            productsList = [...(searchData as any).values];
            // Normalize images for search results (same as ProductsContext does for allProducts)
            productsList.forEach((p: any) => {
                if (!p.image) {
                    p.image = getProductImageUrl(p);
                }
            });
        } else {
            if (!isReady || allProducts.length === 0) return [];
            productsList = [...allProducts];
            if (searchTerm && typeof searchTerm === 'string' && searchTerm.trim()) {
                const searchLower = String(searchTerm).toLowerCase().trim();
                productsList = productsList.filter((product: any) => {
                    const name = ((product as any).ItemName || product.itemName || '').toLowerCase();
                    const desc = (product.description || (product as any).ItemDescription || '').toLowerCase();
                    return name.includes(searchLower) || desc.includes(searchLower);
                });
            }
        }
        if (selectedCategory) {
            const categoryCode = selectedCategory.ItmsGrpCod;
            const categoryName = selectedCategory.ItmsGrpNam || selectedCategory.name;
            if (isSuperCategory(categoryName)) productsList = filterProductsBySupCategory(productsList, categoryName);
            else productsList = filterProductsByCategory(productsList, categoryCode);
        }
        return productsList;
    }, [allProducts, isReady, searchTerm, debouncedSearch, searchData, selectedCategory]);

    useEffect(() => { setCurrentPage(1); }, [searchTerm, selectedCategory]);
    useEffect(() => { cratePagination(); }, [limit, products.length]);

    const cratePagination = () => {
        let arr = new Array(Math.ceil(products.length / limit)).fill(0).map((_, idx) => idx + 1);
        setPagination(arr);
        setPages(Math.ceil(products.length / limit));
    };

    const startIndex = currentPage * limit - limit;
    const endIndex = startIndex + limit;
    const getPaginatedProducts = products.slice(startIndex, endIndex);
    let start = Math.floor((currentPage - 1) / showPagination) * showPagination;
    let end = start + showPagination;
    const getPaginationGroup = pagination.slice(start, end);
    const next = () => setCurrentPage((page) => page + 1);
    const prev = () => setCurrentPage((page) => page - 1);
    const handleActive = (item: any) => setCurrentPage(item);

    const seoConfig = selectedCategory
        ? generateCategorySeo(selectedCategory.ItmsGrpNam || selectedCategory.groupName)
        : pageSeoConfig['/store'];

    const breadcrumbs = selectedCategory
        ? [{ name: 'Home', url: '/' }, { name: 'Shop', url: '/store' }, { name: selectedCategory.ItmsGrpNam || selectedCategory.groupName, url: `/shop?category=${selectedCategory.ItmsGrpCod || selectedCategory.code}` }]
        : [{ name: 'Home', url: '/' }, { name: 'Shop', url: '/store' }];
    const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);

    const handleCategorySelect = (cat: any) => {
        setSelectedCategory(cat);
        setCurrentPage(1);
        if (cat) {
            Router.replace({ pathname: '/store', query: { category: cat.ItmsGrpCod } }, undefined, { shallow: true });
        } else {
            Router.replace('/store', undefined, { shallow: true });
        }
    };

    const handleClearAll = () => {
        setSelectedCategory(null);
        Router.replace('/store', undefined, { shallow: true });
    };

    const categoryName = selectedCategory?.ItmsGrpNam || selectedCategory?.groupName;

    return (
        <>
            <SEO {...seoConfig} structuredData={breadcrumbSchema as any} />
            <Layout parent="Home" sub="Shop" noBreadcrumb={!selectedCategory as any}>

                <style jsx global>{`
                    /* Card styles are self-contained in Sixty60ProductCard component */

                    /* ── SHOP PAGE ── */
                    .shop-page-wrap { background: #fff; min-height: 80vh; }

                    /* ── Category Nav ── */
                    .shop-cat-nav {
                        background: #fff;
                        border-bottom: 1px solid #f0f0f0;
                        padding: 0;
                    }
                    .shop-cat-scroll {
                        display: flex;
                        gap: 8px;
                        overflow-x: auto;
                        padding: 8px 0;
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                    .shop-cat-scroll::-webkit-scrollbar { display: none; }
                    .shop-cat-icon { font-size: 16px; line-height: 1; }
                    .shop-cat-item {
                        flex-shrink: 0;
                        padding: 8px 18px;
                        font-size: 13px;
                        font-weight: 600;
                        color: #555;
                        cursor: pointer;
                        border: 1.5px solid #e0e0e0;
                        background: #fff;
                        border-radius: 99px;
                        transition: all 0.2s;
                        display: inline-flex;
                        align-items: center;
                        gap: 6px;
                        white-space: nowrap;
                    }
                    .shop-cat-item:hover {
                        color: #1a5c38;
                        border-color: #1a5c38;
                        background: #f0faf2;
                    }
                    .shop-cat-item.active {
                        color: #fff;
                        background: #1a5c38;
                        border-color: #1a5c38;
                        font-weight: 700;
                    }

                    /* ── Results header ── */
                    .shop-results-header {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        padding: 20px 0 16px;
                        flex-wrap: wrap;
                        gap: 8px;
                    }
                    .shop-results-left {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        flex-wrap: wrap;
                    }
                    .shop-results-count {
                        font-size: 15px;
                        font-weight: 800;
                        color: #1a1a2e;
                        letter-spacing: -0.01em;
                        margin: 0;
                    }
                    .shop-active-tag {
                        display: inline-flex;
                        align-items: center;
                        gap: 6px;
                        padding: 4px 12px;
                        border-radius: 99px;
                        font-size: 12px;
                        font-weight: 600;
                        background: #f0faf2;
                        color: #1a5c38;
                        border: 1px solid #e0f2e4;
                    }
                    .shop-active-tag button {
                        background: none;
                        border: none;
                        cursor: pointer;
                        color: #595959;
                        font-size: 14px;
                        padding: 0;
                        line-height: 1;
                        transition: color 0.2s;
                    }
                    .shop-active-tag button:hover { color: #e74c3c; }

                    /* ── Product Grid — 5 columns ── */
                    .shop-product-grid {
                        display: grid;
                        grid-template-columns: repeat(5, 1fr);
                        gap: 18px;
                    }
                    @media (max-width: 1199px) {
                        .shop-product-grid { grid-template-columns: repeat(4, 1fr); gap: 16px; }
                    }
                    @media (max-width: 991px) {
                        .shop-product-grid { grid-template-columns: repeat(3, 1fr); gap: 14px; }
                    }
                    @media (max-width: 640px) {
                        .shop-product-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
                    }

                    /* ── Empty state ── */
                    .shop-empty {
                        text-align: center;
                        padding: 80px 20px;
                    }
                    .shop-empty-icon {
                        font-size: 48px;
                        opacity: 0.12;
                        margin-bottom: 16px;
                        display: block;
                    }
                    .shop-empty h3 {
                        font-size: 18px;
                        font-weight: 800;
                        color: #1a1a2e;
                        letter-spacing: -0.02em;
                        margin-bottom: 8px;
                    }
                    .shop-empty p {
                        color: #888;
                        font-size: 14px;
                        margin-bottom: 24px;
                    }
                    .shop-empty-btn {
                        background: #1a5c38;
                        color: #fff;
                        border: none;
                        border-radius: 10px;
                        padding: 12px 28px;
                        font-size: 14px;
                        font-weight: 700;
                        cursor: pointer;
                        transition: background 0.2s;
                    }
                    .shop-empty-btn:hover { background: #1a2b28; }

                    /* Pagination styles are self-contained in Pagination component */

                    /* ── Loading toast ── */
                    .shop-toast {
                        position: fixed;
                        top: 80px;
                        right: 20px;
                        z-index: 9999;
                        background: #1a1a2e;
                        color: #fff;
                        padding: 10px 18px;
                        border-radius: 10px;
                        font-size: 13px;
                        font-weight: 600;
                        box-shadow: 0 4px 16px rgba(0,0,0,0.18);
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        animation: shopToastIn 0.2s ease;
                    }
                    @keyframes shopToastIn {
                        from { opacity: 0; transform: translateX(12px); }
                        to { opacity: 1; transform: translateX(0); }
                    }

                    /* ── Mobile tweaks ── */
                    @media (max-width: 767px) {
                        .shop-cat-item { padding: 12px 16px; font-size: 12px; }
                        .shop-results-header { padding: 16px 0 12px; }
                        .shop-results-count { font-size: 13px; }

                        /* Product card mobile handled by component styles */
                    }
                `}</style>

                {/* Loading toast */}
                {(isSearching || (isFetching && isReady)) && (
                    <div className="shop-toast">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg>
                        {isSearching ? 'Searching...' : 'Updating...'}
                    </div>
                )}

                <div className="shop-page-wrap">
                    {/* Category horizontal nav */}
                    <div className="shop-cat-nav">
                        <div className="container">
                            <div className="shop-cat-scroll">
                                <button
                                    className={`shop-cat-item${!selectedCategory ? ' active' : ''}`}
                                    onClick={() => handleCategorySelect(null)}
                                >
                                    <span className="shop-cat-icon">🛒</span> All
                                </button>
                                {categories && categories.map((cat: any) => {
                                    const name = cat.ItmsGrpNam || cat.GroupName || 'Category';
                                    const catIcon = getCategoryIcon(name);
                                    return (
                                        <button
                                            key={cat.ItmsGrpCod}
                                            className={`shop-cat-item${selectedCategory?.ItmsGrpCod === cat.ItmsGrpCod ? ' active' : ''}`}
                                            onClick={() => handleCategorySelect(cat)}
                                        >
                                            <span className="shop-cat-icon">{catIcon.icon}</span> {name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Main content */}
                    <div className="container">
                        <ProductsLoadingState
                            skeletonCount={12}
                            showRetry={true}
                            errorMessage="We're having trouble loading products. Please check your internet connection."
                            emptyMessage="No products available at the moment."
                        >
                            {(_allProductsLoaded) => (
                                <>
                                    {/* Results header */}
                                    <div className="shop-results-header">
                                        <div className="shop-results-left">
                                            <p className="shop-results-count">
                                                {products.length} {products.length === 1 ? 'product' : 'products'}
                                                {categoryName && <> in {categoryName}</>}
                                                {searchTerm && <> for "{searchTerm}"</>}
                                            </p>
                                            {selectedCategory && (
                                                <span className="shop-active-tag">
                                                    {categoryName}
                                                    <button onClick={() => handleCategorySelect(null)}>
                                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                                    </button>
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Product grid */}
                                    {getPaginatedProducts.length === 0 ? (
                                        <div className="shop-empty">
                                            <span className="shop-empty-icon">
                                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                                            </span>
                                            <h3>No Products Found</h3>
                                            <p>Try adjusting your search or browse all products.</p>
                                            <button className="shop-empty-btn" onClick={handleClearAll}>
                                                Clear Filters
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="shop-product-grid">
                                            {getPaginatedProducts.map((item, i) => (
                                                <SingleProduct key={item.ItemCode || i} product={item} index={i} />
                                            ))}
                                        </div>
                                    )}

                                    {/* Pagination */}
                                    {pages > 1 && (
                                        <Pagination
                                            getPaginationGroup={getPaginationGroup}
                                            currentPage={currentPage}
                                            pages={pages}
                                            next={next}
                                            prev={prev}
                                            handleActive={handleActive}
                                        />
                                    )}
                                </>
                            )}
                        </ProductsLoadingState>
                    </div>
                </div>

                <WishlistModal />
                <QuickView />
            </Layout>
        </>
    );
};

export default ProductsFullWidth;
