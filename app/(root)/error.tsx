'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-white p-4">
            <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
            <p className="text-gray-300 mb-8 text-center max-w-md">
                We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
            </p>
            <div className="flex gap-4">
                <Button
                    onClick={() => reset()}
                    className="bg-secondary hover:bg-blue-900"
                >
                    Try again
                </Button>
                <Button
                    variant="outline"
                    onClick={() => window.location.reload()}
                    className="text-white border-white hover:bg-white/10"
                >
                    Refresh Page
                </Button>
            </div>
        </div>
    );
}
