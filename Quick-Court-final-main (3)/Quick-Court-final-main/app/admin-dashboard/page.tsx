"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Building2, Calendar, Activity, TrendingUp } from 'lucide-react'

interface StatBox { title:string; value:string; change:string; icon: any }

const statData: StatBox[] = [
  { title:'Total Users', value:'1,250', change:'+12%', icon:Users },
  { title:'Facility Owners', value:'86', change:'+4%', icon:Building2 },
  { title:'Bookings (30d)', value:'3,420', change:'+9%', icon:Calendar },
  { title:'Pending Facilities', value:'5', change:'-2', icon:Activity },
]

export default function AdminDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (!userStr) { router.replace('/login'); return }
    const u = JSON.parse(userStr)
    if (u.role !== 'admin') { router.replace('/login'); return }
    setUser(u)
  }, [router])

  if (!user) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-gray-600'>Loading...</div>
      </div>
    )
  }

  return (
    <div className='space-y-8'>
      <div>
        <h1 className='text-3xl font-bold text-gray-900'>Admin Dashboard</h1>
        <p className='text-gray-600 mt-1'>Platform overview & moderation tools</p>
      </div>

      <div className='grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'>
        {statData.map(s => (
          <Card key={s.title} className='border-gray-200'>
            <CardHeader className='flex flex-row items-center justify-between pb-2 space-y-0'>
              <CardTitle className='text-sm font-medium text-gray-600'>{s.title}</CardTitle>
              <s.icon className='h-4 w-4 text-gray-400' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-gray-900'>{s.value}</div>
              <div className='flex items-center text-xs text-gray-500 mt-1'><TrendingUp className='h-3 w-3 mr-1' />{s.change}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className='grid gap-6 md:grid-cols-2'>
        <Card className='border-gray-200'>
          <CardHeader><CardTitle className='text-gray-900 text-base'>Recent Facility Registrations</CardTitle></CardHeader>
          <CardContent className='space-y-4'>
            {[{name:'Elite Sports Complex', owner:'John Smith', status:'Pending'}, {name:'Premier Tennis Club', owner:'Ravi Kumar', status:'Approved'}].map((f,i)=>(
              <div key={i} className='flex items-center justify-between border border-gray-200 rounded-lg p-3'>
                <div>
                  <p className='font-medium text-gray-900'>{f.name}</p>
                  <p className='text-xs text-gray-500'>Owner: {f.owner}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${f.status==='Approved'?'bg-gray-100 text-gray-700':'bg-gray-900 text-white'}`}>{f.status}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className='border-gray-200'>
          <CardHeader><CardTitle className='text-gray-900 text-base'>System Activity (Sample)</CardTitle></CardHeader>
          <CardContent className='space-y-4'>
            {[ 'New booking created', 'Venue approved', 'User registered', 'Owner added court' ].map((a,i)=>(
              <div key={i} className='flex items-center justify-between border border-gray-200 rounded-lg p-3'>
                <span className='text-sm text-gray-700'>{a}</span>
                <span className='text-xs text-gray-500'>Just now</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
