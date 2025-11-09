import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Leaf } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 p-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-emerald-900">Carbon Tracker</h1>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="h-16 w-16 text-emerald-600" />
              </div>
              <CardTitle className="text-2xl text-center">Check your email</CardTitle>
              <CardDescription className="text-center">We&apos;ve sent you a confirmation link</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Please check your email and click the confirmation link to activate your account. Once confirmed, you
                can sign in and start tracking your carbon footprint.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
