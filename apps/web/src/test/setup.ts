import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "./server";

beforeAll(() => server.listen({ onUnhandledFrame: "error" }));

afterEach(() => {
  cleanup(); // gỡ component đã render sau mỗi test
  server.resetHandlers(); // xoá các câu trả lời giả lập của test trước
});

afterAll(() => server.close());