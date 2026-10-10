
const swaggerAutogen = require("swagger-autogen")({
  openapi: "3.0.0"
});

const doc = {
  info: {
    title: "Task API",
    description: "A simple REST API for managing tasks",
    version: "1.0.0"
  },
  servers: [
    {
      url: "/"
    }
  ]
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./server.js"];

swaggerAutogen(outputFile, endpointsFiles, doc);
