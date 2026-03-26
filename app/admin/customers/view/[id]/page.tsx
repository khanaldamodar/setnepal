"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import Cookies from "js-cookie";

// types
interface Customer {
  id: number;
  organization_name: string;
  contact_person_name: string;
  contact_person_email: string;
  contact_person_phone: string;
  email: string;
  phone: string;
  address: string;
  leadSource: string;
  tags: string[];
  note: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  callLogs: CallLog[];
  followUps: FollowUp[];
}

interface CallLog {
  id: number;
  callStatus: string;
  response: string;
  durationLabel: string;
  callTime: string;
  notes: string;
  calledBy?: { name: string };
}

interface FollowUp {
  id: number;
  scheduledAt: string;
  notes: string;
  status: "PENDING" | "COMPLETED" | "MISSED";
  createdBy?: { name: string };
}

interface CallLogForm {
  callStatus: string;
  response: string;
  durationLabel: string;
  callTime?: string;
  notes: string;
}

interface FollowUpForm {
  scheduledAt: string;
  notes: string;
  status: "PENDING" | "COMPLETED" | "MISSED";
}

export default function ViewCustomerPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [loading, setLoading] = useState(true);

  // sync active tab with URL
  const tabFromUrl = searchParams.get("tab") as
    | "info"
    | "logs"
    | "followups"
    | null;
  const [activeTab, setActiveTab] = useState<"info" | "logs" | "followups">(
    tabFromUrl || "info",
  );

  const [showLogModal, setShowLogModal] = useState(false);
  const [showFuModal, setShowFuModal] = useState(false);

  const [logForm, setLogForm] = useState<CallLogForm>({
    callStatus: "",
    response: "",
    durationLabel: "",
    callTime: "",
    notes: "",
  });

  const [fuForm, setFuForm] = useState<FollowUpForm>({
    scheduledAt: "",
    notes: "",
    status: "PENDING",
  });

  // fetch customer
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/customers/${id}`);
        if (!res.ok) throw new Error("Failed to load customer");

        const data = await res.json();
        const cust: Customer = data.customer;

        setCustomer(cust);
        setCallLogs(cust.callLogs || []);
        setFollowUps(cust.followUps || []);
      } catch (err: any) {
        toast.error(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // update URL when tab changes
  const handleTabChange = (tab: "info" | "logs" | "followups") => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    router.replace(url.toString());
  };

  // form handlers
  const handleLogChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setLogForm({ ...logForm, [e.target.name]: e.target.value });
  };

  const handleFuChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFuForm({ ...fuForm, [e.target.name]: e.target.value });
  };

  // submit call log
  const submitCallLog = async () => {
    const token = Cookies.get("token");
    if (!token) return toast.error("You must be logged in");

    try {
      const res = await fetch(`/api/customers/${id}/call-logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(logForm),
      });

      if (!res.ok) throw new Error("Failed to add call log");

      const newLog: CallLog = await res.json();
      setCallLogs((prev) => [newLog, ...prev]);
      toast.success("Call log added");
      setShowLogModal(false);
      setLogForm({
        callStatus: "",
        response: "",
        durationLabel: "",
        callTime: "",
        notes: "",
      });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // submit follow up
  const submitFollowUp = async () => {
    const token = Cookies.get("token");
    if (!token) return toast.error("You must be logged in");

    try {
      const res = await fetch(`/api/customers/${id}/follow-ups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(fuForm),
      });

      if (!res.ok) throw new Error("Failed to add follow-up");

      const newFu: FollowUp = await res.json();
      setFollowUps((prev) => [newFu, ...prev]);
      toast.success("Follow-up added");
      setShowFuModal(false);
      setFuForm({ scheduledAt: "", notes: "", status: "PENDING" });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!customer) return <div className="p-6">Customer not found</div>;

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 shadow rounded-xl mt-6">
      <h1 className="text-2xl font-semibold mb-4">
        {customer.organization_name || "Customer Details"}
      </h1>

      {/* tabs */}
      <div className="flex gap-4 border-b mb-6 text-sm font-medium">
        <button
          onClick={() => handleTabChange("info")}
          className={activeTab === "info" ? "border-b-2 border-black pb-2" : ""}
        >
          Info
        </button>
        <button
          onClick={() => handleTabChange("logs")}
          className={activeTab === "logs" ? "border-b-2 border-black pb-2" : ""}
        >
          Call Logs
        </button>
        <button
          onClick={() => handleTabChange("followups")}
          className={
            activeTab === "followups" ? "border-b-2 border-black pb-2" : ""
          }
        >
          Follow Ups
        </button>
      </div>

      {/* Info Tab */}
      {activeTab === "info" && (
        <div className="space-y-3 text-sm">
          <Field label="Organization Name" value={customer.organization_name} />
          <Field label="Contact Person" value={customer.contact_person_name} />
          <Field label="Email" value={customer.email} />
          <Field label="Phone" value={customer.phone} />
          <Field label="Address" value={customer.address} />
          <Field label="Lead Source" value={customer.leadSource} />
          <div>
            <p className="font-medium text-gray-700">Status</p>
            <span
              className={`px-2 py-1 rounded-full text-white text-xs font-semibold ${
                customer.status === "NEW"
                  ? "bg-blue-500"
                  : customer.status === "CONTACTED"
                    ? "bg-yellow-500"
                    : customer.status === "INTERESTED"
                      ? "bg-[#99b84f]"
                      : customer.status === "NOT_INTERESTED"
                        ? "bg-red-500"
                        : "bg-gray-400"
              }`}
            >
              {customer.status}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-700">Tags</p>
            <p>
              {Array.isArray(customer.tags)
                ? customer.tags.join(", ")
                : customer.tags || "—"}
            </p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Note</p>
            <p className="whitespace-pre-wrap">{customer.note || "—"}</p>
          </div>
        </div>
      )}

      {/* Call Logs Tab */}
      {activeTab === "logs" && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Call Logs</h2>
            <button
              onClick={() => setShowLogModal(true)}
              className="bg-[#99b84f] text-white px-3 py-1 rounded"
            >
              Add Log
            </button>
          </div>
          {callLogs.length === 0 && <p>No call logs</p>}
          {callLogs.map((log) => (
            <div key={log.id} className="border p-4 rounded-md">
              <p>
                <strong>Time:</strong>{" "}
                {log.callTime ? new Date(log.callTime).toLocaleString() : "—"}
              </p>
              <p>
                <strong>Status:</strong> {log.callStatus}
              </p>
              <p>
                <strong>Response:</strong> {log.response}
              </p>
              <p>
                <strong>Duration:</strong> {log.durationLabel}
              </p>
              <p>
                <strong>Notes:</strong> {log.notes}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                By: {log.calledBy?.name || "—"}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Follow Ups Tab */}
      {activeTab === "followups" && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Follow Ups</h2>
            <button
              onClick={() => setShowFuModal(true)}
              className="bg-[#99b84f] text-white px-3 py-1 rounded"
            >
              Add Follow-Up
            </button>
          </div>
          {followUps.length === 0 && <p>No follow-ups</p>}
          {followUps.map((fu) => (
            <div
              key={fu.id}
              className="border p-4 rounded-md flex justify-between items-center"
            >
              <div>
                <p>
                  <strong>Scheduled:</strong>{" "}
                  {new Date(fu.scheduledAt).toLocaleString()}
                </p>
                <p>
                  <strong>Notes:</strong> {fu.notes || "—"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  By: {fu.createdBy?.name || "—"}
                </p>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  fu.status === "PENDING"
                    ? "bg-yellow-500 text-white"
                    : fu.status === "COMPLETED"
                      ? "bg-[#99b84f] text-white"
                      : fu.status === "MISSED"
                        ? "bg-red-500 text-white"
                        : "bg-gray-400 text-white"
                }`}
              >
                {fu.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Back Button */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={() => router.back()}
          className="text-sm text-[#4998d1] font-semibold hover:underline"
        >
          ← Back
        </button>
      </div>

      {/* Modals */}
      {showLogModal && (
        <Modal onClose={() => setShowLogModal(false)}>
          <h2 className="text-lg font-semibold mb-3">Add Call Log</h2>
          <div className="space-y-3">
            <input
              type="datetime-local"
              name="callTime"
              value={logForm.callTime}
              onChange={handleLogChange}
              className="w-full border p-2 rounded"
            />
            <select
              name="callStatus"
              value={logForm.callStatus}
              onChange={handleLogChange}
              className="w-full border p-2 rounded"
            >
              <option value="">Select Status</option>
              <option value="CONNECTED">Connected</option>
              <option value="NOT_PICKED">Not Picked</option>
              <option value="BUSY">Busy</option>
            </select>
            <select
              name="response"
              value={logForm.response}
              onChange={handleLogChange}
              className="w-full border p-2 rounded"
            >
              <option value="">Select Response</option>
              <option value="INTERESTED">Interested</option>
              <option value="CALL_LATER">Call Later</option>
              <option value="NOT_INTERESTED">Not Interested</option>
            </select>
            <input
              name="durationLabel"
              placeholder="Duration (e.g., 5 mins)"
              value={logForm.durationLabel}
              onChange={handleLogChange}
              className="w-full border p-2 rounded"
            />
            <textarea
              name="notes"
              placeholder="Notes"
              value={logForm.notes}
              onChange={handleLogChange}
              className="w-full border p-2 rounded"
            />
            <button
              onClick={submitCallLog}
              className="w-full bg-blue-500 text-white py-2 rounded"
            >
              Save
            </button>
          </div>
        </Modal>
      )}

      {showFuModal && (
        <Modal onClose={() => setShowFuModal(false)}>
          <h2 className="text-lg font-semibold mb-3">Add Follow-Up</h2>
          <div className="space-y-3">
            <input
              type="datetime-local"
              name="scheduledAt"
              value={fuForm.scheduledAt}
              onChange={handleFuChange}
              className="w-full border p-2 rounded"
            />
            <textarea
              name="notes"
              placeholder="Notes"
              value={fuForm.notes}
              onChange={handleFuChange}
              className="w-full border p-2 rounded"
            />
            <select
              name="status"
              value={fuForm.status}
              onChange={handleFuChange}
              className="w-full border p-2 rounded"
            >
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="MISSED">Missed</option>
            </select>
            <button
              onClick={submitFollowUp}
              className="w-full bg-[#99b84f] text-white py-2 rounded"
            >
              Save
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// Field Component
function Field({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <p className="font-medium text-gray-700">{label}</p>
      <p className="text-gray-900">{value || "—"}</p>
    </div>
  );
}

// Modal Component
function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded-lg w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
