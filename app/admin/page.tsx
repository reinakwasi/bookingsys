"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

const stats = [
  { label: "Total Bookings", value: 42, desc: "All time" },
  { label: "Occupancy Rate", value: "85%", desc: "Current active" },
  { label: "Revenue", value: "GHC 12,500", desc: "Total earned" },
  { label: "Pending Actions", value: 3, desc: "Require attention" },
];

const roomAvailability = [
  { label: "Expensive Rooms", available: 2, total: 5 },
  { label: "Standard Rooms", available: 3, total: 5 },
  { label: "Regular Rooms", available: 4, total: 5 },
];

const bookings = [
  { id: 1001, guest: "John Doe", checkIn: "2025-05-01", checkOut: "2025-05-03", type: "Expensive", status: "Confirmed", amount: "GHC 600" },
  { id: 1002, guest: "Jane Smith", checkIn: "2025-05-02", checkOut: "2025-05-04", type: "Standard", status: "Pending", amount: "GHC 400" },
  { id: 1003, guest: "Mike Brown", checkIn: "2025-05-03", checkOut: "2025-05-05", type: "Regular", status: "Cancelled", amount: "GHC 300" },
  { id: 1004, guest: "Mary Green", checkIn: "2025-05-04", checkOut: "2025-05-06", type: "Expensive", status: "Confirmed", amount: "GHC 600" },
  { id: 1005, guest: "Bob Lee", checkIn: "2025-05-05", checkOut: "2025-05-07", type: "Standard", status: "Confirmed", amount: "GHC 400" },
];

export default function AdminDashboard() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [activeSubMenu, setActiveSubMenu] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#f0f2f5]">
      {/* Sidebar */}
      <aside className="hidden md:block w-64 bg-[#1a233b] text-white p-6 fixed h-full z-10">
        <div className="font-serif text-2xl mb-8" style={{ fontFamily: 'Cormorant Garamond, serif' }}>Hotel 734 Admin</div>
        <nav className="space-y-2">
          <SidebarItem label="Dashboard" active={activeMenu === "dashboard"} onClick={() => { setActiveMenu("dashboard"); setActiveSubMenu(""); }} />
          <SidebarItem label="Rooms" active={activeMenu === "rooms"} onClick={() => setActiveMenu("rooms")}/>
          {activeMenu === "rooms" && (
            <div className="ml-4 space-y-1">
              <SidebarSubItem label="Expensive" active={activeSubMenu === "expensive"} onClick={() => setActiveSubMenu("expensive")} />
              <SidebarSubItem label="Standard" active={activeSubMenu === "standard"} onClick={() => setActiveSubMenu("standard")} />
              <SidebarSubItem label="Regular" active={activeSubMenu === "regular"} onClick={() => setActiveSubMenu("regular")} />
            </div>
          )}
          <SidebarItem label="Compound" active={activeMenu === "compound"} onClick={() => { setActiveMenu("compound"); setActiveSubMenu(""); }} />
          <SidebarItem label="Conference" active={activeMenu === "conference"} onClick={() => { setActiveMenu("conference"); setActiveSubMenu(""); }} />
          <SidebarItem label="Messages" active={activeMenu === "messages"} onClick={() => { setActiveMenu("messages"); setActiveSubMenu(""); }} />
          <SidebarItem label="Logout" active={false} onClick={() => window.location.reload()} />
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h1 className="font-serif text-3xl text-[#1a233b] mb-4 sm:mb-0" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Dashboard Overview
          </h1>
          <button className="bg-[#FFD700] hover:bg-[#e6c200] text-[#1a233b] font-bold px-6 py-2 rounded-md shadow transition-all">+ New Booking</button>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
              <h3 className="text-base text-gray-500 mb-2">{s.label}</h3>
              <h2 className="text-2xl font-bold text-[#1a233b] mb-1">{s.value}</h2>
              <p className="text-xs text-gray-400">{s.desc}</p>
            </div>
          ))}
        </div>
        {/* Room Availability */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="font-bold text-xl text-[#FFD700] mb-4">Room Availability</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roomAvailability.map((room) => {
              const percent = (room.available / room.total) * 100;
              return (
                <div key={room.label} className="bg-[#f8f9fa] rounded-lg p-4 border-l-4 border-[#FFD700]">
                  <h3 className="text-lg text-[#1a233b] mb-2">{room.label}</h3>
                  <div className="h-2 bg-gray-200 rounded mb-2">
                    <div className="h-2 rounded bg-[#FFD700] transition-all" style={{ width: `${percent}%` }} />
                  </div>
                  <p className="text-sm text-gray-600">{room.available} of {room.total} available</p>
                </div>
              );
            })}
          </div>
        </div>
        {/* Bookings Table */}
        <div className="bg-white rounded-xl shadow p-6 mb-8 overflow-x-auto">
          <h2 className="font-bold text-xl text-[#FFD700] mb-4">Recent Bookings</h2>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-3 text-left">Booking ID</th>
                <th className="py-2 px-3 text-left">Guest Name</th>
                <th className="py-2 px-3 text-left">Check-In</th>
                <th className="py-2 px-3 text-left">Check-Out</th>
                <th className="py-2 px-3 text-left">Type</th>
                <th className="py-2 px-3 text-left">Status</th>
                <th className="py-2 px-3 text-left">Amount</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="border-b last:border-0">
                  <td className="py-2 px-3">#{b.id}</td>
                  <td className="py-2 px-3">{b.guest}</td>
                  <td className="py-2 px-3">{b.checkIn}</td>
                  <td className="py-2 px-3">{b.checkOut}</td>
                  <td className="py-2 px-3">{b.type}</td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      b.status === "Confirmed"
                        ? "bg-green-100 text-green-700"
                        : b.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="py-2 px-3">{b.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* You can add Messages Table and Modals here as needed */}
      </main>
    </div>
  );
}

function SidebarItem({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <div
      className={`menu-item px-4 py-3 rounded-lg cursor-pointer transition font-semibold mb-1 ${active ? 'bg-[#FFD700] text-[#1a233b]' : 'hover:bg-[#FFD700] hover:text-[#1a233b] text-white'}`}
      onClick={onClick}
    >
      {label}
    </div>
  );
}

function SidebarSubItem({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <div
      className={`sub-item px-4 py-2 rounded cursor-pointer transition text-sm mb-1 ${active ? 'bg-[#FFD700] text-[#1a233b]' : 'hover:bg-[#FFD700] hover:text-[#1a233b] text-white'}`}
      onClick={onClick}
    >
      {label}
    </div>
  );
} 