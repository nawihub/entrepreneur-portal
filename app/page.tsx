import { redirect } from "next/navigation";

/**
 * The portal's front door is the login page. proxy.ts sends signed-in visitors on to /feed before
 * this runs; this covers anything that reaches the page itself.
 */
export default function Home() {
  redirect("/login");
}
