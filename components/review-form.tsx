"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  orderId: string;
  productId: string;
  productName: string;
};

export default function ReviewForm({
  orderId,
  productId,
  productName,
}: Props) {
  const supabase = createClient();

  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setSubmitting(true);
    setMessage("");
    setSuccess(false);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Please log in to submit a review.");
      }

      const { data, error } = await supabase.rpc(
        "create_my_review",
        {
          p_order_id: orderId,
          p_product_id: productId,
          p_rating: rating,
          p_review_text: reviewText.trim() || null,
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error("Review could not be submitted.");
      }

      setSuccess(true);
      setMessage(
        "Review submitted successfully. It will appear after approval."
      );
      setReviewText("");
      setRating(5);
    } catch (err) {
      setMessage(
        err instanceof Error
          ? err.message
          : "Unable to submit your review."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-xl border bg-gray-50 p-5">
      <h3 className="font-semibold text-gray-900">
        Review {productName}
      </h3>

      {success ? (
        <p className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {message}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Rating
            </label>

            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className={`text-2xl transition ${
                    value <= rating
                      ? "text-yellow-500"
                      : "text-gray-300"
                  }`}
                  aria-label={`${value} star${
                    value === 1 ? "" : "s"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor={`review-${productId}`}
              className="block text-sm font-medium text-gray-700"
            >
              Review
            </label>

            <textarea
              id={`review-${productId}`}
              value={reviewText}
              onChange={(event) =>
                setReviewText(event.target.value)
              }
              maxLength={1000}
              rows={4}
              placeholder="Share your experience..."
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
            />

            <p className="mt-1 text-xs text-gray-500">
              {reviewText.length}/1000
            </p>
          </div>

          {message && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-green-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      )}
    </div>
  );
}