import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { server } from "@/test/server";
import LoginPage from "./page";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

const API = "http://localhost:4000";

async function fillAndSubmit(email: string, password: string) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Email"), email);
  await user.type(screen.getByLabelText("Password"), password);
  await user.click(screen.getByRole("button", { name: "Log in" }));
}

describe("LoginPage", () => {
  beforeEach(() => push.mockClear());

  it("shows validation errors and does not call the API when the form is empty", async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByText("Email is required")).toBeInTheDocument();
    expect(screen.getByText("Password is required")).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("shows the server error when credentials are wrong", async () => {
    server.use(
      http.post(`${API}/auth/login`, () =>
        HttpResponse.json({ error: "Invalid email or password" }, { status: 401 }),
      ),
    );
    render(<LoginPage />);

    await fillAndSubmit("hieu@example.com", "wrong-password");

    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid email or password");
    expect(push).not.toHaveBeenCalled();
  });

  it("redirects to the dashboard after a successful login", async () => {
    server.use(
      http.post(`${API}/auth/login`, () =>
        HttpResponse.json({
          user: {
            id: "u1",
            email: "hieu@example.com",
            name: "Hieu",
            slug: "hieu-abc123",
            timezone: "Asia/Ho_Chi_Minh",
            slotMinutes: 30,
          },
        }),
      ),
    );
    render(<LoginPage />);

    await fillAndSubmit("hieu@example.com", "Password123");

    await waitFor(() => expect(push).toHaveBeenCalledWith("/dashboard"));
  });
});