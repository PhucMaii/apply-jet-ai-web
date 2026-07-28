import { env } from "@/lib/env";
import { supabase } from "@/lib/supabase";

const useEmail = () => {
    const sendWelcomeEmail = async (email: string, displayName: string) => {
        const response = await supabase.functions.invoke('send-welcome-email', {
            body: JSON.stringify({ email, displayName }),
            headers: {
                "Content-Type": "application/json",
                "X-Secret-Key": env.xsecretkey!,
            },
        });
        return response;
    };

    const sendFirstApplicationEmail = async (userId: string) => {
        const response = await supabase.functions.invoke('email-after-first-application', {
            body: JSON.stringify({ userId }),
            headers: {
                "Content-Type": "application/json",
                "X-Secret-Key": env.xsecretkey!,
            },
        });
        return response;
    };

    return {
        sendWelcomeEmail,
        sendFirstApplicationEmail,
    };

}

export default useEmail;