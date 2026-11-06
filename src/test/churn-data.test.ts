import { describe, expect, it } from "vitest";

import { customers, DATASET_ROW_COUNT } from "@/data/churn";
import { computeKpis } from "@/lib/churn-analytics";

describe("IBM Telco customer dataset", () => {
  it("loads every CSV customer and computes the correct churn totals", () => {
    expect(DATASET_ROW_COUNT).toBe(7043);
    expect(customers).toHaveLength(7043);
    expect(computeKpis(customers)).toEqual({
      total: 7043,
      churned: 1869,
      retained: 5174,
      churnRate: 1869 / 7043,
    });
  });

  it("converts Yes/No CSV fields to booleans without losing customer details", () => {
    expect(customers[0]).toMatchObject({
      id: "7590-VHVEG",
      partner: true,
      dependents: false,
      paperless: true,
      churned: false,
    });
    expect(customers.find((customer) => customer.id === "3668-QPYBK")).toMatchObject({
      partner: false,
      dependents: false,
      churned: true,
    });
  });
});