import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// This is the router for the vehicle API
export const vehicleRouter = createTRPCRouter({
  getVehicle: publicProcedure
    .input(
      z.object({
        year: z.string().length(4),
        make: z.string(),
        model: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const car = await ctx.prisma.vehicle.findUnique({
        where: {
          vehicle_year_vehicle_make_vehicle_model: {
            vehicle_year: input.year,
            vehicle_make: input.make,
            vehicle_model: input.model,
          },
        },
      });
      return car;
    }),
  getAllVehicleYears: publicProcedure.query(async ({ ctx }) => {
    const years = await ctx.prisma.vehicle.groupBy({
      by: ["vehicle_year"],
    });
    //Convert the array of objects to an array of strings
    return years.map((year) => year.vehicle_year);
  }),

  getAllVehicleMakes: publicProcedure.query(async ({ ctx }) => {
    const makes = await ctx.prisma.vehicle.groupBy({
      by: ["vehicle_make"],
    });
    return makes.map((make) => make.vehicle_make);
  }),

  getAllVehicleModels: publicProcedure
    // This is the input type for the getAllVehicleModels procedure dependent on year and make
    .input(z.object({ year: z.string().length(4), make: z.string() }))
    // This is the return type for the getAllVehicleModels procedure dependent on year and make
    .query(async ({ ctx, input }) => {
      const models = await ctx.prisma.vehicle.findMany({
        where: {
          vehicle_year: input.year,
          vehicle_make: input.make,
        },
      });
      return models.map((model) => model.vehicle_model);
    }),
});
