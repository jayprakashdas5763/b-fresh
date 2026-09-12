"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ReviewRow = {
  id: string;
  rating: number;
  review_text: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  product_id: string;
  user_id: string;
  order_id: string;
};

type Product = {
  id: string;
  name: string;
};

type Review = ReviewRow & {
  product: Product | null;
};

export default function AdminReviewsPage() {
  const supabase = createClient();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("pending");

  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function loadReviews() {
    setLoading(true);
    setMessage("");

    let query = supabase
      .from("reviews")
      .select(`
                id,
                rating,
                review_text,
                status,
                created_at,
                product_id,
                user_id,
                order_id
            `)
      .order("created_at", { ascending: false });

    if (filter !== "all") {
      query = query.eq("status", filter);
    }

    const { data: reviewData, error: reviewError } = await query;

    if (reviewError) {
      setMessage(reviewError.message);
      setReviews([]);
      setLoading(false);
      return;
    }

    const reviewRows = (reviewData ?? []) as ReviewRow[];

    if (reviewRows.length === 0) {
      setReviews([]);
      setLoading(false);
      return;
    }

    const productIds = [
      ...new Set(reviewRows.map((review) => review.product_id)),
    ];

    const { data: productData, error: productError } =
      await supabase
        .from("products")
        .select("id, name")
        .in("id", productIds);

    if (productError) {
      setMessage(productError.message);
      setReviews([]);
      setLoading(false);
      return;
    }

    const products = (productData ?? []) as Product[];

    const combinedReviews: Review[] = reviewRows.map((review) => ({
      ...review,
      product:
        products.find(
          (product) => product.id === review.product_id
        ) ?? null,
    }));

    setReviews(combinedReviews);
    setLoading(false);
  }

  useEffect(() => {
    loadReviews();
  }, [filter]);

  async function updateStatus(
    reviewId: string,
    status: "pending" | "approved" | "rejected"
  ) {
    setSavingId(reviewId);
    setMessage("");

    const { error } = await supabase
      .from("reviews")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", reviewId);

    if (error) {
      setMessage(error.message);
    } else {
      if (filter === "all") {
        setReviews((current) =>
          current.map((review) =>
            review.id === reviewId
              ? { ...review, status }
              : review
          )
        );
      } else {
        setReviews((current) =>
          current.filter((review) => review.id !== reviewId)
        );
      }
    }

    setSavingId(null);
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 transition-colors dark:bg-[#07140d] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Reviews
            </h1>

            <p className="mt-2 text-gray-600 dark:text-green-200/70">
              Review and moderate customer feedback.
            </p>
          </div>

          <select
            value={filter}
            onChange={(event) =>
              setFilter(
                event.target.value as
                | "all"
                | "pending"
                | "approved"
                | "rejected"
              )
            }
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100 dark:border-green-800 dark:bg-[#102019] dark:text-white dark:focus:border-lime-400 dark:focus:ring-green-950"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="all">All Reviews</option>
          </select>
        </div>

        {message && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {message}
          </div>
        )}

        {loading ? (
          <div className="mt-8 flex items-center justify-center gap-3 rounded-2xl border border-transparent bg-white p-8 text-center text-gray-600 shadow-sm dark:border-green-900/70 dark:bg-green-950/70 dark:text-green-200/70">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-green-700 dark:border-green-800 dark:border-t-lime-300" />
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-green-800 dark:bg-green-950/70">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              No reviews found
            </h2>

            <p className="mt-2 text-gray-600 dark:text-green-200/70">
              There are no{" "}
              {filter === "all" ? "" : filter} reviews right
              now.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-5">
            {reviews.map((review) => (
              <article
                key={review.id}
                className="rounded-2xl border border-transparent bg-white p-6 shadow-sm transition-colors dark:border-green-900/70 dark:bg-green-950/70 dark:shadow-black/10"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-green-300/70">
                      Product
                    </p>

                    <h2 className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                      {review.product?.name ??
                        "Unknown Product"}
                    </h2>

                    <p className="mt-2 text-sm text-gray-500 dark:text-green-300/70">
                      Order #{review.order_id}
                    </p>

                    <p className="mt-1 text-sm text-gray-500 dark:text-green-300/70">
                      {new Date(
                        review.created_at
                      ).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${review.status === "approved"
                        ? "bg-green-100 text-green-800 dark:bg-green-950/70 dark:text-green-300"
                        : review.status === "rejected"
                          ? "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-300"
                      }`}
                  >
                    {review.status}
                  </span>
                </div>

                <div className="mt-5">
                  <div
                    className="text-lg text-yellow-500"
                    aria-label={`${review.rating} out of 5 stars`}
                  >
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </div>

                  {review.review_text && (
                    <p className="mt-3 leading-7 text-gray-700 dark:text-green-100/85">
                      {review.review_text}
                    </p>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap gap-3 border-t border-gray-200 pt-5 dark:border-green-900">
                  {review.status !== "approved" && (
                    <button
                      type="button"
                      onClick={() =>
                        updateStatus(
                          review.id,
                          "approved"
                        )
                      }
                      disabled={
                        savingId === review.id
                      }
                      className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-green-700 dark:hover:bg-green-600"
                    >
                      {savingId === review.id
                        ? "Saving..."
                        : "Approve"}
                    </button>
                  )}

                  {review.status !== "rejected" && (
                    <button
                      type="button"
                      onClick={() =>
                        updateStatus(
                          review.id,
                          "rejected"
                        )
                      }
                      disabled={
                        savingId === review.id
                      }
                      className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/60"
                    >
                      Reject
                    </button>
                  )}

                  {review.status !== "pending" && (
                    <button
                      type="button"
                      onClick={() =>
                        updateStatus(
                          review.id,
                          "pending"
                        )
                      }
                      disabled={
                        savingId === review.id
                      }
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-green-800 dark:bg-green-950/60 dark:text-green-100 dark:hover:bg-green-900"
                    >
                      Set Pending
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}