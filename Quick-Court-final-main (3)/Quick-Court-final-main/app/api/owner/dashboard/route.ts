import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";
import dbConnect from "@/lib/db/connect";
import Facility from "@/models/Facility";
import Booking from "@/models/Booking";
import Court from "@/models/Court";
import { startOfMonth, endOfMonth } from "date-fns";

export const GET = withAuth(async (req: Request, user: any) => {
  try {
    await dbConnect();

    // Get all facilities owned by the user
    const facilities = await Facility.find({ owner: user._id });
    const facilityIds = facilities.map(f => f._id);

    // Get all courts for these facilities
    const courts = await Court.find({ facility: { $in: facilityIds } });
    const activeCourts = courts.filter(c => c.status === "Active").length;
    const maintenanceCourts = courts.filter(c => c.status === "Maintenance").length;

    // Get current month's dates
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    // Get all bookings for these facilities
    const allBookings = await Booking.find({
      facility: { $in: facilityIds }
    }).sort({ createdAt: -1 });

    // Get monthly bookings
    const monthlyBookings = allBookings.filter(booking => 
      booking.date >= monthStart && booking.date <= monthEnd
    );

    // Calculate total and monthly earnings
    const totalEarnings = allBookings.reduce((sum, booking) => sum + booking.amount, 0);
    const monthlyEarnings = monthlyBookings.reduce((sum, booking) => sum + booking.amount, 0);

    // Get recent bookings with populated user and court info
    const recentBookings = await Booking.find({ facility: { $in: facilityIds } })
      .sort({ createdAt: -1 })
      .limit(4)
      .populate("user", "name email")
      .populate("court", "name");

    // Transform recent bookings for the response
    const formattedRecentBookings = recentBookings.map(booking => ({
      id: booking._id,
      facility: facilities.find(f => f._id.equals(booking.facility))?.name || "Unknown Facility",
      court: booking.court.name,
      user: booking.user.name,
      date: new Date(booking.date).toLocaleDateString(),
      time: booking.startTime,
      status: booking.status,
      amount: booking.amount
    }));

    return NextResponse.json({
      totalBookings: allBookings.length,
      monthlyBookings: monthlyBookings.length,
      activeCourts,
      maintenanceCourts,
      totalEarnings,
      monthlyEarnings,
      recentBookings: formattedRecentBookings
    });
  } catch (error) {
    console.error("Dashboard data fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}, ["owner"]);
