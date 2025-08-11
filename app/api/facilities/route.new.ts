import { NextResponse } from "next/server"
import dbConnect from "@/lib/db/connect"
import { withAuth, ROLES } from "@/lib/auth"
import Facility from "@/models/Facility"

export const GET = withAuth(async (req: Request, user: any) => {
  try {
    await dbConnect()

    // Get facilities owned by this user
    const facilities = await Facility.find({ owner: user.userId })
      .select("name location sports status rating totalBookings monthlyRevenue image")
      .sort({ createdAt: -1 })

    return NextResponse.json(facilities)
  } catch (error) {
    console.error("Error fetching facilities:", error)
    return NextResponse.json(
      { error: "Failed to fetch facilities" },
      { status: 500 }
    )
  }
}, [ROLES.OWNER])

export const POST = withAuth(async (req: Request, user: any) => {
  try {
    const body = await req.json()
    await dbConnect()

    // Create new facility with the owner set to current user
    const facility = await Facility.create({
      ...body,
      owner: user.userId,
      status: 'Active'  // Set default status
    })

    return NextResponse.json(facility, { status: 201 })
  } catch (error) {
    console.error("Error creating facility:", error)
    return NextResponse.json(
      { error: "Failed to create facility" },
      { status: 500 }
    )
  }
}, [ROLES.OWNER])
