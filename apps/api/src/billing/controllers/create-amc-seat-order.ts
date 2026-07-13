import { HTTPException } from "hono/http-exception";
import { getRazorpayCredentials } from "../../utils/razorpay-env";
import { AMC_SEAT_PRICE_PAISE } from "../../utils/seed-plans";
import { getRazorpayClient } from "../razorpay-client";

async function createAmcSeatOrder(workspaceId: string, seats: number) {
  const razorpay = getRazorpayClient();

  const order = await razorpay.orders.create({
    amount: AMC_SEAT_PRICE_PAISE * seats,
    currency: "INR",
    notes: { workspaceId, seats },
  });

  if (!order.id) {
    throw new HTTPException(502, {
      message: "Razorpay did not return an order id.",
    });
  }

  const { keyId } = getRazorpayCredentials();

  return {
    orderId: order.id,
    amount: order.amount,
    keyId,
  };
}

export default createAmcSeatOrder;
