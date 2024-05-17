const index = require("../routes/index.js");

//in-memory database for testing
const {
  initializeMongoServer,
  closeServer,
} = require("../utils/mongoConfigTesting.js");

//Supertest -> for testing http, wrapper of superagent
//SuperAgent -> light-weight ajax api for http handling (like axios, etc.)
const request = require("supertest");
const express = require("express");

//create a new express app for testing purpose
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use("/", index);

describe("route testing", () => {
  beforeAll(async () => {
    console.log("starting server...");
    await initializeMongoServer();
  });

  afterAll(async () => {
    console.log("stopping server...");
    await closeServer();
  });

  test("index route works", (done) => {
    request(app).get("/").expect(200, done);
  });
});
