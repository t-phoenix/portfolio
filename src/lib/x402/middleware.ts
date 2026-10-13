import { NextRequest, NextResponse } from 'next/server';

export interface X402Config {
  price: string;
  asset: 'USDC';
  network: 'base' | 'ethereum' | 'polygon';
  recipient: string;
  description?: string;
}

export interface X402PaymentDetails {
  price: string;
  asset: string;
  network: string;
  recipient: string;
  paymentAddress: string;
  transferMethod: string;
  chainId: number;
}

const NETWORK_CONFIG: Record<string, { chainId: number; facilitator: string }> = {
  base: {
    chainId: 8453,
    facilitator: 'https://x402.org/facilitator/base',
  },
  ethereum: {
    chainId: 1,
    facilitator: 'https://x402.org/facilitator/ethereum',
  },
  polygon: {
    chainId: 137,
    facilitator: 'https://x402.org/facilitator/polygon',
  },
};

export function createX402Response(config: X402Config): NextResponse {
  const networkConfig = NETWORK_CONFIG[config.network];
  
  const paymentDetails: X402PaymentDetails = {
    price: config.price,
    asset: config.asset,
    network: config.network,
    recipient: config.recipient,
    paymentAddress: config.recipient,
    transferMethod: 'transferWithAuthorization',
    chainId: networkConfig.chainId,
  };

  return new NextResponse(
    JSON.stringify({
      error: 'Payment Required',
      message: config.description || 'This endpoint requires payment via x402 protocol',
      payment: paymentDetails,
      facilitator: networkConfig.facilitator,
      documentation: 'https://x402.org/docs',
    }),
    {
      status: 402,
      headers: {
        'Content-Type': 'application/json',
        'X-Payment-Required': 'true',
        'X-Payment-Price': config.price,
        'X-Payment-Asset': config.asset,
        'X-Payment-Network': config.network,
        'X-Payment-Recipient': config.recipient,
        'X-Payment-Chain-Id': networkConfig.chainId.toString(),
      },
    }
  );
}

export async function verifyX402Payment(
  request: NextRequest,
  config: X402Config
): Promise<{ valid: boolean; error?: string }> {
  const paymentSignature = request.headers.get('X-Payment-Signature');
  const paymentNonce = request.headers.get('X-Payment-Nonce');
  const paymentTimestamp = request.headers.get('X-Payment-Timestamp');

  if (!paymentSignature) {
    return { valid: false, error: 'Missing payment signature' };
  }

  if (!paymentNonce) {
    return { valid: false, error: 'Missing payment nonce' };
  }

  if (!paymentTimestamp) {
    return { valid: false, error: 'Missing payment timestamp' };
  }

  // Verify timestamp is within acceptable range (5 minutes)
  const timestamp = parseInt(paymentTimestamp, 10);
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > 300) {
    return { valid: false, error: 'Payment timestamp expired' };
  }

  // In production, verify the payment signature against the facilitator
  // For now, we'll implement a placeholder that accepts payments
  const VERIFY_PAYMENTS = process.env.X402_VERIFY_PAYMENTS === 'true';

  if (VERIFY_PAYMENTS) {
    try {
      const networkConfig = NETWORK_CONFIG[config.network];
      const response = await fetch(`${networkConfig.facilitator}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signature: paymentSignature,
          nonce: paymentNonce,
          timestamp: paymentTimestamp,
          recipient: config.recipient,
          price: config.price,
          asset: config.asset,
        }),
      });

      if (!response.ok) {
        return { valid: false, error: 'Payment verification failed' };
      }

      const result = await response.json();
      return { valid: result.verified === true };
    } catch (error) {
      console.error('Payment verification error:', error);
      return { valid: false, error: 'Payment verification service unavailable' };
    }
  }

  // Development mode: accept any properly formatted payment headers
  console.log('Development mode: Accepting payment without verification');
  return { valid: true };
}

export function withX402<T extends Record<string, unknown>>(
  config: X402Config,
  handler: (request: NextRequest) => Promise<NextResponse<T>>
) {
  return async function x402Handler(request: NextRequest): Promise<NextResponse> {
    const verification = await verifyX402Payment(request, config);

    if (!verification.valid) {
      return createX402Response(config);
    }

    return handler(request);
  };
}
