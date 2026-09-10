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
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Reviews
            </h1>

            <p className="mt-2 text-gray-600">
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
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="all">All Reviews</option>
          </select>
        </div>

        {message && (
          <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {message}
          </div>
        )}

        {loading ? (
          <div className="mt-8 rounded-2xl bg-white p-8 text-center text-gray-600">
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed bg-white p-10 text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              No reviews found
            </h2>

            <p className="mt-2 text-gray-600">
              There are no{" "}
              {filter === "all" ? "" : filter} reviews right now.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-5">
            {reviews.map((review) => (
              <article
                key={review.id}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      Product
                    </p>

                    <h2 className="mt-1 text-lg font-semibold text-gray-900">
                      {review.product?.name ?? "Unknown Product"}
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                      Order #{review.order_id}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      {new Date(
                        review.created_at
                      ).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                      review.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : review.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
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
                    <p className="mt-3 leading-7 text-gray-700">
                      {review.review_text}
                    </p>
                  )}
                </div>

                <div className="mt-5 flex flex-wrap gap-3 border-t pt-5">
                  {review.status !== "approved" && (
                    <button
                      type="button"
                      onClick={() =>
                        updateStatus(review.id, "approved")
                      }
                      disabled={savingId === review.id}
                      className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50"
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
                        updateStatus(review.id, "rejected")
                      }
                      disabled={savingId === review.id}
                      className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  )}

                  {review.status !== "pending" && (
                    <button
                      type="button"
                      onClick={() =>
                        updateStatus(review.id, "pending")
                      }
                      disabled={savingId === review.id}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
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