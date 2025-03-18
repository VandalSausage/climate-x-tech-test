import { describe, test, expect, jest } from "@jest/globals";
import { getUploadAssetsStatement } from "./helpers";

jest.mock("uuid", () => ({ v4: () => "uuid" }));
//TODO test all helpers
describe("helpers", () => {
  test("get insert assets statement (happy path)", () => {
    const result = getUploadAssetsStatement(
      [
        { address: "address", latitude: 0, longitude: 0 },
        { address: "address", latitude: 0, longitude: 0 },
      ],
      "test"
    );
    expect(result).toBe(
      "INSERT INTO assets (id, client_id, latitude, longitude, address) VALUES ('uuid', 'test', '0', '0', 'address') ,('uuid', 'test', '0', '0', 'address');"
    );
  });
  test("get insert assets statement (data type error)", () => {
    expect(() =>
      getUploadAssetsStatement(
        [{ address: "address", latitude: "0", longitude: 0 }, ,],
        "test"
      )
    ).toThrowError("data type mismatch");
  });
});
