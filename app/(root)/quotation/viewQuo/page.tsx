"use client";
import React, { useState } from "react";

const Page = () => {
  const [items, setItems] = useState([
    {
      sn: 1,
      description: "Product A",
      brands: "Brand X",
      unit: "pcs",
      quantity: 10,
      amount: 500,
    },
    {
      sn: 2,
      description: "Product B",
      brands: "Brand Y",
      unit: "pcs",
      quantity: 5,
      amount: 300,
    },
  ]);

  return (
    <div className="px-32 mt-20">
      {" "}
      {/* Header Section */}
      <div className="flex justify-between gap-8">
        {/* Company Info */}
        <div className="flex flex-col w-7/10 p-5">
          <img
            src="/logo.jpeg"
            alt="Company Logo"
            className="h-46 w-56 object-cover mb-4"
          />
          <div className="">
            <p className="font-semibold text-base">Company Name</p>
            <p className="text-sm">Contact Office</p>
            <p className="text-sm">Location</p>
          </div>
        </div>

        {/* Quality & Contact Info */}
        <div className="flex flex-col w-3/10 p-5">
          <img
            src="/qualityAssured.png"
            alt="Quality Assured"
            className="h-46 w-56 object-cover mb-4"
          />
          <div className=" text-sm">
            <p className="text-sm">Contact No</p>
            <p className="text-sm">WhatsApp Number</p>
            <p className="text-sm">Email</p>
            <p className="text-sm">Quotation Date</p>
          </div>
        </div>
      </div>
      {/* Quotation ID Section */}
      <div className="mt-8 text-center">
        <p className="font-medium text-base">Quotation ID: #12345</p>
      </div>
      <div className="flex">
        <div className="w-7/10 border border-black  p-5">
          <p className="text-lg font-bold">organization</p>
          <p className="text-lg font-bold">name</p>
          <p className="text-lg font-bold">location</p>
        </div>
        <div className="w-3/10 text-6xl border border-black ml-5 p-5">
          Quotation
        </div>
      </div>
      <table className="w-full border border-black border-collapse mt-8">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-black px-2 py-1" rowSpan={2}>
              SN
            </th>
            <th className="border border-black px-2 py-1" rowSpan={2}>
              Description
            </th>
            <th className="border border-black px-2 py-1" rowSpan={2}>
              Brands
            </th>
            <th className="border border-black px-2 py-1" rowSpan={2}>
              Unit
            </th>
            <th className="border border-black px-2 py-1" rowSpan={2}>
              Quantity
            </th>
            <th
              className="border border-black px-2 py-1 text-center"
              colSpan={2}
            >
              Amount
            </th>
          </tr>
          <tr className="bg-gray-200">
            <th className="border border-black px-2 py-1 text-right">Unit</th>
            <th className="border border-black px-2 py-1 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {[
            {
              sn: 1,
              description: "Product A",
              brands: "Brand X",
              unit: "pcs",
              quantity: 10,
              unitPrice: 50,
            },
            {
              sn: 2,
              description: "Product B",
              brands: "Brand Y",
              unit: "pcs",
              quantity: 5,
              unitPrice: 60,
            },
          ].map((item) => (
            <tr key={item.sn}>
              <td className="border border-black px-2 py-1 text-center">
                {item.sn}
              </td>
              <td className="border border-black px-2 py-1">
                {item.description}
              </td>
              <td className="border border-black px-2 py-1">{item.brands}</td>
              <td className="border border-black px-2 py-1 text-center">
                {item.unit}
              </td>
              <td className="border border-black px-2 py-1 text-center">
                {item.quantity}
              </td>
              <td className="border border-black px-2 py-1 text-right">
                {item.unitPrice}
              </td>
              <td className="border border-black px-2 py-1 text-right">
                {item.unitPrice * item.quantity}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="w-full mt-8">
        <table className="w-full border border-black border-collapse mb-4">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-black px-2 py-1 text-left">
                Notes and Special Comments
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black px-2 py-1">jqwf</td>
            </tr>
            <tr>
              <td className="border border-black px-2 py-1">jqwf</td>
            </tr>
            <tr>
              <td className="border border-black px-2 py-1">jqwf</td>
            </tr>
          </tbody>
        </table>

        <table className="w-full border border-black border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-black px-2 py-1 text-left">
                Warranty Terms and Conditions
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black px-2 py-1">
                {/* Add your warranty text here */}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        We will be happy to supply any further information you may need and
        trust that you call on us to fill your order, which will receive our
      </p>
      <p>To accept this quotation, Please sign here and return :</p>
      <p className="flex items-end justify-end">
        To accept this quotation, Please sign here and return :
      </p>
    </div>
  );
};

export default Page;
