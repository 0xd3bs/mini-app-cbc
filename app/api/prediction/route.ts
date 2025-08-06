
import { NextRequest, NextResponse } from 'next/server';

/**
 * Handles POST requests to the /api/prediction endpoint.
 * This function simulates a prediction process and returns a structured response.
 *
 * @param {NextRequest} req - The incoming request object.
 * @returns {Promise<NextResponse>} A promise that resolves to the response.
 */
export async function POST(req: NextRequest) {
  // Simulate a delay to make the API call feel more realistic
  await new Promise(resolve => setTimeout(resolve, 1500));

  try {
    // Simulate a random prediction result
    const outcomes = [
      { prediction: 'positive', tokenToBuy: 'ETH' },
      { prediction: 'positive', tokenToBuy: 'WBTC' },
      { prediction: 'negative', tokenToBuy: null },
    ];
    const randomOutcome = outcomes[Math.floor(Math.random() * outcomes.length)];

    return NextResponse.json(randomOutcome, { status: 200 });
  } catch (error) {
    // Handle any potential errors during the process
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return NextResponse.json({ message: 'Failed to get prediction.', error: errorMessage }, { status: 500 });
  }
}
