import { server } from "../src/index";
import request from "supertest";
import { describe, test, expect, afterEach } from "@jest/globals";
import { query } from "../src/conn";
import path from "path";

//TODO add more cases
describe("Asset Endpoint POST /assests/upload", () => {
  afterEach(() => {
    query((db) => {
      db.prepare("DROP TABLE assets").run();
      db.prepare(
        `CREATE TABLE "assets" ( "client_id" TEXT NOT NULL, "address" TEXT NOT NULL, "latitude" INTEGER NOT NULL, "longitude" INTEGER NOT NULL, "id" TEXT NOT NULL, PRIMARY KEY("id") )`
      ).run();
    });
  });
  test("upload json file", async () => {
    const response = await request(server)
      .post("/assets/upload")
      .field("client_id", "test_ciient")
      .attach("assets", path.resolve(__dirname, "./test.json"));
    expect(response.body.message).toBe("assets created: 1");
    expect(response.status).toBe(200);
  });

  test("upload csv file", async () => {
    const response = await request(server)
      .post("/assets/upload")
      .field("client_id", "test_ciient")
      .attach("assets", path.resolve(__dirname, "./test.csv"));
    expect(response.body.message).toBe("assets created: 2");
    expect(response.status).toEqual(200);
  });
});
