"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import PaySimulator from "@/components/pay-simulator"
import { 
  ArrowLeft, Trophy, Users, Calendar, MapPin, 
  DollarSign, AlertCircle, CheckCircle, User,
  Phone, Mail, CreditCard, Shield
} from "lucide-react"

interface Tournament {
  id: number
  name: string
  sport: string
  category: string
  venue: string
  location: string
  entryFee: number
  registrationDeadline: string
  maxParticipants: number
  currentParticipants: number
  isTeamTournament: boolean
}

interface TeamMember {
  name: string
  email: string
  phone: string
  position?: string
}

const mockTournament: Tournament = {
  id: 1,
  name: "Spring Basketball Championship",
  sport: "Basketball",
  category: "5v5",
  venue: "Elite Sports Complex",
  location: "Mumbai",
  entryFee: 3500,
  registrationDeadline: "2024-03-10",
  maxParticipants: 16,
  currentParticipants: 12,
  isTeamTournament: true
}

export default function TournamentRegistrationPage() {
  const [userData, setUserData] = useState<any>(null)
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const { toast } = useToast()
  const router = useRouter()
  const params = useParams()

  // Form data
  const [formData, setFormData] = useState({
    // Personal/Team Info
    participantType: "individual", // individual or team
    teamName: "",
    captainName: "",
    captainEmail: "",
    captainPhone: "",
    
    // Individual registration
    individualName: "",
    individualEmail: "",
    individualPhone: "",
    
    // Team members (for team tournaments)
    teamMembers: Array(5).fill(null).map(() => ({ name: "", email: "", phone: "", position: "" })),
    
    // Additional Info
    experience: "",
    previousTournaments: "",
    medicalConditions: "",
    emergencyContact: "",
    emergencyPhone: "",
    
    // Payment
    paymentMethod: "card",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
    
    // Agreements
    termsAccepted: false,
    waiverAccepted: false,
    emailUpdates: true
  })

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(user)
    if (parsedUser.role !== "user") {
      router.push("/login")
      return
    }

    setUserData(parsedUser)
    
    // Fetch real tournament data from API
    const fetchTournament = async () => {
      try {
        const response = await fetch(`/api/tournaments/${params.id}`)
        if (!response.ok) {
          throw new Error('Tournament not found')
        }
        const data = await response.json()
        
        // Transform API data to match component interface
        const tournamentData = {
          ...data.tournament,
          id: data.tournament._id,
          currentParticipants: data.tournament.participants?.length || 0,
          isTeamTournament: data.tournament.category?.includes('v') || data.tournament.sport === 'Basketball' || data.tournament.sport === 'Football'
        }
        
        setTournament(tournamentData)
        
      } catch (error) {
        console.error('Error fetching tournament:', error)
        // Fallback to mock data if API fails
        setTournament(mockTournament)
      }
    }
    
    fetchTournament()
    
    // Pre-fill user data
    setFormData(prev => ({
      ...prev,
      individualName: parsedUser.name || "",
      individualEmail: parsedUser.email || "",
      captainName: parsedUser.name || "",
      captainEmail: parsedUser.email || ""
    }))
  }, [router, params.id])

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const updateTeamMember = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.map((member, i) => 
        i === index ? { ...member, [field]: value } : member
      )
    }))
  }

  const validateStep = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        if (tournament?.isTeamTournament && formData.participantType === "team") {
          return formData.teamName && formData.captainName && formData.captainEmail && formData.captainPhone
        } else {
          return formData.individualName && formData.individualEmail && formData.individualPhone
        }
      case 2:
        if (tournament?.isTeamTournament && formData.participantType === "team") {
          const requiredMembers = formData.teamMembers.slice(0, 4) // At least 4 additional members
          return requiredMembers.every(member => member.name && member.email)
        }
        return true
      case 3:
        return formData.emergencyContact && formData.emergencyPhone
      case 4:
        return formData.paymentMethod === "card" ? 
          (formData.cardNumber && formData.expiryDate && formData.cvv && formData.cardholderName) : 
          true
      case 5:
        return formData.termsAccepted && formData.waiverAccepted
      default:
        return true
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(5)) {
      toast({
        title: "Please accept all required agreements",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      // Store registration in the database via API
      const res = await fetch(`/api/tournaments/${params.id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantType: formData.participantType,
          teamName: formData.teamName,
          teamMembers: formData.teamMembers,
          individualName: formData.individualName,
          individualEmail: formData.individualEmail,
          individualPhone: formData.individualPhone,
          captainName: formData.captainName,
          captainEmail: formData.captainEmail,
          captainPhone: formData.captainPhone,
          emergencyContact: formData.emergencyContact,
          emergencyPhone: formData.emergencyPhone,
          medicalConditions: formData.medicalConditions,
          previousTournaments: formData.previousTournaments,
          paymentMethod: formData.paymentMethod,
          cardholderName: formData.cardholderName,
          cardNumber: formData.cardNumber,
          expiryDate: formData.expiryDate,
          cvv: formData.cvv,
          termsAccepted: formData.termsAccepted,
          waiverAccepted: formData.waiverAccepted,
          emailUpdates: formData.emailUpdates
        })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Registration failed');
      }
      toast({
        title: "Registration Successful!",
        description: "You have been successfully registered for the tournament."
      });
      router.push(`/tournaments/${params.id}`);
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "There was an error processing your registration. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  if (!userData || !tournament) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  const totalSteps = tournament.isTeamTournament ? 5 : 4

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Tournament Registration</h1>
          <p className="text-gray-600 mt-1">{tournament.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          {/* Progress Steps */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                {Array.from({ length: totalSteps }, (_, i) => i + 1).map((stepNum) => (
                  <div key={stepNum} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      stepNum === step ? "bg-blue-600 text-white" :
                      stepNum < step ? "bg-green-600 text-white" :
                      "bg-gray-200 text-gray-600"
                    }`}>
                      {stepNum < step ? <CheckCircle className="h-4 w-4" /> : stepNum}
                    </div>
                    {stepNum < totalSteps && (
                      <div className={`h-1 w-12 mx-2 ${
                        stepNum < step ? "bg-green-600" : "bg-gray-200"
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-600">
                <span>Basic Info</span>
                {tournament.isTeamTournament && <span>Team Details</span>}
                <span>Emergency Contact</span>
                <span>Payment</span>
                <span>Agreements</span>
              </div>
            </CardContent>
          </Card>

          {/* Step 1: Basic Information */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {tournament.isTeamTournament && (
                  <div className="space-y-2">
                    <Label>Registration Type</Label>
                    <Select 
                      value={formData.participantType} 
                      onValueChange={(value) => updateFormData("participantType", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">Individual Registration</SelectItem>
                        <SelectItem value="team">Team Registration</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {formData.participantType === "team" ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="teamName">Team Name *</Label>
                      <Input
                        id="teamName"
                        value={formData.teamName}
                        onChange={(e) => updateFormData("teamName", e.target.value)}
                        placeholder="Enter your team name"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="captainName">Team Captain Name *</Label>
                        <Input
                          id="captainName"
                          value={formData.captainName}
                          onChange={(e) => updateFormData("captainName", e.target.value)}
                          placeholder="Captain's full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="captainEmail">Captain Email *</Label>
                        <Input
                          id="captainEmail"
                          type="email"
                          value={formData.captainEmail}
                          onChange={(e) => updateFormData("captainEmail", e.target.value)}
                          placeholder="captain@example.com"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="captainPhone">Captain Phone Number *</Label>
                      <Input
                        id="captainPhone"
                        value={formData.captainPhone}
                        onChange={(e) => updateFormData("captainPhone", e.target.value)}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="individualName">Full Name *</Label>
                      <Input
                        id="individualName"
                        value={formData.individualName}
                        onChange={(e) => updateFormData("individualName", e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="individualEmail">Email Address *</Label>
                        <Input
                          id="individualEmail"
                          type="email"
                          value={formData.individualEmail}
                          onChange={(e) => updateFormData("individualEmail", e.target.value)}
                          placeholder="your@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="individualPhone">Phone Number *</Label>
                        <Input
                          id="individualPhone"
                          value={formData.individualPhone}
                          onChange={(e) => updateFormData("individualPhone", e.target.value)}
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="experience">Experience Level</Label>
                    <Select 
                      value={formData.experience} 
                      onValueChange={(value) => updateFormData("experience", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner (0-2 years)</SelectItem>
                        <SelectItem value="intermediate">Intermediate (2-5 years)</SelectItem>
                        <SelectItem value="advanced">Advanced (5-10 years)</SelectItem>
                        <SelectItem value="professional">Professional (10+ years)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="previousTournaments">Previous Tournament Experience</Label>
                    <Textarea
                      id="previousTournaments"
                      value={formData.previousTournaments}
                      onChange={(e) => updateFormData("previousTournaments", e.target.value)}
                      placeholder="Describe any previous tournament experience (optional)"
                      rows={3}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Team Members (only for team tournaments) */}
          {step === 2 && tournament.isTeamTournament && formData.participantType === "team" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Members
                </CardTitle>
                <p className="text-sm text-gray-600">Add your team members (minimum 5 players including captain)</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {formData.teamMembers.map((member, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-4">
                    <h4 className="font-medium">Player {index + 2}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`member-name-${index}`}>Full Name {index < 4 ? "*" : ""}</Label>
                        <Input
                          id={`member-name-${index}`}
                          value={member.name}
                          onChange={(e) => updateTeamMember(index, "name", e.target.value)}
                          placeholder="Player's full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`member-email-${index}`}>Email {index < 4 ? "*" : ""}</Label>
                        <Input
                          id={`member-email-${index}`}
                          type="email"
                          value={member.email}
                          onChange={(e) => updateTeamMember(index, "email", e.target.value)}
                          placeholder="player@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`member-phone-${index}`}>Phone Number</Label>
                        <Input
                          id={`member-phone-${index}`}
                          value={member.phone}
                          onChange={(e) => updateTeamMember(index, "phone", e.target.value)}
                          placeholder="+91 98765 43210"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`member-position-${index}`}>Preferred Position</Label>
                        <Input
                          id={`member-position-${index}`}
                          value={member.position}
                          onChange={(e) => updateTeamMember(index, "position", e.target.value)}
                          placeholder="e.g., Point Guard, Forward"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Step 3: Emergency Contact & Medical Info */}
          {step === (tournament.isTeamTournament ? 3 : 2) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Emergency Contact & Medical Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact">Emergency Contact Name *</Label>
                    <Input
                      id="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={(e) => updateFormData("emergencyContact", e.target.value)}
                      placeholder="Emergency contact person"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone">Emergency Phone Number *</Label>
                    <Input
                      id="emergencyPhone"
                      value={formData.emergencyPhone}
                      onChange={(e) => updateFormData("emergencyPhone", e.target.value)}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medicalConditions">Medical Conditions or Allergies</Label>
                  <Textarea
                    id="medicalConditions"
                    value={formData.medicalConditions}
                    onChange={(e) => updateFormData("medicalConditions", e.target.value)}
                    placeholder="Please list any medical conditions, allergies, or medications that tournament staff should be aware of (optional)"
                    rows={3}
                  />
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    All participants must have valid medical insurance. Tournament organizers are not responsible for injuries sustained during the event.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Payment Information */}
          {step === (tournament.isTeamTournament ? 4 : 3) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select 
                    value={formData.paymentMethod} 
                    onValueChange={(value) => updateFormData("paymentMethod", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card">Credit/Debit Card</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.paymentMethod === "card" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardholderName">Cardholder Name *</Label>
                      <Input
                        id="cardholderName"
                        value={formData.cardholderName}
                        onChange={(e) => updateFormData("cardholderName", e.target.value)}
                        placeholder="Name as it appears on card"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number *</Label>
                      <Input
                        id="cardNumber"
                        value={formData.cardNumber}
                        onChange={(e) => updateFormData("cardNumber", e.target.value)}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiryDate">Expiry Date *</Label>
                        <Input
                          id="expiryDate"
                          value={formData.expiryDate}
                          onChange={(e) => updateFormData("expiryDate", e.target.value)}
                          placeholder="MM/YY"
                          maxLength={5}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV *</Label>
                        <Input
                          id="cvv"
                          value={formData.cvv}
                          onChange={(e) => updateFormData("cvv", e.target.value)}
                          placeholder="123"
                          maxLength={4}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {formData.paymentMethod === "paypal" && (
                  <Alert>
                    <AlertDescription>
                      You will be redirected to PayPal to complete your payment after submitting this form.
                    </AlertDescription>
                  </Alert>
                )}

                {formData.paymentMethod === "bank" && (
                  <Alert>
                    <AlertDescription>
                      Bank transfer details will be provided after registration. Payment must be completed within 48 hours to secure your spot.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 5: Agreements */}
          {step === (tournament.isTeamTournament ? 5 : 4) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Terms & Agreements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={formData.termsAccepted}
                      onCheckedChange={(checked) => updateFormData("termsAccepted", checked)}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        I accept the tournament terms and conditions *
                      </Label>
                      <p className="text-xs text-gray-600">
                        By checking this box, you agree to follow all tournament rules and regulations.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="waiver"
                      checked={formData.waiverAccepted}
                      onCheckedChange={(checked) => updateFormData("waiverAccepted", checked)}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="waiver" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        I agree to the liability waiver *
                      </Label>
                      <p className="text-xs text-gray-600">
                        I understand the risks involved and release the organizers from liability for injuries.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="emails"
                      checked={formData.emailUpdates}
                      onCheckedChange={(checked) => updateFormData("emailUpdates", checked)}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="emails" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        I would like to receive tournament updates via email
                      </Label>
                      <p className="text-xs text-gray-600">
                        Stay informed about tournament schedules, results, and future events.
                      </p>
                    </div>
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please review all information carefully before submitting. Registration fees are non-refundable except in case of tournament cancellation.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
            >
              Previous
            </Button>
            
            {step === totalSteps ? (
              // Payment Integration for Final Step
              !validateStep(step) ? (
                <Button disabled className="min-w-[120px]">
                  Complete Required Fields
                </Button>
              ) : (
                <PaySimulator
                  amount={tournament.entryFee}
                  descriptor={`Tournament Registration - ${tournament.name}`}
                  buttonLabel={`Pay ₹${tournament.entryFee.toLocaleString('en-IN')} & Register`}
                  onSuccess={async (tx) => {
                    try {
                      // Handle successful payment and registration
                      console.log("Tournament registration payment successful:", tx)
                      
                      // Get authentication token
                      const getAuthToken = () => {
                        let token = localStorage.getItem('token')
                        if (token) return token
                        
                        const value = `; ${document.cookie}`;
                        const parts = value.split(`; authToken=`);
                        if (parts.length === 2) {
                          const cookieValue = parts.pop()?.split(';').shift();
                          if (cookieValue) return decodeURIComponent(cookieValue);
                        }
                        return null;
                      }
                      
                      const token = getAuthToken();
                      if (!token) {
                        toast({
                          title: "Authentication Error",
                          description: "Please login to complete registration",
                          variant: "destructive",
                        })
                        router.push('/login')
                        return
                      }

                      // Store registration in the database via API
                      const registrationPayload = {
                        participantType: formData.participantType,
                        teamName: formData.teamName,
                        teamMembers: formData.teamMembers,
                        individualName: formData.individualName,
                        individualEmail: formData.individualEmail,
                        individualPhone: formData.individualPhone,
                        captainName: formData.captainName,
                        captainEmail: formData.captainEmail,
                        captainPhone: formData.captainPhone,
                        emergencyContact: formData.emergencyContact,
                        emergencyPhone: formData.emergencyPhone,
                        medicalConditions: formData.medicalConditions,
                        previousTournaments: formData.previousTournaments,
                        paymentMethod: "card",
                        paymentId: tx.id,
                        paymentStatus: "paid",
                        entryFee: tournament.entryFee,
                        termsAccepted: formData.termsAccepted,
                        waiverAccepted: formData.waiverAccepted,
                        emailUpdates: formData.emailUpdates
                      }

                      console.log('Registering for tournament with payload:', registrationPayload)

                      const res = await fetch(`/api/tournaments/${params.id}/register`, {
                        method: 'POST',
                        headers: { 
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(registrationPayload)
                      });
                      
                      const result = await res.json();
                      
                      if (res.ok && result.success) {
                        // Show success message
                        toast({
                          title: "🎉 Registration Successful!",
                          description: "You have been registered for the tournament! Redirecting to confirmation...",
                        })

                        // Store confirmation in booking confirmation API
                        try {
                          await fetch('/api/bookings/confirm', {
                            method: 'POST',
                            headers: {
                              'Authorization': `Bearer ${token}`,
                              'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                              bookingId: result.data?.registrationId || `REG_${Date.now()}`,
                              transactionId: tx.id,
                              amount: tournament.entryFee,
                              paymentMethod: 'Credit Card',
                              type: 'tournament',
                              venueName: tournament.venue,
                              courtName: tournament.name,
                              sport: tournament.sport,
                              date: new Date().toLocaleDateString(),
                              time: 'Tournament Registration',
                              duration: 'Full Tournament',
                              notes: `Tournament: ${tournament.name} - ${formData.participantType === 'team' ? `Team: ${formData.teamName}` : `Player: ${formData.individualName}`}`
                            })
                          })
                        } catch (confirmError) {
                          console.log('Confirmation API error (non-critical):', confirmError)
                        }

                        // Redirect to payment completed page with tournament details
                        const queryParams = new URLSearchParams({
                          txId: tx.id,
                          type: 'tournament',
                          amount: tournament.entryFee.toString(),
                          tournament: tournament.name,
                          venue: tournament.venue,
                          date: new Date().toLocaleDateString(),
                          registrationId: result.data?.registrationId || '',
                          participantType: formData.participantType,
                          teamName: formData.teamName || '',
                          playerName: formData.individualName || '',
                          status: 'confirmed'
                        })
                        
                        setTimeout(() => {
                          window.location.href = `/payment-completed?${queryParams.toString()}`
                        }, 1500)
                      } else {
                        console.error('Registration failed:', result)
                        
                        // Handle specific error cases
                        if (result.error === 'Already registered') {
                          toast({
                            title: "Already Registered",
                            description: "You are already registered for this tournament.",
                            variant: "destructive"
                          });
                        } else if (result.error === 'Tournament full') {
                          toast({
                            title: "Tournament Full",
                            description: "This tournament has reached maximum capacity.",
                            variant: "destructive"
                          });
                        } else {
                          toast({
                            title: "Registration Failed",
                            description: result.error || "Failed to register for tournament",
                            variant: "destructive"
                          });
                        }
                      }
                    } catch (error: any) {
                      console.error('Registration error:', error)
                      toast({
                        title: "Registration Error",
                        description: "Failed to complete registration. Please try again.",
                        variant: "destructive",
                      })
                    }
                  }}
                  onFailure={() => {
                    toast({
                      title: "Payment Failed",
                      description: "Tournament registration payment failed. Please try again.",
                      variant: "destructive",
                    })
                  }}
                />
              )
            ) : (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!validateStep(step)}
              >
                Next
              </Button>
            )}
          </div>
        </div>

        {/* Registration Summary Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Registration Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">{tournament.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  Registration Deadline: {new Date(tournament.registrationDeadline).toLocaleDateString('en-IN')}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  {tournament.venue}, {tournament.location}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Registration Type:</span>
                  <span className="text-sm font-medium">
                    {formData.participantType === "team" ? "Team" : "Individual"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Entry Fee:</span>
                  <span className="text-lg font-bold text-green-600">₹{tournament.entryFee.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Processing Fee:</span>
                  <span>₹0</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span className="text-green-600">₹{tournament.entryFee.toLocaleString('en-IN')}</span>
              </div>

              {formData.participantType === "team" && formData.teamName && (
                <div className="pt-2">
                  <p className="text-sm font-medium">Team: {formData.teamName}</p>
                  <p className="text-xs text-gray-600">Captain: {formData.captainName}</p>
                </div>
              )}

              {formData.participantType === "individual" && formData.individualName && (
                <div className="pt-2">
                  <p className="text-sm font-medium">Player: {formData.individualName}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-gray-500" />
                <span>support@quickcourt.in</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-gray-500" />
                <span>+91 98765 43210</span>
              </div>
              <p className="text-xs text-gray-600">
                Contact us if you have any questions about the registration process. All fees include GST as per Indian law.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
