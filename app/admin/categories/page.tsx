"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";
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

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [editingCategory, setEditingCategory] =
    useState<Category | null>(null);

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

  function handleImageChange(file: File | null) {
    setMessage("");

    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setMessage("Please select a valid image file.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setMessage("Image must be 5 MB or smaller.");
      return;
    }

    setImageFile(file);

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  }

  function resetForm() {
    setName("");
    setDescription("");
    setImageFile(null);
    setImagePreview(null);
    setEditingCategory(null);
    setMessage("");
  }

  function startEdit(category: Category) {
    setEditingCategory(category);
    setName(category.name);
    setDescription(category.description ?? "");
    setImageFile(null);
    setImagePreview(category.image_url);
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function getStoragePathFromUrl(url: string | null) {
    if (!url) return null;

    const marker = "/storage/v1/object/public/product-images/";

    const index = url.indexOf(marker);

    if (index === -1) return null;

    return decodeURIComponent(url.substring(index + marker.length));
  }

  async function uploadCategoryImage(file: File, categoryId: string) {
    const extension =
      file.name.split(".").pop()?.toLowerCase() || "jpg";

    const filePath = `categories/${categoryId}-${crypto.randomUUID()}.${extension}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(filePath, file, {
        cacheControl: "31536000",
        upsert: false,
      });

    if (error) {
      throw new Error(`Image upload failed: ${error.message}`);
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    return {
      filePath,
      publicUrl,
    };
  }

  async function deleteStorageImage(imageUrl: string | null) {
    const storagePath = getStoragePathFromUrl(imageUrl);

    if (!storagePath) return;

    const { error } = await supabase.storage
      .from("product-images")
      .remove([storagePath]);

    if (error) {
      console.error("Could not delete old category image:", error);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      setMessage("Category name is required.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const slug = createSlug(name);

      /*
       * EDIT CATEGORY
       */
      if (editingCategory) {
        let imageUrl = editingCategory.image_url;

        // Upload new image if selected
        if (imageFile) {
          const uploaded = await uploadCategoryImage(
            imageFile,
            editingCategory.id
          );

          imageUrl = uploaded.publicUrl;
        }

        const { error } = await supabase
          .from("categories")
          .update({
            name: name.trim(),
            slug,
            description: description.trim() || null,
            image_url: imageUrl,
          })
          .eq("id", editingCategory.id);

        if (error) {
          // If database update fails after uploading,
          // remove the newly uploaded image.
          if (imageFile && imageUrl !== editingCategory.image_url) {
            await deleteStorageImage(imageUrl);
          }

          throw new Error(error.message);
        }

        // Delete old image only after database update succeeds
        if (
          imageFile &&
          editingCategory.image_url &&
          imageUrl !== editingCategory.image_url
        ) {
          await deleteStorageImage(editingCategory.image_url);
        }

        setMessage("Category updated successfully.");
      }

      /*
       * CREATE CATEGORY
       */
      else {
        const { data, error } = await supabase
          .from("categories")
          .insert({
            name: name.trim(),
            slug,
            description: description.trim() || null,
          })
          .select("id")
          .single();

        if (error) {
          throw new Error(error.message);
        }

        const categoryId = data.id;

        // Upload image after category has been created
        if (imageFile) {
          try {
            const uploaded = await uploadCategoryImage(
              imageFile,
              categoryId
            );

            const { error: imageUpdateError } = await supabase
              .from("categories")
              .update({
                image_url: uploaded.publicUrl,
              })
              .eq("id", categoryId);

            if (imageUpdateError) {
              await deleteStorageImage(uploaded.publicUrl);

              // Remove category if image update failed
              await supabase
                .from("categories")
                .delete()
                .eq("id", categoryId);

              throw new Error(imageUpdateError.message);
            }
          } catch (error) {
            throw error;
          }
        }

        setMessage("Category created successfully.");
      }

      resetForm();
      await loadCategories();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleCategory(category: Category) {
    setMessage("");

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

  async function deleteCategory(category: Category) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`
    );

    if (!confirmed) return;

    setMessage("");

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", category.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    // Delete category image after successful database deletion
    if (category.image_url) {
      await deleteStorageImage(category.image_url);
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

        {/* Add / Edit Category */}
        <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {editingCategory ? "Edit Category" : "Add Category"}
            </h2>

            {editingCategory && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Category name"
              className="w-full rounded-lg border p-3"
              disabled={saving}
            />

            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Description (optional)"
              rows={3}
              className="w-full rounded-lg border p-3"
              disabled={saving}
            />

            {/* Image upload */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Category Image
              </label>

              <input
                type="file"
                accept="image/*"
                disabled={saving}
                onChange={(event) =>
                  handleImageChange(event.target.files?.[0] ?? null)
                }
                className="block w-full rounded-lg border bg-white p-2 text-sm"
              />

              <p className="mt-1 text-xs text-gray-500">
                JPG, PNG, WebP or other image formats. Maximum 5 MB.
              </p>
            </div>

            {/* Image preview */}
            {imagePreview && (
              <div className="relative h-48 w-full overflow-hidden rounded-xl border bg-gray-50 sm:w-72">
                <Image
                  src={imagePreview}
                  alt="Category preview"
                  fill
                  className="object-cover"
                  sizes="288px"
                />
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-black px-5 py-3 text-white disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingCategory
                    ? "Update Category"
                    : "Add Category"}
              </button>

              {editingCategory && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="rounded-lg border px-5 py-3"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {message && (
            <p className="mt-4 rounded-lg bg-gray-100 p-3 text-sm">
              {message}
            </p>
          )}
        </section>

        {/* Existing Categories */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">
            Existing Categories
          </h2>

          {loading ? (
            <p className="text-gray-500">
              Loading categories...
            </p>
          ) : categories.length === 0 ? (
            <p className="text-gray-500">
              No categories yet.
            </p>
          ) : (
            <div className="space-y-3">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex flex-col gap-4 rounded-xl border p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    {/* Category thumbnail */}
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                      {category.image_url ? (
                        <Image
                          src={category.image_url}
                          alt={category.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-2xl">
                          🥗
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-semibold">
                        {category.name}
                      </h3>

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
                        {category.is_active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(category)}
                      className="rounded-lg border border-blue-300 px-3 py-2 text-sm text-blue-700 hover:bg-blue-50"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        toggleCategory(category)
                      }
                      className="rounded-lg border px-3 py-2 text-sm"
                    >
                      {category.is_active
                        ? "Deactivate"
                        : "Activate"}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        deleteCategory(category)
                      }
                      className="rounded-lg border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
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