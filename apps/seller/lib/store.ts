import { configureStore } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import { productApi } from "./store/api/productApi";
import { orderApi } from "./store/api/orderApi";
import { earningsApi } from "./store/api/earningsApi";
import { reviewApi } from "./store/api/reviewApi";
import { shippingApi } from "./store/api/shippingApi";
import { inventoryApi } from "./store/api/inventoryApi";
import { chatApi } from "./store/api/chatApi";
import { serviceApi } from "./store/api/serviceApi";
import { baseApi } from "./store/api/baseApi";

export const store = configureStore({
  reducer: {
    [productApi.reducerPath]: productApi.reducer,
    [orderApi.reducerPath]: orderApi.reducer,
    [earningsApi.reducerPath]: earningsApi.reducer,
    [reviewApi.reducerPath]: reviewApi.reducer,
    [shippingApi.reducerPath]: shippingApi.reducer,
    [inventoryApi.reducerPath]: inventoryApi.reducer,
    [chatApi.reducerPath]: chatApi.reducer,
    [serviceApi.reducerPath]: serviceApi.reducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefault) =>
    getDefault()
      .concat(productApi.middleware)
      .concat(orderApi.middleware)
      .concat(earningsApi.middleware)
      .concat(reviewApi.middleware)
      .concat(shippingApi.middleware)
      .concat(inventoryApi.middleware)
      .concat(chatApi.middleware)
      .concat(serviceApi.middleware)
      .concat(baseApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Initialize real-time socket listeners to keep RTK Query caches in sync and show new chat notifications.
if (typeof window !== "undefined") {
  import("./../lib/socket")
    .then(async (mod) => {
      try {
        const getSocket = mod.getSocket;
        const socket = await getSocket();
        if (!socket) return;

        socket.on?.("receive_message", (payload: any) => {
          try {
            store.dispatch(chatApi.util.invalidateTags(["Chat"]));
          } catch (e) {
            console.warn("Failed to invalidate chat tags", e);
          }

          const senderName = payload?.message?.senderId?.fullName || payload?.message?.senderName || "Customer";
          
        });

        socket.on?.("conversation_updated", () => {
          try {
            store.dispatch(chatApi.util.invalidateTags(["Chat"]));
          } catch (e) {
            console.warn("Failed to invalidate chat tags", e);
          }
        });
      } catch (err) {
        console.warn("Socket init failed", err);
      }
    })
    .catch((e) => console.warn("Failed to load socket helper", e));
}
