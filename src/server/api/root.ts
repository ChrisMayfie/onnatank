import { createTRPCRouter } from "~/server/api/trpc";
import { vehicleRouter } from "./routers/vehicle";

export const appRouter = createTRPCRouter({
  vehicle: vehicleRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
