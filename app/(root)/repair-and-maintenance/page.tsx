import React from "react";

export default function RepairAndMaintence() {
  return (
    <div className="min-h-screen flex justify-center items-center py-5 ">
      <form className="bg-white rounded-3xl w-full max-w-3xl p-6 mt-15 shadow-lg">
        <h2 className="text-black underline underline-offset-8 text-2xl font-bold mb-8 text-center">
          Repair and Maintenance
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input id="name" label="Name" />
          <Input id="phone" label="Phone" />
          <Input id="address" label="Address" fullWidth />
          <Input id="product" label="Product" fullWidth />
          <Input id="message" label="Message" fullWidth textarea />
        </div>

        <div className="flex justify-center mt-6">
          <button
            type="button"
            className="bg-[#9bb648] text-white font-semibold py-2 px-10 rounded-xl text-lg transition hover:bg-[#8aa83d]"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({
  id,
  label,
  value,
  onChange,
  fullWidth,
  type = "text",
  textarea,
}: any) {
  return (
    <div className={`flex flex-col ${fullWidth ? "md:col-span-2" : ""}`}>
      <label htmlFor={id} className="mb-1 text-gray-700 font-medium">
        {label}
      </label>
      {textarea ? (
        <textarea
          id={id}
          value={value}
          onChange={onChange}
          className="border border-gray-300 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-[#9bb648] transition resize-none"
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          className="border border-gray-300 rounded-lg p-3 text-sm outline-none focus:ring-2 focus:ring-[#9bb648] transition"
        />
      )}
    </div>
  );
}
