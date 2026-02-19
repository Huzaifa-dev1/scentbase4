// src/pages/admin/ProductsManage.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  createProduct,
  listenProducts,
  removeProduct,
  updateProduct,
} from "../../firebase/products.service";

import { uploadToCloudinary } from "../../firebase/cloudinary.service";

const emptyForm = {
  name: "",
  slug: "",
  price: "",
  description: "",
  size: "100ml",
  stock: 10,
  category: "Perfume",
  isActive: true,

  // ✅ Best seller flag
  isBestSeller: false,

  // ✅ Cloudinary
  imageUrl: "",
  imagePublicId: "",
};

function makeSlug(text) {
  return (text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function ProductsManage() {
  const [items, setItems] = useState([]);
  const [mode, setMode] = useState("create");
  const [activeId, setActiveId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imgFile, setImgFile] = useState(null);

  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  // ✅ Add multiple perfumes modal
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkRows, setBulkRows] = useState([
    {
      name: "",
      price: "",
      size: "100ml",
      stock: 10,
      category: "Perfume",
      isActive: true,
      description: "",
      isBestSeller: false, // ✅ include here too
    },
  ]);

  useEffect(() => {
    const unsub = listenProducts(setItems);
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    const s = search.toLowerCase().trim();
    if (!s) return items;
    return items.filter(
      (p) =>
        (p.name || "").toLowerCase().includes(s) ||
        (p.slug || "").toLowerCase().includes(s) ||
        (p.category || "").toLowerCase().includes(s)
    );
  }, [items, search]);

  const reset = () => {
    setMode("create");
    setActiveId(null);
    setForm(emptyForm);
    setImgFile(null);
  };

  // ✅ FIXED startEdit (best seller + no broken line)
  const startEdit = (p) => {
    setMode("edit");
    setActiveId(p.id);

    setForm({
      name: p.name || "",
      slug: p.slug || "",
      price: p.price ?? "",
      description: p.description || "",
      size: p.size || "100ml",
      stock: p.stock ?? 0,
      category: p.category || "Perfume",
      isActive: p.isActive ?? true,

      // ✅ bring best seller from Firestore
      isBestSeller: p.isBestSeller ?? false,

      imageUrl: p.imageUrl || "",
      imagePublicId: p.imagePublicId || "",
    });

    setImgFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleChange = (k, v) => {
    setForm((prev) => {
      const next = { ...prev, [k]: v };
      if (k === "name" && (mode === "create" || !prev.slug)) {
        next.slug = makeSlug(v);
      }
      return next;
    });
  };

  // ✅ Cloudinary image save logic is here
  const handleSave = async () => {
    if (!form.name.trim()) return alert("Product name is required");
    if (!form.slug.trim()) return alert("Slug is required");
    if (!form.price || Number(form.price) <= 0)
      return alert("Price must be > 0");

    setSaving(true);
    try {
      if (mode === "create") {
        const payload = {
          ...form,
          price: Number(form.price),
          stock: Number(form.stock || 0),
          slug: makeSlug(form.slug),
          // ✅ ensure boolean saved
          isBestSeller: !!form.isBestSeller,
          isActive: !!form.isActive,
        };

        // ✅ Upload image FIRST (Cloudinary) then save url in Firestore
        if (imgFile) {
          const uploaded = await uploadToCloudinary(imgFile);
          payload.imageUrl = uploaded.url;
          payload.imagePublicId = uploaded.publicId;
        }

        await createProduct(payload);

        reset();
        alert("Product added ✅");
      }

      if (mode === "edit" && activeId) {
        const payload = {
          ...form,
          price: Number(form.price),
          stock: Number(form.stock || 0),
          slug: makeSlug(form.slug),
          // ✅ ensure boolean saved
          isBestSeller: !!form.isBestSeller,
          isActive: !!form.isActive,
        };

        // ✅ Upload new image (optional)
        if (imgFile) {
          const uploaded = await uploadToCloudinary(imgFile);
          payload.imageUrl = uploaded.url;
          payload.imagePublicId = uploaded.publicId;
        }

        await updateProduct(activeId, payload);

        reset();
        alert("Product updated ✅");
      }
    } catch (e) {
      console.error(e);
      alert(e?.message || "Error saving product. Check console.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p) => {
    const ok = window.confirm(`Delete "${p.name}"?`);
    if (!ok) return;

    setSaving(true);
    try {
      // Only Firestore delete (Cloudinary delete requires backend secret, optional later)
      await removeProduct(p.id);
      if (activeId === p.id) reset();
      alert("Product deleted ✅");
    } catch (e) {
      console.error(e);
      alert(e?.message || "Error deleting product. Check console.");
    } finally {
      setSaving(false);
    }
  };

  // ✅ Bulk add multiple
  const addBulkRow = () => {
    setBulkRows((prev) => [
      ...prev,
      {
        name: "",
        price: "",
        size: "100ml",
        stock: 10,
        category: "Perfume",
        isActive: true,
        description: "",
        isBestSeller: false,
      },
    ]);
  };

  const removeBulkRow = (idx) => {
    setBulkRows((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateBulkRow = (idx, key, value) => {
    setBulkRows((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, [key]: value } : r))
    );
  };

  const submitBulk = async () => {
    const clean = bulkRows
      .map((r) => ({
        ...r,
        name: (r.name || "").trim(),
        slug: makeSlug(r.name || ""),
        price: Number(r.price),
        stock: Number(r.stock || 0),
        isActive: !!r.isActive,
        isBestSeller: !!r.isBestSeller,
      }))
      .filter((r) => r.name && r.price > 0);

    if (clean.length === 0)
      return alert("Add at least 1 valid product (name + price).");

    setSaving(true);
    try {
      for (const p of clean) await createProduct(p);
      alert(
        `${clean.length} products added ✅ Now edit each to upload image + set Best Seller.`
      );
      setBulkOpen(false);
      setBulkRows([
        {
          name: "",
          price: "",
          size: "100ml",
          stock: 10,
          category: "Perfume",
          isActive: true,
          description: "",
          isBestSeller: false,
        },
      ]);
    } catch (e) {
      console.error(e);
      alert(e?.message || "Bulk add failed. Check console.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="sbAdminProducts">
      <div className="sbHeader">
        <div>
          <h2>Products</h2>
          <p>Manage perfumes (Firestore + Cloudinary images)</p>
        </div>

        <div className="sbHeaderActions">
          <button
            className="sbBtnGhost"
            onClick={() => setBulkOpen(true)}
            disabled={saving}
          >
            + Add Multiple
          </button>
          <button className="sbBtnGhost" onClick={reset} disabled={saving}>
            Reset
          </button>
        </div>
      </div>

      {bulkOpen ? (
        <div
          className="sbModalWrap"
          onClick={() => !saving && setBulkOpen(false)}
        >
          <div className="sbModal" onClick={(e) => e.stopPropagation()}>
            <div className="sbModalTop">
              <h3>Add Multiple Perfumes</h3>
              <button
                className="sbX"
                onClick={() => !saving && setBulkOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="sbBulkList">
              {bulkRows.map((r, idx) => (
                <div key={idx} className="sbBulkRow">
                  <input
                    value={r.name}
                    onChange={(e) => updateBulkRow(idx, "name", e.target.value)}
                    placeholder="Name"
                  />
                  <input
                    type="number"
                    value={r.price}
                    onChange={(e) =>
                      updateBulkRow(idx, "price", e.target.value)
                    }
                    placeholder="Price"
                  />
                  <select
                    value={r.size}
                    onChange={(e) => updateBulkRow(idx, "size", e.target.value)}
                  >
                    <option>50ml</option>
                    <option>100ml</option>
                    <option>150ml</option>
                  </select>
                  <input
                    type="number"
                    value={r.stock}
                    onChange={(e) =>
                      updateBulkRow(idx, "stock", e.target.value)
                    }
                    placeholder="Stock"
                  />

                  {/* ✅ Best seller quick toggle in bulk */}
                  <select
                    value={String(r.isBestSeller)}
                    onChange={(e) =>
                      updateBulkRow(idx, "isBestSeller", e.target.value === "true")
                    }
                    title="Best Seller"
                  >
                    <option value="false">Best Seller: No</option>
                    <option value="true">Best Seller: Yes</option>
                  </select>

                  <button
                    className="sbRemoveRow"
                    onClick={() => removeBulkRow(idx)}
                    disabled={bulkRows.length === 1}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="sbModalActions">
              <button className="sbBtnGhost" onClick={addBulkRow} disabled={saving}>
                + Add Row
              </button>
              <button className="sbBtnMain" onClick={submitBulk} disabled={saving}>
                {saving ? "Saving..." : "Save Products"}
              </button>
            </div>

            <p className="sbTip">
              Upload images after bulk add by clicking Edit on each product.
            </p>
          </div>
        </div>
      ) : null}

      <div className="sbGrid">
        {/* Form */}
        <div className="sbCard">
          <div className="sbCardTop">
            <h3>{mode === "create" ? "Add New Product" : "Edit Product"}</h3>
            <span className={mode === "edit" ? "sbPill" : "sbPill2"}>
              {mode === "edit" ? "Editing" : "New"}
            </span>
          </div>

          <div className="sbForm">
            <div className="sbRow2">
              <div className="sbField">
                <label>Name</label>
                <input
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Perfume Name"
                />
              </div>
              <div className="sbField">
                <label>Slug</label>
                <input
                  value={form.slug}
                  onChange={(e) => handleChange("slug", e.target.value)}
                  placeholder="auto-from-name"
                />
              </div>
            </div>

            <div className="sbRow3">
              <div className="sbField">
                <label>Price (PKR)</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                />
              </div>
              <div className="sbField">
                <label>Size</label>
                <select
                  value={form.size}
                  onChange={(e) => handleChange("size", e.target.value)}
                >
                  <option>50ml</option>
                  <option>100ml</option>
                  <option>150ml</option>
                </select>
              </div>
              <div className="sbField">
                <label>Stock</label>
                <input
                  type="number"
                  value={form.stock}
                  onChange={(e) => handleChange("stock", e.target.value)}
                />
              </div>
            </div>

            <div className="sbRow2">
              <div className="sbField">
                <label>Category</label>
                <input
                  value={form.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                />
              </div>
              <div className="sbField">
                <label>Status</label>
                <select
                  value={String(form.isActive)}
                  onChange={(e) =>
                    handleChange("isActive", e.target.value === "true")
                  }
                >
                  <option value="true">Active</option>
                  <option value="false">Hidden</option>
                </select>
              </div>
            </div>

            {/* ✅ Best Seller field (now properly works) */}
            <div className="sbRow2">
              <div className="sbField">
                <label>Best Seller</label>
                <select
                  value={String(form.isBestSeller)}
                  onChange={(e) =>
                    handleChange("isBestSeller", e.target.value === "true")
                  }
                >
                  <option value="false">No</option>
                  <option value="true">Yes (Show in Best Selling)</option>
                </select>
              </div>
            </div>

            <div className="sbField">
              <label>Description</label>
              <textarea
                rows="4"
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </div>

            <div className="sbUpload">
              <div className="sbUploadLeft">
                <label>Product Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImgFile(e.target.files?.[0] || null)}
                />
                <small>Stored on Cloudinary (free).</small>
              </div>

              <div className="sbPreview">
                {imgFile ? (
                  <img src={URL.createObjectURL(imgFile)} alt="preview" />
                ) : form.imageUrl ? (
                  <img src={form.imageUrl} alt="preview" />
                ) : (
                  <div className="sbEmptyPreview">No image</div>
                )}
              </div>
            </div>

            <button className="sbBtnMain" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : mode === "create" ? "Add Product" : "Update Product"}
            </button>
          </div>
        </div>

        {/* List */}
        <div className="sbCard">
          <div className="sbCardTop">
            <h3>All Products</h3>
            <div className="sbSearch">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name / slug / category..."
              />
            </div>
          </div>

          <div className="sbList">
            {filtered.length === 0 ? (
              <div className="sbEmpty">No products found.</div>
            ) : (
              filtered.map((p) => (
                <div key={p.id} className="sbItem">
                  <div className="sbItemLeft">
                    <div className="sbThumb">
                      {p.imageUrl ? <img src={p.imageUrl} alt={p.name} /> : <span>🧴</span>}
                    </div>

                    <div className="sbMeta">
                      <div className="sbNameRow">
                        <h4 title={p.name}>{p.name}</h4>

                        <span className={p.isActive ? "sbTagActive" : "sbTagHidden"}>
                          {p.isActive ? "Active" : "Hidden"}
                        </span>

                        {/* ✅ Optional badge in list */}
                        {p.isBestSeller ? <span className="sbTagBest">Best Seller</span> : null}
                      </div>

                      <p className="sbSubRow">
                        <span className="mono">/{p.slug}</span>
                        <span className="dot">•</span>
                        <span>PKR {Number(p.price || 0).toLocaleString()}</span>
                        <span className="dot">•</span>
                        <span>{p.size || "—"}</span>
                        <span className="dot">•</span>
                        <span>Stock: {p.stock ?? 0}</span>
                      </p>
                    </div>
                  </div>

                  <div className="sbActions">
                    <button className="sbBtnSmall" onClick={() => startEdit(p)} disabled={saving}>
                      Edit
                    </button>
                    <button className="sbBtnSmallDanger" onClick={() => handleDelete(p)} disabled={saving}>
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style>{`
        .sbAdminProducts{padding:20px;color:#fff;background:#070b14;min-height:100vh;}
        .sbHeader{display:flex;justify-content:space-between;align-items:flex-end;gap:14px;margin-bottom:14px;}
        .sbHeader h2{margin:0;font-size:28px;}
        .sbHeader p{margin:6px 0 0;opacity:.7;font-size:13px}
        .sbHeaderActions{display:flex;gap:10px;flex-wrap:wrap}

        .sbBtnGhost{padding:10px 12px;border-radius:12px;background:rgba(255,255,255,.06);
          border:1px solid rgba(255,255,255,.10);color:#fff;cursor:pointer;}
        .sbBtnGhost:hover{background:rgba(255,255,255,.09)}

        .sbGrid{display:grid;grid-template-columns: 1fr 1.2fr;gap:14px;}
        .sbCard{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.10);
          border-radius:16px;padding:16px;backdrop-filter: blur(10px);box-shadow: 0 20px 60px rgba(0,0,0,.35);}

        .sbCardTop{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px;}
        .sbCardTop h3{margin:0;font-size:16px}
        .sbPill,.sbPill2{font-size:12px;padding:6px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.12)}
        .sbPill{background:rgba(255,77,109,.12);border-color:rgba(255,77,109,.35)}
        .sbPill2{background:rgba(124,77,255,.12);border-color:rgba(124,77,255,.35)}

        .sbForm{display:flex;flex-direction:column;gap:12px;}
        .sbRow2{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
        .sbRow3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;}
        .sbField label{display:block;font-size:12px;opacity:.8;margin-bottom:6px;}
        .sbField input,.sbField select,.sbField textarea{width:100%;padding:11px 12px;border-radius:12px;
          background:rgba(0,0,0,.28);border:1px solid rgba(255,255,255,.12);color:#fff;outline:none;}
        .sbField textarea{resize:none}
        .sbField input:focus,.sbField select:focus,.sbField textarea:focus{border-color:rgba(255,77,109,.55);
          box-shadow:0 0 0 4px rgba(255,77,109,.12);}

        .sbUpload{display:grid;grid-template-columns:1fr 160px;gap:10px;align-items:start;}
        .sbUploadLeft small{display:block;opacity:.6;margin-top:6px}
        .sbPreview{width:160px;height:150px;border-radius:14px;overflow:hidden;border:1px solid rgba(255,255,255,.10);background:rgba(0,0,0,.25)}
        .sbPreview img{width:100%;height:100%;object-fit:cover}
        .sbEmptyPreview{width:100%;height:100%;display:grid;place-items:center;opacity:.6}

        .sbBtnMain{margin-top:2px;padding:12px 14px;border-radius:14px;border:none;cursor:pointer;
          background:linear-gradient(90deg,#ff4d6d,#ff7a59);color:#0b0b0f;font-weight:800;}

        .sbSearch input{padding:10px 12px;border-radius:12px;background:rgba(0,0,0,.28);
          border:1px solid rgba(255,255,255,.12);color:#fff;outline:none;width:270px;max-width:45vw;}

        .sbList{display:flex;flex-direction:column;gap:10px;max-height:72vh;overflow:auto;padding-right:4px;}
        .sbItem{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px;border-radius:14px;
          background:rgba(0,0,0,.22);border:1px solid rgba(255,255,255,.08);}
        .sbItemLeft{display:flex;gap:12px;align-items:center;min-width:0;}
        .sbThumb{width:56px;height:56px;border-radius:14px;overflow:hidden;display:grid;place-items:center;
          border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.05)}
        .sbThumb img{width:100%;height:100%;object-fit:cover}
        .sbMeta{min-width:0}
        .sbNameRow{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
        .sbNameRow h4{margin:0;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:320px}
        .sbSubRow{margin:6px 0 0;font-size:12px;opacity:.75;display:flex;gap:8px;align-items:center;flex-wrap:wrap}
        .mono{font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;}
        .dot{opacity:.55}
        .sbTagActive,.sbTagHidden,.sbTagBest{font-size:11px;padding:5px 9px;border-radius:999px;border:1px solid rgba(255,255,255,.10)}
        .sbTagActive{background:rgba(0,200,120,.12);border-color:rgba(0,200,120,.35)}
        .sbTagHidden{background:rgba(255,200,0,.10);border-color:rgba(255,200,0,.25)}
        .sbTagBest{background:rgba(182,138,90,.12);border-color:rgba(182,138,90,.35)}

        .sbActions{display:flex;gap:8px;flex-shrink:0}
        .sbBtnSmall,.sbBtnSmallDanger{padding:9px 12px;border-radius:12px;border:1px solid rgba(255,255,255,.10);
          background:rgba(255,255,255,.06);color:#fff;cursor:pointer;}
        .sbBtnSmallDanger{background:rgba(255,77,109,.12);border-color:rgba(255,77,109,.35)}
        .sbEmpty{opacity:.7;padding:18px;text-align:center}

        /* modal */
        .sbModalWrap{position:fixed;inset:0;background:rgba(0,0,0,.55);display:grid;place-items:center;z-index:9999;padding:18px;}
        .sbModal{width:min(920px, 100%);background:rgba(10,14,26,.92);border:1px solid rgba(255,255,255,.10);
          border-radius:18px;padding:16px;backdrop-filter: blur(12px);}
        .sbModalTop{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px;}
        .sbModalTop h3{margin:0}
        .sbX{border:none;background:rgba(255,255,255,.08);color:#fff;border-radius:12px;padding:8px 10px;cursor:pointer;}
        .sbBulkList{display:flex;flex-direction:column;gap:10px;max-height:52vh;overflow:auto;padding-right:4px;}
        .sbBulkRow{display:grid;grid-template-columns: 1.4fr .8fr .7fr .6fr .7fr .5fr;gap:10px;}
        .sbBulkRow input,.sbBulkRow select{padding:10px 12px;border-radius:12px;background:rgba(0,0,0,.28);
          border:1px solid rgba(255,255,255,.12);color:#fff;outline:none;}
        .sbRemoveRow{border:none;border-radius:12px;background:rgba(255,77,109,.15);color:#fff;cursor:pointer;}
        .sbModalActions{display:flex;justify-content:space-between;gap:10px;margin-top:12px;flex-wrap:wrap}
        .sbTip{margin:10px 0 0;opacity:.7;font-size:12px}

        @media(max-width: 980px){
          .sbGrid{grid-template-columns:1fr;}
          .sbSearch input{width:100%;max-width:none}
          .sbList{max-height:none}
          .sbUpload{grid-template-columns:1fr;}
          .sbPreview{width:100%;height:240px}
          .sbBulkRow{grid-template-columns:1fr 1fr;}
        }
      `}</style>
    </div>
  );
}
