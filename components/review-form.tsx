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
    event: React.FormEvent<HTMLFormElement>,
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
        },
      );

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error("Review could not be submitted.");
      }

      setSuccess(true);
      setMessage(
        "Review submitted successfully. It will appear after approval.",
      );
      setReviewText("");
      setRating(5);
    } catch (err) {
      setMessage(
        err instanceof Error
          ? err.message
          : "Unable to submit your review.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-green-100 bg-gray-50 p-5 transition-colors dark:border-green-900/70 dark:bg-green-950/50">
      <h3 className="font-black text-gray-900 dark:text-white">
        Review {productName}
      </h3>

      {success ? (
        <p className="mt-3 rounded-xl border border-green-100 bg-green-50 p-3 text-sm leading-5 text-green-700 dark:border-green-900 dark:bg-green-950/50 dark:text-green-300">
          {message}
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mt-4 space-y-4"
        >
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-green-100">
              Rating
            </label>

            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className={`text-2xl transition hover:scale-105 ${value <= rating
                      ? "text-yellow-500"
                      : "text-gray-300 dark:text-green-900"
                    }`}
                  aria-label={`${value} star${value === 1 ? "" : "s"
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
              className="block text-sm font-semibold text-gray-700 dark:text-green-100"
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
              className="mt-2 w-full resize-none rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-4 focus:ring-green-100 dark:border-green-800 dark:bg-[#102019] dark:text-white dark:placeholder:text-green-400/60 dark:focus:border-lime-400 dark:focus:ring-green-950"
            />

            <p className="mt-1 text-xs text-gray-500 dark:text-green-200/50">
              {reviewText.length}/1000
            </p>
          </div>

          {message && (
            <p className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm leading-5 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-green-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-green-700 dark:hover:bg-green-600"
          >
            {submitting
              ? "Submitting..."
              : "Submit Review"}
          </button>
        </form>
      )}
    </div>
  );
}