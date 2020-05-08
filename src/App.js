import React, { useState, useEffect, useRef } from "react";

export default function App() {
    const SELECT_DEFAULT = "Wybierz walutę";
    const [currency, setCurrency] = useState([]);
    const [value, setValue] = useState("");
    const [selected, setSelectd] = useState(SELECT_DEFAULT);
    const [result, setResult] = useState(0);
    const refCurrency = useRef(null);
    const refValue = useRef(null);

    useEffect(() => {
        fetch("https://api.nbp.pl/api/exchangerates/tables/A")
            .then((response) => response.json())
            .then((data) => {
                const rates = data[0].rates.filter((v, i) => {
                    return v.code === "EUR" || v.code === "USD";
                });
                setCurrency(rates);
            })
            .catch((err) => console.log(err));
    }, []);

    const handleSubmit = (event) => {
        event.preventDefault();
        let errors = 0;

        if (selected === SELECT_DEFAULT) {
            refCurrency.current.classList.add("is-required");
            errors += 1;
        }
        if (value === "" || value === "0") {
            refValue.current.classList.add("is-required");
            errors += 1;
        }

        if (errors > 0) return;

        setResult((parseInt(value, 10) * selected).toFixed(2).replace(".", ","));
    };

    const handleChange = (event) => {
        refCurrency.current.classList.remove("is-required");

        setSelectd(event.target.value);
    };

    return (
        <div className="container max-w-md m-auto p-5">
            <h1 className="text-4xl text-blue-700 mb-6 border-b-2 border-blue-200">
                Kalkulator walut
      </h1>
            <form data-testid="form" onSubmit={handleSubmit}>
                <svg class="icon" viewBox="0 0 512 512">
                    <use xlinkHref="#pl" />
                </svg>
                <div className="mb-4">
                    <label className="mb-1 block" htmlFor="currency">
                        Waluta
                    </label>
                    <select
                        className="w-full p-3 text-md bg-white border-gray-400 border rounded"
                        id="currency"
                        ref={refCurrency}
                        onChange={handleChange}
                    >
                        <option value="">Wybierz walutę</option>
                        {currency &&
                            currency.map((v, i) => {
                                return (
                                    <option value={v.mid} key={i}>
                                        {v.code}
                                    </option>
                                );
                            })}
                    </select>
                </div>
                <div>
                    <label className="mb-1 block" htmlFor="value">
                        Wartość <span className="text-xs">(zł)</span>
                    </label>
                    <input
                        className="w-full p-3 text-md bg-white border-gray-400 border rounded appearance-none"
                        type="number"
                        id="value"
                        placeholder="0 zł"
                        onChange={(e) => {
                            refValue.current.classList.remove("is-required");
                            setValue(e.target.value);
                        }}
                        value={value}
                        min={0}
                        ref={refValue}
                    />
                </div>

                <p>
                    <button
                        className="rounded bg-green-400 px-3 py-2 my-5 w-full text-white font-semibold text-lg hover:bg-green-500 ransition ease-in-out duration-200"
                        type="submit"
                    >
                        Oblicz
          </button>
                </p>
            </form>

            <br />

            <p
                className="px-4 py-3 border-2 border-dashed text-gray-700"
                data-testid="result"
            >
                {result} zł
      </p>

            {/* <ul>
        <li key="1">
          {currency.no}::{currency.effectiveData}::{currency.mid}
        </li>
      </ul> */}
        </div>
    );
}
