"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const supabase = createClient();

  async function loadCategories() {
    setLoading(true);

    const { data, error } = await supabase
      .from("categories")
      .select(
        "id, name, slug, description, image_url, is_active, created_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
    } else {
      setCategories(data ?? []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function createSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      setMessage("Category name is required.");
      return;
    }

    setSaving(true);
    setMessage("");

    const slug = createSlug(name);

    const { error } = await supabase.from("categories").insert({
      name: name.trim(),
      slug,
      description: description.trim() || null,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setName("");
      setDescription("");
      setMessage("Category created successfully.");
      await loadCategories();
    }

    setSaving(false);
  }

  async function toggleCategory(category: Category) {
    const { error } = await supabase
      .from("categories")
      .update({
        is_active: !category.is_active,
      })
      .eq("id", category.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    await loadCategories();
  }

  async function deleteCategory(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Category deleted.");
    await loadCategories();
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="mt-2 text-gray-600">
            Manage the product categories for B-Fresh.
          </p>
        </div>

        <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Add Category</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Category name"
              className="w-full rounded-lg border p-3"
            />

            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Description (optional)"
              rows={3}
              className="w-full rounded-lg border p-3"
            />

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-black px-5 py-3 text-white disabled:opacity-50"
            >
              {saving ? "Saving..." : "Add Category"}
            </button>
          </form>

          {message && (
            <p className="mt-4 rounded-lg bg-gray-100 p-3 text-sm">
              {message}
            </p>
          )}
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Existing Categories</h2>

          {loading ? (
            <p className="text-gray-500">Loading categories...</p>
          ) : categories.length === 0 ? (
            <p className="text-gray-500">No categories yet.</p>
          ) : (
            <div className="space-y-3">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex flex-col gap-4 rounded-xl border p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <h3 className="font-semibold">{category.name}</h3>

                    <p className="text-sm text-gray-500">
                      {category.slug}
                    </p>

                    {category.description && (
                      <p className="mt-1 text-sm text-gray-600">
                        {category.description}
                      </p>
                    )}

                    <span
                      className={`mt-2 inline-block rounded-full px-2 py-1 text-xs ${
                        category.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {category.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => toggleCategory(category)}
                      className="rounded-lg border px-3 py-2 text-sm"
                    >
                      {category.is_active ? "Deactivate" : "Activate"}
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteCategory(category.id)}
                      className="rounded-lg border border-red-300 px-3 py-2 text-sm text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}