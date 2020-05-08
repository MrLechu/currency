import React from "react";
import "@testing-library/jest-dom";
import user from "@testing-library/user-event";
import { render, act, wait } from "@testing-library/react";
import App from "./App";

const setup = () => {
  const Wrapper = render(<App />);
  return { ...Wrapper };
};

test("render input", async () => {
  const { getByLabelText } = setup();
  expect(getByLabelText(/wartość/i)).toBeInTheDocument();
});

test("render submit", async () => {
  const { getByText } = setup();
  expect(getByText(/oblicz/i)).toBeInTheDocument();
});

describe("select", () => {
  let promise;

  const PLACEHOLDER_VALUE = "Wybierz walutę";
  const USD_VALUE = "4.1646";
  const EUR_VALUE = "4.5582";

  beforeEach(() => {
    const fakeData = [
      {
        rates: [
          {
            currency: "dolar amerykański",
            code: "USD",
            mid: USD_VALUE,
          },
          {
            currency: "euro",
            code: "EUR",
            mid: EUR_VALUE,
          },
        ],
      },
    ];

    jest.spyOn(window, "fetch").mockImplementationOnce(() => {
      promise = Promise.resolve({
        json: () => Promise.resolve(fakeData),
      });
      return promise;
    });
  });

  test("render select", async () => {
    const { getByLabelText, getByText } = setup();

    await wait(() => {
      const euro = getByText("EUR");
      const dolar = getByText("USD");
      expect(getByLabelText(/waluta/i)).toContainElement(dolar);
      expect(getByLabelText(/waluta/i)).toContainElement(euro);
    });
  });

  test("calculate currency", async () => {
    const { getByLabelText, getByTestId, getByText, debug } = setup();

    await wait(() => {
      user.type(getByLabelText(/wartość/i), "5");
      user.selectOptions(getByLabelText(/waluta/i), USD_VALUE);
      user.click(getByText(/oblicz/i));
      expect(getByTestId("result")).toHaveTextContent(/^20,82 zł$/);

      user.selectOptions(getByLabelText(/waluta/i), EUR_VALUE);
      user.click(getByText(/oblicz/i));
      expect(getByTestId("result")).toHaveTextContent(/^22,79 zł$/);
    });
  });

  test("is required", async () => {
    const { getByLabelText, getByText, getByTestId } = setup();

    user.selectOptions(getByLabelText(/waluta/i), PLACEHOLDER_VALUE);
    user.type(getByLabelText(/wartość/i), "0");
    user.click(getByText(/oblicz/i));

    expect(getByLabelText(/waluta/i)).toHaveClass(
      "w-full p-3 text-md bg-white border-gray-400 border rounded is-required"
    );
    expect(getByLabelText(/wartość/i)).toHaveClass(
      "w-full p-3 text-md bg-white border-gray-400 border rounded appearance-none is-required"
    );
    expect(getByTestId("result")).toHaveTextContent("0 zł");

    await act(() => promise);
  });
});
