/* ===== vendors.js ===== */
import Link from "next/link";
import Layout from "../components/layout/Layout";
import vendorData from "../util/storeData";
import EmptyState from "../components/common/EmptyState";

function Vendors() {
    const vendors = vendorData.map(vendor => ({
        id: vendor.id,
        name: vendor.title,
        logo: vendor.img,
        description: vendor.desc,
        itemCount: 93,
        slug: vendor.title.toLowerCase().replace(/\s+/g, '-')
    }));

    return (
        <Layout parent="Home" sub="Shop" subChild="Vendors">
            <style jsx>{`
                .vendors-page { background: #f4f9f6; min-height: 60vh; }
                .vendors-grid { padding: 40px 0 60px; }
                .vendor-card {
                    background: #fff;
                    border: 1.5px solid #dae8d8;
                    border-radius: 18px;
                    overflow: hidden;
                    transition: var(--sf-transition);
                    cursor: pointer;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    text-decoration: none;
                }
                .vendor-card:hover {
                    border-color: var(--sf-green-500);
                    box-shadow: 0 12px 36px rgba(59,183,126,0.14);
                    transform: translateY(-6px);
                }
                .vendor-card-img {
                    background: linear-gradient(135deg, #f4f9f6, #e8f5ec);
                    padding: 44px 36px;
                    display: flex; align-items: center; justify-content: center;
                    min-height: 220px;
                    transition: background 0.3s ease;
                }
                .vendor-card:hover .vendor-card-img { background: linear-gradient(135deg, #e4f5ec, #cde9d8); }
                .vendor-card-img img {
                    max-width: 100%; max-height: 160px;
                    object-fit: contain;
                    filter: drop-shadow(0 4px 10px rgba(0,0,0,0.08));
                    transition: transform 0.3s ease;
                }
                .vendor-card:hover .vendor-card-img img { transform: scale(1.04); }
                .vendor-card-body { padding: 24px; flex: 1; display: flex; flex-direction: column; }
                .vendor-card-name {
                    font-size: 1.2rem; font-weight: 800; color: var(--sf-gray-900);
                    margin-bottom: 8px; letter-spacing: -0.02em;
                    transition: color 0.2s;
                }
                .vendor-card:hover .vendor-card-name { color: var(--sf-green-500); }
                .vendor-card-desc {
                    font-size: 0.85rem; color: #7a9a7a; line-height: 1.6;
                    margin-bottom: 18px;
                    display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
                }
                .vendor-card-stats {
                    display: flex; gap: 16px; padding-top: 16px;
                    border-top: 1px solid #eef2ee; margin-bottom: 20px;
                }
                .vendor-stat {
                    display: flex; align-items: center; gap: 6px;
                    font-size: 12px; font-weight: 700; color: #3a5a3a;
                }
                .vendor-stat i { color: var(--sf-green-500); font-size: 14px; }
                .vendor-card-cta {
                    display: flex; align-items: center; justify-content: center;
                    gap: 8px; background: var(--sf-green-900);
                    color: #fff;
                    padding: 12px 20px; border-radius: var(--sf-radius-lg);
                    font-size: 13px; font-weight: 700;
                    margin-top: auto;
                    transition: background 0.2s;
                    letter-spacing: -0.01em;
                }
                .vendor-card:hover .vendor-card-cta { background: var(--sf-green-500); }
            `}</style>

            <div className="sf-page vendors-page">
                <div className="sf-page-hero">
                    <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                        <div className="sf-page-hero-eyebrow">Our Partners</div>
                        <h1 className="sf-page-hero">Our Vendors</h1>
                        <p className="sf-page-hero">Discover our trusted partners delivering fresh products straight to your door.</p>
                        <div className="sf-breadcrumb">
                            <Link href="/">Home</Link>
                            <span className="sf-breadcrumb-sep">&rsaquo;</span>
                            <span className="sf-breadcrumb-cur">Vendors</span>
                        </div>
                    </div>
                </div>

                <div className="vendors-grid">
                    <div className="container">
                        {vendors.length === 0 ? (
                            <div className="sf-card">
                                <div className="sf-card__body">
                                    <EmptyState
                                        icon="fi-rs-shop"
                                        title="No Vendors Available"
                                        text="Check back soon for our trusted vendor partners."
                                    />
                                    <div className="sf-flex-end" style={{ justifyContent: 'center', marginTop: '16px' }}>
                                        <Link href="/" className="sf-btn sf-btn--green sf-btn--md">
                                            Back to Home
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="row">
                                {vendors.map(vendor => (
                                    <div key={vendor.id} className="col-lg-4 col-md-6 mb-30">
                                        <Link href={`/shop?vendor=${vendor.slug}`} className="vendor-card">
                                            <div className="vendor-card-img">
                                                <img src={`/assets/imgs/vendor/${vendor.logo}`} alt={vendor.name} />
                                            </div>
                                            <div className="vendor-card-body">
                                                <div className="vendor-card-name">{vendor.name}</div>
                                                <p className="vendor-card-desc">{vendor.description}</p>
                                                <div className="vendor-card-stats">
                                                    <div className="vendor-stat"><i className="fi-rs-box"></i>{vendor.itemCount} Products</div>
                                                    <div className="vendor-stat"><i className="fi-rs-star"></i>Verified</div>
                                                </div>
                                                <div className="vendor-card-cta">
                                                    View Products <i className="fi-rs-arrow-small-right"></i>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default Vendors;
