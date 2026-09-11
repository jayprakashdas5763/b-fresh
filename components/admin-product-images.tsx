"use client";

import { ChangeEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ProductImage = {
    id: string;
    product_id: string;
    image_url: string;
    alt_text: string | null;
    sort_order: number;
};

type AdminProductImagesProps = {
    productId: string;
    productName: string;
    images: ProductImage[];
    onImagesChanged: () => Promise<void>;
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_IMAGES = 5;

export default function AdminProductImages({
    productId,
    productName,
    images,
    onImagesChanged,
}: AdminProductImagesProps) {
    const supabase = createClient();

    const [uploading, setUploading] = useState(false);
    const [actionId, setActionId] = useState<string | null>(null);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    function getSortedImages() {
        return [...images].sort(
            (a, b) => a.sort_order - b.sort_order
        );
    }

    function getStoragePathFromUrl(imageUrl: string) {
        const marker =
            "/storage/v1/object/public/product-images/";

        const index = imageUrl.indexOf(marker);

        if (index === -1) {
            return null;
        }

        return imageUrl.slice(index + marker.length);
    }

    async function handleUpload(
        event: ChangeEvent<HTMLInputElement>
    ) {
        const files = Array.from(event.target.files ?? []);

        if (files.length === 0) {
            return;
        }

        setMessage("");
        setError("");

        const sortedImages = getSortedImages();

        if (sortedImages.length + files.length > MAX_IMAGES) {
            setError(
                `A product can have a maximum of ${MAX_IMAGES} images.`
            );
            event.target.value = "";
            return;
        }

        for (const file of files) {
            if (!file.type.startsWith("image/")) {
                setError(
                    `Invalid file: ${file.name}. Please select an image.`
                );
                event.target.value = "";
                return;
            }

            if (file.size > MAX_IMAGE_SIZE) {
                setError(
                    `${file.name} is larger than 5 MB.`
                );
                event.target.value = "";
                return;
            }
        }

        setUploading(true);

        try {
            let nextSortOrder = sortedImages.length;

            for (const file of files) {
                const extension =
                    file.name.split(".").pop()?.toLowerCase() ||
                    "jpg";

                const storagePath =
                    `${productId}/${crypto.randomUUID()}.${extension}`;

                const { error: uploadError } =
                    await supabase.storage
                        .from("product-images")
                        .upload(storagePath, file, {
                            cacheControl: "3600",
                            upsert: false,
                            contentType: file.type,
                        });

                if (uploadError) {
                    throw new Error(uploadError.message);
                }

                const {
                    data: { publicUrl },
                } = supabase.storage
                    .from("product-images")
                    .getPublicUrl(storagePath);

                const { error: imageError } = await supabase
                    .from("product_images")
                    .insert({
                        product_id: productId,
                        image_url: publicUrl,
                        alt_text: productName,
                        sort_order: nextSortOrder,
                    });

                if (imageError) {
                    await supabase.storage
                        .from("product-images")
                        .remove([storagePath]);

                    throw new Error(imageError.message);
                }

                nextSortOrder += 1;
            }

            setMessage(
                `${files.length} image${files.length > 1 ? "s" : ""
                } uploaded successfully.`
            );

            await onImagesChanged();
        } catch (uploadError) {
            setError(
                uploadError instanceof Error
                    ? uploadError.message
                    : "Unable to upload images."
            );
        } finally {
            setUploading(false);
            event.target.value = "";
        }
    }

    async function setPrimaryImage(imageId: string) {
        const sortedImages = getSortedImages();
        const selectedIndex = sortedImages.findIndex(
            (image) => image.id === imageId
        );

        if (selectedIndex === -1 || selectedIndex === 0) {
            return;
        }

        setActionId(imageId);
        setMessage("");
        setError("");

        try {
            const reorderedImages = [
                sortedImages[selectedIndex],
                ...sortedImages.filter(
                    (_, index) => index !== selectedIndex
                ),
            ];

            for (let index = 0; index < reorderedImages.length; index++) {
                const image = reorderedImages[index];

                const { error: updateError } = await supabase
                    .from("product_images")
                    .update({
                        sort_order: index,
                    })
                    .eq("id", image.id);

                if (updateError) {
                    throw new Error(updateError.message);
                }
            }

            setMessage("Primary image updated.");
            await onImagesChanged();
        } catch (updateError) {
            setError(
                updateError instanceof Error
                    ? updateError.message
                    : "Unable to update image order."
            );
        } finally {
            setActionId(null);
        }
    }

    async function moveImage(
        imageId: string,
        direction: "left" | "right"
    ) {
        const sortedImages = getSortedImages();
        const currentIndex = sortedImages.findIndex(
            (image) => image.id === imageId
        );

        if (currentIndex === -1) {
            return;
        }

        const targetIndex =
            direction === "left"
                ? currentIndex - 1
                : currentIndex + 1;

        if (
            targetIndex < 0 ||
            targetIndex >= sortedImages.length
        ) {
            return;
        }

        setActionId(imageId);
        setMessage("");
        setError("");

        try {
            const reorderedImages = [...sortedImages];

            [
                reorderedImages[currentIndex],
                reorderedImages[targetIndex],
            ] = [
                    reorderedImages[targetIndex],
                    reorderedImages[currentIndex],
                ];

            for (let index = 0; index < reorderedImages.length; index++) {
                const image = reorderedImages[index];

                const { error: updateError } = await supabase
                    .from("product_images")
                    .update({
                        sort_order: index,
                    })
                    .eq("id", image.id);

                if (updateError) {
                    throw new Error(updateError.message);
                }
            }

            setMessage("Image order updated.");
            await onImagesChanged();
        } catch (updateError) {
            setError(
                updateError instanceof Error
                    ? updateError.message
                    : "Unable to update image order."
            );
        } finally {
            setActionId(null);
        }
    }

    async function deleteImage(image: ProductImage) {
        if (images.length <= 1) {
            setError(
                "A product must keep at least one image."
            );
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to delete this image?"
        );

        if (!confirmed) {
            return;
        }

        setActionId(image.id);
        setMessage("");
        setError("");

        try {
            const { error: deleteError } = await supabase
                .from("product_images")
                .delete()
                .eq("id", image.id)
                .eq("product_id", productId);

            if (deleteError) {
                throw new Error(deleteError.message);
            }

            const storagePath =
                getStoragePathFromUrl(image.image_url);

            if (storagePath) {
                const { error: storageError } =
                    await supabase.storage
                        .from("product-images")
                        .remove([storagePath]);

                if (storageError) {
                    console.error(
                        "Unable to remove image from storage:",
                        storageError.message
                    );
                }
            }

            const remainingImages = getSortedImages().filter(
                (item) => item.id !== image.id
            );

            for (
                let index = 0;
                index < remainingImages.length;
                index++
            ) {
                const remainingImage = remainingImages[index];

                await supabase
                    .from("product_images")
                    .update({
                        sort_order: index,
                    })
                    .eq("id", remainingImage.id);
            }

            setMessage("Image deleted.");
            await onImagesChanged();
        } catch (deleteError) {
            setError(
                deleteError instanceof Error
                    ? deleteError.message
                    : "Unable to delete image."
            );
        } finally {
            setActionId(null);
        }
    }

    const sortedImages = getSortedImages();

    return (
        <div className="mt-6 rounded-xl border bg-gray-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="font-semibold text-gray-900">
                        Product Images
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                        {sortedImages.length} of {MAX_IMAGES} images
                    </p>
                </div>

                <label
                    className={`inline-flex cursor-pointer items-center rounded-lg px-4 py-2 text-sm font-medium text-white ${uploading ||
                        sortedImages.length >= MAX_IMAGES
                        ? "cursor-not-allowed bg-gray-400"
                        : "bg-black hover:bg-gray-800"
                        }`}
                >
                    {uploading ? "Uploading..." : "Add Images"}

                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        disabled={
                            uploading ||
                            actionId !== null ||
                            sortedImages.length >= MAX_IMAGES
                        }
                        onChange={handleUpload}
                        className="hidden"
                    />
                </label>
            </div>

            {sortedImages.length === 0 ? (
                <div className="mt-4 rounded-lg border border-dashed bg-white p-6 text-center">
                    <p className="text-sm text-gray-500">
                        No images uploaded.
                    </p>
                </div>
            ) : (
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {sortedImages.map((image, index) => (
                        <div
                            key={image.id}
                            className="overflow-hidden rounded-xl border bg-white"
                        >
                            <div className="relative aspect-square bg-gray-100">
                                <img
                                    src={image.image_url}
                                    alt={
                                        image.alt_text ??
                                        productName
                                    }
                                    className="h-full w-full object-cover"
                                />

                                {index === 0 && (
                                    <span className="absolute left-2 top-2 rounded-full bg-green-700 px-2 py-1 text-xs font-medium text-white">
                                        Primary
                                    </span>
                                )}
                            </div>

                            <div className="p-3">
                                <p className="text-xs text-gray-500">
                                    Image {index + 1}
                                </p>

                                <div className="mt-3 flex flex-wrap gap-2">
                                    {index > 0 && (
                                        <button
                                            type="button"
                                            disabled={
                                                actionId !== null ||
                                                index === 0
                                            }
                                            onClick={() =>
                                                setPrimaryImage(
                                                    image.id
                                                )
                                            }
                                            className="rounded-lg border px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-50 disabled:opacity-50"
                                        >
                                            Make Primary
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        disabled={
                                            actionId !== null ||
                                            index === 0
                                        }
                                        onClick={() =>
                                            moveImage(
                                                image.id,
                                                "left"
                                            )
                                        }
                                        className="rounded-lg border px-2 py-1 text-xs disabled:opacity-40"
                                    >
                                        ←
                                    </button>

                                    <button
                                        type="button"
                                        disabled={
                                            actionId !== null ||
                                            index === sortedImages.length - 1
                                        }
                                        onClick={() =>
                                            moveImage(
                                                image.id,
                                                "right"
                                            )
                                        }
                                        className="rounded-lg border px-2 py-1 text-xs disabled:opacity-40"
                                    >
                                        →
                                    </button>

                                    <button
                                        type="button"
                                        disabled={actionId !== null}
                                        onClick={() =>
                                            deleteImage(image)
                                        }
                                        className="rounded-lg border border-red-300 px-2 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {message && (
                <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                    {message}
                </p>
            )}

            {error && (
                <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    {error}
                </p>
            )}
        </div>
    );
}