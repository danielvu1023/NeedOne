"use client";
import { useState, useEffect, useTransition } from "react";
import { submitReport } from "@/app/reports/actions";
import { getAllParks } from "@/app/parks/actions";

const ReportForm = () => {
  const [parkId, setParkId] = useState("");
  const [count, setCount] = useState("");
  const [parks, setParks] = useState<{ id: number; name: string }[]>([]);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const result = await getAllParks();
      if (result.success && Array.isArray(result.data)) {
        setParks(result.data.map((p: any) => ({ id: p.id, name: p.name })));
      } else {
        setParks([]);
      }
    })();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const response = await submitReport(Number(parkId), Number(count));
      setMessage(response.message);
      if (response.success) {
        setParkId("");
        setCount("");
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 bg-white rounded shadow flex flex-col gap-4"
    >
      <h2 className="text-xl font-bold mb-2">Submit Park Report</h2>
      <label className="flex flex-col gap-1">
        Park
        <select
          value={parkId}
          onChange={(e) => setParkId(e.target.value)}
          className="border rounded px-2 py-1"
          required
        >
          <option value="" disabled>
            Select a park
          </option>
          {parks.map((park) => (
            <option key={park.id} value={park.id}>
              {park.name}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1">
        Count
        <input
          type="number"
          value={count}
          min={0}
          onChange={(e) => {
            const val = e.target.value;
            if (Number(val) < 0) {
              setCount("0");
            } else {
              setCount(val);
            }
          }}
          className="border rounded px-2 py-1"
          required
        />
      </label>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        disabled={isPending}
      >
        {isPending ? "Submitting..." : "Submit Report"}
      </button>
      {message && <p className="mt-2 text-center text-sm">{message}</p>}
    </form>
  );
};

export default ReportForm;
