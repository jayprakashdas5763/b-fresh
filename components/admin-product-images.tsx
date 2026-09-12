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
                files.length === 1
                    ? "Image uploaded successfully."
                    : `${files.length} images uploaded successfully.`
            );

            event.target.value = "";

            await onImagesChanged();
        } catch (uploadError) {
            setError(
                uploadError instanceof Error
                    ? uploadError.message
                    : "Unable to upload image."
            );
        } finally {
            setUploading(false);
        }
    }

    async function setPrimaryImage(imageId: string) {
        if (actionId) {
            return;
        }

        setActionId(imageId);
        setMessage("");
        setError("");

        const sortedImages = getSortedImages();
        const targetIndex = sortedImages.findIndex(
            (image) => image.id === imageId
        );

        if (targetIndex <= 0) {
            setActionId(null);
            return;
        }

        const primaryImage = sortedImages[0];
        const targetImage = sortedImages[targetIndex];

        const { error: firstUpdateError } = await supabase
            .from("product_images")
            .update({
                sort_order: targetImage.sort_order,
            })
            .eq("id", primaryImage.id);

        if (firstUpdateError) {
            setError(firstUpdateError.message);
            setActionId(null);
            return;
        }

        const { error: secondUpdateError } = await supabase
            .from("product_images")
            .update({
                sort_order: primaryImage.sort_order,
            })
            .eq("id", targetImage.id);

        if (secondUpdateError) {
            setError(secondUpdateError.message);
            setActionId(null);
            return;
        }

        setMessage("Primary image updated.");

        await onImagesChanged();

        setActionId(null);
    }

    async function moveImage(
        imageId: string,
        direction: "left" | "right"
    ) {
        if (actionId) {
            return;
        }

        setActionId(imageId);
        setMessage("");
        setError("");

        const sortedImages = getSortedImages();
        const currentIndex = sortedImages.findIndex(
            (image) => image.id === imageId
        );

        if (currentIndex === -1) {
            setActionId(null);
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
            setActionId(null);
            return;
        }

        const currentImage = sortedImages[currentIndex];
        const targetImage = sortedImages[targetIndex];

        const { error: currentError } = await supabase
            .from("product_images")
            .update({
                sort_order: targetImage.sort_order,
            })
            .eq("id", currentImage.id);

        if (currentError) {
            setError(currentError.message);
            setActionId(null);
            return;
        }

        const { error: targetError } = await supabase
            .from("product_images")
            .update({
                sort_order: currentImage.sort_order,
            })
            .eq("id", targetImage.id);

        if (targetError) {
            setError(targetError.message);
            setActionId(null);
            return;
        }

        setMessage("Image order updated.");

        await onImagesChanged();

        setActionId(null);
    }

    async function deleteImage(image: ProductImage) {
        if (actionId) {
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
            const { error: deleteRecordError } =
                await supabase
                    .from("product_images")
                    .delete()
                    .eq("id", image.id);

            if (deleteRecordError) {
                throw new Error(deleteRecordError.message);
            }

            const storagePath = getStoragePathFromUrl(
                image.image_url
            );

            if (storagePath) {
                const { error: removeError } =
                    await supabase.storage
                        .from("product-images")
                        .remove([storagePath]);

                if (removeError) {
                    console.error(
                        "Unable to remove image file:",
                        removeError.message
                    );
                }
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
        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-green-900 dark:bg-green-900/30">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                        Product Images
                    </h3>

                    <p className="mt-1 text-xs text-gray-500 dark:text-green-200/70">
                        {sortedImages.length} of {MAX_IMAGES} images
                    </p>
                </div>

                <label
                    className={`inline-flex cursor-pointer items-center rounded-lg px-4 py-2 text-sm font-medium text-white transition ${
                        uploading ||
                        sortedImages.length >= MAX_IMAGES
                            ? "cursor-not-allowed bg-gray-400 dark:bg-green-900"
                            : "bg-green-700 hover:bg-green-800 dark:bg-green-700 dark:hover:bg-green-600"
                    }`}
                >
                    {uploading ? "Uploading..." : "Add Images"}

                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        disabled={
                            uploading ||
                            sortedImages.length >= MAX_IMAGES
                        }
                        onChange={handleUpload}
                        className="hidden"
                    />
                </label>
            </div>

            {sortedImages.length === 0 ? (
                <div className="mt-4 rounded-lg border border-dashed border-gray-300 bg-white p-6 text-center dark:border-green-800 dark:bg-green-950/60">
                    <p className="text-sm text-gray-500 dark:text-green-200/70">
                        No images uploaded.
                    </p>
                </div>
            ) : (
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {sortedImages.map((image, index) => (
                        <div
                            key={image.id}
                            className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-green-900 dark:bg-green-950/70 dark:shadow-black/10"
                        >
                            <div className="relative aspect-square bg-gray-100 dark:bg-green-900/50">
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
                                <p className="text-xs text-gray-500 dark:text-green-200/70">
                                    Image {index + 1}
                                </p>

                                <div className="mt-3 flex flex-wrap gap-2">
                                    {index > 0 && (
                                        <button
                                            type="button"
                                            disabled={
                                                actionId === image.id
                                            }
                                            onClick={() =>
                                                setPrimaryImage(
                                                    image.id
                                                )
                                            }
                                            className="rounded-lg border border-green-200 bg-white px-2 py-1 text-xs font-medium text-green-700 transition hover:bg-green-50 disabled:opacity-50 dark:border-green-800 dark:bg-green-950/60 dark:text-lime-300 dark:hover:bg-green-900"
                                        >
                                            Make Primary
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        disabled={
                                            actionId === image.id ||
                                            index === 0
                                        }
                                        onClick={() =>
                                            moveImage(
                                                image.id,
                                                "left"
                                            )
                                        }
                                        className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 transition hover:bg-gray-50 disabled:opacity-40 dark:border-green-800 dark:bg-green-950/60 dark:text-green-100 dark:hover:bg-green-900"
                                    >
                                        ←
                                    </button>

                                    <button
                                        type="button"
                                        disabled={
                                            actionId === image.id ||
                                            index ===
                                                sortedImages.length -
                                                    1
                                        }
                                        onClick={() =>
                                            moveImage(
                                                image.id,
                                                "right"
                                            )
                                        }
                                        className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 transition hover:bg-gray-50 disabled:opacity-40 dark:border-green-800 dark:bg-green-950/60 dark:text-green-100 dark:hover:bg-green-900"
                                    >
                                        →
                                    </button>

                                    <button
                                        type="button"
                                        disabled={
                                            actionId === image.id
                                        }
                                        onClick={() =>
                                            deleteImage(image)
                                        }
                                        className="rounded-lg border border-red-300 bg-white px-2 py-1 text-xs text-red-600 transition hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/60"
                                    >
                                        {actionId === image.id
                                            ? "Working..."
                                            : "Delete"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {message && (
                <p className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/60 dark:text-green-300">
                    {message}
                </p>
            )}

            {error && (
                <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/60 dark:text-red-300">
                    {error}
                </p>
            )}
        </div>
    );
}