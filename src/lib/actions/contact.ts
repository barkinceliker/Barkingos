"use server";

import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  subject: z.string().min(5).max(100),
  message: z.string().min(10).max(1000),
});

export async function submitContactForm(values: z.infer<typeof formSchema>) {
  // Simulate database call or email sending
  console.log("Form submitted with values:", values);

  // In a real application, you would:
  // 1. Validate the data again on the server (though Zod already does this).
  // 2. Save to a database.
  // 3. Send an email notification.
  // 4. Handle potential errors.

  // Simulate a delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simulate success/failure
  if (values.email.includes("error")) { // Simple way to test error case
    return { success: false, message: "Bu e-posta adresiyle bir sorun oluştu." };
  }
  
  return { success: true, message: "Mesajınız başarıyla alındı! En kısa sürede geri dönüş yapacağız." };
}
