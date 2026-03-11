"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Something went wrong
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              An unexpected error occurred. Our team has been notified.
            </p>
            <button
              onClick={reset}
              className="mt-4 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
