import { describe, expect, it } from "vitest";

import { customers, DATASET_ROW_COUNT } from "@/data/churn";
import { computeKpis, groupBy } from "@/lib/churn-analytics";

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

  it("groups the actual payment methods into populated chart series", () => {
    const paymentGroups = groupBy(customers, (customer) => customer.payment);
    const counts = Object.fromEntries(paymentGroups.map((group) => [group.name, group.total]));

    expect(counts).toEqual({
      "Electronic check": 2365,
      "Mailed check": 1612,
      "Bank transfer (automatic)": 1544,
      "Credit card (automatic)": 1522,
    });
    expect(paymentGroups.every((group) => group.retained + group.churned === group.total)).toBe(true);
  });
});