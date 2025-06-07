
"use server";

import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalıdır.").max(50, "İsim en fazla 50 karakter olabilir."),
  email: z.string().email("Geçerli bir e-posta adresi giriniz."),
  subject: z.string().min(5, "Konu en az 5 karakter olmalıdır.").max(100, "Konu en fazla 100 karakter olabilir."),
  message: z.string().min(10, "Mesaj en az 10 karakter olmalıdır.").max(1000, "Mesaj en fazla 1000 karakter olabilir."),
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
  // You can test an error case by submitting an email containing "error"
  if (values.email.toLowerCase().includes("error")) { 
    return { success: false, message: "Bu e-posta adresiyle bir sorun oluştu. Lütfen farklı bir adres deneyin." };
  }
  
  return { success: true, message: "Mesajınız başarıyla alındı! En kısa sürede geri dönüş yapacağız." };
}
