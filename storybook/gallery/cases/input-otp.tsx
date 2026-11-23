import * as inputOtp from "@clegra/ui/components/input-otp"
import * as inputOtpDrawn from "@clegra/ui/drawn/components/input-otp"

import { defineCase } from "../case"

export default defineCase("input-otp", [inputOtp], [inputOtpDrawn], ({ InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }) => (
  <InputOTP maxLength={6} aria-label="Code">
    <InputOTPGroup>
      <InputOTPSlot index={0} />
      <InputOTPSlot index={1} />
      <InputOTPSlot index={2} />
    </InputOTPGroup>
    <InputOTPSeparator />
    <InputOTPGroup>
      <InputOTPSlot index={3} />
      <InputOTPSlot index={4} />
      <InputOTPSlot index={5} />
    </InputOTPGroup>
  </InputOTP>
))
