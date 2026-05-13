import { toast } from "react-toastify";
import Layout from "../components/layout/Layout";
import { useCart, useWishlist } from "../hooks";
import { normalizeProductForCart, createDefaultUOM } from "../lib/productTransformer";
import { formatCurrency } from "../lib/formatters";

const Wishlist = () => {
    const { wishlist, clearWishlist, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();

    const handleCart = (product: any) => {
        const normalizedProduct = normalizeProductForCart(product);
        const uom = createDefaultUOM(normalizedProduct);
        addToCart(normalizedProduct, uom);
        toast("Product added to Cart !");
    };
    return (
        <>
            <Layout parent="Home" sub="Shop" subChild="Wishlist">
                <section className="mt-50 mb-50">
                    <div className="container">
                        <div className="row">
                            <div className="col-xl-10 col-lg-12 m-auto">
                                {wishlist.length > 0 ? (
                                    <div className="table-responsive shopping-summery">
                                        <table className="table table-wishlist">
                                            <thead>
                                                <tr className="main-heading">
                                                    <th className="custome-checkbox start pl-30" colSpan={2}>
                                                        Product
                                                    </th>
                                                    <th scope="col">Price</th>
                                                    <th scope="col">
                                                        Stock Status
                                                    </th>
                                                    <th scope="col">Action</th>
                                                    <th scope="col" className="end">
                                                        Remove
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {wishlist.map(
                                                    (product) => (
                                                        <tr className="pt-30" key={product.id || product.itemCode}>
                                                            <td className="image product-thumbnail pt-40">
                                                                <img
                                                                    src={
                                                                        product
                                                                            .images?.[0]
                                                                            ?.img
                                                                    }
                                                                    alt={product.title || product.itemName || "Product image"}
                                                                    className="img-fluid"
                                                                />
                                                            </td>

                                                            <td className="product-des product-name">
                                                                <h6 className="product-name  mb-10">
                                                                    <span>
                                                                        {
                                                                            product.title
                                                                        }
                                                                    </span>
                                                                </h6>
                                                                {(product as any).rating != null && (
                                                                    <div className="product-rate-cover">
                                                                        <div className="product-rate d-inline-block">
                                                                            <div
                                                                                className="product-rating"
                                                                                style={{
                                                                                    width: `${((product as any).rating / 5) * 100}%`,
                                                                                }}
                                                                                role="img"
                                                                                aria-label={`Rating: ${(product as any).rating} out of 5`}
                                                                            ></div>
                                                                        </div>
                                                                        <span className="font-small ml-5 text-muted">
                                                                            {" "}
                                                                            ({(product as any).rating.toFixed(1)})
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td
                                                                className="price"
                                                                data-title="Price"
                                                            >
                                                                <h3 className="text-brand">
                                                                    {formatCurrency(product.price)}
                                                                </h3>
                                                            </td>
                                                            <td
                                                                className="text-center detail-info"
                                                                data-title="Stock"
                                                            >
                                                                {product.stock ===
                                                                0 ? (
                                                                    <span className="stock-status out-stock mb-0">
                                                                        Out of
                                                                        stock
                                                                    </span>
                                                                ) : (
                                                                    <span className="stock-status in-stock mb-0">
                                                                        In Stock
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td
                                                                className="text-right"
                                                                data-title="Cart"
                                                            >
                                                                {product.stock ===
                                                                0 ? (
                                                                    <button className="btn btn-sm btn-secondary">
                                                                        Contact
                                                                        Us
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        className="btn btn-sm"
                                                                        onClick={(
                                                                            _e
                                                                        ) =>
                                                                            handleCart(
                                                                                product
                                                                            )
                                                                        }
                                                                        aria-label={`Add ${product.title || "product"} to cart`}
                                                                    >
                                                                        Add to
                                                                        cart
                                                                    </button>
                                                                )}
                                                            </td>
                                                            <td
                                                                className="action"
                                                                data-title="Remove"
                                                            >
                                                                <button
                                                                    className="sf-btn sf-btn--link"
                                                                    onClick={() =>
                                                                        removeFromWishlist(
                                                                            product.id as any
                                                                        )
                                                                    }
                                                                    aria-label={`Remove ${product.title || "product"} from wishlist`}
                                                                >
                                                                    <i className="fi-rs-trash"></i>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                        <div className="text-right">
                                            <button
                                                className="sf-btn sf-btn--link clear-btn"
                                                onClick={clearWishlist}
                                                aria-label="Clear all items from wishlist"
                                            >
                                                Clear All
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <h4 className="mb-0">No Products</h4>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </Layout>
        </>
    );
};

export default Wishlist;
