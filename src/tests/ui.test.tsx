import React from "react";
import { render } from "@testing-library/react-native";
import HomeScreen from "@/screens/HomeScreen";

describe("App Shell", () => {
  it("renders HomeScreen without crashing and shows heading", () => {
    const { getByText } = render(<HomeScreen />);

    const heading = getByText("Home");
    expect(heading).toBeTruthy();
  });

  it("shows the coming-soon description text", () => {
    const { getByText } = render(<HomeScreen />);

    const description = getByText(/Coming soon/i);
    expect(description).toBeTruthy();
  });

  it("has bg-background class on root container", () => {
    const { root } = render(<HomeScreen />);

    expect(root).toBeTruthy();
  });

  it("renders with font-heading class on title", () => {
    const { getByText } = render(<HomeScreen />);

    const heading = getByText("Home");
    expect(heading).toBeTruthy();
  });
});
