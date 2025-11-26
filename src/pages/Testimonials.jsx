import React, { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from "react-toastify";

const emptyForm = {
  customerName: "",
  headline: "",
  content: "",
  rating: "",
  productId: "",
  productName: "",
  location: "",
  language: "en",
  featured: false,
  sortOrder: 0,
  published: false,
};

const Testimonials = ({ token }) => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [avatar, setAvatar] = useState(null);
  const [media, setMedia] = useState([]); // FileList
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  const load = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/testimonials/all`, { headers });
      setItems(res.data.data || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load testimonials");
    }
  };

  useEffect(() => { load(); }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const reset = () => {
    setForm(emptyForm);
    setAvatar(null);
    setMedia([]);
    setEditingId(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (avatar) fd.append("avatar", avatar);
      Array.from(media || []).forEach((f) => fd.append("media", f));
      // optional: fd.append("mediaMeta", JSON.stringify([{alt:""}, ...]))

      if (editingId) {
        // Keep current media unless replaced — send keepMedia
        const keep = items.find(i => i._id === editingId)?.media || [];
        fd.append("keepMedia", JSON.stringify(keep));
        await axios.put(`${backendUrl}/api/testimonials/${editingId}`, fd, { headers });
        toast.success("Testimonial updated");
      } else {
        await axios.post(`${backendUrl}/api/testimonials`, fd, { headers });
        toast.success("Testimonial created");
      }
      await load();
      reset();
    } catch (e) {
      console.error(e);
      toast.error(e.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const edit = (it) => {
    setEditingId(it._id);
    setForm({
      customerName: it.customerName || "",
      headline: it.headline || "",
      content: it.content || "",
      rating: it.rating || "",
      productId: it.productId || "",
      productName: it.productName || "",
      location: it.location || "",
      language: it.language || "en",
      featured: !!it.featured,
      sortOrder: it.sortOrder || 0,
      published: !!it.published,
    });
    setAvatar(null);
    setMedia([]);
  };

  const remove = async (id) => {
    if (!confirm("Delete this testimonial?")) return;
    try {
      await axios.delete(`${backendUrl}/api/testimonials/${id}`, { headers });
      toast.success("Deleted");
      await load();
    } catch (e) {
      console.error(e);
      toast.error("Delete failed");
    }
  };

  const toggle = async (id, patch) => {
    try {
      await axios.patch(`${backendUrl}/api/testimonials/${id}/status`, patch, { headers });
      await load();
    } catch (e) {
      console.error(e);
      toast.error("Update failed");
    }
  };

  const handleReorder = async () => {
    try {
      const payload = { items: items.map((it, idx) => ({ id: it._id, sortOrder: idx })) };
      await axios.patch(`${backendUrl}/api/testimonials/reorder`, payload, { headers });
      toast.success("Reordered");
      await load();
    } catch (e) {
      console.error(e);
      toast.error("Reorder failed");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl md:text-2xl font-semibold mb-4">Happy Customers</h2>

      {/* Form */}
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 bg-white p-3 md:p-4 rounded shadow">
        <input name="customerName" value={form.customerName} onChange={onChange} placeholder="Customer Name*" className="border p-2 rounded text-sm md:text-base" required />
        <textarea name="content" value={form.content} onChange={onChange} placeholder="Content*" className="border p-2 rounded md:col-span-2 text-sm md:text-base" rows={3} required />
        <input name="rating" type="number" min="1" max="5" value={form.rating} onChange={onChange} placeholder="Rating (1-5)" className="border p-2 rounded text-sm md:text-base" />
        <input name="productName" value={form.productName} onChange={onChange} placeholder="Product Name (display)" className="border p-2 rounded text-sm md:text-base" />
        <input name="productId" value={form.productId} onChange={onChange} placeholder="ProductId (optional)" className="border p-2 rounded text-sm md:text-base" />
        <input name="location" value={form.location} onChange={onChange} placeholder="Location" className="border p-2 rounded text-sm md:text-base" />
        <input name="language" value={form.language} onChange={onChange} placeholder="Language e.g. en" className="border p-2 rounded text-sm md:text-base" />
        
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:col-span-2">
          <label className="flex items-center gap-2 text-sm md:text-base">
            <input type="checkbox" name="featured" checked={form.featured} onChange={onChange} className="h-4 w-4" /> 
            Featured
          </label>
          <input name="sortOrder" type="number" value={form.sortOrder} onChange={onChange} placeholder="Sort Order" className="border p-2 rounded text-sm md:text-base flex-1" />
          <label className="flex items-center gap-2 text-sm md:text-base">
            <input type="checkbox" name="published" checked={form.published} onChange={onChange} className="h-4 w-4" /> 
            Published
          </label>
        </div>

        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Avatar</label>
            <input type="file" accept="image/*" onChange={(e) => setAvatar(e.target.files[0])} className="text-xs md:text-sm" />
          </div>
          {/* <div>
            <label className="block text-sm font-medium mb-1">Media (up to 6)</label>
            <input type="file" accept="image/*,video/*" multiple onChange={(e) => setMedia(e.target.files)} />
          </div> */}
        </div>

        <div className="md:col-span-2 flex flex-wrap gap-2">
          <button type="submit" disabled={loading} className={`px-3 py-2 md:px-4 md:py-2 rounded text-white text-sm md:text-base ${loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`}>
            {editingId ? "Update" : "Create"}
          </button>
          {editingId && (
            <button type="button" onClick={reset} className="px-3 py-2 md:px-4 md:py-2 rounded bg-gray-200 text-sm md:text-base">Cancel</button>
          )}
          <button type="button" onClick={handleReorder} className="px-3 py-2 md:px-4 md:py-2 rounded bg-blue-600 text-white text-sm md:text-base">Auto Reorder</button>
        </div>
      </form>

      {/* List */}
      <div className="mt-6 space-y-3">
        {items.map((it) => (
          <div key={it._id} className="bg-white p-3 md:p-4 rounded shadow flex flex-col md:flex-row md:items-start gap-3">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden bg-gray-100 shrink-0">
              {it.avatarUrl ? <img src={it.avatarUrl} alt={it.customerName} className="w-full h-full object-cover" /> : null}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm md:text-base">{it.customerName} {it.rating ? `· ⭐ ${it.rating}` : ""}</div>
              {it.headline && <div className="text-xs md:text-sm text-gray-600 mt-1">{it.headline}</div>}
              <div className="text-xs md:text-sm mt-1 line-clamp-2">{it.content}</div>
              <div className="text-xs text-gray-500 mt-2">
                Featured: {it.featured ? "Yes" : "No"} · Order: {it.sortOrder} · {it.published ? "Published" : "Draft"}
              </div>
            </div>
            <div className="flex flex-wrap gap-1 md:gap-2 justify-end">
              <button onClick={() => edit(it)} className="px-2 py-1 md:px-3 md:py-1 rounded bg-amber-500 text-white text-xs md:text-sm">Edit</button>
              <button onClick={() => toggle(it._id, { published: !it.published })} className="px-2 py-1 md:px-3 md:py-1 rounded bg-indigo-600 text-white text-xs md:text-sm">
                {it.published ? "Unpub" : "Pub"}
              </button>
              <button onClick={() => toggle(it._id, { featured: !it.featured })} className="px-2 py-1 md:px-3 md:py-1 rounded bg-blue-600 text-white text-xs md:text-sm">
                {it.featured ? "Unfeat" : "Feat"}
              </button>
              <button onClick={() => remove(it._id)} className="px-2 py-1 md:px-3 md:py-1 rounded bg-red-600 text-white text-xs md:text-sm">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonials;